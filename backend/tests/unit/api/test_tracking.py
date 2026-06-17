import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock, AsyncMock
from main import app
from models.domain import DailyProgress, NutritionLog

client = TestClient(app)

@pytest.fixture
def mock_db_nosql():
    with patch("api.routes.tracking.db_nosql") as mock_db:
        yield mock_db

def test_get_today_progress_no_plan(mock_db_nosql):
    # Mocking that no active plan is found
    mock_db_nosql.plans.find_one = AsyncMock(return_value=None)
    
    response = client.get("/progress/today?user_id=1")
    assert response.status_code == 404
    assert response.json()["detail"] == "No active plan found for this user."

def test_log_hydration(mock_db_nosql):
    mock_db_nosql.hydration_logs.insert_one = AsyncMock()
    
    response = client.post(
        "/progress/log/hydration",
        json={"user_id": 1, "amount_ml": 250}
    )
    assert response.status_code == 200
    assert response.json()["amount_added"] == 250
    mock_db_nosql.hydration_logs.insert_one.assert_called_once()

def test_log_weight(mock_db_nosql):
    mock_db_nosql.weight_logs.insert_one = AsyncMock()
    
    response = client.post(
        "/progress/log/weight",
        json={"user_id": 1, "weight_kg": 75.5}
    )
    assert response.status_code == 200
    assert response.json()["new_weight"] == 75.5
    mock_db_nosql.weight_logs.insert_one.assert_called_once()

def test_log_nutrition_meal(mock_db_nosql):
    mock_db_nosql.nutrition_logs.insert_one = AsyncMock()
    
    response = client.post(
        "/progress/log/nutrition",
        json={
            "user_id": 1, 
            "name": "Breakfast", 
            "calories": 400,
            "protein_g": 20.0,
            "carbs_g": 40.0,
            "fat_g": 10.0
        }
    )
    assert response.status_code == 200
    assert response.json()["status"] == "success"
    mock_db_nosql.nutrition_logs.insert_one.assert_called_once()
