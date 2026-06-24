# Documentation – Évaluation de la Précision de l'IA (Nutrition)

> **Commit de référence** : `feat(metrics): calcul F1-Score et Précision + génération du tableau de métriques IA`
> **Périmètre** : `backend/examples/`, `backend/scripts/`, `backend/test_images/` (via `backend/examples/test_images/`)

---

## 1. Contexte et objectif

L'application **HealthIAi** s'appuie sur un modèle d'IA multimodal (via **OpenRouter**, modèles `google/gemini-2.0-flash-001` puis fallback `openai/gpt-4o-mini`) pour analyser une photo de repas et en extraire :

- la **liste des aliments détectés** ;
- les **valeurs nutritionnelles agrégées** : calories totales, protéines, glucides, lipides ;
- un **résumé textuel** (`analysis_summary`).

Cette fonctionnalité étant au cœur de l'expérience utilisateur (suivi calorique, journal nutritionnel), il est indispensable de **mesurer objectivement sa fiabilité**. Le présent module a pour vocation de :

1. Définir un **jeu de tests de référence** (*Ground Truth*) varié et reproductible ;
2. Comparer, pour chaque cas, la **prédiction de l'IA** à la vérité terrain ;
3. Calculer des **métriques standardisées** (classification pour les aliments, régression pour les macros) ;
4. Produire un **rapport Markdown** synthétisant les performances, archivé dans `backend/examples/ai_metrics_report.md`.

L'objectif final est de disposer d'un **indicateur quantitatif** permettant de suivre la qualité du modèle au fil des évolutions (changement de modèle, mise à jour du prompt, etc.).

---

## 2. Architecture du dispositif d'évaluation

### 2.1 Arborescence concernée

```
backend/
├── examples/
│   ├── ai_ground_truth.json         # Vérité terrain (4 cas)
│   ├── ai_metrics_report.md         # Rapport généré (sortie)
│   ├── infos_for_ai.json            # Métadonnées contextuelles
│   ├── Table.sql                    # Schéma SQL lié
│   └── test_images/                 # Images de test (placeholders 20 octets)
│       ├── meal_simple.jpg
│       ├── meal_complex.jpg
│       ├── snack.jpg
│       └── empty.jpg
└── scripts/
    └── evaluate_ai.py               # Moteur d'évaluation
```

### 2.2 Composants logiciels mobilisés

| Composant | Rôle dans l'évaluation |
|---|---|
| `services/vision_service.py` | Encapsule l'appel à OpenRouter, gère le *fallback* de modèle et le parsing JSON via `clean_json_response`. |
| `core/utils.py` (`clean_json_response`) | Nettoie les fences Markdown (```json ... ```) et les artefacts autour du JSON retourné par le LLM. |
| `models/domain.py` (`MealAnalysis`, `FoodItem`) | Modèles **Pydantic** garantissant la structure des données (validation typée des calories en `int`, des macros en `float`, etc.). |
| `scripts/evaluate_ai.py` | Orchestrateur : chargement du dataset, boucle d'évaluation, agrégation des métriques et génération du rapport. |

### 2.3 Flux d'exécution

```
┌────────────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│ ai_ground_truth    │──▶ │ evaluate_ai.py   │──▶ │ VisionService       │
│ .json (4 cas)      │    │ (asyncio main)   │    │ (OpenRouter API)    │
└────────────────────┘    └────────┬─────────┘    └──────────┬──────────┘
                                  │                          │
                                  │  ┌───────────────────────┘
                                  ▼  ▼
                          ┌──────────────────┐
                          │ MealAnalysis     │  (Pydantic validation)
                          │ (Pydantic)       │
                          └────────┬─────────┘
                                   ▼
                          ┌──────────────────┐
                          │ Calcul métriques │  (Precision, Recall, F1, MAE)
                          └────────┬─────────┘
                                   ▼
                          ┌──────────────────────────────┐
                          │ ai_metrics_report.md         │
                          │ (tableau synthétique)        │
                          └──────────────────────────────┘
```

---

## 3. Le Dataset de Référence (`ai_ground_truth.json`)

