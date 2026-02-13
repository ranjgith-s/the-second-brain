@echo off
setlocal

set MODE=dev
if "%1"=="--ci" set MODE=ci

echo Starting setup in %MODE% mode...

REM Check prerequisites
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Python is not installed.
    exit /b 1
)

call npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: npm is not installed.
    exit /b 1
)

call poetry --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Poetry is not installed.
    exit /b 1
)

echo Prerequisites check passed.

REM Backend Setup
echo Setting up Backend (Cortex)...
cd apps\cortex

if not exist .env (
    if exist .env.example (
        copy .env.example .env
        echo Created .env from .env.example
    ) else (
        echo Warning: .env.example not found. Creating empty .env
        type nul > .env
    )
)

echo Installing backend dependencies...
call poetry install

echo Running backend tests...
set PYTHONPATH=.
call poetry run pytest
if %errorlevel% neq 0 (
    echo Backend tests failed.
    exit /b 1
)

cd ..\..

REM Frontend Setup
echo Setting up Frontend (Web)...
cd apps\web

if not exist .env.local (
    if exist .env.example (
        copy .env.example .env.local
        echo Created .env.local from .env.example
    ) else (
        echo Warning: .env.example not found. Creating empty .env.local
        type nul > .env.local
    )
)

echo Installing frontend dependencies...
call npm install

echo Running frontend linting...
call npm run lint
if %errorlevel% neq 0 (
    echo Frontend linting failed.
    exit /b 1
)

cd ..\..

echo Setup complete!

if "%MODE%"=="ci" (
    echo CI mode: Skipping server startup.
    exit /b 0
)

echo Starting application...

REM Start Backend
cd apps\cortex
start "Cortex Backend" cmd /k "poetry run uvicorn main:app --reload --port 8000"
cd ..\..

REM Start Frontend
cd apps\web
start "Web Frontend" cmd /k "npm run dev"
cd ..\..

echo Application is running!
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo Press Ctrl+C in the separate windows to stop.

endlocal
