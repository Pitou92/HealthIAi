# Plan d'Évolution de HealthIAi : Vers une Application Complète

Après analyse approfondie du backend actuel, voici l'état des lieux et le plan d'action pour transformer HealthIAi en une véritable application de santé, de suivi sportif et nutritionnel "premium".

## 1. État des Lieux Actuel (Backend)
Ce qui est déjà en place et fonctionnel :
*   **Authentification** : Inscription/Connexion avec JWT (`auth.py`).
*   **Intelligence Artificielle** :
    *   Génération de plans personnalisés (Sport & Nutrition) via GPT (`/ai/generate-plan`).
    *   Analyse visuelle de repas (Computer Vision) pour estimer les macros/calories (`/ai/analyze-meal`).
*   **Suivi Quotidien (Basique)** :
    *   Calcul de la progression du jour (`/progress/today`) en comparant les logs au plan généré.
    *   Enregistrement de l'hydratation, du poids et des repas (`tracking.py`).

## 2. Lacunes Identifiées (Pourquoi l'app fait "cheap" actuellement)
*   **Absence de suivi sportif réel** : Le endpoint `today` renvoie `workout_completed=False` en dur. L'utilisateur ne peut pas valider une séance.
*   **Pas d'historique ni de tendances** : L'API ne renvoie que les données "d'aujourd'hui". Impossible de faire des graphiques (ex: évolution du poids, calories sur 7 jours).
*   **Base de données alimentaire limitée** : L'ajout de repas se fait uniquement via IA ou manuellement. Il manque un scan de code-barres (type Yuka/MyFitnessPal).
*   **Gamification absente** : Le frontend affiche une "flamme" (Streak), mais le backend ne calcule pas les jours consécutifs de réussite.
*   **Gestion du profil statique** : Impossible pour l'utilisateur de mettre à jour ses mensurations (taille, âge) ou ses objectifs sans regénérer un plan complet.

---

## 3. Plan d'Implémentation Détaillé (Nouvelles Fonctionnalités)

### Phase 1 : Le Suivi Sportif (Workouts)
Pour que la partie "Sport" soit vraiment utile :
1.  **Endpoint de validation de séance** : `POST /progress/log/workout`.
    *   Permet à l'utilisateur de cocher une séance de son `WeeklySchedule` généré par l'IA comme "terminée".
    *   Enregistrement du temps passé, calories brûlées (estimation) et ressenti (RPE).
2.  **Mise à jour de `/progress/today`** : Lier la variable `workout_completed` aux logs de la base de données.

### Phase 2 : Historique et Data Visualisation (Charts)
Indispensable pour l'intégration de `victory-native` sur le frontend.
1.  **Endpoint Historique Macros** : `GET /progress/history/nutrition?days=7`
    *   Renvoie les calories et macros consommées par jour sur une période donnée pour afficher des graphiques en barres.
2.  **Endpoint Historique Poids** : `GET /progress/history/weight?months=3`
    *   Renvoie l'évolution du poids pour un graphique linéaire.
3.  **Endpoint Calcul du "Streak"** : `GET /progress/streak`
    *   Calcule le nombre de jours consécutifs où l'utilisateur a atteint ses objectifs caloriques ou loggé un repas.

### Phase 3 : Nutrition Premium & Base de données
1.  **Intégration OpenFoodFacts (Code-barres)** : `GET /nutrition/barcode/{code}`
    *   Permet de récupérer les macros exactes d'un produit industriel via son code-barres.
2.  **Recherche d'aliments texte** : `GET /nutrition/search?q={query}`
    *   Recherche dans une API nutritionnelle externe (ex: FatSecret ou Edamam) ou base locale.
3.  **Gestion des "Favoris"** : Sauvegarder des repas fréquents pour les ajouter en un clic.

### Phase 4 : Gestion Avancée du Profil & Santé
1.  **Endpoints Profil** : `GET /profile` et `PUT /profile`
    *   Mise à jour du poids, des objectifs, du niveau d'activité, synchronisés avec MySQL.
2.  **Régénération partielle de plan** : 
    *   Si l'utilisateur perd du poids, l'IA doit ajuster automatiquement les calories sans écraser tout le plan sportif.

---

## 4. Architecture BDD (MongoDB & MySQL)
*   **MongoDB (à créer/modifier)** :
    *   Collection `workout_logs` : `{ user_id, date, duration_min, calories_burned, workout_type }`
    *   Collection `saved_meals` (Repas favoris).
*   **MySQL (à modifier)** :
    *   Table `users` : Ajouter des champs pour le profil détaillé (taille, âge, objectif) actuellement passés à la volée à l'IA.

## Prochaines Étapes
1.  **Valider ce plan** avec l'utilisateur.
2.  Commencer par la **Phase 1 (Sport)** et la **Phase 2 (Historique)** pour pouvoir rapidement animer le frontend et le rendre visuellement impressionnant.
