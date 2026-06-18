from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from core.sql_db import get_db
from models.sql_models import User
from models.domain import UserProfile

router = APIRouter()

@router.get("/", response_model=UserProfile)
async def get_profile(user_id: int, db: AsyncSession = Depends(get_db)):
    """Fetch user profile details from MySQL."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    return UserProfile(
        goal=user.goal or "",
        age=user.age or 0,
        sex=user.sex or "",
        height_cm=int(user.height) if user.height else 0,
        weight_kg=int(user.weight) if user.weight else 0,
        fitness_level=user.activity_level or "",
        workouts_per_week=user.activity_frequency or 0,
        session_duration_min=45, # Default
        equipment=[],
        diet="",
        injuries=[],
        daily_activity=user.activity_type or ""
    )

@router.put("/")
async def update_profile(user_id: int, profile: UserProfile, db: AsyncSession = Depends(get_db)):
    """Update user profile details in MySQL."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.goal = profile.goal
    user.age = profile.age
    user.sex = profile.sex
    user.height = float(profile.height_cm)
    user.weight = float(profile.weight_kg)
    user.activity_level = profile.fitness_level
    user.activity_frequency = profile.workouts_per_week
    user.activity_type = profile.daily_activity
    
    await db.commit()
    return {"status": "success", "message": "Profile updated"}
