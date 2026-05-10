import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

try:
    model = genai.GenerativeModel("gemini-1.5-flash", system_instruction="You are a bot")
    chat = model.start_chat(history=[{"role": "user", "parts": ["hello"]}])
    res = chat.send_message("world")
    print(res.text)
except Exception as e:
    print(repr(e))
