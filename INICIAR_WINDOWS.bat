@echo off
cd /d "%~dp0"
echo ============================
echo    UCH AGENDA SALUD DEMO
 echo ============================
echo.
echo Si aparece "node no se reconoce", instala Node.js desde https://nodejs.org/
echo.
start "" cmd /c "timeout /t 3 >nul && start http://localhost:5055"
node server.js
if errorlevel 1 (
 echo.
 echo Error al iniciar. Verifica que Node.js sea version 22.13 o superior.
)
pause
