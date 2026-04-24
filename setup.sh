#!/bin/bash
set -e

echo "🚀 Setting up Recruitment Platform..."

# Backend
echo "\n📦 Installing backend dependencies..."
cd backend
cp -n .env.example .env 2>/dev/null || true
npm install
mkdir -p logs
cd ..

# Frontend
echo "\n📦 Installing frontend dependencies..."
cd frontend
cp -n .env.example .env.local 2>/dev/null || true
npm install
cd ..

echo "\n✅ Setup complete!"
echo "\n📋 Next steps:"
echo "  1. Edit backend/.env with your MongoDB URI, OpenAI key, Cloudinary credentials"
echo "  2. Edit frontend/.env.local with NEXT_PUBLIC_API_URL"
echo "  3. Run: ./start.sh"
