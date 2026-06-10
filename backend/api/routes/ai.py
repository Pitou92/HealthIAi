from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Query
import logging
from models.domain import UserProfile, RecommendationPlan, MealAnalysis
from services.ai_service import AIService
from services.vision_service import VisionService
from core.nosql_db import get_nosql_db

logger = logging.getLogger(__name__)
ai_service = AIService()
vision_service = VisionService()
router = APIRouter()
db_nosql = get_nosql_db()

@router.post("/generate-plan", response_model=RecommendationPlan)
async def generate_plan(profile: UserProfile, user_id: int = Query(..., description="ID de l'utilisateur (MySQL)")):
    """
    Generates a personalized sports and nutrition plan and saves it to MongoDB.
    """
    logger.info(f"Generating standard plan for user_id: {user_id}")
    try:
        user_json = profile.model_dump_json()
        plan = await ai_service.generate_recommendations(user_json)

        # Associer l'user_id et sauvegarder en NoSQL
        plan.user_id = user_id
        await db_nosql.plans.insert_one(plan.model_dump())
        logger.info(f"Successfully generated and saved plan for user_id: {user_id}")

        return plan
    except Exception as e:
        logger.error(f"AI generation failed for user_id {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")

@router.post("/analyze-meal", response_model=MealAnalysis)
async def analyze_meal(file: UploadFile = File(...), user_id: int = Query(..., description="ID de l'utilisateur (MySQL)")):
    """Analyze a meal image, save to MongoDB."""
    logger.info(f"Analyzing meal for user_id: {user_id}")
    try:
        image_bytes = await file.read()
        analysis = await vision_service.analyze_meal_image(image_bytes)

        # Associer l'user_id et sauvegarder en NoSQL
        analysis.user_id = user_id
        await db_nosql.meal_analyses.insert_one(analysis.model_dump())
        logger.info(f"Successfully analyzed and saved meal for user_id: {user_id}")

        return analysis
    except Exception as e:
        logger.error(f"Vision analysis failed for user_id {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Vision analysis failed: {str(e)}")

@router.post("/generate-smart-plan", response_model=RecommendationPlan)
async def generate_smart_plan(
    profile: str = Form(...),
    file: UploadFile = File(...),
    user_id: int = Query(..., description="ID de l'utilisateur (MySQL)")
):
    """Upload a meal image and get an adapted recommendation plan, saved to MongoDB."""
    logger.info(f"Generating smart plan for user_id: {user_id}")
    try:
        try:
            user_profile = UserProfile.model_validate_json(profile)
        except Exception:
            logger.warning(f"Invalid user profile JSON provided for user_id {user_id}")
            raise HTTPException(status_code=422, detail="Invalid user profile JSON provided in form field")

        image_bytes = await file.read()
        meal_analysis = await vision_service.analyze_meal_image(image_bytes)
        logger.info(f"Meal analysis completed for user_id {user_id}, proceeding to smart plan generation")

        user_json = user_profile.model_dump_json()
        plan = await ai_service.generate_smart_recommendations(user_json, meal_analysis)

        # Sauvegarder l'analyse et le plan
        meal_analysis.user_id = user_id
        plan.user_id = user_id

        await db_nosql.meal_analyses.insert_one(meal_analysis.model_dump())
        await db_nosql.plans.insert_one(plan.model_dump())
        logger.info(f"Successfully generated and saved smart plan and analysis for user_id: {user_id}")

        return plan
    except Exception as e:
        logger.error(f"Smart generation failed for user_id {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Smart generation failed: {str(e)}")