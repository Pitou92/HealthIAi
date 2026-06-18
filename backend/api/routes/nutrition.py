from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
import httpx
import logging
from models.domain import SavedMeal, FoodItem
from core.nosql_db import get_nosql_db
from datetime import datetime

logger = logging.getLogger(__name__)
router = APIRouter()
db_nosql = get_nosql_db()

@router.get("/barcode/{code}")
async def get_product_by_barcode(code: str):
    """Fetch product nutrition info from OpenFoodFacts by barcode."""
    url = f"https://world.openfoodfacts.org/api/v0/product/{code}.json"
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()
            
            if data.get("status") != 1:
                raise HTTPException(status_code=404, detail="Product not found")
                
            product = data.get("product", {})
            nutriments = product.get("nutriments", {})
            
            return {
                "name": product.get("product_name", "Unknown Product"),
                "brand": product.get("brands", "Unknown Brand"),
                "image_url": product.get("image_url"),
                "nutrition": {
                    "calories_100g": nutriments.get("energy-kcal_100g", 0),
                    "protein_100g": nutriments.get("proteins_100g", 0),
                    "carbs_100g": nutriments.get("carbohydrates_100g", 0),
                    "fat_100g": nutriments.get("fat_100g", 0)
                }
            }
        except httpx.RequestError as e:
            logger.error(f"Error calling OpenFoodFacts API: {e}")
            raise HTTPException(status_code=502, detail="External API error")

@router.get("/search")
async def search_foods(q: str = Query(..., min_length=2)):
    """Search for foods using OpenFoodFacts API."""
    url = f"https://world.openfoodfacts.org/cgi/search.pl"
    params = {
        "search_terms": q,
        "search_simple": 1,
        "action": "process",
        "json": 1,
        "page_size": 10
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            products = data.get("products", [])
            results = []
            
            for p in products:
                nutriments = p.get("nutriments", {})
                results.append({
                    "id": p.get("code"),
                    "name": p.get("product_name"),
                    "brand": p.get("brands"),
                    "calories_100g": nutriments.get("energy-kcal_100g", 0),
                    "protein_100g": nutriments.get("proteins_100g", 0),
                    "carbs_100g": nutriments.get("carbohydrates_100g", 0),
                    "fat_100g": nutriments.get("fat_100g", 0)
                })
                
            return results
        except httpx.RequestError as e:
            logger.error(f"Error calling OpenFoodFacts Search API: {e}")
            raise HTTPException(status_code=502, detail="External API error")

@router.post("/favorites", response_model=SavedMeal)
async def save_favorite_meal(meal: SavedMeal):
    """Save a meal to favorites."""
    if not meal.created_at:
        meal.created_at = datetime.now().isoformat()
    await db_nosql.saved_meals.insert_one(meal.model_dump())
    return meal

@router.get("/favorites", response_model=List[SavedMeal])
async def get_favorite_meals(user_id: int = Query(...)):
    """Get all favorite meals for a user."""
    cursor = db_nosql.saved_meals.find({"user_id": user_id}).sort("created_at", -1)
    meals = []
    async for doc in cursor:
        meals.append(SavedMeal.model_validate(doc))
    return meals
