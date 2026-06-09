import os
import base64
from openai import OpenAI
from core.config import settings
from core.utils import clean_json_response
from models.domain import MealAnalysis

class VisionService:
    def __init__(self):
        self.client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=settings.OPENROUTER_KEY,
        )
        self.primary_model = "google/gemma-3-27b-it" # Modèle top 1
        self.fallback_model = "qwen/qwen2.5-vl-72b-instruct" # Modèle top 2
        self.vision_prompt = self._load_vision_prompt()
    
    def _load_vision_prompt(self):
        try:
            with open(settings.VISION_PROMPT, "r", encoding="utf-8") as f:
                return f.read()
        except FileNotFoundError:
            print(f"Critical Error: Vision prompt not found at {settings.VISION_PROMPT}")
            return "Analyze this meal image and return nutritional data in JSON."

    def _encode_image(self, image_bytes):
        return base64.b64encode(image_bytes).decode('utf-8')

    async def analyze_meal_image(self, image_bytes) -> MealAnalysis:
        base64_image = self._encode_image(image_bytes)

        prompt = self.vision_prompt

        models_to_try = [self.primary_model, self.fallback_model]

        for model in models_to_try:
            try:
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
                # Nettoyage rapide du markdown JSON si présent
                content = clean_json_response(content)

                return MealAnalysis.model_validate_json(content)
            except Exception as e:
                print(f"Vision error with model {model}: {e}")
                continue

        raise Exception("All vision models failed to analyze the image.")