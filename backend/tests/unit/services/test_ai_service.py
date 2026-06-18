import pytest
import json
from unittest.mock import patch, MagicMock
from services.ai_service import AIService
from models.domain import RecommendationPlan

@pytest.fixture
def mock_openai():
    with patch("services.ai_service.OpenAI") as MockOpenAI:
        mock_client = MagicMock()
        MockOpenAI.return_value = mock_client
        
        # Setup mock response
        mock_response = MagicMock()
        mock_choice = MagicMock()
        mock_message = MagicMock()
        
        # Valid JSON response that matches RecommendationPlan
        mock_data = {
            "type": "test_plan",
            "user_context": {
                "goal": "lose weight",
                "fitness_level": "beginner",
                "activity_level": "sedentary",
                "constraints": {"equipment": [], "injuries": []}
            },
            "plan": {
                "duration_weeks": 4,
                "weekly_schedule": []
            },
            "nutrition": {
                "daily_calories": 2000,
                "macros": {"protein_g": 150, "carbs_g": 200, "fat_g": 60},
                "meals": []
            },
            "recommendation_logic": {
                "goal_alignment": "focus on caloric deficit",
                "constraints_applied": []
            },
            "metadata": {
                "model": "test-model",
                "prompt_version": "1.0",
                "generated_at": "2024-01-01"
            }
        }
        mock_message.content = json.dumps(mock_data)
        mock_choice.message = mock_message
        mock_response.choices = [mock_choice]
        mock_client.chat.completions.create.return_value = mock_response
        
        yield mock_client

@pytest.fixture
def mock_system_prompt():
    with patch.object(AIService, '_load_system_prompt', return_value="You are a helpful assistant."):
        yield

@pytest.mark.asyncio
async def test_generate_recommendations(mock_openai, mock_system_prompt):
    service = AIService()
    user_profile = '{"goal": "lose weight", "fitness_level": "beginner"}'
    
    plan = await service.generate_recommendations(user_profile)
    
    assert isinstance(plan, RecommendationPlan)
    assert plan.type == "test_plan"
    assert plan.user_context.goal == "lose weight"
    assert plan.nutrition.daily_calories == 2000
    
    # Verify OpenAI was called correctly
    mock_openai.chat.completions.create.assert_called_once()
