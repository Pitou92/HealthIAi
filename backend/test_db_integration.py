import requests
import json

BASE_URL = "http://localhost:8000"

def test_full_flow():
    # 0. Register a new user
    print("--- 0. Testing Registration (SQL) ---")
    import time
    email = f"user_{int(time.time())}@example.com"
    register_data = {
        "email": email,
        "password": "password123"
    }
    response = requests.post(f"{BASE_URL}/auth/register", json=register_data)
    if response.status_code == 200:
        token = response.json()["access_token"]
        print(f"✅ User registered successfully. Token received.")
    else:
        print(f"❌ Registration failed: {response.text}")
        return

    headers = {"Authorization": f"Bearer {token}"}

    # 1. Simuler l'Onboarding (SQL - MySQL)
    print("\n--- 1. Testing Onboarding (SQL) ---")
    user_profile = {
        "goal": "Weight Loss",
        "age": 25,
        "sex": "M",
        "height_cm": 180,
        "weight_kg": 85,
        "fitness_level": "Beginner",
        "workouts_per_week": 3,
        "session_duration_min": 45,
        "equipment": ["Dumbbells"],
        "diet": "High Protein",
        "injuries": [],
        "daily_activity": "Sedentary"
    }
    
    response = requests.post(f"{BASE_URL}/auth/onboarding", json=user_profile, headers=headers)
    if response.status_code == 200:
        user_id = response.json()["user_id"]
        print(f"✅ User created in MySQL. ID: {user_id}")
    else:
        print(f"❌ Onboarding failed: {response.text}")
        return

    # 2. Générer un plan (NoSQL - MongoDB)
    print("\n--- 2. Testing Plan Generation (NoSQL) ---")
    plan_response = requests.post(
        f"{BASE_URL}/ai/generate-plan", 
        params={"user_id": user_id}, 
        json=user_profile
    )
    
    if plan_response.status_code == 200:
        print("✅ Plan generated and saved to MongoDB.")
        print(f"Plan Type: {plan_response.json().get('type')}")
    else:
        print(f"❌ Plan generation failed: {plan_response.text}")

    # 3. Vérifier la récupération de l'utilisateur
    print("\n--- 3. Verifying User in SQL ---")
    get_response = requests.get(f"{BASE_URL}/auth/user/{user_id}")
    if get_response.status_code == 200:
        print(f"✅ User {user_id} retrieved successfully from MySQL.")
    else:
        print(f"❌ Failed to retrieve user: {get_response.text}")

if __name__ == "__main__":
    test_full_flow()
