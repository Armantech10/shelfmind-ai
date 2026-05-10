from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import datetime

from database import get_db
import models
import schemas
from auth import get_current_user

router = APIRouter(prefix="/api/forecasts", tags=["forecasts"])

@router.get("", response_model=List[schemas.ProductForecastsResponse])
def get_all_forecasts(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    products = db.query(models.Product).filter(models.Product.owner_id == current_user.id).all()
    results = []
    for p in products:
        summary = db.query(models.ForecastSummary).filter(models.ForecastSummary.product_id == p.id).first()
        if summary:
            results.append({
                "product": schemas.ProductOut.from_orm(p),
                "summary": schemas.ForecastSummaryOut.from_orm(summary),
                "daily_forecasts": [],
                "historical_sales": []
            })
    return results

@router.get("/{product_id}", response_model=schemas.ProductForecastsResponse)
def get_product_forecast(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    product = db.query(models.Product).filter(models.Product.id == product_id, models.Product.owner_id == current_user.id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    summary = db.query(models.ForecastSummary).filter(models.ForecastSummary.product_id == product.id).first()
    forecasts = db.query(models.Forecast).filter(models.Forecast.product_id == product.id).order_by(models.Forecast.forecast_date.asc()).all()
    
    thirty_days_ago = datetime.datetime.utcnow() - datetime.timedelta(days=30)
    sales = db.query(models.Sale).filter(
        models.Sale.product_id == product.id,
        models.Sale.sale_date >= thirty_days_ago
    ).order_by(models.Sale.sale_date.asc()).all()

    sales_dict = {}
    for s in sales:
        d = s.sale_date.strftime("%Y-%m-%d")
        sales_dict[d] = sales_dict.get(d, 0) + s.quantity
    
    historical_sales = [{"date": k, "quantity": v} for k, v in sorted(sales_dict.items())]

    return {
        "product": schemas.ProductOut.from_orm(product),
        "summary": schemas.ForecastSummaryOut.from_orm(summary) if summary else None,
        "daily_forecasts": [schemas.ForecastOut.from_orm(f) for f in forecasts],
        "historical_sales": historical_sales
    }
