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
    It automatically uses the previous plan as context if it exists.
    """
    logger.info(f"Generating plan for user_id: {user_id}")
    try:
        # 1. Chercher s'il existe un plan précédent pour cet utilisateur
        previous_plan = None
        try:
            if db_nosql is not None:
                # On récupère le plan le plus récent
                cursor = db_nosql.plans.find({"user_id": user_id}).sort("metadata.generated_at", -1).limit(1)
                async for doc in cursor:
                    previous_plan = doc
                    # On retire l'ID MongoDB pour ne pas polluer l'input de l'IA
                    if "_id" in previous_plan:
                        del previous_plan["_id"]
                    logger.info(f"Found previous plan for user_id {user_id}, using it as context")
        except Exception as e:
            logger.warning(f"Could not fetch previous plan for user_id {user_id}: {e}")

        # 2. Appeler le service AI avec le profil et éventuellement l'ancien plan
        user_json = profile.model_dump_json()
        plan = await ai_service.generate_updated_recommendations(user_json, previous_plan)

        # 3. Associer l'user_id et sauvegarder en NoSQL
        plan.user_id = user_id
        try:
            if db_nosql is not None:
                await db_nosql.plans.insert_one(plan.model_dump())
                logger.info(f"Successfully generated and saved plan for user_id: {user_id}")
        except Exception:
            pass  # MongoDB not available — continue without saving

        return plan
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"AI generation failed for user_id {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")

@router.get("/current-plan", response_model=RecommendationPlan)
async def get_current_plan(user_id: int = Query(..., description="ID de l'utilisateur")):
    """Fetch the most recent plan for a user from MongoDB."""
    logger.info(f"Fetching current plan for user_id: {user_id}")
    try:
        if db_nosql is None:
            raise HTTPException(status_code=503, detail="NoSQL database not available")
            
        plan_doc = await db_nosql.plans.find_one(
            {"user_id": user_id},
            sort=[("metadata.generated_at", -1)]
        )
        
        if not plan_doc:
            raise HTTPException(status_code=404, detail="No plan found for this user")
            
        if "_id" in plan_doc:
            del plan_doc["_id"]
            
        return RecommendationPlan.model_validate(plan_doc)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to fetch plan for user_id {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze-meal", response_model=MealAnalysis)
async def analyze_meal(file: UploadFile = File(...), user_id: int = Query(..., description="ID de l'utilisateur (MySQL)")):
    """Analyze a meal image, save to MongoDB."""
    logger.info(f"Analyzing meal for user_id: {user_id}")
    try:
        image_bytes = await file.read()
        analysis = await vision_service.analyze_meal_image(image_bytes)

        # Associer l'user_id et sauvegarder en NoSQL
        analysis.user_id = user_id
        try:
            await db_nosql.meal_analyses.insert_one(analysis.model_dump())
            logger.info(f"Successfully analyzed and saved meal for user_id: {user_id}")
        except Exception:
            pass

        return analysis
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Vision analysis failed for user_id {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Vision analysis failed: {str(e)}")

@router.post("/generate-smart-plan", response_model=RecommendationPlan)
async def generate_smart_plan(
    profile: str = Form(...),
    file: UploadFile = File(...),
    user_id: int = Query(..., description="ID de l'utilisateur (MySQL)")
):
    """Upload a meal image and get an adapted recommendation plan, saved to MongoDB. Uses previous plan as context."""
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

        # Chercher s'il existe un plan précédent
        previous_plan = None
        try:
            if db_nosql is not None:
                cursor = db_nosql.plans.find({"user_id": user_id}).sort("metadata.generated_at", -1).limit(1)
                async for doc in cursor:
                    previous_plan = doc
                    if "_id" in previous_plan:
                        del previous_plan["_id"]
        except Exception:
            pass

        user_json = user_profile.model_dump_json()
        plan = await ai_service.generate_smart_recommendations(user_json, meal_analysis, previous_plan)

        # Sauvegarder l'analyse et le plan
        meal_analysis.user_id = user_id
        plan.user_id = user_id

        try:
            if db_nosql is not None:
                await db_nosql.meal_analyses.insert_one(meal_analysis.model_dump())
                await db_nosql.plans.insert_one(plan.model_dump())
                logger.info(f"Successfully generated and saved smart plan and analysis for user_id: {user_id}")
        except Exception:
            pass

        return plan
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Smart generation failed for user_id {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Smart generation failed: {str(e)}")

@router.post("/adjust-plan", response_model=RecommendationPlan)
async def adjust_plan(profile: UserProfile, user_id: int = Query(...)):
    """
    Adjusts an existing plan based on a new profile (e.g. weight change, goal change)
    without regenerating the whole workout schedule if possible.
    """
    logger.info(f"Adjusting plan for user_id: {user_id}")
    try:
        previous_plan = None
        if db_nosql is not None:
            cursor = db_nosql.plans.find({"user_id": user_id}).sort("metadata.generated_at", -1).limit(1)
            async for doc in cursor:
                previous_plan = doc
                if "_id" in previous_plan:
                    del previous_plan["_id"]
        
        if not previous_plan:
            # Fallback to full generation if no previous plan exists
            user_json = profile.model_dump_json()
            plan = await ai_service.generate_updated_recommendations(user_json, None)
        else:
            user_json = profile.model_dump_json()
            # We reuse generate_updated_recommendations which passes the previous_plan to the AI.
            # The AI prompt handles adapting the plan.
            plan = await ai_service.generate_updated_recommendations(user_json, previous_plan)

        plan.user_id = user_id
        if db_nosql is not None:
            await db_nosql.plans.insert_one(plan.model_dump())
            
        return plan
    except Exception as e:
        logger.error(f"Plan adjustment failed for user_id {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))