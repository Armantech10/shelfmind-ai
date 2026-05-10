from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List
import datetime

from database import get_db
import models
import schemas
from auth import get_current_user

router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])

@router.post("/generate", response_model=List[schemas.ReorderRecommendationOut])
def generate_recommendations(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    products = db.query(models.Product).filter(models.Product.owner_id == current_user.id).all()
    
    # Clear old unapproved recommendations
    db.query(models.ReorderRecommendation).filter(
        models.ReorderRecommendation.product_id.in_([p.id for p in products]),
        models.ReorderRecommendation.is_approved == False
    ).delete(synchronize_session=False)

    now = datetime.datetime.utcnow()
    new_recs = []

    for p in products:
        f = p.forecast_summary
        if not f:
            continue
        
        # reorder_qty = max(0, (predicted_demand_7d + min_threshold) - current_stock)
        safety_stock = p.min_threshold
        qty_needed = max(0, (f.demand_7_day + safety_stock) - p.current_stock)

        if qty_needed > 0:
            # Calculate Urgency
            urgency = "low"
            if f.stockout_probability > 0.7:
                urgency = "critical"
            elif f.stockout_probability > 0.4:
                urgency = "high"
            elif f.stockout_probability > 0.2:
                urgency = "medium"

            # Priority Score
            trend_multiplier = 1.0
            if f.demand_trend == "increasing":
                trend_multiplier = 1.2
            elif f.demand_trend == "decreasing":
                trend_multiplier = 0.8
            
            priority = f.stockout_probability * trend_multiplier
            
            # Simple stockout estimate
            stockout_days = max(1, p.current_stock / max(0.1, (f.demand_7_day / 7)))
            stockout_date = now + datetime.timedelta(days=stockout_days)

            reasoning = f"Predicted stockout in {int(stockout_days)} days due to {f.demand_trend} demand."

            rec = models.ReorderRecommendation(
                product_id=p.id,
                recommended_quantity=int(qty_needed),
                recommended_order_date=now,
                estimated_stockout_date=stockout_date,
                urgency=urgency,
                priority_score=priority,
                reasoning=reasoning
            )
            db.add(rec)
            new_recs.append(rec)

    db.commit()
    for r in new_recs:
        db.refresh(r)
    
    # Order by priority descending
    new_recs.sort(key=lambda x: x.priority_score, reverse=True)
    return new_recs

@router.get("", response_model=List[schemas.ReorderRecommendationOut])
def get_recommendations(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    products = db.query(models.Product.id).filter(models.Product.owner_id == current_user.id).subquery()
    
    return db.query(models.ReorderRecommendation).filter(
        models.ReorderRecommendation.product_id.in_(products),
        models.ReorderRecommendation.is_approved == False
    ).order_by(desc(models.ReorderRecommendation.priority_score)).all()

@router.post("/{rec_id}/approve")
def approve_recommendation(
    rec_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    rec = db.query(models.ReorderRecommendation).filter(models.ReorderRecommendation.id == rec_id).first()
    if not rec or rec.product.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    
    rec.is_approved = True
    rec.approved_at = datetime.datetime.utcnow()
    # In a real system, this would trigger a PO generation
    
    db.commit()
    return {"status": "success", "message": "Recommendation marked as ordered"}
