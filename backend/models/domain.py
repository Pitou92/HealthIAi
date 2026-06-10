from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional

# --- AUTH MODELS ---

class UserRegister(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# --- INPUT MODELS ---

class UserProfile(BaseModel):
    """User profile input for AI recommendation generation."""
    goal: str = Field(..., description="User's primary health/fitness goal")
    age: int = Field(..., description="User's age")
    sex: str = Field(..., description="User's gender")
    height_cm: int = Field(..., description="Height in centimeters")
    weight_kg: int = Field(..., description="Weight in kilograms")
    fitness_level: str = Field(..., description="Current fitness level (e.g., Beginner, Intermediate, Advanced)")
    workouts_per_week: int = Field(..., description="Number of workouts the user can commit to per week")
    session_duration_min: int = Field(..., description="Average duration of a single workout session in minutes")
    equipment: List[str] = Field(default_factory=list, description="List of available equipment")
    diet: str = Field(..., description="User's dietary preferences or restrictions")
    injuries: List[str] = Field(default_factory=list, description="List of current injuries or physical limitations")
    daily_activity: str = Field(..., description="General daily activity level (e.g., Sedentary, Moderate, Active)")

# --- OUTPUT MODELS ---

class Exercise(BaseModel):
    name: str
    sets: int
    reps: str
    rest_sec: int

class WorkoutDay(BaseModel):
    day: str
    focus: str
    duration_min: int
    exercises: List[Exercise]

class WeeklySchedule(BaseModel):
    duration_weeks: int
    weekly_schedule: List[WorkoutDay]

class Macros(BaseModel):
    protein_g: int
    carbs_g: int
    fat_g: int

class Meal(BaseModel):
    name: str
    foods: List[str]

class NutritionPlan(BaseModel):
    daily_calories: int
    macros: Macros
    meals: List[Meal]

class UserContext(BaseModel):
    goal: str
    fitness_level: str
    activity_level: str
    constraints: dict # { "equipment": [], "injuries": [] }

class RecommendationLogic(BaseModel):
    goal_alignment: str
    constraints_applied: List[str]

class Metadata(BaseModel):
    model: str
    prompt_version: str
    generated_at: str

class RecommendationPlan(BaseModel):
    """Structured AI response for health and fitness recommendations."""
    user_id: Optional[int] = Field(None, description="Linked MySQL User ID")
    type: str
    user_context: UserContext
    plan: WeeklySchedule
    nutrition: NutritionPlan
    recommendation_logic: RecommendationLogic
    metadata: Metadata

class FoodItem(BaseModel):
    name: str = Field(..., description="Nom de l'aliment détecté")
    estimated_quantity: str = Field(..., description="Quantité estimée (ex: 200g, 1 portion)")
    calories: int = Field(..., description="Calories estimées pour cette quantité")
    protein_g: float = Field(..., description="Protéines en grammes")
    carbs_g: float = Field(..., description="Glucides en grammes")
    fat_g: float = Field(..., description="Lipides en grammes")

class MealAnalysis(BaseModel):
    """Résultat de l'analyse visuelle d'un repas."""
    user_id: Optional[int] = Field(None, description="Linked MySQL User ID")
    detected_foods: List[FoodItem]
    total_calories: int
    total_protein: float
    total_carbs: float
    total_fat: float
    analysis_summary: str = Field(..., description="Bref résumé nutritionnel du repas")
