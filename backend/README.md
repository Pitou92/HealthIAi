# HealthIAi Backend

This is the backend service for HealthIAi, an AI-powered fitness and nutrition coach. It provides APIs for user onboarding, personalized workout and nutrition plan generation, and visual meal analysis.

## 🚀 Tech Stack

- **Framework:** [FastAPI](https://fastapi.tiangolo.com/)
- **AI Integration:** [OpenAI SDK](https://github.com/openai/openai-python) via [OpenRouter](https://openrouter.ai/)
- **SQL Database:** MySQL with [SQLAlchemy](https://www.sqlalchemy.org/) (Async via `aiomysql`)
- **NoSQL Database:** MongoDB with [Motor](https://motor.readthedocs.io/) (Async)
- **Validation:** [Pydantic v2](https://docs.pydantic.dev/)
- **Environment Management:** `python-dotenv`

## 📂 Project Structure

```text
backend/
├── api/                # API Routes
│   └── routes/         # Endpoint definitions (AI, Auth)
├── core/               # Core Configuration & Database Connections
│   ├── prompts/        # AI System & Vision Prompts
│   ├── config.py       # Global settings and env vars
│   ├── sql_db.py       # MySQL connection (SQLAlchemy)
│   └── nosql_db.py     # MongoDB connection (Motor)
├── models/             # Data Models
│   ├── domain.py       # Pydantic models for API & Business logic
│   └── sql_models.py   # SQLAlchemy ORM models
├── services/           # Business Logic
│   ├── ai_service.py   # AI plan generation logic
│   └── vision_service.py # Image analysis logic
├── examples/           # Example SQL and JSON files
├── main.py             # Application entry point
└── requirements.txt    # Python dependencies
```

## 🛠️ Setup & Installation

### Prerequisites

- Python 3.11+
- MySQL Server
- MongoDB Server
- OpenRouter API Key (or OpenAI/compatible API)

### Installation

1. **Clone the repository and navigate to the backend:**
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment:**
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure Environment Variables:**
   Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```

## 🏃 Running the Application

Start the development server:
```bash
python main.py
```
Or using uvicorn directly:
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`.
- **Interactive Documentation:** `http://localhost:8000/docs` (Swagger UI)
- **Alternative Docs:** `http://localhost:8000/redoc`

## 🧪 Testing

An integration test script is provided to verify the full flow (SQL + NoSQL + AI):
```bash
python test_db_integration.py
```

## 🗄️ Database Architecture

This project uses a **polyglot persistence** approach:

1.  **MySQL (SQL):** Used for **Structured User Profiles** and core authentication data. It ensures data integrity and supports complex relationships for user accounts.
2.  **MongoDB (NoSQL):** Used for **AI-Generated Plans & Analyses**. Since AI outputs can be highly variable and unstructured, MongoDB provides the flexibility to store complex JSON schemas without rigid migrations.

## 📡 API Endpoints

### Auth / Onboarding
- `POST /auth/onboarding`: Register a new user and save their profile in MySQL.
- `GET /auth/user/{user_id}`: Retrieve user profile from MySQL.

### AI / Planning
- `POST /ai/generate-plan`: Generate a standard recommendation plan and save to MongoDB.
- `POST /ai/analyze-meal`: Analyze a meal image using vision models and save results to MongoDB.
- `POST /ai/generate-smart-plan`: Combined endpoint that analyzes a meal and generates a plan adapted to it.
