import requests

API_URL = "http://localhost:8000"

# Login
r = requests.post(f"{API_URL}/api/auth/login", json={
    "email": "test@shelfmind.com",
    "password": "password123"
})
token = r.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

r = requests.get(f"{API_URL}/api/forecasts/", headers=headers)
print("Forecasts:", r.status_code, [x['product']['name'] for x in r.json()])

