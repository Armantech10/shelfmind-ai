from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

from database import engine, Base
import models  # noqa: F401 – registers all models with Base
from routers import auth, products, sales, forecasts, analytics, insights, recommendations, chat as assistant, alerts

# ── Bootstrap ─────────────────────────────────────────────────────────────────
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ShelfMind AI",
    description="Intelligent inventory & demand-forecasting SaaS API",
    version="1.0.0",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        FRONTEND_URL,
        "http://localhost:3000",
        "https://*.vercel.app",
        "capacitor://localhost",
        "http://localhost"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(sales.router)
app.include_router(forecasts.router)
app.include_router(analytics.router)
app.include_router(insights.router)
app.include_router(recommendations.router)
app.include_router(assistant.router)
app.include_router(alerts.router)


@app.get("/health")
def health():
    return {"status": "ok", "version": "1.0.0"}
