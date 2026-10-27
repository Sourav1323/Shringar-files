@echo off
title Shringar Royal Mehendi - Master Launcher
color 06
echo =====================================================================
echo                 SHRINGAR ROYAL MEHENDI PLATFORM                      
echo =====================================================================
echo.

set "JAVA_EXE=C:\Program Files\Java\jdk-21\bin\java.exe"
if not exist "%JAVA_EXE%" set "JAVA_EXE=java"

echo [1/3] Starting Spring Boot Backend (Port 8080)...
start "Shringar Backend (Port 8080)" cmd /k "title Shringar Backend && cd /d "%~dp0shringar-backend" && "%JAVA_EXE%" -jar target\shringar-backend-1.0.0.jar"

echo [2/3] Starting Vite React Frontend (Port 3005)...
start "Shringar React (Port 3005)" cmd /k "title Shringar React Frontend && cd /d "%~dp0shringar-react" && npm run dev"

echo [3/4] Starting Standalone Admin Portal (Port 5501)...
start "Shringar Standalone Admin (Port 5501)" cmd /k "title Shringar Standalone Admin && cd /d "%~dp0shringar-admin" && python -m http.server 5501"

echo [4/4] Waiting for servers to initialize...
timeout /t 6 /nobreak >nul

echo Opening Shringar in your browser...
start http://localhost:3005/

echo.
echo =====================================================================
echo  Shringar is running!
echo  - React Web App:              http://localhost:3005/
echo  - React Admin Executive Suite: http://localhost:3005/admin
echo  - Standalone Admin Portal:    http://localhost:5501/dashboard.html
echo  - Spring Boot Backend:        http://localhost:8080/api
echo =====================================================================
echo You may minimize this window. Run STOP_SHRINGAR.bat to stop servers.
pause