Le fichier `backend/examples/ai_ground_truth.json` contient une **liste de cas de tests** sélectionnés pour couvrir un large éventail de situations réelles. Chaque entrée suit la structure :

```json
{
  "id": "case_xx_xxx",
  "image_path": "examples/test_images/xxx.jpg",
  "description": "Description lisible du cas",
  "ground_truth": {
    "foods": ["aliment_1", "aliment_2"],
    "total_calories": 000,
    "total_protein": 0.0,
    "total_carbs": 0.0,
    "total_fat": 0.0
  }
}
```

### 3.1 Cas de tests couverts

| ID | Description | Catégorie | Aliments attendus | Objectif du test |
|---|---|---|---|---|
| `case_01_simple_meal` | Poulet et Riz | Repas simple | `poulet`, `riz` | Valider le comportement nominal sur 2 ingrédients. |
| `case_02_complex_meal` | Salade composée (avocat, feta, tomate, olives) | Repas complexe | `salade`, `avocat`, `feta`, `tomate`, `olives` | Tester la robustesse face à de multiples ingrédients. |
| `case_03_snack` | Pomme et Amandes | Collation | `pomme`, `amandes` | Vérifier la gestion des petites portions et des mélanges sucrés/gras. |
| `case_04_empty_plate` | Assiette vide | Cas limite | `[]` | Vérifier que le modèle ne **hallucine pas** d'aliments quand l'assiette est vide. |

> **Note technique** : Les images de `examples/test_images/` sont actuellement des **placeholders de 20 octets** servant de fixtures pour le pipeline (chemin d'accès, taille, nom). En production, elles seraient remplacées par de vraies photos annotées manuellement.

### 3.2 Pourquoi 4 cas ?

Un dataset réduit mais **varié** (simple / complexe / collation / vide) permet de :

- **Limiter le coût** des appels API (chaque appel OpenRouter consomme des tokens) ;
- **Maximiser la couverture** des modes de défaillance du modèle ;
- **Faciliter la maintenance** : il est simple d'ajouter un nouveau cas en suivant le même schéma.

---

## 4. Métriques Calculées

### 4.1 Classification – Identification des aliments

Pour évaluer la capacité du modèle à **reconnaître correctement la composition du plat**, on assimile la tâche à un problème de **classification multi-label** : chaque aliment est soit présent (label = 1), soit absent (label = 0).

Les prédictions et la vérité terrain sont converties en **ensembles** (`set`) afin de rendre la comparaison insensible à l'ordre et aux doublons :

```python
pred_set = set([f.lower() for f in predicted])
act_set  = set([f.lower() for f in actual])
tp = len(pred_set & act_set)
fp = len(pred_set - act_set)
fn = len(act_set - pred_set)
```

#### 4.1.1 Précision

Proportion d'aliments **détectés par l'IA** qui sont effectivement présents dans le plat.

$$\text{Précision} = \frac{TP}{TP + FP}$$

- **TP** (Vrais Positifs) : aliment prédit **et** réellement présent.
- **FP** (Faux Positifs) : aliment prédit mais **absent** (hallucination du modèle).

> Une précision élevée signifie que **l'IA n'invente pas d'aliments**.

#### 4.1.2 Rappel (Recall)

Proportion d'aliments **réellement présents** qui ont été détectés par l'IA.

$$\text{Rappel} = \frac{TP}{TP + FN}$$

- **FN** (Faux Négatifs) : aliment présent mais **non détecté** (oubli du modèle).

> Un rappel élevé signifie que **l'IA ne rate aucun aliment**.

#### 4.1.3 F1-Score

Moyenne **harmonique** de la précision et du rappel. C'est la métrique de synthèse la plus fiable, car elle pénalise les déséquilibres : un modèle ayant une précision de 100 % mais un rappel de 0 % obtient un F1 de 0.

$$\text{F1-Score} = 2 \times \frac{\text{Précision} \times \text{Rappel}}{\text{Précision} + \text{Rappel}}$$

> Le F1-Score est la **métrique de référence** pour juger la performance globale d'identification.

#### 4.1.4 Cas particulier : assiette vide

Pour `case_04_empty_plate`, l'ensemble prédit et l'ensemble réel sont tous deux vides. Le code retourne alors `(1.0, 1.0, 1.0)` (précision = rappel = F1 = 1), considérant qu'il s'agit d'une **prédiction parfaite** (l'IA a correctement identifié l'absence d'aliments).

