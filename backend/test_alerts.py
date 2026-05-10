import requests
res = requests.post("http://localhost:8000/api/auth/login", json={"email":"ska628480@gmail.com", "password":"password"})
print(res.text)
