# The Second Brain: Local Setup Guide

This guide details the steps to set up "The Second Brain" application locally for development.

## Prerequisites

Ensure you have the following installed on your machine:

-   **Python 3.10+**: [Download Python](https://www.python.org/downloads/)
-   **Node.js (v18+)**: [Download Node.js](https://nodejs.org/)
-   **Poetry**: [Install Poetry](https://python-poetry.org/docs/#installation)
    -   Verify with `poetry --version`.
-   **Git**: [Download Git](https://git-scm.com/downloads)

### Optional
-   **Docker Desktop**: Recommended if you want to run a PostgreSQL database with pgvector easily.
-   **PostgreSQL**: Alternatively, install PostgreSQL locally if you prefer not to use Docker or SQLite.

## Automated Setup (Recommended)

We provide automated scripts to set up the environment and run the application with a single command.

### macOS / Linux
Run the setup script from the root of the repository:
```bash
./setup.sh
```

### Windows
Run the batch script from the root of the repository:
```cmd
setup.bat
```

These scripts will:
1.  Install backend dependencies using Poetry.
2.  Install frontend dependencies using npm.
3.  Set up environment variables (`.env`).
4.  Run tests.
5.  Start the development servers for both backend and frontend.

## Manual Setup

If you prefer to set up manually, follow these steps.

### 1. Clone the Repository

```bash
git clone <repository-url>
cd second-brain
```

### 2. Backend Setup (Cortex)

Navigate to the backend directory:
```bash
cd apps/cortex
```

Install dependencies:
```bash
poetry install
```

Set up environment variables:
```bash
cp .env.example .env
# Edit .env if you need to configure database URL or API keys
```

Run database migrations/initialization:
The application initializes the database on startup.

Run the backend server:
```bash
poetry run uvicorn main:app --reload
```
The API will be available at `http://localhost:8000`.

### 3. Frontend Setup (Web)

Open a new terminal and navigate to the frontend directory:
```bash
cd apps/web
```

Install dependencies:
```bash
npm install
```

Set up environment variables:
Create a `.env.local` file if needed (see `.env.example` if available).

Run the frontend server:
```bash
npm run dev
```
The web app will be available at `http://localhost:3000`.

## Testing

### Backend Tests
From `apps/cortex`:
```bash
poetry run pytest
```

### Frontend Tests/Linting
From `apps/web`:
```bash
npm run lint
```
