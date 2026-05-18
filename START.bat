@echo off
REM Startup script for Research Agent (Backend + Frontend)

echo Starting Research Agent System...
echo.

REM Check if venv is activated
if not defined VIRTUAL_ENV (
    echo Activating Python virtual environment...
    call venv\Scripts\activate.bat
)

REM Start Python backend in a new window
echo Starting Python Flask backend on port 5000...
start "Research Agent Backend" python app.py

REM Wait a moment for backend to start
timeout /t 2 /nobreak

REM Start frontend in a new window
echo Starting Express frontend on port 3000...
cd frontend
start "Research Agent Frontend" npm run dev
cd ..

echo.
echo =============================================
echo Research Agent System is starting...
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo.
echo Credentials: username: admin, password: nexus123
echo =============================================
echo.

pause
