# 🏗️ Architecture Technique — HealthIAi

## 1. Vue d'Ensemble
HealthIAi est une application de coaching fitness et nutrition basée sur l'IA. Elle utilise une architecture client-serveur classique avec une application mobile multiplateforme (iOS, Android, Web) communiquant avec une API backend robuste. Le backend s'appuie sur une approche de persistance polyglotte (MySQL + MongoDB) et s'intègre avec des fournisseurs d'IA (OpenRouter pour le texte, Gemini pour la vision) pour offrir des recommandations personnalisées.

## 2. Diagramme d'Architecture

```text
+-------------------+       +--------------------+       +-----------------------+
|   Client Layer    |       |     API Layer      |       |      Data Layer       |
|  (Expo / React)   |       |  (FastAPI - 8000)  |       |                       |
|                   |       |                    |       |  +-----------------+  |
|  +-------------+  | HTTP  |  +--------------+  | MySQL |  | MySQL (8.0)     |  |
|  | iOS / Android| <=======> | Routers (API) | <=======> | User Profiles   |  |
|  +-------------+  | JSON  |  +--------------+  | Async |  | Auth Data       |  |
|                   |       |         |          |       |  +-----------------+  |
|  +-------------+  |       |  +--------------+  | Mongo |  +-----------------+  |
|  | Web Browser  | |       |  | Services     | <=======> | MongoDB (latest)|  |
|  +-------------+  |       |  | (AI, Vision) |  | Async |  | Plans, Logs,    |  |
+-------------------+       |  +--------------+  |       |  | Analyses        |  |
                            |         |          |       |  +-----------------+  |
                            +---------|----------+       +-----------------------+
                                      |
                            +---------v----------+
                            | External AI Layer  |
                            | - OpenRouter API   |
                            | - Gemini 2.0 Flash |
                            +--------------------+
```

## 3. Architecture Backend

### 3.1 Structure des Répertoires
```text
backend/
├── api/
│   └── routes/         # Endpoints (ai.py, auth.py, tracking.py)
├── core/
│   ├── config.py       # Configuration et variables d'environnement
│   ├── prompts/        # Prompts IA (system_prompt.md, vision_prompt.md)
│   ├── sql_db.py       # Connexion MySQL (SQLAlchemy)
│   └── nosql_db.py     # Connexion MongoDB (Motor)
├── models/
│   ├── domain.py       # Modèles de données Pydantic
│   └── sql_models.py   # Modèles ORM SQLAlchemy
├── services/           # Logique métier
│   ├── ai_service.py   # Intégration OpenRouter
│   ├── auth_service.py # Hash de mdp et JWT
│   └── vision_service.py # Analyse d'image IA
└── main.py             # Point d'entrée FastAPI
```

### 3.2 Couches Applicatives
- **API Layer** (`api/routes/`) : Gère les requêtes entrantes, la validation initiale via Pydantic et le formatage des réponses HTTP.
- **Service Layer** (`services/`) : Contient la logique métier complexe (génération de plans, authentification, appel aux API externes).
- **Data Layer** (`models/`, `core/`) : Interface avec les bases de données via SQLAlchemy (MySQL) et Motor (MongoDB).
- **Core** (`core/`) : Gère la configuration (chargement du `.env`), les utilitaires, et le stockage des prompts IA.

### 3.3 Modèle de Données

#### Base SQL (MySQL) - Table `users`
Utilisée pour les données hautement structurées (comptes, profils).
- `id` (Integer, PK)
- `email` (String, Unique)
- `hashed_password` (String)
- `age` (Integer)
- `height` (Float)
- `weight` (Float)
- `sex` (String)
- `goal` (String)
- `activity_frequency` (Integer)
- `activity_type` (String)
- `activity_level` (String)
- `created_at` (DateTime)

