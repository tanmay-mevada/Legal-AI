@echo off
REM Deploy Frontend to Firebase Hosting (Windows)

echo 🚀 Deploying Frontend to Firebase Hosting...

cd frontend

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Build the application
echo 🔨 Building application...
npm run build

REM Deploy to Firebase
echo 🌐 Deploying to Firebase...
firebase deploy --only hosting

echo ✅ Frontend deployed successfully!

cd ..