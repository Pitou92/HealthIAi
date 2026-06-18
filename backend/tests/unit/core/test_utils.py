import pytest
from core.utils import clean_json_response

def test_clean_json_response_with_json_marker():
    content = "```json\n{\"key\": \"value\"}\n```"
    assert clean_json_response(content) == "{\"key\": \"value\"}"

def test_clean_json_response_with_generic_marker():
    content = "```\n{\"key\": \"value\"}\n```"
    assert clean_json_response(content) == "{\"key\": \"value\"}"

def test_clean_json_response_no_marker():
    content = "{\"key\": \"value\"}"
    assert clean_json_response(content) == "{\"key\": \"value\"}"

def test_clean_json_response_with_whitespace():
    content = "   ```json\n{\"key\": \"value\"}\n```   "
    assert clean_json_response(content) == "{\"key\": \"value\"}"