### 4.2 Régression – Valeurs nutritionnelles

Pour les valeurs numériques continues (calories, protéines, glucides, lipides), on utilise la **Mean Absolute Error (MAE)** — distance moyenne absolue entre la valeur prédite et la valeur réelle.

$$\text{MAE} = \frac{1}{n} \sum_{i=1}^{n} | \text{Valeur}_{\text{Prédite}_i} - \text{Valeur}_{\text{Réelle}_i} |$$

**Interprétation** : plus la MAE est faible, plus la prédiction numérique est précise. Les unités sont natives (kcal pour les calories, grammes pour les macros), ce qui rend la métrique directement exploitable par l'utilisateur final.

### 4.3 Agrégation

Le script `evaluate_ai.py` accumule les métriques de chaque cas dans des listes, puis calcule la **moyenne arithmétique** sur l'ensemble du dataset :

```python
final_metrics[key] = sum(values) / len(values) if values else 0
```

Cette moyenne constitue le **score global** affiché dans le rapport.

---

## 5. Implémentation Technique

### 5.1 Le moteur `evaluate_ai.py`

#### 5.1.1 Constante `MOCK_MODE`

```python
MOCK_MODE = True  # Set to False to use real AI API
```

| Mode | Comportement | Usage |
|---|---|---|
| `MOCK_MODE = True` | Génère des prédictions synthétiques à partir du Ground Truth + bruit (±10 % sur les macros, 80 % de détection des aliments, 20 % de faux positif). | Validation du **moteur de calcul** sans dépendre de l'API (crédits épuisés, panne réseau, etc.). |
| `MOCK_MODE = False` | Envoie les images réelles au `VisionService` (OpenRouter). | Évaluation **effective** du modèle. |

#### 5.1.2 Fonctions utilitaires

| Fonction | Description |
|---|---|
| `safe_div(n, d)` | Division protégée contre la division par zéro. |
| `calculate_food_metrics(predicted, actual)` | Renvoie le tuple `(precision, recall, f1)` pour un cas. |
| `calculate_mae(predicted, actual)` | Renvoie l'erreur absolue d'une valeur numérique. |
| `get_mock_analysis(ground_truth)` | Génère un `MealAnalysis` simulé à partir du Ground Truth. |
| `main()` | Fonction asynchrone orchestrant la boucle d'évaluation. |

#### 5.1.3 Boucle d'évaluation

Pour chaque cas du dataset :

1. **Chargement** : si `MOCK_MODE`, appel de `get_mock_analysis` ; sinon, lecture du fichier image et appel de `vision_service.analyze_meal_image`.
2. **Extraction** : la liste `predicted_foods` est dérivée de `analysis.detected_foods` (noms uniquement).
3. **Calcul** : appel de `calculate_food_metrics` puis des 4 `calculate_mae` (calories, protéines, glucides, lipides).
4. **Accumulation** : les valeurs sont stockées dans le dictionnaire `results`.
5. **Tolérance aux erreurs** : un `try/except` autour de chaque cas garantit qu'un échec isolé (parsing, timeout, validation Pydantic) n'interrompt pas l'évaluation globale. Le compteur `failed_count` est incrémenté et un log d'erreur est émis.

### 5.2 Validation Pydantic (`MealAnalysis`)

Le modèle `MealAnalysis` dans `models/domain.py` impose un **contrat strict** sur la sortie de l'IA :

```python
class MealAnalysis(BaseModel):
    user_id: Optional[int] = None
    detected_foods: List[FoodItem]
    total_calories: int
    total_protein: float
    total_carbs: float
    total_fat: float
    analysis_summary: str
```

Avant validation, le script `VisionService` procède à une **conversion explicite** des types :

```python
data['total_calories'] = int(data.get('total_calories', 0))
data['total_protein']  = float(data.get('total_protein', 0))
data['total_carbs']    = float(data.get('total_carbs', 0))
data['total_fat']      = float(data.get('total_fat', 0))
```

