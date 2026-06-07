import os
import json
import sys
from pathlib import Path
from openai import OpenAI
from dotenv import load_dotenv

# Add parent directory to sys.path to allow importing from models
sys.path.append(str(Path(__file__).parent.parent))
from models import RecommendationPlan

load_dotenv()

class AIService:
    def __init__(self):
        self.client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=os.getenv('OPENROUTER_KEY'),
        )
        self.system_prompt = self._load_system_prompt()

    def _load_system_prompt(self):
        # Path relative to this file: backend/services/ai_service.py -> backend/docs/systemPrompt.md
        import os
        current_dir = os.path.dirname(os.path.abspath(__file__))
        prompt_path = os.path.join(os.path.dirname(current_dir), "..", "docs", "systemPrompt.md")

        try:
            with open(prompt_path, "r", encoding="utf-8") as f:
                return f.read()
        except FileNotFoundError:
            print(f"Critical Error: systemPrompt.md not found at {prompt_path}")
            return ""

    async def generate_recommendations(self, user_profile_json: str) -> RecommendationPlan:
        """
        Calls the AI model to generate a recommendation plan based on user profile.
        Returns a validated RecommendationPlan object.
        """
        try:
            response = self.client.chat.completions.create(
                model="openai/gpt-oss-120b:free",
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
