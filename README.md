# ShelfMind AI 🚀

ShelfMind AI is an ultra-premium, intelligent inventory and demand-forecasting SaaS platform. It combines traditional machine learning (ARIMA) for precise sales forecasting with Generative AI (Gemini 1.5 Flash) for conversational insights and smart reorder recommendations.

## 🌟 Key Features

- **Demand Forecasting:** Automated ARIMA models trained on historical sales.
- **Smart Reorder Engine:** Calculates precise reorder quantities based on safety stock and stockout risk.
- **Automated Alerts:** Background scanning flags low stock, expiry warnings, and demand spikes.
- **AI Business Insights:** Generates actionable reports from complex inventory data.
- **Conversational Assistant:** Chat directly with your inventory using the AI assistant.

---

## 🛠 Tech Stack

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS (Premium Dark Mode)
- **Animations:** Framer Motion
- **Charts:** Recharts

### Backend
- **Framework:** FastAPI (Python)
- **Database:** SQLAlchemy & SQLite/PostgreSQL
- **AI/ML:** statsmodels (ARIMA), Google Gemini 1.5 Flash

---

## 🚀 Quick Start

### Option 1: Docker (Recommended)

1. Clone the repository and navigate into it.
2. Create a `.env` file in the root based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
3. Add your `GEMINI_API_KEY` to the `.env` file.
4. Start the services:
   ```bash
   docker-compose up --build
   ```

### Option 2: Manual Setup

#### Backend
1. `cd backend`
2. `pip install -r requirements.txt`
3. `python seed.py` (to create demo data)
4. `uvicorn main:app --reload`

#### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

---

## 🔑 Environment Variables

| Variable | Description | Location |
|----------|-------------|----------|
| `SECRET_KEY` | JWT Signing Key | Backend |
| `GEMINI_API_KEY` | Google AI Studio API Key | Backend |
| `DATABASE_URL` | SQLAlchemy Connection String | Backend |
| `NEXT_PUBLIC_API_URL` | Backend API Endpoint | Frontend |

---

## 📸 Screenshots
*(Add screenshots here after deployment)*

---

## ⚖️ License
MIT License
