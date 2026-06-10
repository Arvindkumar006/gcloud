@echo off
setlocal

echo =========================================
echo  Automated Git Commit and Push
echo =========================================

:: Check for changes
git status --short > temp.txt
for /F "usebackq" %%A in ('temp.txt') do set size=%%~zA
if %size% EQU 0 (
    echo No changes found to commit.
    del temp.txt
    exit /b 0
)
del temp.txt

:: If the user passed a message (e.g. push.bat "my message"), use it
:: Otherwise use a default timestamp message
set MSG=%~1
if "%MSG%"=="" (
    set MSG=Auto-update: %date% %time%
)

echo.
echo Staging all files...
git add .

echo.
echo Committing with message: "%MSG%"
git commit -m "%MSG%"

echo.
echo Pushing to GitHub...
git push origin main

echo.
echo =========================================
echo  Done! Your code is live on GitHub.
echo =========================================
endlocal
