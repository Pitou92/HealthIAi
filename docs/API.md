# 📡 Documentation API — HealthIAi

> Référence complète de l'API REST du projet HealthIAi.  
> Dernière mise à jour : 17 juin 2026

---

## 📋 Table des matières

1. [Base URL & Environnements](#-base-url--environnements)
2. [Authentification](#-authentification)
3. [Endpoints](#-endpoints)
   - [Health Check](#-health-check)
   - [Auth (`/auth`)](#-auth-auth---5-endpoints)
   - [AI (`/ai`)](#-ai-ai---4-endpoints)
   - [Tracking (`/progress`)](#-tracking-progress---5-endpoints)
4. [Modèles de Données](#-modèles-de-données)
5. [Codes d'Erreur](#-codes-derreur)
6. [Notes Importantes](#-notes-importantes)

---

## 🌐 Base URL & Environnements

| Environnement | URL |
|---------------|-----|
| 🖥️ Local (développement) | `http://localhost:8000` |
| 🐳 Docker | `http://localhost:8000` |

**Documentation interactive :**

| Outil | URL | Description |
|-------|-----|-------------|
| Swagger UI | `http://localhost:8000/docs` | Interface interactive pour tester les endpoints |
| ReDoc | `http://localhost:8000/redoc` | Documentation alternative en lecture seule |

---

## 🔐 Authentification

L'API utilise des **JSON Web Tokens (JWT)** pour sécuriser certains endpoints.

| Propriété | Valeur |
|-----------|--------|
| **Type** | Bearer Token (JWT) |
| **Header** | `Authorization: Bearer <token>` |
| **Durée de validité** | 7 jours |
| **Algorithme** | HS256 |

**Exemple d'en-tête authentifié :**

```http
GET /auth/user/me HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> [!IMPORTANT]
> Seuls les endpoints du groupe **Auth** utilisent réellement le JWT. Les endpoints **AI** et **Tracking** identifient l'utilisateur via un query parameter `user_id`. Voir la section [Notes Importantes](#-notes-importantes) pour plus de détails.

---

## 📌 Endpoints

### 💚 Health Check

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| `GET` | `/` | ❌ Non | Vérification de santé du service |

**Response `200 OK` :**

```json
{
  "project": "HealthIAi",
  "status": "running",
  "version": "0.1.0"
}
```

---

### 👤 Auth (`/auth`) — 5 endpoints

#### `POST` `/auth/register`

Création d'un nouveau compte utilisateur.

| Propriété | Valeur |
|-----------|--------|
| **Auth** | ❌ Non requise |
| **Content-Type** | `application/json` |

**Request Body :**

```json
{
  "email": "user@example.com",
  "password": "motdepasse123"
}
```

**Response `200 OK` :**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

**Erreurs possibles :**

| Code | Description |
|------|-------------|
| `400` | L'adresse email est déjà utilisée |
| `422` | Données de validation invalides |

---

#### `POST` `/auth/login`

Connexion d'un utilisateur existant.

| Propriété | Valeur |
|-----------|--------|
| **Auth** | ❌ Non requise |
| **Content-Type** | `application/json` |

**Request Body :**

```json
{
  "email": "user@example.com",
  "password": "motdepasse123"
}
```

**Response `200 OK` :**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

**Erreurs possibles :**

| Code | Description |
|------|-------------|
| `401` | Identifiants invalides (email ou mot de passe incorrect) |
| `422` | Données de validation invalides |

---

#### `POST` `/auth/onboarding`

Complétion du profil utilisateur après inscription. Enregistre toutes les données nécessaires pour la génération de plans personnalisés.

| Propriété | Valeur |
|-----------|--------|
| **Auth** | ✅ JWT requis |
| **Content-Type** | `application/json` |

**Request Body :**

```json
{
  "goal": "muscle_gain",
  "age": 28,
  "sex": "male",
  "height_cm": 180.0,
  "weight_kg": 75.0,
  "fitness_level": "intermediate",
  "workouts_per_week": 4,
  "session_duration_min": 60,
  "equipment": ["dumbbells", "barbell", "pull_up_bar"],
  "diet": "standard",
  "injuries": ["lower_back"],
  "daily_activity": "moderate"
}
```

**Détail des champs :**

| Champ | Type | Description | Valeurs possibles |
|-------|------|-------------|-------------------|
| `goal` | `string` | Objectif principal | `weight_loss`, `muscle_gain`, `maintenance`, `endurance` |
| `age` | `int` | Âge de l'utilisateur | 16–100 |
| `sex` | `string` | Sexe biologique | `male`, `female` |
| `height_cm` | `float` | Taille en centimètres | — |
| `weight_kg` | `float` | Poids en kilogrammes | — |
| `fitness_level` | `string` | Niveau sportif | `beginner`, `intermediate`, `advanced` |
| `workouts_per_week` | `int` | Nombre de séances par semaine | 1–7 |
| `session_duration_min` | `int` | Durée d'une séance en minutes | 15–120 |
| `equipment` | `list[string]` | Équipements disponibles | `dumbbells`, `barbell`, `machines`, `pull_up_bar`, `resistance_bands`, `none` |
| `diet` | `string` | Régime alimentaire | `standard`, `vegetarian`, `vegan`, `keto`, `halal` |
| `injuries` | `list[string]` | Blessures ou limitations | `lower_back`, `knee`, `shoulder`, `wrist`, `none` |
| `daily_activity` | `string` | Niveau d'activité quotidienne | `sedentary`, `light`, `moderate`, `active`, `very_active` |

**Response `200 OK` :**

```json
{
  "user_id": 1,
  "email": "user@example.com",
  "goal": "muscle_gain",
  "age": 28,
  "sex": "male",
  "height_cm": 180.0,
  "weight_kg": 75.0,
  "fitness_level": "intermediate",
  "workouts_per_week": 4,
  "session_duration_min": 60,
  "equipment": ["dumbbells", "barbell", "pull_up_bar"],
  "diet": "standard",
  "injuries": ["lower_back"],
  "daily_activity": "moderate"
}
```

---

#### `GET` `/auth/user/me`

Récupère le profil de l'utilisateur actuellement connecté.

| Propriété | Valeur |
|-----------|--------|
| **Auth** | ✅ JWT requis |

**Response `200 OK` :**

```json
{
  "user_id": 1,
  "email": "user@example.com",
  "goal": "muscle_gain",
  "age": 28,
  "sex": "male",
  "height_cm": 180.0,
  "weight_kg": 75.0,
  "fitness_level": "intermediate",
  "workouts_per_week": 4,
  "session_duration_min": 60,
  "equipment": ["dumbbells", "barbell", "pull_up_bar"],
  "diet": "standard",
  "injuries": ["lower_back"],
  "daily_activity": "moderate"
}
```

**Erreurs possibles :**

| Code | Description |
|------|-------------|
| `401` | Token JWT manquant ou invalide |

---

#### `GET` `/auth/user/{user_id}`

Récupère le profil d'un utilisateur par son ID.

| Propriété | Valeur |
|-----------|--------|
| **Auth** | ⚠️ Non requise (endpoint public) |

**Path Parameters :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `user_id` | `int` | Identifiant unique de l'utilisateur |

**Response `200 OK` :**

```json
{
  "user_id": 1,
  "email": "user@example.com",
  "goal": "muscle_gain",
  "age": 28,
  "..."
}
```

**Erreurs possibles :**

| Code | Description |
|------|-------------|
| `404` | Utilisateur non trouvé |

> [!WARNING]
> Cet endpoint est **public** et ne nécessite aucune authentification. Toute personne connaissant un `user_id` peut accéder au profil correspondant. Cela sera à sécuriser avant la mise en production.

---

### 🤖 AI (`/ai`) — 4 endpoints

#### `POST` `/ai/generate-plan`

Génère un plan d'entraînement et de nutrition personnalisé via l'IA.

| Propriété | Valeur |
|-----------|--------|
| **Auth** | ❌ Non (utilise `user_id` en query param) |
| **Content-Type** | `application/json` |

**Query Parameters :**

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `user_id` | `int` | ✅ | Identifiant de l'utilisateur |

**Request Body :** Objet `UserProfile` complet (voir [Modèles de Données](#-modèles-de-données)).

**Response `200 OK` :** Objet `RecommendationPlan` (voir [RecommendationPlan](#recommendationplan-ai-output)).

**Comportement :**
- 🔄 Utilise le plan précédent comme contexte s'il existe (amélioration continue)
- 💾 Sauvegarde automatiquement le plan généré dans MongoDB
- 🇫🇷 Les recommandations sont générées en français

---

#### `GET` `/ai/current-plan`

Récupère le plan de recommandation le plus récent de l'utilisateur.

| Propriété | Valeur |
|-----------|--------|
| **Auth** | ❌ Non (utilise `user_id` en query param) |

**Query Parameters :**

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `user_id` | `int` | ✅ | Identifiant de l'utilisateur |

**Response `200 OK` :** Objet `RecommendationPlan` le plus récent depuis MongoDB.

**Erreurs possibles :**

| Code | Description |
|------|-------------|
| `404` | Aucun plan trouvé pour cet utilisateur |

---

#### `POST` `/ai/analyze-meal`

Analyse une photo de repas via la vision IA pour estimer les apports nutritionnels.

| Propriété | Valeur |
|-----------|--------|
| **Auth** | ❌ Non (utilise `user_id` en query param) |
| **Content-Type** | `multipart/form-data` |

**Query Parameters :**

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `user_id` | `int` | ✅ | Identifiant de l'utilisateur |

**Request Body (form-data) :**

| Champ | Type | Description |
|-------|------|-------------|
| `file` | `UploadFile` | Image du repas (JPEG, PNG) |

**Exemple cURL :**

```bash
curl -X POST "http://localhost:8000/ai/analyze-meal?user_id=1" \
  -F "file=@photo_repas.jpg"
```

**Response `200 OK` :**

```json
{
  "user_id": 1,
  "detected_foods": [
    {
      "name": "Poulet grillé",
      "estimated_quantity": "150g",
      "calories": 248,
      "protein_g": 38.0,
      "carbs_g": 0.0,
      "fat_g": 9.5
    },
    {
      "name": "Riz basmati",
      "estimated_quantity": "200g",
      "calories": 260,
      "protein_g": 5.4,
      "carbs_g": 56.0,
      "fat_g": 0.6
    }
  ],
  "total_calories": 508,
  "total_protein": 43.4,
  "total_carbs": 56.0,
  "total_fat": 10.1,
  "analysis_summary": "Repas équilibré riche en protéines, bon apport en glucides complexes."
}
```

---

#### `POST` `/ai/generate-smart-plan`

Combine l'analyse d'image de repas **et** la génération de plan adapté en un seul appel.

| Propriété | Valeur |
|-----------|--------|
| **Auth** | ❌ Non (utilise `user_id` en query param) |
| **Content-Type** | `multipart/form-data` |

**Query Parameters :**

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `user_id` | `int` | ✅ | Identifiant de l'utilisateur |

**Request Body (form-data) :**

| Champ | Type | Description |
|-------|------|-------------|
| `file` | `UploadFile` | Image du repas (JPEG, PNG) |

**Response `200 OK` :** Objet `RecommendationPlan` adapté à l'analyse du repas.

**Comportement :**
1. 📸 Analyse l'image du repas (vision IA)
2. 📊 Évalue les apports nutritionnels détectés
3. 🧠 Génère un plan adapté en tenant compte du repas analysé

---

### 📊 Tracking (`/progress`) — 5 endpoints

#### `GET` `/progress/today`

Récupère le résumé de progression du jour pour un utilisateur.

| Propriété | Valeur |
|-----------|--------|
| **Auth** | ❌ Non (utilise `user_id` en query param) |

**Query Parameters :**

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `user_id` | `int` | ✅ | Identifiant de l'utilisateur |

**Response `200 OK` :**

```json
{
  "user_id": 1,
  "date": "2026-06-17",
  "calories_consumed": 0,
  "calories_target": 2200,
  "protein_consumed": 0,
  "protein_target": 165,
  "carbs_consumed": 0,
  "carbs_target": 250,
  "fat_consumed": 0,
  "fat_target": 70,
  "water_consumed_ml": 0,
  "water_target_ml": 2500,
  "weight_kg": null,
  "workout_completed": false
}
```

> [!NOTE]
> Les cibles (`*_target`) sont calculées à partir du profil utilisateur et de son plan de nutrition actuel. Si aucun plan n'existe, des valeurs par défaut sont utilisées.

---

#### `POST` `/progress/log/hydration`

Enregistre une prise d'eau pour la journée.

| Propriété | Valeur |
|-----------|--------|
| **Auth** | ❌ Non requise |
| **Content-Type** | `application/json` |

**Request Body :**

```json
{
  "user_id": 1,
  "amount_ml": 250
}
```

**Response `200 OK` :**

```json
{
  "message": "Hydration logged successfully",
  "total_water_ml": 750
}
```

> [!TIP]
> Chaque appel **ajoute** la quantité à la consommation totale du jour. Pour un verre d'eau standard, utilisez `amount_ml: 250`.

---

#### `POST` `/progress/log/weight`

Enregistre le poids du jour.

| Propriété | Valeur |
|-----------|--------|
| **Auth** | ❌ Non requise |
| **Content-Type** | `application/json` |

**Request Body :**

```json
{
  "user_id": 1,
  "weight_kg": 75.5
}
```

**Response `200 OK` :**

```json
{
  "message": "Weight logged successfully",
  "weight_kg": 75.5
}
```

---

#### `POST` `/progress/log/nutrition`

Enregistre un repas ou un aliment consommé.

| Propriété | Valeur |
|-----------|--------|
| **Auth** | ❌ Non requise |
| **Content-Type** | `application/json` |

**Request Body :**

```json
{
  "user_id": 1,
  "name": "Déjeuner",
  "calories": 650,
  "protein_g": 45.0,
  "carbs_g": 60.0,
  "fat_g": 20.0,
  "items": [
    {
      "name": "Poulet grillé",
      "calories": 248,
      "protein_g": 38.0,
      "carbs_g": 0.0,
      "fat_g": 9.5
    },
    {
      "name": "Riz basmati",
      "calories": 260,
      "protein_g": 5.4,
      "carbs_g": 56.0,
      "fat_g": 0.6
    }
  ]
}
```

**Response `200 OK` :**

```json
{
  "message": "Nutrition logged successfully"
}
```

---

#### `GET` `/progress/nutrition/logs`

Récupère tous les logs de nutrition du jour pour un utilisateur.

| Propriété | Valeur |
|-----------|--------|
| **Auth** | ❌ Non (utilise `user_id` en query param) |

**Query Parameters :**

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `user_id` | `int` | ✅ | Identifiant de l'utilisateur |

**Response `200 OK` :**

```json
[
  {
    "id": 1,
    "user_id": 1,
    "name": "Petit-déjeuner",
    "calories": 450,
    "protein_g": 25.0,
    "carbs_g": 55.0,
    "fat_g": 12.0,
    "items": [...],
    "created_at": "2026-06-17T08:30:00"
  },
  {
    "id": 2,
    "user_id": 1,
    "name": "Déjeuner",
    "calories": 650,
    "protein_g": 45.0,
    "carbs_g": 60.0,
    "fat_g": 20.0,
    "items": [...],
    "created_at": "2026-06-17T12:45:00"
  }
]
```

> [!NOTE]
> Seuls les logs de la journée en cours sont retournés. Les données sont filtrées par date (aujourd'hui uniquement).

---

## 📦 Modèles de Données

### `UserProfile` (Input)

Profil complet de l'utilisateur, utilisé pour l'onboarding et la génération de plans.

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `goal` | `string` | ✅ | Objectif : `weight_loss`, `muscle_gain`, `maintenance`, `endurance` |
| `age` | `int` | ✅ | Âge (16–100) |
| `sex` | `string` | ✅ | Sexe biologique : `male`, `female` |
| `height_cm` | `float` | ✅ | Taille en centimètres |
| `weight_kg` | `float` | ✅ | Poids en kilogrammes |
| `fitness_level` | `string` | ✅ | Niveau : `beginner`, `intermediate`, `advanced` |
| `workouts_per_week` | `int` | ✅ | Séances par semaine (1–7) |
| `session_duration_min` | `int` | ✅ | Durée de séance en minutes (15–120) |
| `equipment` | `list[string]` | ✅ | Équipements disponibles |
| `diet` | `string` | ✅ | Régime : `standard`, `vegetarian`, `vegan`, `keto`, `halal` |
| `injuries` | `list[string]` | ✅ | Blessures ou limitations |
| `daily_activity` | `string` | ✅ | Activité quotidienne : `sedentary`, `light`, `moderate`, `active`, `very_active` |

---

### `RecommendationPlan` (AI Output)

Plan personnalisé généré par l'IA, contenant les recommandations sportives et nutritionnelles.

| Champ | Type | Description |
|-------|------|-------------|
| `user_id` | `int` | Identifiant de l'utilisateur |
| `plan` | `object` | Plan d'entraînement complet (jours, exercices, séries, répétitions) |
| `plan.weekly_schedule` | `list[object]` | Programme hebdomadaire détaillé |
| `plan.weekly_schedule[].day` | `string` | Jour de la semaine |
| `plan.weekly_schedule[].focus` | `string` | Groupe musculaire ciblé |
| `plan.weekly_schedule[].exercises` | `list[object]` | Liste des exercices |
| `plan.weekly_schedule[].exercises[].name` | `string` | Nom de l'exercice |
| `plan.weekly_schedule[].exercises[].sets` | `int` | Nombre de séries |
| `plan.weekly_schedule[].exercises[].reps` | `string` | Nombre de répétitions |
| `plan.weekly_schedule[].exercises[].rest_seconds` | `int` | Temps de repos en secondes |
| `nutrition` | `object` | Plan nutritionnel détaillé |
| `nutrition.daily_calories` | `int` | Objectif calorique journalier |
| `nutrition.macros` | `object` | Répartition des macronutriments |
| `nutrition.macros.protein_g` | `float` | Protéines en grammes |
| `nutrition.macros.carbs_g` | `float` | Glucides en grammes |
| `nutrition.macros.fat_g` | `float` | Lipides en grammes |
| `nutrition.meal_suggestions` | `list[object]` | Suggestions de repas |
| `metadata` | `object` | Métadonnées du plan |
| `metadata.generated_at` | `string` | Date/heure de génération (ISO 8601) |
| `metadata.model_used` | `string` | Modèle IA utilisé |
| `metadata.based_on_previous` | `bool` | Si le plan s'appuie sur un plan précédent |

---

### `MealAnalysis` (Vision Output)

Résultat de l'analyse d'image de repas par la vision IA.

| Champ | Type | Description |
|-------|------|-------------|
| `user_id` | `int` | Identifiant de l'utilisateur |
| `detected_foods` | `list[FoodItem]` | Liste des aliments détectés |
| `total_calories` | `int` | Total des calories estimées |
| `total_protein` | `float` | Total des protéines en grammes |
| `total_carbs` | `float` | Total des glucides en grammes |
| `total_fat` | `float` | Total des lipides en grammes |
| `analysis_summary` | `string` | Résumé textuel de l'analyse (en français) |

---

### `FoodItem` (Vision)

Aliment individuel détecté par la vision IA.

| Champ | Type | Description |
|-------|------|-------------|
| `name` | `string` | Nom de l'aliment détecté |
| `estimated_quantity` | `string` | Quantité estimée (ex: `"150g"`, `"1 portion"`) |
| `calories` | `int` | Calories estimées |
| `protein_g` | `float` | Protéines en grammes |
| `carbs_g` | `float` | Glucides en grammes |
| `fat_g` | `float` | Lipides en grammes |

---

### `DailyProgress` (Tracking)

Résumé de la progression quotidienne de l'utilisateur.

| Champ | Type | Description |
|-------|------|-------------|
| `user_id` | `int` | Identifiant de l'utilisateur |
| `date` | `string` | Date du jour (format `YYYY-MM-DD`) |
| `calories_consumed` | `int` | Calories consommées aujourd'hui |
| `calories_target` | `int` | Objectif calorique du jour |
| `protein_consumed` | `float` | Protéines consommées (g) |
| `protein_target` | `float` | Objectif protéines (g) |
| `carbs_consumed` | `float` | Glucides consommés (g) |
| `carbs_target` | `float` | Objectif glucides (g) |
| `fat_consumed` | `float` | Lipides consommés (g) |
| `fat_target` | `float` | Objectif lipides (g) |
| `water_consumed_ml` | `int` | Eau consommée (ml) |
| `water_target_ml` | `int` | Objectif hydratation (ml) |
| `weight_kg` | `float \| null` | Poids du jour (si enregistré) |
| `workout_completed` | `bool` | Séance du jour complétée |

---

### `NutritionLog` (Tracking)

Entrée de journal nutritionnel enregistrée par l'utilisateur.

| Champ | Type | Description |
|-------|------|-------------|
| `id` | `int` | Identifiant unique du log |
| `user_id` | `int` | Identifiant de l'utilisateur |
| `name` | `string` | Nom du repas (ex: `"Déjeuner"`, `"Collation"`) |
| `calories` | `int` | Total des calories du repas |
| `protein_g` | `float` | Protéines totales (g) |
| `carbs_g` | `float` | Glucides totaux (g) |
| `fat_g` | `float` | Lipides totaux (g) |
| `items` | `list[FoodItem]` | Détail des aliments composant le repas |
| `created_at` | `string` | Date/heure de création (ISO 8601) |

---

## ❌ Codes d'Erreur

L'API utilise les codes HTTP standard pour indiquer le succès ou l'échec d'une requête.

| Code | Status | Description | Exemple |
|------|--------|-------------|---------|
| `200` | OK | Requête traitée avec succès | — |
| `400` | Bad Request | Requête invalide ou données incohérentes | Email déjà utilisé lors de l'inscription |
| `401` | Unauthorized | Non authentifié ou token JWT invalide/expiré | Token manquant sur `/auth/user/me` |
| `404` | Not Found | Ressource non trouvée | Utilisateur ou plan inexistant |
| `422` | Unprocessable Entity | Erreur de validation des données | Champ requis manquant, type incorrect |
| `500` | Internal Server Error | Erreur interne du serveur | Erreur de l'API IA, base de données indisponible |

**Format d'erreur standard :**

```json
{
  "detail": "Description de l'erreur"
}
```

**Format d'erreur de validation (422) :**

```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

---

## ⚠️ Notes Importantes

### Sécurité

> [!WARNING]
> **Authentification partielle** — La majorité des endpoints AI (`/ai/*`) et Tracking (`/progress/*`) n'utilisent **pas** de JWT pour l'authentification. Ils identifient l'utilisateur via un simple query parameter `user_id`. Cela signifie que n'importe qui peut accéder aux données d'un autre utilisateur en devinant son `user_id`. **À sécuriser impérativement avant la mise en production.**

> [!WARNING]
> **CORS ouvert** — La configuration CORS actuelle autorise toutes les origines (`allow_origins=["*"]`). C'est acceptable en développement mais doit être restreint en production.

### Langue des réponses IA

> [!NOTE]
> Toutes les réponses générées par l'IA (plans d'entraînement, analyses de repas, recommandations) sont en **français** 🇫🇷.

### Base de données

| Service | Technologie | Usage |
|---------|-------------|-------|
| Données utilisateurs | MySQL | Comptes, profils, logs de progression |
| Plans IA | MongoDB | Stockage des plans générés et analyses |
| Cache (prévu) | Redis | Cache de session et rate limiting |

### Flux typique d'utilisation

```mermaid
sequenceDiagram
    participant C as Client (App)
    participant A as API (FastAPI)
    participant DB as MySQL
    participant AI as Service IA
    participant M as MongoDB

    C->>A: POST /auth/register
    A->>DB: Créer utilisateur
    A-->>C: JWT Token

    C->>A: POST /auth/onboarding (+ JWT)
    A->>DB: Sauvegarder profil
    A-->>C: Profil complet

    C->>A: POST /ai/generate-plan?user_id=1
    A->>AI: Générer plan personnalisé
    AI-->>A: Plan IA
    A->>M: Sauvegarder plan
    A-->>C: RecommendationPlan

    C->>A: POST /ai/analyze-meal?user_id=1
    A->>AI: Analyser image (Vision)
    AI-->>A: MealAnalysis
    A-->>C: Résultat analyse

    C->>A: POST /progress/log/nutrition
    A->>DB: Enregistrer repas
    A-->>C: Confirmation

    C->>A: GET /progress/today?user_id=1
    A->>DB: Récupérer progression
    A-->>C: DailyProgress
```

---

> 📝 *Documentation générée pour le projet HealthIAi — Version 0.1.0*
