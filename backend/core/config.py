import os
from pathlib import Path
from dotenv import load_dotenv

# Base directory of the project
BASE_DIR = Path(__file__).parent.parent

# Load environment variables
load_dotenv(BASE_DIR / ".env")

class Settings:
    PROJECT_NAME: str = "HealthAI Coach API"
    VERSION: str = "1.0.0"

    OPENROUTER_KEY: str = os.getenv("OPENROUTER_KEY", "")
    AI_MODEL: str = "openai/gpt-oss-120b:free"
    
    # SQL Database (MySQL) - MUST use aiomysql for async
    DATABASE_URL: str = os.getenv("DATABASE_URL", "mysql+aiomysql://root:password@localhost/healthiai")
    
    # NoSQL Database (MongoDB)
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    MONGODB_DB_NAME: str = os.getenv("MONGODB_DB_NAME", "healthiai")

    PROMPT_DIR: Path = BASE_DIR / "core" / "prompts"
    SYSTEM_PROMPT_PATH: Path = PROMPT_DIR / "system_prompt.md"
    VISION_PROMPT: Path = PROMPT_DIR / "vision_prompt.md"

settings = Settings()
