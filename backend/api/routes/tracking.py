from fastapi import APIRouter, HTTPException, Query
from datetime import datetime
from typing import Optional, List
import logging
from models.domain import DailyProgress, HydrationLog, WeightLog, RecommendationPlan, NutritionLog, WorkoutLog, NutritionHistoryEntry, WeightHistoryEntry, StreakInfo
from core.nosql_db import get_nosql_db
from datetime import timedelta

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

        # 4. Get workout logs
        workout_completed = False
        workout_name = None
        workout_doc = await db_nosql.workout_logs.find_one({
            "user_id": user_id,
            "timestamp": {"$gte": today_iso}
        }, sort=[("timestamp", -1)])
        
        if workout_doc:
            workout_completed = True
            workout_name = workout_doc.get("workout_name")

        # 5. Construct progress
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
            workout_completed=workout_completed,
            workout_name=workout_name
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

@router.post("/log/workout")
async def log_workout(log: WorkoutLog):
    """Log a completed workout."""
    if not log.timestamp:
        log.timestamp = datetime.now().isoformat()
    await db_nosql.workout_logs.insert_one(log.model_dump())
    return {"status": "success"}

@router.get("/history/nutrition", response_model=List[NutritionHistoryEntry])
async def get_nutrition_history(user_id: int = Query(...), days: int = Query(7)):
    """Fetch nutrition history for the past X days."""
    end_date = datetime.now()
    start_date = (end_date - timedelta(days=days-1)).replace(hour=0, minute=0, second=0, microsecond=0)
    
    cursor = db_nosql.nutrition_logs.find({
        "user_id": user_id,
        "timestamp": {"$gte": start_date.isoformat()}
    })
    
    # Aggregate by date
    daily_data = {}
    async for log in cursor:
        try:
            date_str = datetime.fromisoformat(log["timestamp"]).strftime("%Y-%m-%d")
        except ValueError:
            continue
            
        if date_str not in daily_data:
            daily_data[date_str] = {"calories": 0, "protein_g": 0.0, "carbs_g": 0.0, "fat_g": 0.0}
            
        daily_data[date_str]["calories"] += log.get("calories", 0)
        daily_data[date_str]["protein_g"] += log.get("protein_g", 0.0)
        daily_data[date_str]["carbs_g"] += log.get("carbs_g", 0.0)
        daily_data[date_str]["fat_g"] += log.get("fat_g", 0.0)
        
    history = []
    # Fill missing days with zeros to ensure continuous chart
    for i in range(days):
        current_date = (end_date - timedelta(days=i)).strftime("%Y-%m-%d")
        data = daily_data.get(current_date, {"calories": 0, "protein_g": 0.0, "carbs_g": 0.0, "fat_g": 0.0})
        history.append(NutritionHistoryEntry(
            date=current_date,
            calories=int(data["calories"]),
            protein_g=data["protein_g"],
            carbs_g=data["carbs_g"],
            fat_g=data["fat_g"]
        ))
        
    # Sort chronological
    history.sort(key=lambda x: x.date)
    return history

@router.get("/history/weight", response_model=List[WeightHistoryEntry])
async def get_weight_history(user_id: int = Query(...), months: int = Query(3)):
    """Fetch weight history for the past X months."""
    end_date = datetime.now()
    start_date = (end_date - timedelta(days=months*30)).replace(hour=0, minute=0, second=0, microsecond=0)
    
    cursor = db_nosql.weight_logs.find({
        "user_id": user_id,
        "timestamp": {"$gte": start_date.isoformat()}
    }).sort("timestamp", 1)
    
    history = []
    async for log in cursor:
        try:
            date_str = datetime.fromisoformat(log["timestamp"]).strftime("%Y-%m-%d")
            history.append(WeightHistoryEntry(date=date_str, weight_kg=log["weight_kg"]))
        except ValueError:
            continue
            
    return history

@router.get("/streak", response_model=StreakInfo)
async def get_streak(user_id: int = Query(...)):
    """Calculate user streak based on logins or logging activity."""
    # Simplified streak: check nutrition logs per day
    # We aggregate all unique dates where user logged a meal
    cursor = db_nosql.nutrition_logs.find({"user_id": user_id}).sort("timestamp", -1)
    
    dates_logged = set()
    async for log in cursor:
        try:
            date_str = datetime.fromisoformat(log["timestamp"]).strftime("%Y-%m-%d")
            dates_logged.add(date_str)
        except ValueError:
            pass
            
    sorted_dates = sorted(list(dates_logged), reverse=True)
    
    current_streak = 0
    today = datetime.now().strftime("%Y-%m-%d")
    yesterday = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
    
    if not sorted_dates:
        return StreakInfo(user_id=user_id, current_streak=0, last_activity_date=None)
        
    last_activity = sorted_dates[0]
    
    if last_activity == today or last_activity == yesterday:
        current_streak = 1
        check_date = datetime.strptime(last_activity, "%Y-%m-%d")
        
        for i in range(1, len(sorted_dates)):
            prev_date = datetime.strptime(sorted_dates[i], "%Y-%m-%d")
            diff = (check_date - prev_date).days
            if diff == 1:
                current_streak += 1
                check_date = prev_date
            elif diff == 0:
                continue # Same day multiple logs
            else:
                break # Streak broken
                
    return StreakInfo(user_id=user_id, current_streak=current_streak, last_activity_date=last_activity)
