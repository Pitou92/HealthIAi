import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock, AsyncMock
from main import app

client = TestClient(app)

@pytest.fixture
def mock_db_nosql():
    with patch("api.routes.ai.db_nosql") as mock_db:
        yield mock_db

@pytest.fixture
def mock_ai_service():
    with patch("api.routes.ai.ai_service") as mock_service:
        yield mock_service

def test_get_current_plan_no_plan(mock_db_nosql):
    mock_db_nosql.plans.find_one = AsyncMock(return_value=None)
    
    response = client.get("/ai/current-plan?user_id=1")
    assert response.status_code == 404
    assert response.json()["detail"] == "No plan found for this user"

def test_get_current_plan_success(mock_db_nosql):
    mock_plan_data = {
        "type": "test",
        "user_context": {
            "goal": "lose weight",
            "fitness_level": "beginner",
            "activity_level": "sedentary",
            "constraints": {"equipment": [], "injuries": []}
        },
        "plan": {"duration_weeks": 4, "weekly_schedule": []},
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
            "model": "test",
            "prompt_version": "1.0",
            "generated_at": "2024-01-01"
        }
    }
    
    mock_db_nosql.plans.find_one = AsyncMock(return_value=mock_plan_data)
    
    response = client.get("/ai/current-plan?user_id=1")
    assert response.status_code == 200
    assert response.json()["type"] == "test"

def test_generate_plan_success(mock_db_nosql, mock_ai_service):
    # Mocking that no previous plan is found
    mock_cursor = MagicMock()
    mock_cursor.sort.return_value.limit.return_value.__aiter__.return_value = []
    mock_db_nosql.plans.find.return_value = mock_cursor
    
    from models.domain import RecommendationPlan
    
    mock_plan = RecommendationPlan.model_validate({
        "type": "new_plan",
        "user_context": {
            "goal": "Build Muscle",
            "fitness_level": "Intermediate",
            "activity_level": "Active",
            "constraints": {"equipment": [], "injuries": []}
        },
        "plan": {"duration_weeks": 4, "weekly_schedule": []},
        "nutrition": {
            "daily_calories": 2500,
            "macros": {"protein_g": 180, "carbs_g": 250, "fat_g": 70},
            "meals": []
        },
        "recommendation_logic": {
            "goal_alignment": "focus on caloric surplus",
            "constraints_applied": []
        },
        "metadata": {
            "model": "test",
            "prompt_version": "1.0",
            "generated_at": "2024-01-01"
        }
    })
    
    mock_ai_service.generate_updated_recommendations = AsyncMock(return_value=mock_plan)
    
    response = client.post(
        "/ai/generate-plan?user_id=1",
        json={
            "goal": "Build Muscle",
            "age": 25,
            "sex": "M",
            "height_cm": 180,
            "weight_kg": 75,
            "fitness_level": "Intermediate",
            "workouts_per_week": 4,
            "session_duration_min": 60,
            "diet": "None",
            "daily_activity": "Active",
            "equipment": [],
            "injuries": []
        }
    )
    assert response.status_code == 200
