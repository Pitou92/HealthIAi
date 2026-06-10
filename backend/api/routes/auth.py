from fastapi import APIRouter, Depends, HTTPException
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from core.sql_db import get_db
from models.sql_models import User
from models.domain import UserProfile
from sqlalchemy import select

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/onboarding")
async def onboarding(profile: UserProfile, db: AsyncSession = Depends(get_db)):
    """
    Crée un nouvel utilisateur dans MySQL avec les données d'onboarding.
    """
    logger.info("Starting user onboarding process")
    try:
        new_user = User(
            age=profile.age,
            height=profile.height_cm,
            weight=profile.weight_kg,
            sex=profile.sex,
            goal=profile.goal,
            activity_frequency=profile.workouts_per_week,
            activity_type=profile.daily_activity, # Mapping simple pour l'exemple
            activity_level=profile.fitness_level
        )
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
        logger.info(f"User created successfully with id: {new_user.id}")
        return {"user_id": new_user.id, "message": "User created successfully"}
    except Exception as e:
        logger.error(f"Failed to create user during onboarding: {e}")
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create user: {str(e)}")

@router.get("/user/{user_id}")
async def get_user(user_id: int, db: AsyncSession = Depends(get_db)):
    """
    Récupère les infos d'un utilisateur depuis MySQL.
    """
    logger.info(f"Retrieving user info for user_id: {user_id}")
    try:
        result = await db.execute(select(User).filter(User.id == user_id))
        user = result.scalars().first()
        if not user:
            logger.warning(f"User not found with id: {user_id}")
            raise HTTPException(status_code=404, detail="User not found")
        logger.info(f"User {user_id} retrieved successfully")
        return user
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
