import json
from openai import OpenAI
from core.config import settings
from models.domain import RecommendationPlan

class AIService:
    def __init__(self):
        self.client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=settings.OPENROUTER_KEY,
        )
        self.system_prompt = self._load_system_prompt()

    def _load_system_prompt(self):
        try:
            with open(settings.SYSTEM_PROMPT_PATH, "r", encoding="utf-8") as f:
                return f.read()
        except FileNotFoundError:
            print(f"Critical Error: system_prompt.md not found at {settings.SYSTEM_PROMPT_PATH}")
            return ""

    async def generate_recommendations(self, user_profile_json: str) -> RecommendationPlan:
        """
        Calls the AI model to generate a recommendation plan based on user profile.
        Returns a validated RecommendationPlan object.
        """
        try:
            response = self.client.chat.completions.create(
                model=settings.AI_MODEL,
                messages=[
                    {"role": "system", "content": self.system_prompt},
                    {"role": "user", "content": user_profile_json}
                ]
            )

            content = response.choices[0].message.content

            # Remove potential markdown fences if the AI ignored the system prompt
            if content.startswith("```json"):
                content = content.replace("```json", "", 1).replace("```", "", 1).strip()
            elif content.startswith("```"):
                content = content.replace("```", "", 2).strip()

            # Validate with Pydantic
            return RecommendationPlan.model_validate_json(content)

        except Exception as e:
            print(f"AI Service Error: {e}")
            raise e
