@echo off
echo Starting Flashcard App Backend Servers...
echo.

echo Starting Python AI Service on port 5001...
start "Python AI Service" cmd /k "cd python_ai_service && python app.py"

echo Waiting 3 seconds for Python server to start...
timeout /t 3 /nobreak > nul

echo Starting TypeScript Server on port 5000...
start "TypeScript Server" cmd /k "npm run dev"

echo.
echo Both servers are starting...
echo - TypeScript Server: http://localhost:5000
echo - Python AI Service: http://localhost:5001
echo.
echo Press any key to close this window...
pause > nul 