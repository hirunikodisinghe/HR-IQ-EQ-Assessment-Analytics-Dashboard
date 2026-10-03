@echo off

cd /d C:\Users\hiruni\hiruni_gri\HRDash\frontend\frontend

set PORT=3000

echo ========================================== >> frontend_task.log
echo [%date% %time%] Starting HRDash frontend on port 3000 >> frontend_task.log

"C:\Program Files\nodejs\npm.cmd" start >> frontend_task.log 2>&1