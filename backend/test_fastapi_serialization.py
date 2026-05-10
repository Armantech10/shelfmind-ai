import requests
import sqlite3
import jwt
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key") # wait, where is secret key defined? Let's check auth.py
