import pandas as pd
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from statsmodels.tsa.arima.model import ARIMA
import numpy as np

import models

def retrain_product_model(db: Session, product_id: int):
    # Fetch product
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        return
    
    # Fetch all sales for product
    sales = db.query(models.Sale).filter(models.Sale.product_id == product_id).all()
    if not sales:
        return

    # Convert to DataFrame
    df = pd.DataFrame([{
        "sale_date": s.sale_date,
        "quantity": s.quantity
    } for s in sales])
    
    # Ensure datetime
    df["sale_date"] = pd.to_datetime(df["sale_date"]).dt.tz_localize(None)
    
    # Resample daily
    df.set_index("sale_date", inplace=True)
    daily_sales = df.resample("D").sum().fillna(0)

    # Ensure we have a continuous range up to today
    today = pd.to_datetime(datetime.utcnow().date())
    if daily_sales.empty:
        return
    
    idx = pd.date_range(start=daily_sales.index.min(), end=today, freq="D")
    daily_sales = daily_sales.reindex(idx, fill_value=0)

    quantities = daily_sales["quantity"].values

    if len(quantities) < 3:
        # Not enough data for ARIMA, use simple average
        avg = np.mean(quantities)
        forecast_values = [avg] * 30
        conf_int = [[avg * 0.5, avg * 1.5]] * 30
    else:
        try:
            # Fit ARIMA
            model = ARIMA(quantities, order=(1, 1, 1))
            model_fit = model.fit()
            
            forecast_res = model_fit.get_forecast(steps=30)
            forecast_values = forecast_res.predicted_mean
            conf_int = forecast_res.conf_int()
        except Exception:
            # Fallback
            avg = np.mean(quantities[-7:]) if len(quantities) >= 7 else np.mean(quantities)
            forecast_values = [avg] * 30
            conf_int = [[avg * 0.5, avg * 1.5]] * 30

    # Clean old forecasts
    db.query(models.Forecast).filter(models.Forecast.product_id == product_id).delete()

    # Save new forecasts
    forecast_dates = [today + timedelta(days=i) for i in range(1, 31)]
    for i in range(30):
        f_val = max(0, float(forecast_values[i]))
        c_lower = max(0, float(conf_int[i][0]))
        c_upper = max(0, float(conf_int[i][1]))
        db.add(models.Forecast(
            product_id=product_id,
            forecast_date=forecast_dates[i],
            predicted_quantity=f_val,
            confidence_lower=c_lower,
            confidence_upper=c_upper,
            model_type="ARIMA"
        ))

    # Calculate Summary metrics
    demand_7_day = float(sum(max(0, val) for val in forecast_values[:7]))
    demand_30_day = float(sum(max(0, val) for val in forecast_values))
    
    current_stock = product.current_stock
    
    # Stockout Probability
    if current_stock < demand_7_day:
        stockout_prob = 0.9
    elif current_stock < demand_30_day:
        stockout_prob = 0.5
    else:
        stockout_prob = 0.1

    # Overstock Probability
    if current_stock > demand_30_day * 3:
        overstock_prob = 0.8
    elif current_stock > demand_30_day * 2:
        overstock_prob = 0.4
    else:
        overstock_prob = 0.05

    # Reorder Quantity
    reorder_qty = max(0, int(demand_30_day - current_stock + product.min_threshold))

    # Trend (using last 30 days of actual sales)
    trend = "stable"
    if len(quantities) >= 7:
        recent_sales = quantities[-30:] if len(quantities) >= 30 else quantities
        x = np.arange(len(recent_sales))
        y = recent_sales
        slope, intercept = np.polyfit(x, y, 1)
        if slope > 0.5:
            trend = "increasing"
        elif slope < -0.5:
            trend = "decreasing"

    # Confidence Score (heuristic)
    conf_score = 0.85 if len(quantities) > 30 else 0.5

    # Save Summary
    summary = db.query(models.ForecastSummary).filter(models.ForecastSummary.product_id == product_id).first()
    if not summary:
        summary = models.ForecastSummary(product_id=product_id)
        db.add(summary)
    
    summary.demand_7_day = demand_7_day
    summary.demand_30_day = demand_30_day
    summary.stockout_probability = stockout_prob
    summary.overstock_probability = overstock_prob
    summary.recommended_reorder_quantity = reorder_qty
    summary.demand_trend = trend
    summary.confidence_score = conf_score

    db.commit()

def process_all_products(db: Session, user_id: int):
    products = db.query(models.Product).filter(models.Product.owner_id == user_id).all()
    for p in products:
        retrain_product_model(db, p.id)
