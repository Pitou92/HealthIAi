import os
import sys
import json
import asyncio
import logging
import random
from datetime import datetime

# --- PATH HACK ---
# Add the project root (backend) to sys.path so we can import from services and core
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from services.vision_service import VisionService
from core.config import settings
from models.domain import MealAnalysis, FoodItem

# Setup logging for the script
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

# --- CONFIGURATION ---
MOCK_MODE = True  # Set to False to use real AI API
REPORT_PATH = os.path.join(os.path.dirname(__file__), '..', 'examples', 'ai_metrics_report.md')

def safe_div(n, d):
    """Helper to avoid division by zero."""
    return n / d if d != 0 else 0.0

def calculate_food_metrics(predicted, actual):
    """
    Calculates Precision, Recall, and F1-Score for food identification.
    predicted: List of food names found by IA
    actual: List of ground truth food names
    """
    pred_set = set([f.lower() for f in predicted])
    act_set = set([f.lower() for f in actual])

    # If both are empty, it's a perfect match (e.g. empty plate)
    if not pred_set and not act_set:
        return 1.0, 1.0, 1.0

    tp = len(pred_set.intersection(act_set))
    fp = len(pred_set - act_set)
    fn = len(act_set - pred_set)

    precision = safe_div(tp, tp + fp)
    recall = safe_div(tp, tp + fn)
    f1 = safe_div(2 * precision * recall, precision + recall)

    return precision, recall, f1

def calculate_mae(predicted, actual):
    """Calculates Absolute Error for nutritional values."""
    return abs(predicted - actual)

async def get_mock_analysis(ground_truth):
    """
    Simulates an AI analysis based on ground truth but adds synthetic noise.
    """
    # 1. Simulate food detection with some randomness
    actual_foods = ground_truth['foods']
    predicted_foods_names = []

    for food in actual_foods:
        # 80% chance to detect a food that is actually there
        if random.random() < 0.8:
            predicted_foods_names.append(food)

    # 20% chance to add a fake food item
    if random.random() < 0.2:
        predicted_foods_names.append("unknown_food")

    # 2. Simulate nutritional values with +/- 10% noise
    def add_noise(val):
        return val * random.uniform(0.9, 1.1)

    total_cal = int(add_noise(ground_truth['total_calories']))
    total_prot = add_noise(ground_truth['total_protein'])
    total_carb = add_noise(ground_truth['total_carbs'])
    total_fat = add_noise(ground_truth['total_fat'])

    # Create FoodItem objects for each detected food (distributing calories)
    detected_foods = []
    if predicted_foods_names:
        share = 1.0 / len(predicted_foods_names)
        for name in predicted_foods_names:
            detected_foods.append(FoodItem(
                name=name,
                estimated_quantity="1 portion",
                calories=int(total_cal * share),
                protein_g=total_prot * share,
                carbs_g=total_carb * share,
                fat_g=total_fat * share
            ))
    else:
        # Case where no foods were detected but calories are still guessed
        detected_foods = []

    return MealAnalysis(
        user_id=None,
        detected_foods=detected_foods,
        total_calories=total_cal,
        total_protein=total_prot,
        total_carbs=total_carb,
        total_fat=total_fat,
        analysis_summary="Mock AI analysis for testing metrics."
    )

async def main():
    logger.info(f"Starting AI Precision Evaluation (MOCK_MODE={MOCK_MODE})...")

    # 1. Load Ground Truth Dataset
    dataset_path = os.path.join(os.path.dirname(__file__), '..', 'examples', 'ai_ground_truth.json')
    try:
        with open(dataset_path, 'r', encoding='utf-8') as f:
            dataset = json.load(f)
    except Exception as e:
        logger.error(f"Could not load ground truth file: {e}")
        return

    vision_service = VisionService()

    # Accumulators for final averages
    results = {
        "precision": [],
        "recall": [],
        "f1": [],
        "calorie_mae": [],
        "protein_mae": [],
        "carbs_mae": [],
        "fat_mae": []
    }

    processed_count = 0
    failed_count = 0

    # 2. Process each test case
    for i, case in enumerate(dataset):
        logger.info(f"Testing case {i+1}/{len(dataset)}: {case['description']}...")

        try:
            if MOCK_MODE:
                analysis = await get_mock_analysis(case['ground_truth'])
            else:
                image_path = case['image_path']
                abs_image_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', image_path))
                with open(abs_image_path, 'rb') as img_file:
                    image_bytes = img_file.read()
                analysis = await vision_service.analyze_meal_image(image_bytes)

            # Extract predicted foods
            predicted_foods = [food.name for food in analysis.detected_foods]
            actual_foods = case['ground_truth']['foods']

            # Food Metrics
            p, r, f1 = calculate_food_metrics(predicted_foods, actual_foods)
            results["precision"].append(p)
            results["recall"].append(r)
            results["f1"].append(f1)

            # Nutrition Metrics (MAE)
            gt = case['ground_truth']
            results["calorie_mae"].append(calculate_mae(analysis.total_calories, gt['total_calories']))
            results["protein_mae"].append(calculate_mae(analysis.total_protein, gt['total_protein']))
            results["carbs_mae"].append(calculate_mae(analysis.total_carbs, gt['total_carbs']))
            results["fat_mae"].append(calculate_mae(analysis.total_fat, gt['total_fat']))

            processed_count += 1
            logger.info(f"Case {i+1} completed successfully.")

        except Exception as e:
            logger.error(f"Error evaluating case {case['id']}: {e}")
            failed_count += 1

    # 3. Calculate Averages
    final_metrics = {}
    for key, values in results.items():
        final_metrics[key] = sum(values) / len(values) if values else 0

    # 4. Generate Markdown Report
    report_content = []
    report_content.append("="*50)
    report_content.append("FINAL AI PERFORMANCE METRICS")
    report_content.append("="*50)
    report_content.append(f"\n**Date**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    report_content.append(f"**Mode**: {'Simulation (Mock)' if MOCK_MODE else 'Real API'}")
    report_content.append(f"**Dataset**: {len(dataset)} cases ({processed_count} success, {failed_count} failed)")
    report_content.append("\n| Metrique | Valeur Moyenne |")
    report_content.append("| :--- | :--- |")
    report_content.append(f"| Precision (Aliments) | {final_metrics['precision']*100:.2f}% |")
    report_content.append(f"| Rappel (Aliments) | {final_metrics['recall']*100:.2f}% |")
    report_content.append(f"| F1-Score (Aliments) | {final_metrics['f1']*100:.2f}% |")
    report_content.append(f"| MAE Calories | {final_metrics['calorie_mae']:.2f} kcal |")
    report_content.append(f"| MAE Proteines | {final_metrics['protein_mae']:.2f} g |")
    report_content.append(f"| MAE Glucides | {final_metrics['carbs_mae']:.2f} g |")
    report_content.append(f"| MAE Lipides | {final_metrics['fat_mae']:.2f} g |")
    report_content.append("\n" + "="*50)

    final_report = "\n".join(report_content)

    # Print to console
    print("\n" + final_report)

    # Write to file
    try:
        with open(REPORT_PATH, 'w', encoding='utf-8') as f:
            f.write(final_report)
        logger.info(f"Report saved to {REPORT_PATH}")
    except Exception as e:
        logger.error(f"Could not save report file: {e}")

if __name__ == "__main__":
    asyncio.run(main())
