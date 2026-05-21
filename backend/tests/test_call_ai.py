import pytest
from unittest.mock import MagicMock, patch
import os
import sys

# Ensure the backend directory is in the path so we can import scripts.call_ai
# Given the structure:
# backend/
#   scripts/
#     call_ai.py
#   tests/
#     test_call_ai.py

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from scripts.call_ai import load_system_prompt, call_ai_for_recommendations

def test_load_system_prompt_actual_file():
    """Vérifie que le prompt système est correctement chargé depuis le fichier réel."""
    content = load_system_prompt()
    assert content != ""
    assert "recommendation engine" in content.lower()
    assert "workout_plan" in content

def test_load_system_prompt_not_found():
    """Vérifie le comportement quand le fichier n'existe pas (en simulant un mauvais chemin)."""
    with patch('os.path.abspath') as mock_abspath:
        # On simule un chemin où le dossier docs/ n'existerait pas au niveau attendu
        mock_abspath.return_value = "/tmp/non_existent_project/scripts/call_ai.py"
        content = load_system_prompt()
        assert content == ""

@patch('scripts.call_ai.OpenAI')
@patch('scripts.call_ai.load_system_prompt')
@patch('os.getenv')
def test_call_ai_for_recommendations_success(mock_getenv, mock_load_prompt, mock_openai_class):
    """Vérifie le succès de l'appel à l'IA avec des mocks."""
    # Setup
    mock_getenv.return_value = "fake_api_key"
    mock_load_prompt.return_value = "System Prompt Mock"
    
    mock_client = MagicMock()
    mock_openai_class.return_value = mock_client
    
    mock_response = MagicMock()
    mock_response.choices = [MagicMock()]
    mock_response.choices[0].message.content = '{"plan": "test content"}'
    mock_client.chat.completions.create.return_value = mock_response
    
    # Execute
    result = call_ai_for_recommendations('{"goal": "fitness"}')
    
    # Assert
    assert result == '{"plan": "test content"}'
    mock_client.chat.completions.create.assert_called_once()
    
    # Vérification des messages envoyés
    args, kwargs = mock_client.chat.completions.create.call_args
    messages = kwargs['messages']
    assert messages[0]['content'] == "System Prompt Mock"
    assert messages[1]['content'] == '{"goal": "fitness"}'

@patch('scripts.call_ai.OpenAI')
@patch('scripts.call_ai.load_system_prompt')
def test_call_ai_for_recommendations_failure(mock_load_prompt, mock_openai_class):
    """Vérifie la gestion d'erreur lors d'un échec de l'API."""
    # Setup
    mock_load_prompt.return_value = "System Prompt Mock"
    mock_client = MagicMock()
    mock_openai_class.return_value = mock_client
    mock_client.chat.completions.create.side_effect = Exception("API Error")
    
    # Execute
    result = call_ai_for_recommendations('{"goal": "fitness"}')
    
    # Assert
    assert result is None
