#!/bin/bash
set -e

# Setup script for The Second Brain

# Function to check for required tools
check_tool() {
    if ! command -v "$1" &> /dev/null; then
        echo "Error: $1 is not installed."
        exit 1
    fi
}

MODE="dev"
if [ "$1" == "--ci" ]; then
    MODE="ci"
fi

echo "Starting setup in $MODE mode..."

# Check prerequisites
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
    echo "Python 3 found."
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
    echo "Python found."
else
    echo "Error: Python is not installed."
    exit 1
fi

if command -v poetry &> /dev/null; then
    POETRY_CMD="poetry"
elif $PYTHON_CMD -m poetry --version &> /dev/null; then
    POETRY_CMD="$PYTHON_CMD -m poetry"
else
    echo "Error: poetry is not installed."
    echo "You can install it using: $PYTHON_CMD -m pip install poetry"
    exit 1
fi
echo "Using poetry command: $POETRY_CMD"
check_tool node
check_tool npm

echo "Prerequisites check passed."

# Backend Setup (Cortex)
echo "Setting up Backend (Cortex)..."
cd apps/cortex

if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "Created .env from .env.example"
    else
        echo "Warning: .env.example not found. Creating empty .env"
        touch .env
    fi
fi

echo "Installing backend dependencies..."
$POETRY_CMD install

echo "Running backend tests..."
PYTHONPATH=. $POETRY_CMD run pytest

cd ../..

# Frontend Setup (Web)
echo "Setting up Frontend (Web)..."
cd apps/web

if [ ! -f .env.local ]; then
    if [ -f .env.example ]; then
        cp .env.example .env.local
        echo "Created .env.local from .env.example"
    else
        echo "Warning: .env.example not found. Creating empty .env.local"
        touch .env.local
    fi
fi

echo "Installing frontend dependencies..."
npm install

echo "Running frontend linting..."
npm run lint

cd ../..

echo "Setup complete!"

if [ "$MODE" == "ci" ]; then
    echo "CI mode: Skipping server startup."
    exit 0
fi

echo "Starting application..."

# Function to cleanup background processes on exit
cleanup() {
    echo "Stopping servers..."
    # Kill all child processes of this script's process group
    kill $(jobs -p) 2>/dev/null || true
}
trap cleanup EXIT

# Start Backend
cd apps/cortex
echo "Starting Backend on http://localhost:8000"
$POETRY_CMD run uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
cd ../..

# Start Frontend
cd apps/web
echo "Starting Frontend on http://localhost:3000"
npm run dev &
FRONTEND_PID=$!
cd ../..

echo "Application is running!"
echo "Press Ctrl+C to stop."

# Wait for processes to finish
wait
