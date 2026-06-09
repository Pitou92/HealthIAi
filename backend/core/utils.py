
def clean_json_response(content: str) -> str:
    """
    Removes markdown code fences (```json ... ``` or ``` ... ```)
    from a string and returns the raw JSON content.
    """
    content = content.strip()
    if content.startswith("```json"):
        return content.split("```json")[1].split("```")[0].strip()
    elif content.startswith("```"):
        return content.split("```")[1].split("```")[0].strip()
    return content