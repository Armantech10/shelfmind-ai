from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List
import datetime

from database import get_db
import models
import schemas
from auth import get_current_user

router = APIRouter(prefix="/api/alerts", tags=["alerts"])


@router.post("/scan")
def scan_alerts(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    products = db.query(models.Product).filter(
        models.Product.owner_id == current_user.id
    ).all()
    now = datetime.datetime.utcnow()

    # To avoid duplicate active alerts, we can just clear active ones or check if they exist.
    # For simplicity, we'll mark all existing active alerts for these products as resolved,
    # then generate fresh ones if the condition still holds.
    # Or, we can just generate them and the user marks them as read.
    # But if we run this often, we don't want 100 "Low Stock" alerts for the same item.
    # So let's delete active alerts of the same type for the same product before creating.

    new_alerts = []

    for p in products:
        f = p.forecast_summary

        # 1. low_stock
        if p.current_stock < p.min_threshold:
            _create_or_update_alert(
                db, current_user.id, p.id,
                alert_type="low_stock",
                title=f"Low Stock: {p.name}",
                message=(
                    f"Current stock ({p.current_stock}) is below "
                    f"minimum threshold ({p.min_threshold})."
                ),
                severity=models.AlertSeverity.high
            )

        # 2. expiry_warning
        if p.expiry_date:
            days_to_expiry = (p.expiry_date.date() - now.date()).days
            if 0 <= days_to_expiry <= 7:
                _create_or_update_alert(
                    db, current_user.id, p.id,
                    alert_type="expiry_warning",
                    title=f"Expiring Soon: {p.name}",
                    message=(
                        f"Product will expire in {days_to_expiry} days "
                        f"on {p.expiry_date.date()}."
                    ),
                    severity=models.AlertSeverity.high
                )
            elif days_to_expiry < 0:
                _create_or_update_alert(
                    db, current_user.id, p.id,
                    alert_type="expired",
                    title=f"Expired: {p.name}",
                    message=f"Product expired {-days_to_expiry} days ago.",
                    severity=models.AlertSeverity.critical
                )

        if f:
            # 3. stockout_risk
            if f.stockout_probability > 0.6:
                _create_or_update_alert(
                    db, current_user.id, p.id,
                    alert_type="stockout_risk",
                    title=f"High Stockout Risk: {p.name}",
                    message=(
                        f"There is a {int(f.stockout_probability * 100)}% "
                        f"chance of stocking out in the next 7 days."
                    ),
                    severity=models.AlertSeverity.critical
                )

            # 4. overstock
            # overstock: current_stock > 3x average monthly sales (approx demand_30_day)
            if f.demand_30_day > 0 and p.current_stock > (3 * f.demand_30_day):
                _create_or_update_alert(
                    db, current_user.id, p.id,
                    alert_type="overstock",
                    title=f"Overstock Detected: {p.name}",
                    message=(
                        f"Current stock ({p.current_stock}) is over 3x "
                        f"the 30-day demand ({int(f.demand_30_day)})."
                    ),
                    severity=models.AlertSeverity.low
                )

            # 5. demand_spike
            # demand_spike: predicted demand 7d > 150% of (demand_30_day / 4)
            avg_weekly = f.demand_30_day / 4.0
            if avg_weekly > 0 and f.demand_7_day > (1.5 * avg_weekly):
                _create_or_update_alert(
                    db, current_user.id, p.id,
                    alert_type="demand_spike",
                    title=f"Demand Spike: {p.name}",
                    message=(
                        f"Predicted 7-day demand ({int(f.demand_7_day)}) "
                        f"is unusually high compared to historical averages."
                    ),
                    severity=models.AlertSeverity.medium
                )

    db.commit()
    return {"status": "success"}


def _create_or_update_alert(
    db, user_id, product_id, alert_type, title, message, severity
):
    # Check if an active alert of this type already exists for this product
    existing = db.query(models.Alert).filter(
        models.Alert.user_id == user_id,
        models.Alert.product_id == product_id,
        models.Alert.alert_type == alert_type,
        models.Alert.status == models.AlertStatus.active
    ).first()

    if not existing:
        new_alert = models.Alert(
            user_id=user_id,
            product_id=product_id,
            title=title,
            message=message,
            severity=severity,
            status=models.AlertStatus.active,
            alert_type=alert_type
        )
        db.add(new_alert)


@router.get("", response_model=List[schemas.AlertOut])
def get_alerts(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return db.query(models.Alert).filter(
        models.Alert.user_id == current_user.id,
        models.Alert.status == models.AlertStatus.active
    ).order_by(desc(models.Alert.created_at)).all()


@router.put("/{alert_id}/read")
def mark_alert_read(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    alert = db.query(models.Alert).filter(
        models.Alert.id == alert_id,
        models.Alert.user_id == current_user.id
    ).first()

    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    alert.status = models.AlertStatus.acknowledged
    alert.acknowledged_at = datetime.datetime.utcnow()
    db.commit()

    return {"status": "success"}
