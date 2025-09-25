#!/bin/bash

# Deploy Frontend to Firebase Hosting
echo "🚀 Deploying Frontend to Firebase Hosting..."

cd frontend

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building application..."
npm run build

# Deploy to Firebase
echo "🌐 Deploying to Firebase..."
firebase deploy --only hosting

echo "✅ Frontend deployed successfully!"

cd ..