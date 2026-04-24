#!/bin/bash

echo "🚀 Starting Recruitment Platform..."

# Start backend
echo "Starting backend on :5000..."
cd backend && npm run dev &
BACKEND_PID=$!

# Start frontend
echo "Starting frontend on :3000..."
cd frontend && npm run dev &
FRONTEND_PID=$!

echo "\n✅ Running!"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:5000"
echo "  Health:   http://localhost:5000/health"
echo "\nPress Ctrl+C to stop both servers."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo '\nStopped.'" INT TERM
wait
