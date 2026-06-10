import json
import logging
from openai import OpenAI
from core.config import settings
from core.utils import clean_json_response
from models.domain import RecommendationPlan, MealAnalysis

logger = logging.getLogger(__name__)

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
                content = f.read()
                logger.debug(f"System prompt loaded from {settings.SYSTEM_PROMPT_PATH}")
                return content
        except FileNotFoundError:
            logger.error(f"Critical Error: system_prompt.md not found at {settings.SYSTEM_PROMPT_PATH}")
            return ""

    async def generate_recommendations(self, user_profile_json: str) -> RecommendationPlan:
        """
        Calls the AI model to generate a recommendation plan based on user profile.
        Returns a validated RecommendationPlan object.
        """
        logger.info(f"Calling AI model {settings.AI_MODEL} for recommendations")
        try:
            response = self.client.chat.completions.create(
                model=settings.AI_MODEL,
                messages=[
                    {"role": "system", "content": self.system_prompt},
                    {"role": "user", "content": user_profile_json}
                ]
            )

            content = response.choices[0].message.content
            logger.debug(f"Raw AI response received: {content[:100]}...")

            # Remove potential markdown fences if the AI ignored the system prompt
            content = clean_json_response(content)

            # Validate with Pydantic
            plan = RecommendationPlan.model_validate_json(content)
            logger.info("Successfully validated AI recommendation plan")
            return plan

        except Exception as e:
            logger.error(f"AI Service Error during recommendation generation: {e}")
            raise e

    async def generate_smart_recommendations(self, user_profile_json: str, meal_analysis: MealAnalysis) -> RecommendationPlan:
        """
        Generates an adaptive plan by combining user profile and a meal analysis.
        """
        logger.info("Generating smart adaptive recommendations")
        combined_input = {
            "user_profile": json.loads(user_profile_json),
            "current_meal": meal_analysis.model_dump()
        }

        # On utilise la même logique d'appel que generate_recommendations
        return await self.generate_recommendations(json.dumps(combined_input))