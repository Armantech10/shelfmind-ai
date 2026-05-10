#!/bin/bash
# Start ShelfMind AI — Backend (FastAPI) + Frontend (Next.js)
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "🚀 Starting ShelfMind AI..."

# Backend
echo "📦 Starting FastAPI backend on http://localhost:8000"
(
  cd "$ROOT/backend"
  source venv/bin/activate
  uvicorn main:app --reload --port 8000
) &
BACKEND_PID=$!

# Frontend
echo "🖥  Starting Next.js frontend on http://localhost:3000"
(
  cd "$ROOT/frontend"
  npm run dev
) &
FRONTEND_PID=$!

echo ""
echo "✅ Both servers running:"
echo "   Backend:  http://localhost:8000"
echo "   Frontend: http://localhost:3000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM
wait
