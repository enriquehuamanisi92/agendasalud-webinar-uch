@echo off
cd /d "%~dp0"
echo Esta operacion BORRARA el archivo SQLite local y las citas creadas durante la demo.
choice /C SN /M "Deseas reiniciar los datos de muestra?"
if errorlevel 2 exit /b 0
if exist agenda_demo.sqlite del agenda_demo.sqlite
if exist agenda_demo.sqlite-wal del agenda_demo.sqlite-wal
if exist agenda_demo.sqlite-shm del agenda_demo.sqlite-shm
echo Se eliminó la base de datos local. La proxima vez se crearan 12 citas ficticias.
pause
