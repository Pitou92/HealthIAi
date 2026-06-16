import os
import base64
import json
import logging
from openai import OpenAI
from core.config import settings
from core.utils import clean_json_response
from models.domain import MealAnalysis

logger = logging.getLogger(__name__)

class VisionService:
    def __init__(self):
        self.client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=settings.OPENROUTER_KEY,
        )
        self.primary_model = "google/gemini-2.0-flash-001" # Modèle plus robuste pour la vision
        self.fallback_model = "openai/gpt-4o-mini" # Fallback fiable
        self.vision_prompt = self._load_vision_prompt()

    def _load_vision_prompt(self):
        try:
            with open(settings.VISION_PROMPT, "r", encoding="utf-8") as f:
                content = f.read()
                logger.debug(f"Vision prompt loaded from {settings.VISION_PROMPT}")
                return content
        except FileNotFoundError:
            logger.error(f"Critical Error: Vision prompt not found at {settings.VISION_PROMPT}")
            return "Analyze this meal image and return nutritional data in JSON."

    def _encode_image(self, image_bytes):
        return base64.b64encode(image_bytes).decode('utf-8')

    async def analyze_meal_image(self, image_bytes) -> MealAnalysis:
        logger.info("Starting meal image analysis")
        base64_image = self._encode_image(image_bytes)

        prompt = self.vision_prompt

        models_to_try = [self.primary_model, self.fallback_model]

        for model in models_to_try:
            try:
                logger.info(f"Attempting meal analysis with model: {model}")
                response = self.client.chat.completions.create(
                    model=model,
                    messages=[
                        {
                            "role": "user",
                            "content": [
                                {"type": "text", "text": prompt},
                                {
                                    "type": "image_url",
                                    "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}
                                }
                            ]
                        }
                    ]
                )
                content = response.choices[0].message.content
                logger.debug(f"Raw Vision response from {model}: {content[:100]}...")

                # Nettoyage rapide du markdown JSON si présent
                content = clean_json_response(content)
                data = json.loads(content)
                
                # Conversion explicite pour la sécurité
                data['total_calories'] = int(data.get('total_calories', 0))
                data['total_protein'] = float(data.get('total_protein', 0))
                data['total_carbs'] = float(data.get('total_carbs', 0))
                data['total_fat'] = float(data.get('total_fat', 0))

                analysis = MealAnalysis.model_validate(data)
                logger.info(f"Successfully analyzed meal image using {model}")
                return analysis
            except Exception as e:
                logger.warning(f"Vision error with model {model}: {e}")
                continue

        logger.error("All vision models failed to analyze the image.")
        raise Exception("All vision models failed to analyze the image.")