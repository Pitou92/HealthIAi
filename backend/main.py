import uvicorn
from fastapi import FastAPI, HTTPException
from models import UserProfile, RecommendationPlan
from services.ai_service import AIService

app = FastAPI(title="HealthAI Coach API", version="1.0.0")
ai_service = AIService()

@app.get("/")
async def root():
    return {"message": "Welcome to HealthAI Coach API", "status": "online"}

@app.post("/generate-plan", response_model=RecommendationPlan)
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

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
