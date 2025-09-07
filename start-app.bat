@echo off
echo Starting Hotel Management App...
echo.
echo Setting up environment variables...
set DATABASE_URL=postgresql://test:test@localhost:5432/hotel_test
set NODE_ENV=production
set PORT=5000
echo.
echo Building application...
call npm run build
echo.
echo Starting server...
echo.
echo 🚀 Hotel Management App is starting...
echo 📊 Health check: http://localhost:5000/health
echo 🌐 Main app: http://localhost:5000
echo.
echo Press Ctrl+C to stop the server
echo.
call npm start
