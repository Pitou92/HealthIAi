from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()

def load_system_prompt():
    import os
    current_dir = os.path.dirname(os.path.abspath(__file__))
    # The docs folder is in the parent directory of scripts/
    prompt_path = os.path.join(os.path.dirname(current_dir), "docs/systemPrompt.md")
    
    try:
        print(f"Chargement du prompt: {prompt_path}")
        with open(prompt_path, "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        print(f"Erreur: fichier non trouvé à {prompt_path}")
        return ""

def call_ai_for_recommendations(message):
    print("Initialisation du client OpenRouter...")
    
    client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=os.getenv('OPENROUTER_KEY'),
    )

    print("Chargement du system prompt...")
    system_prompt = load_system_prompt()
    
    print("Envoi de la requête à l'API...")
    try:
        response = client.chat.completions.create(
            model="openai/gpt-oss-120b:free",
            messages=[
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": message
                }
            ]
        )
        response_text = response.choices[0].message.content
        print("Réponse reçue!")
        return response_text
    except Exception as e:
        print(f"Erreur: {e}")
        return None
