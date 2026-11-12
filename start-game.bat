@echo off
cd /d "%~dp0"
echo ============================================
echo  MTN Data Privacy Crossword Challenge
echo ============================================
if not exist node_modules (
  echo.
  echo ERROR: Dependencies have not been installed.
  echo Please run: npm install
  echo Then:      npx prisma migrate dev
  echo Then:      npm run seed
  echo.
  pause
  exit /b 1
)
echo Starting production server on http://localhost:3000
start "" "http://localhost:3000"
call npm run start
pause