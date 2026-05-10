import os
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List
import google.generativeai as genai

from database import get_db
import models
import schemas
from auth import get_current_user

router = APIRouter(prefix="/api/insights", tags=["insights"])

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

@router.post("/generate", response_model=List[schemas.AIInsightOut])
def generate_insights(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if not os.getenv("GEMINI_API_KEY"):
        raise HTTPException(status_code=500, detail="Gemini API Key is not configured in backend")

    # Gather data context
    products = db.query(models.Product).filter(models.Product.owner_id == current_user.id).all()
    if not products:
        raise HTTPException(status_code=400, detail="No products available to generate insights from.")

    context_data = []
    for p in products:
        f = p.forecast_summary
        context_data.append({
            "name": p.name,
            "stock": p.current_stock,
            "min_threshold": p.min_threshold,
            "demand_7d": round(f.demand_7_day, 1) if f else 0,
            "stockout_prob": f.stockout_probability if f else 0,
            "trend": f.demand_trend if f else "unknown",
        })

    prompt = f"""
    You are an expert retail supply chain analyst AI. Based on the following inventory and demand forecast data for a user's store, generate 5 to 8 critical business insights.
    
    Data:
    {json.dumps(context_data, indent=2)}
    
    Rules for Insights:
    - Identify out-of-stock risks, unusual demand spikes, or dead stock opportunities.
    - Keep insights natural, concise, and highly actionable (1-2 sentences each).
    - Categorize each insight into one of these types: "risk", "opportunity", or "demand".
    
    Return EXACTLY a JSON array of objects, with each object having keys:
    - "type": (one of: risk, opportunity, demand)
    - "title": (A short 3-5 word title)
    - "content": (The natural language insight)
    Do not wrap the JSON in markdown blocks like ```json. Return ONLY raw JSON.
    """

    try:
        model = genai.GenerativeModel("gemini-flash-latest")
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
        # Remove markdown if present
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
            
        insights_data = json.loads(response_text)
    except Exception as e:
        print("Gemini generation error:", e)
        raise HTTPException(status_code=500, detail="Failed to generate AI insights.")

    # Clear old insights and save new ones
    db.query(models.AIInsight).filter(models.AIInsight.user_id == current_user.id).delete()

    created_insights = []
    for ind in insights_data:
        insight = models.AIInsight(
            user_id=current_user.id,
            insight_type=ind.get("type", "demand"),
            title=ind.get("title", "Insight"),
            content=ind.get("content", ""),
            confidence_score=0.9
        )
        db.add(insight)
        created_insights.append(insight)

    db.commit()
    for ins in created_insights:
        db.refresh(ins)

    return created_insights

@router.get("", response_model=List[schemas.AIInsightOut])
def get_insights(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return db.query(models.AIInsight).filter(models.AIInsight.user_id == current_user.id).order_by(desc(models.AIInsight.created_at)).all()
