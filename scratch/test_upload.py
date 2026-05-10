import requests

API_URL = "http://localhost:8000"

# 1. Register User
r = requests.post(f"{API_URL}/api/auth/register", json={
    "email": "test@shelfmind.com",
    "password": "password123",
    "full_name": "Test User"
})
print("Register:", r.status_code, r.text)

# 2. Login
r = requests.post(f"{API_URL}/api/auth/login", json={
    "email": "test@shelfmind.com",
    "password": "password123"
})
print("Login:", r.status_code)
token = r.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

# 3. Upload CSV
with open("sales_data.csv", "rb") as f:
    files = {"file": ("sales_data.csv", f, "text/csv")}
    r = requests.post(f"{API_URL}/api/sales/upload", files=files, headers=headers)
    print("Upload:", r.status_code, r.text)

