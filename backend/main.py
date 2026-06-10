import uvicorn
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes.ai import router as ai_router
from api.routes.auth import router as auth_router
from core.config import settings
from core.sql_db import engine, Base

# Setup logging
logging.basicConfig(
    level=settings.LOG_LEVEL,
    format=settings.LOG_FORMAT,
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="""
    ## HealthIAi API
    AI-powered coach providing personalized nutrition and fitness plans.
    
    ### Key Features:
    * **User Onboarding:** Profile management with MySQL.
    * **AI Recommendations:** Adaptive sports and nutrition planning using GPT models.
    * **Computer Vision:** Real-time meal analysis and calorie estimation from images.
    * **NoSQL Storage:** Plans and analyses stored in MongoDB for flexibility.
    """,
    version=settings.VERSION
)

@app.on_event("startup")
async def startup():
    logger.info(f"Starting {settings.PROJECT_NAME} v{settings.VERSION}...")
    # Création des tables SQL au démarrage (pour le dev)
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("SQL database tables synchronized successfully.")
    except Exception as e:
        logger.error(f"Failed to synchronize SQL database tables: {e}")

app.include_router(ai_router, prefix="/ai", tags=["AI"])
app.include_router(auth_router, prefix="/auth", tags=["Auth"])

@app.get("/")
async def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME}",
        "status": "online",
        "version": settings.VERSION
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
