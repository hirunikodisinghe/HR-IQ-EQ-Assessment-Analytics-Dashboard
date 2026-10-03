@echo off
cd /d C:\Users\hiruni\hiruni_gri\HRDash\backend

echo ========================================== >> backend_task.log
echo [%date% %time%] Starting HRDash backend >> backend_task.log

"C:\Program Files\nodejs\node.exe" server.js >> backend_task.log 2>&1