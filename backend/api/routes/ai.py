from fastapi import APIRouter, HTTPException
from models.domain import UserProfile, RecommendationPlan
from services.ai_service import AIService

ai_service = AIService()
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
