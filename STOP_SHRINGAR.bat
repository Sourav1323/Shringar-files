@echo off
title Stop Shringar Platform
color 0C
echo =====================================================================
echo                STOPPING SHRINGAR SERVERS                             
echo =====================================================================
echo.
echo Stopping services on port 8080 (Spring Boot)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080 ^| findstr LISTENING') do taskkill /f /pid %%a 2>nul

echo Stopping services on port 3000 (React Vite)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do taskkill /f /pid %%a 2>nul

echo.
echo All Shringar services stopped successfully.
pause
