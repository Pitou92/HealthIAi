from fastapi import APIRouter, Depends, HTTPException, status
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from core.sql_db import get_db
from models.sql_models import User
from models.domain import UserProfile, UserRegister, UserLogin, Token
from sqlalchemy import select
from services.auth_service import get_password_hash, verify_password, create_access_token, get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/register", response_model=Token)
async def register(user_data: UserRegister, db: AsyncSession = Depends(get_db)):
    """
    Crée un nouvel utilisateur.
    """
    logger.info(f"Registering new user: {user_data.email}")
    
    # Check if user already exists
    result = await db.execute(select(User).filter(User.email == user_data.email))
    if result.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        hashed_password=hashed_password
    )
    
    try:
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
        
        access_token = create_access_token(data={"sub": str(new_user.id)})
        return {"access_token": access_token, "token_type": "bearer"}
    except Exception as e:
        logger.error(f"Failed to register user: {e}")
        await db.rollback()
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    """
    Authentifie un utilisateur et retourne un token.
    """
    logger.info(f"Login attempt for: {credentials.email}")
    
    result = await db.execute(select(User).filter(User.email == credentials.email))
    user = result.scalars().first()
    
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/onboarding")
async def onboarding(profile: UserProfile, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """
    Met à jour l'utilisateur actuel avec les données d'onboarding.
    """
    logger.info(f"Starting user onboarding process for user: {current_user.id}")
    try:
        current_user.age = profile.age
        current_user.height = profile.height_cm
        current_user.weight = profile.weight_kg
        current_user.sex = profile.sex
        current_user.goal = profile.goal
        current_user.activity_frequency = profile.workouts_per_week
        current_user.activity_type = profile.daily_activity
        current_user.activity_level = profile.fitness_level
        
        await db.commit()
        await db.refresh(current_user)
        logger.info(f"User {current_user.id} updated successfully")
        return {"user_id": current_user.id, "message": "User profile updated successfully"}
    except Exception as e:
        logger.error(f"Failed to update user during onboarding: {e}")
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update user: {str(e)}")

@router.get("/user/me")
async def get_me(current_user: User = Depends(get_current_user)):
    """
    Récupère les infos de l'utilisateur connecté.
    """
    return current_user

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