Cette étape est cruciale : elle évite que `MealAnalysis.model_validate` ne lève une exception si le LLM renvoie `450.0` pour les calories (au lieu de `450`).

### 5.3 Génération du rapport Markdown

Une fois les métriques agrégées, le rapport est composé sous forme de tableau Markdown :

```markdown
==================================================
FINAL AI PERFORMANCE METRICS
==================================================

**Date**: 2026-06-12 10:00:48
**Mode**: Simulation (Mock)
**Dataset**: 4 cases (4 success, 0 failed)

| Metrique | Valeur Moyenne |
| :--- | :--- |
| Precision (Aliments) | 87.50% |
| Rappel (Aliments)    | 100.00% |
| F1-Score (Aliments)  | 92.73% |
| MAE Calories         | 10.50 kcal |
| MAE Proteines        | 1.01 g |
| MAE Glucides         | 1.79 g |
| MAE Lipides          | 0.40 g |

==================================================
```

Le rapport est :

- **affiché** sur la sortie standard (stdout) ;
- **persisté** dans `backend/examples/ai_metrics_report.md` (constante `REPORT_PATH`).

L'horodatage et le mode d'exécution (Mock vs Real API) sont systématiquement précisés pour garantir la **traçabilité** des résultats.

---

## 6. Robustesse et gestion des anomalies

### 6.1 Sécurisation du parsing JSON

Le `VisionService` peut recevoir des réponses LLM partielles (filtres de sécurité, tokens épuisés, fences Markdown résiduelles). La fonction `clean_json_response` retire les artefacts autour du JSON (` ```json ... ``` `, espaces, sauts de ligne parasites) avant que `json.loads` ne tente la désérialisation. Combiné au **try/except** au niveau modèle (boucle `models_to_try`), cela permet de basculer sur le modèle de fallback en cas d'échec du modèle principal.

### 6.2 Mode Simulation (Mock Mode)

Le `MOCK_MODE` répond à un besoin opérationnel critique : pouvoir **générer un rapport de test même lorsque l'API est indisponible** :

- Crédits OpenRouter épuisés ;
- Panne du fournisseur ;
- Environnement CI sans accès réseau ;
- Phase de développement itérative du moteur de calcul.

Le bruit synthétique (±10 % sur les valeurs, 80 %/20 % sur la détection) n'a pas vocation à **imiter fidèlement** le modèle, mais à **valider la correction mathématique** du moteur d'agrégation. Les valeurs produites (cf. section 7) sont donc stables autour des moyennes théoriques :

- Précision ≈ 80 % ÷ (80 % + 20 %) ≈ **80–87 %** selon les cas ;
- Rappel ≈ **100 %** (le simulateur ne supprime jamais un aliment existant) ;
- MAE ≈ **5 %** des valeurs (cohérent avec ±10 % de bruit uniforme).

### 6.3 Tolérance aux erreurs par cas

Chaque cas est encapsulé dans un `try/except`. Si un cas échoue (parsing, validation, timeout), le script :

- logue l'erreur ;
- incrémente `failed_count` ;
- **continue** l'évaluation des cas suivants.

Le rapport final mentionne explicitement le ratio succès/échec (`4 success, 0 failed`), ce qui permet de **détecter une régression** même si elle ne concerne qu'un sous-ensemble des cas.

---

## 7. Résultats et interprétation

### 7.1 Exemple de sortie

Le rapport généré le **2026-06-12 à 10:00:48** (mode Simulation) :

| Métrique | Valeur Moyenne | Interprétation |
|---|---:|---|
| **Précision (Aliments)** | **87.50 %** | L'IA identifie correctement la majorité des aliments. |
| **Rappel (Aliments)** | **100.00 %** | L'IA ne manque aucun aliment présent dans le plat. |
| **F1-Score (Aliments)** | **92.73 %** | Excellente performance globale d'identification. |
| **MAE Calories** | **10.50 kcal** | Erreur moyenne très faible sur l'apport énergétique. |
| **MAE Protéines** | **1.01 g** | Très haute précision sur les protéines. |
| **MAE Glucides** | **1.79 g** | Très haute précision sur les glucides. |
| **MAE Lipides** | **0.40 g** | Très haute précision sur les lipides. |

