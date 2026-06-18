import pytest
import json
from unittest.mock import patch, MagicMock
from services.vision_service import VisionService
from models.domain import MealAnalysis

@pytest.fixture
def mock_openai():
    with patch("services.vision_service.OpenAI") as MockOpenAI:
        mock_client = MagicMock()
        MockOpenAI.return_value = mock_client
        
        # Setup mock response
        mock_response = MagicMock()
        mock_choice = MagicMock()
        mock_message = MagicMock()
        
        mock_data = {
            "detected_foods": [
                {
                    "name": "Apple",
                    "estimated_quantity": "1 medium",
                    "calories": 95,
                    "protein_g": 0.5,
                    "carbs_g": 25.0,
                    "fat_g": 0.3
                }
            ],
            "total_calories": 95,
            "total_protein": 0.5,
            "total_carbs": 25.0,
            "total_fat": 0.3,
            "analysis_summary": "A healthy apple."
        }
        mock_message.content = json.dumps(mock_data)
        mock_choice.message = mock_message
        mock_response.choices = [mock_choice]
        mock_client.chat.completions.create.return_value = mock_response
        
        yield mock_client

@pytest.fixture
def mock_vision_prompt():
    with patch.object(VisionService, '_load_vision_prompt', return_value="Analyze image."):
        yield

@pytest.mark.asyncio
async def test_analyze_meal_image_success(mock_openai, mock_vision_prompt):
    service = VisionService()
    image_bytes = b"fake_image_data"
    
    analysis = await service.analyze_meal_image(image_bytes)
    
    assert isinstance(analysis, MealAnalysis)
    assert analysis.total_calories == 95
    assert len(analysis.detected_foods) == 1
    assert analysis.detected_foods[0].name == "Apple"
    
    # Verify OpenAI was called correctly
    mock_openai.chat.completions.create.assert_called_once()
