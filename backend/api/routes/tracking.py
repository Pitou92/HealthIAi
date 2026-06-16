from fastapi import APIRouter, HTTPException, Query
from datetime import datetime
from typing import Optional, List
import logging
from models.domain import DailyProgress, HydrationLog, WeightLog, RecommendationPlan, NutritionLog
from core.nosql_db import get_nosql_db

logger = logging.getLogger(__name__)
router = APIRouter()
db_nosql = get_nosql_db()

@router.get("/today", response_model=DailyProgress)
async def get_today_progress(user_id: int = Query(...)):
    """Fetch today's progress vs targets."""
    today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    today_iso = today.isoformat()
    
    try:
        # 1. Get targets from the latest plan
        plan_doc = await db_nosql.plans.find_one(
            {"user_id": user_id},
            sort=[("metadata.generated_at", -1)]
        )
        
        if not plan_doc:
            raise HTTPException(status_code=404, detail="No active plan found for this user.")
        
        plan = RecommendationPlan.model_validate(plan_doc)
        
        # 2. Get today's logs
        calories_consumed = 0
        protein_consumed = 0
        carbs_consumed = 0
        fat_consumed = 0
        
        cursor = db_nosql.nutrition_logs.find({
            "user_id": user_id,
            "timestamp": {"$gte": today_iso}
        })
        async for analysis in cursor:
            calories_consumed += analysis.get("calories", 0)
            protein_consumed += analysis.get("protein_g", 0)
            carbs_consumed += analysis.get("carbs_g", 0)
            fat_consumed += analysis.get("fat_g", 0)

        # 3. Get hydration and weight logs
        water_consumed_ml = 0
        hydration_cursor = db_nosql.hydration_logs.find({
            "user_id": user_id,
            "timestamp": {"$gte": today_iso}
        })
        async for log in hydration_cursor:
             water_consumed_ml += log.get("amount_ml", 0)
             
        latest_weight = None
        weight_doc = await db_nosql.weight_logs.find_one(
            {"user_id": user_id},
            sort=[("timestamp", -1)]
        )
        if weight_doc:
            latest_weight = weight_doc.get("weight_kg")

        # 4. Construct progress
        return DailyProgress(
            user_id=user_id,
            date=today.strftime("%Y-%m-%d"),
            calories_consumed=int(calories_consumed),
            calories_target=plan.nutrition.daily_calories,
            protein_consumed=int(protein_consumed),
            protein_target=plan.nutrition.macros.protein_g,
            carbs_consumed=int(carbs_consumed),
            carbs_target=plan.nutrition.macros.carbs_g,
            fat_consumed=int(fat_consumed),
            fat_target=plan.nutrition.macros.fat_g,
            water_consumed_ml=water_consumed_ml,
            water_target_ml=plan.nutrition.hydration_target_ml,
            current_weight_kg=latest_weight,
            workout_completed=False,
            workout_name=None
        )

    except Exception as e:
        logger.error(f"Error fetching progress: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/log/hydration")
async def log_hydration(log: HydrationLog):
    if not log.timestamp:
        log.timestamp = datetime.now().isoformat()
    await db_nosql.hydration_logs.insert_one(log.model_dump())
    return {"status": "success", "amount_added": log.amount_ml}

@router.post("/log/weight")
async def log_weight(log: WeightLog):
    if not log.timestamp:
        log.timestamp = datetime.now().isoformat()
    await db_nosql.weight_logs.insert_one(log.model_dump())
    return {"status": "success", "new_weight": log.weight_kg}

@router.post("/log/nutrition")
async def log_nutrition_meal(log: NutritionLog):
    """Save a meal entry to the nutrition journal."""
    if not log.timestamp:
        log.timestamp = datetime.now().isoformat()
    await db_nosql.nutrition_logs.insert_one(log.model_dump())
    return {"status": "success"}

@router.get("/nutrition/logs", response_model=List[NutritionLog])
async def get_nutrition_logs(user_id: int = Query(...)):
    """Fetch nutrition logs for today."""
    today_iso = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
    cursor = db_nosql.nutrition_logs.find({
        "user_id": user_id,
        "timestamp": {"$gte": today_iso}
    }).sort("timestamp", -1)
    logs = []
    async for doc in cursor:
        logs.append(NutritionLog.model_validate(doc))
    return logs
