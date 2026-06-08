from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from models.domain import UserProfile, RecommendationPlan, MealAnalysis
from services.ai_service import AIService
from services.vision_service import VisionService

ai_service = AIService()
vision_service = VisionService()
router = APIRouter()

@router.post("/generate-plan", response_model=RecommendationPlan)
async def generate_plan(profile: UserProfile):
    """
    Generates a personalized sports and nutrition plan based on the user profile.
    """
    try:
        # Convert Pydantic model to JSON string for the AI
        user_json = profile.model_dump_json()

        # Call AI service
        plan = await ai_service.generate_recommendations(user_json)
        return plan
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")

@router.post("/analyze-meal", response_model=MealAnalysis)
async def analyze_meal(file: UploadFile = File(...)):
    """Analyze a meal image and return nutritional data."""
    try:
        image_bytes = await file.read()
        analysis = await vision_service.analyze_meal_image(image_bytes)
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Vision analysis failed: {str(e)}")

@router.post("/generate-smart-plan", response_model=RecommendationPlan)
async def generate_smart_plan(
    profile: str = Form(...), # <--- On reçoit le JSON comme une chaîne de caractères dans le formulaire
    file: UploadFile = File(...)
):
    """Upload a meal image and get an adapted recommendation plan."""
    try:
        # 1. Validation manuelle du profil JSON
        try:
            user_profile = UserProfile.model_validate_json(profile)
        except Exception:
            raise HTTPException(status_code=422, detail="Invalid user profile JSON provided in form field")

        # 2. Vision Analysis
        image_bytes = await file.read()
        meal_analysis = await vision_service.analyze_meal_image(image_bytes)

        # 3. Smart AI Generation
        user_json = user_profile.model_dump_json()
        plan = await ai_service.generate_smart_recommendations(user_json, meal_analysis)

        return plan
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Smart generation failed: {str(e)}")