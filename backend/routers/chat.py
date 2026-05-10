import os
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import google.generativeai as genai

from database import get_db
import models
import schemas
from auth import get_current_user

router = APIRouter(prefix="/api/assistant", tags=["assistant"])

api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

@router.post("", response_model=schemas.ChatResponse)
def chat_with_assistant(
    req: schemas.ChatRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if not os.getenv("GEMINI_API_KEY"):
        raise HTTPException(status_code=500, detail="Gemini API Key is not configured")

    # Gather context
    products = db.query(models.Product).filter(models.Product.owner_id == current_user.id).all()
    
    context_data = []
    for p in products:
        f = p.forecast_summary
        context_data.append({
            "name": p.name,
            "sku": p.sku,
            "current_stock": p.current_stock,
            "min_threshold": p.min_threshold,
            "demand_7d": round(f.demand_7_day, 1) if f else 0,
            "stockout_prob": f.stockout_probability if f else 0,
            "trend": f.demand_trend if f else "unknown",
            "category": p.category,
        })

    system_instruction = f"""
You are the ShelfMind AI Assistant, a helpful and expert retail inventory manager. 
The user is talking to you through the ShelfMind SaaS platform. 
Use the following real-time JSON data about the user's inventory to accurately answer their questions.

Inventory Data Context:
{json.dumps(context_data, indent=2)}

Guidelines:
- Keep answers concise, actionable, and friendly.
- Format responses nicely (you can use markdown like bolding or bullet points).
- If the user asks something completely unrelated to business, retail, or inventory, politely steer them back.
"""

    try:
        model = genai.GenerativeModel("gemini-flash-latest", system_instruction=system_instruction)
        
        # Convert history format
        formatted_history = []
        for msg in req.history:
            formatted_history.append({
                "role": msg.role, # 'user' or 'model'
                "parts": [msg.text]
            })
            
        chat_session = model.start_chat(history=formatted_history)
        response = chat_session.send_message(req.message)
        
        return schemas.ChatResponse(reply=response.text.strip())
    except Exception as e:
        print("Gemini chat error:", e)
        raise HTTPException(status_code=500, detail="Failed to get AI response.")
