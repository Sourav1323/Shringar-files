@echo off
setlocal
echo ========================================================
echo   SHRINGAR PLATFORM - OCI 1-CLICK DEPLOYER
echo ========================================================

if "%~1"=="" (
    set /p SERVER_IP="Enter your OCI Server Public IP: "
) else (
    set SERVER_IP=%~1
)

if "%SERVER_IP%"=="" (
    echo Error: No Server IP specified.
    pause
    exit /b 1
)

echo Deploying to Oracle Cloud Server at: %SERVER_IP%
powershell -ExecutionPolicy Bypass -File "%~dp0deploy-to-oci.ps1" -ServerIp "%SERVER_IP%"

pause