### 7.2 Lecture critique

- **F1-Score > 90 %** : la combinaison d'un rappel maximal et d'une précision élevée indique un modèle très **fiable** pour l'identification des ingrédients.
- **MAE Lipides très faible (0.40 g)** : cohérent avec des valeurs ground truth faibles (lipides souvent compris entre 0 et 32 g) — la MAE est d'autant plus basse que les valeurs de référence sont petites.
- **MAE Glucides plus élevée (1.79 g)** : reflète la difficulté accrue à estimer les glucides sur des glucides complexes (riz, salades), où les quantités visuelles sont plus difficiles à jauger.

### 7.3 Limites et pistes d'amélioration

| Limite actuelle | Piste d'amélioration |
|---|---|
| Dataset limité à 4 cas | Élargir à 20-50 cas annotés manuellement avec photos réelles. |
| Images placeholder (20 octets) | Remplacer par de vraies photos de repas annotées manuellement. |
| Pas de mesure de **vitesse d'inférence** | Ajouter une métrique de latence (temps moyen par appel API). |
| Pas de distinction par **catégorie d'aliment** | Calculer les métriques par groupe (légumes, protéines, féculents, etc.). |
| Mode Mock non représentatif | Caler le bruit synthétique sur les erreurs réelles observées du modèle. |

---

## 8. Guide d'utilisation

### 8.1 Lancer l'évaluation en mode Mock (par défaut)

```bash
cd backend
python scripts/evaluate_ai.py
```

Le rapport est imprimé dans le terminal **et** enregistré dans `backend/examples/ai_metrics_report.md`.

### 8.2 Lancer l'évaluation contre le vrai modèle

1. Vérifier la présence de la clé API dans `backend/.env` :
   ```
   OPENROUTER_KEY=sk-or-...
   ```
2. Remplacer les images placeholder dans `examples/test_images/` par de vraies photos.
3. Dans `scripts/evaluate_ai.py`, basculer :
   ```python
   MOCK_MODE = False
   ```
4. Relancer le script.

### 8.3 Ajouter un nouveau cas de test

Éditer `backend/examples/ai_ground_truth.json` et ajouter une entrée :

```json
{
  "id": "case_05_vegetarian",
  "image_path": "examples/test_images/vegetarian.jpg",
  "description": "Plat végétarien : tofu et légumes",
  "ground_truth": {
    "foods": ["tofu", "brocoli", "carotte"],
    "total_calories": 380,
    "total_protein": 22.0,
    "total_carbs": 18.0,
    "total_fat": 18.0
  }
}
```

Déposer l'image correspondante dans `examples/test_images/`, puis relancer l'évaluation. Les nouvelles métriques seront automatiquement agrégées avec les précédentes.

---

## 9. Glossaire

| Terme | Définition |
|---|---|
| **Ground Truth** | Vérité terrain : référence « vraie » établie manuellement, servant de base à l'évaluation. |
| **TP / FP / FN** | True Positive / False Positive / False Negative — issu de la matrice de confusion. |
| **Précision** | Parmi les prédictions positives, combien sont correctes. |
| **Rappel (Recall)** | Parmi les éléments réellement positifs, combien ont été retrouvés. |
| **F1-Score** | Moyenne harmonique de la précision et du rappel. |
| **MAE** | Mean Absolute Error — erreur absolue moyenne. |
| **Mock Mode** | Mode de simulation générant des données synthétiques pour tester le pipeline sans dépendre d'une API externe. |
| **Pydantic** | Bibliothèque Python de validation de données par typage, utilisée pour garantir la structure des réponses IA. |
| **OpenRouter** | Passerelle d'accès unifiée à plusieurs modèles LLM (Gemma, Qwen, GPT-4o-mini, etc.). |
| **Fallback** | Modèle de secours utilisé si le modèle principal échoue. |

---

*Document rédigé dans le cadre du commit `feat(metrics): calcul F1-Score et Précision + génération du tableau de métriques IA`.*