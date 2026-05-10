from database import SessionLocal
import models
from routers.alerts import get_alerts
from fastapi.encoders import jsonable_encoder
from schemas import AlertOut
import sys

try:
    db = SessionLocal()
    user = db.query(models.User).first()
    alerts = get_alerts(db, user)
    
    # Try validating with Pydantic schema
    for alert in alerts:
        AlertOut.model_validate(alert)
        
    print("SUCCESS")
except Exception as e:
    import traceback
    traceback.print_exc()
