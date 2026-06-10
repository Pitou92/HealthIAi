import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes.ai import router as ai_router
from api.routes.auth import router as auth_router
from core.config import settings
from core.sql_db import engine, Base

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION
)

@app.on_event("startup")
async def startup():
    # Création des tables SQL au démarrage (pour le dev)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

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
