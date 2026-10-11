@echo off
title Shringar Royal Mehendi - Master Launcher
color 06
echo =====================================================================
echo                 SHRINGAR ROYAL MEHENDI PLATFORM                      
echo =====================================================================
echo.
echo [1/3] Starting Spring Boot Backend (Port 8080)...
start "Shringar Backend (Port 8080)" cmd /k "cd /d "%~dp0shringar-backend" && java -jar target\shringar-backend-1.0.0.jar"

echo [2/3] Starting Vite React Frontend (Port 3000)...
start "Shringar React (Port 3000)" cmd /k "cd /d "%~dp0shringar-react" && npm run dev -- --host 0.0.0.0"

echo [3/4] Starting Standalone Admin Portal (Port 5501)...
start "Shringar Standalone Admin (Port 5501)" cmd /k "cd /d "%~dp0shringar-admin" && python -m http.server 5501"

echo [4/4] Waiting for servers to initialize...
timeout /t 5 /nobreak >nul

echo Opening Shringar in your browser...
start http://localhost:3000/

echo.
echo =====================================================================
echo  Shringar is running!
echo  - React Web App:              http://localhost:3000/
echo  - React Admin Executive Suite: http://localhost:3000/admin
echo  - Standalone Admin Portal:    http://localhost:5501/dashboard.html
echo  - Spring Boot Backend:        http://localhost:8080/
echo =====================================================================
echo You may minimize this window. Run STOP_SHRINGAR.bat to stop servers.
pause