#### Base NoSQL (MongoDB) - Collections
Utilisée pour la flexibilité (formats JSON complexes générés par l'IA).
- `plans` : Documents `RecommendationPlan` générés par l'IA.
- `meal_analyses` : Documents `MealAnalysis` suite aux requêtes de vision.
- `nutrition_logs` : Entrées `NutritionLog`.
- `hydration_logs` : Entrées `HydrationLog`.
- `weight_logs` : Entrées `WeightLog`.

**Pourquoi la persistance polyglotte ?** L'IA génère des structures de données complexes (ex: listes de repas avec macros détaillées) qui sont difficiles à modéliser et à faire évoluer dans un schéma SQL rigide. MongoDB permet de stocker ces plans IA bruts sous forme de documents JSON sans nécessiter de migrations de schéma constantes. MySQL assure la cohérence des comptes et des relations utilisateurs.

### 3.4 Modèles Pydantic (16 modèles dans `domain.py`)
- **Authentification** : `UserRegister`, `UserLogin`, `Token`
- **Profil (Input)** : `UserProfile` (12 champs: goal, age, sex, height_cm, weight_kg, fitness_level, workouts_per_week, session_duration_min, equipment, diet, injuries, daily_activity)
- **IA (Output)** : `RecommendationPlan`, `WeeklySchedule`, `WorkoutDay`, `Exercise`, `NutritionPlan`, `Macros`, `Meal`, `UserContext`, `RecommendationLogic`, `Metadata`
- **Vision** : `MealAnalysis`, `FoodItem`
- **Tracking** : `HydrationLog`, `WeightLog`, `DailyProgress`, `NutritionLog`

### 3.5 Intégration IA

#### Chat / Recommandations (`AIService`)
- **Provider** : OpenRouter
- **Modèle** : `openai/gpt-oss-120b:free`
- **Prompt** : Un prompt système strict de 133 lignes forçant une sortie JSON.
- **Pipeline** : `generate_recommendations` → IA génère JSON dans des blocs markdown → `clean_json_response` (nettoie le markdown) → Validation par `RecommendationPlan.model_validate_json()`.

#### Vision / Analyse Repas (`VisionService`)
- **Modèle Primaire** : `google/gemini-2.0-flash-001`
- **Modèle Fallback** : `openai/gpt-4o-mini`
- **Pipeline** : Image envoyée en Base64 → Envoi via l'API (avec format d'URL d'image) → Réponse JSON nettoyée et castée → Validation par le modèle Pydantic `MealAnalysis`.

### 3.6 Authentification
- Hachage de mot de passe via `bcrypt`.
- Jetons JWT HS256 (expiration : 7 jours).
- Implémenté via OAuth2 (`OAuth2PasswordBearer`) dans FastAPI.

## 4. Architecture Frontend

### 4.1 Structure des Répertoires
```text
frontend/
├── src/
│   ├── app/            # Routes Expo Router (Dossiers)
│   ├── components/     # Composants réutilisables
│   ├── config/         # Config API et Mock
│   ├── constants/      # Thème (Couleurs, Polices)
│   ├── hooks/          # Hooks personnalisés (ex: useTheme)
│   ├── mocks/          # Données de simulation
│   ├── navigation/     # Mapping des routes
│   ├── services/       # Couche API et authentification
│   ├── store/          # Stores Zustand
│   ├── types/          # Interfaces TypeScript
│   └── utils/          # Fonctions utilitaires
```

### 4.2 Navigation (Expo Router)
Navigation basée sur le système de fichiers (`src/app/`) :
- `/(auth)` : `welcome`, `login`, `register`
- `/(onboarding)` : `step1`, `step2`, `step3`
- `/(tabs)` : `index` (Résumé), `nutrition`, `sport`, `profile`
- `/nutrition/scan` : Scanner de repas
- `/ai-loading` : Écran de chargement des résultats IA

**Flux de navigation :**
1. Lancement (`/`) → Check Token → Redirect `/(tabs)` ou `/(auth)/welcome`.
2. Welcome → Register → Onboarding (3 étapes) → AI Loading → Dashboard.
3. Dashboard (Résumé) ↔ Nutrition ↔ Sport ↔ Profile.
4. Nutrition → Bouton Scanner → Modal `/nutrition/scan`.

### 4.3 State Management (Zustand v5)
Utilise deux stores principaux, avec persistance via `AsyncStorage` :
- `useAppStore` : Gère les recommandations, le suivi journalier (`dailyProgress`), l'ID utilisateur, et les journaux de nutrition. Inclut les actions asynchrones (ex: `submitAndFetch`).
- `useOnboardingStore` : Stocke temporairement les données des 3 étapes de l'onboarding avant la soumission.

### 4.4 Service Layer (`src/services/api.ts`)
Gère les appels backend avec support complet du mode **Mock**.
- Variables d'environnement `EXPO_PUBLIC_USE_MOCK` pour basculer facilement.
- 11 fonctions d'API principales.
- Mappers : `toBackendProfile` et `fromBackendPlan` pour assurer la compatibilité des formats entre le front (camelCase) et le back (snake_case/nested).

### 4.5 Système de Thème
- Composants de base (cartes, badges) utilisent **NativeWind/Tailwind**.
- Les écrans (layouts) utilisent **StyleSheet** de React Native.
- Couleurs personnalisées (Palette "SP") définies dans `constants/theme.ts`.

## 5. Flux de Données
1. **Inscription** : Utilisateur crée un compte → Onboarding remplit le store local → POST API → Backend enregistre dans MySQL → Lance la génération de plan IA → Sauvegarde MongoDB → Frontend affiche le Dashboard.
2. **Scan Repas** : Prise de photo (Expo Image Picker) → Upload API (FormData Base64) → VisionService interroge Gemini → Retourne JSON Pydantic → Frontend affiche confirmation.
3. **Tracking** : Utilisateur log l'eau/poids/repas → API POST → MongoDB log → Retour 200 → Zustand met à jour le store local optimiste → L'UI se rafraîchit.

## 6. Patterns & Conventions
- **Asynchrone** : Utilisation exclusive de `async/await` côté client et serveur (`aiomysql`, `motor`).
- **Développement Mock-First** : Frontend testable et développable indépendamment du backend via un système de mock intégré et persistant localement.
- **Plateforme Unique** : Utilisation de fichiers `.web.tsx` pour l'adaptation spécifique au web de certains composants natifs (ex: `app-tabs`).
