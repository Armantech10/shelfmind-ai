from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
import datetime

from database import get_db
import models
import schemas
from auth import get_current_user

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

@router.get("/summary", response_model=schemas.AnalyticsSummaryOut)
def get_analytics_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    total_products = db.query(models.Product).filter(models.Product.owner_id == current_user.id).count()
    low_stock_count = db.query(models.Product).filter(
        models.Product.owner_id == current_user.id,
        models.Product.current_stock <= models.Product.min_threshold
    ).count()

    now = datetime.datetime.utcnow()
    thirty_days_ago = now - datetime.timedelta(days=30)
    seven_days_ago = now - datetime.timedelta(days=7)

    sales_30d = db.query(func.sum(models.Sale.total_amount)).join(models.Product).filter(
        models.Product.owner_id == current_user.id,
        models.Sale.sale_date >= thirty_days_ago
    ).scalar() or 0.0

    sales_7d = db.query(func.sum(models.Sale.total_amount)).join(models.Product).filter(
        models.Product.owner_id == current_user.id,
        models.Sale.sale_date >= seven_days_ago
    ).scalar() or 0.0

    predicted_demand = db.query(func.sum(models.ForecastSummary.demand_7_day)).join(models.Product).filter(
        models.Product.owner_id == current_user.id
    ).scalar() or 0.0

    avg_accuracy = db.query(func.avg(models.ForecastSummary.confidence_score)).join(models.Product).filter(
        models.Product.owner_id == current_user.id
    ).scalar() or 0.0

    return schemas.AnalyticsSummaryOut(
        total_products=total_products,
        low_stock_count=low_stock_count,
        total_revenue_30d=sales_30d,
        weekly_sales=sales_7d,
        predicted_demand_next_7d=predicted_demand,
        forecast_accuracy_score=avg_accuracy
    )

@router.get("/revenue-trend", response_model=List[schemas.RevenueTrendOut])
def get_revenue_trend(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    now = datetime.datetime.utcnow()
    thirty_days_ago = now - datetime.timedelta(days=30)

    sales = db.query(models.Sale).join(models.Product).filter(
        models.Product.owner_id == current_user.id,
        models.Sale.sale_date >= thirty_days_ago
    ).all()

    daily_revenue = {}
    for i in range(31):
        d = (thirty_days_ago + datetime.timedelta(days=i)).strftime("%Y-%m-%d")
        daily_revenue[d] = 0.0

    for s in sales:
        d = s.sale_date.strftime("%Y-%m-%d")
        if d in daily_revenue:
            daily_revenue[d] += s.total_amount

    return [schemas.RevenueTrendOut(date=k, revenue=v) for k, v in sorted(daily_revenue.items())]

@router.get("/top-products", response_model=List[schemas.TopProductOut])
def get_top_products(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    now = datetime.datetime.utcnow()
    thirty_days_ago = now - datetime.timedelta(days=30)

    results = db.query(
        models.Product.id,
        models.Product.name,
        func.sum(models.Sale.quantity).label('total_qty'),
        func.sum(models.Sale.total_amount).label('total_rev')
    ).join(models.Sale).filter(
        models.Product.owner_id == current_user.id,
        models.Sale.sale_date >= thirty_days_ago
    ).group_by(models.Product.id, models.Product.name).order_by(func.sum(models.Sale.quantity).desc()).limit(10).all()

    return [
        schemas.TopProductOut(
            product_id=r.id,
            name=r.name,
            quantity_sold=r.total_qty or 0,
            revenue=r.total_rev or 0.0
        ) for r in results
    ]

@router.get("/slow-movers", response_model=List[schemas.TopProductOut])
def get_slow_movers(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    now = datetime.datetime.utcnow()
    thirty_days_ago = now - datetime.timedelta(days=30)

    results = db.query(
        models.Product.id,
        models.Product.name,
        func.sum(models.Sale.quantity).label('total_qty'),
        func.sum(models.Sale.total_amount).label('total_rev')
    ).join(models.Sale).filter(
        models.Product.owner_id == current_user.id,
        models.Sale.sale_date >= thirty_days_ago
    ).group_by(models.Product.id, models.Product.name).order_by(func.sum(models.Sale.quantity).asc()).limit(10).all()

    return [
        schemas.TopProductOut(
            product_id=r.id,
            name=r.name,
            quantity_sold=r.total_qty or 0,
            revenue=r.total_rev or 0.0
        ) for r in results
    ]

@router.get("/inventory-turnover", response_model=List[schemas.InventoryTurnoverOut])
def get_inventory_turnover(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    now = datetime.datetime.utcnow()
    thirty_days_ago = now - datetime.timedelta(days=30)

    results = db.query(
        models.Product.id,
        models.Product.name,
        models.Product.current_stock,
        func.sum(models.Sale.quantity).label('total_qty')
    ).outerjoin(models.Sale, (models.Sale.product_id == models.Product.id) & (models.Sale.sale_date >= thirty_days_ago)).filter(
        models.Product.owner_id == current_user.id
    ).group_by(models.Product.id, models.Product.name, models.Product.current_stock).all()

    turnovers = []
    for r in results:
        qty = r.total_qty or 0
        stock = r.current_stock if r.current_stock > 0 else 1
        turnovers.append(schemas.InventoryTurnoverOut(
            product_id=r.id,
            name=r.name,
            turnover_ratio=round(qty / stock, 2)
        ))
    
    return sorted(turnovers, key=lambda x: x.turnover_ratio, reverse=True)[:10]
