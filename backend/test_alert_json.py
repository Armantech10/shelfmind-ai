import requests
import jwt
import os
from datetime import datetime, timedelta

SECRET_KEY = os.getenv("SECRET_KEY", "fallback-secret-key")
to_encode = {"sub": "1", "exp": datetime.utcnow() + timedelta(minutes=10)}
token = jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")

res = requests.get(
    "http://localhost:8000/api/alerts",
    cookies={"access_token": f"Bearer {token}"}
)
print("STATUS:", res.status_code)
print("BODY:", res.text)
