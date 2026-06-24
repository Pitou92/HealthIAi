# 🧠 Documentation Complète du Backend — HealthIAi

Ce document propose une vue d'ensemble technique complète du backend de l'application **HealthIAi** (coach de fitness et nutrition propulsé par l'intelligence artificielle). Il détaille l'architecture, la stack technique et ses justifications, le fonctionnement interne, la stratégie de monitoring/supervision, les méthodes de déploiement et la suite de tests.

---

## 🚀 1. Stack Technique & Justifications

Le backend de HealthIAi repose sur une architecture moderne de microservices et APIs asynchrones, construite pour être performante, résiliente et facilement supervisable.

| Composant | Technologie | Rôle principal |
| :--- | :--- | :--- |
| **Framework Web** | **FastAPI** | Serveur HTTP RESTful, routage, validation de types, auto-documentation (Swagger/OpenAPI). |
| **Serveur ASGI** | **Uvicorn** | Serveur Web asynchrone ultra-rapide exécutant l'application FastAPI. |
| **Base de Données Relationnelle** | **MySQL 8.0** | Stockage des profils utilisateurs, identifiants d'authentification et états de compte. |
| **Base de Données Document** | **MongoDB** | Stockage flexible des plans sportifs/nutritionnels complexes générés par l'IA et logs de suivi. |
| **Intégration de l'IA** | **OpenAI SDK / OpenRouter** | Génération de plans personnalisés (via `openai/gpt-4o-mini`) et Vision (Gemini 2.0 Flash). |
| **Validation & Modèles** | **Pydantic v2** | Sérialisation, désérialisation, validation stricte des schémas d'entrée/sortie et configurations. |
| **ORM / Accès Base SQL** | **SQLAlchemy + aiomysql** | Accès asynchrone à MySQL avec cartographie objet-relationnel (ORM). |
| **Accès Base NoSQL** | **Motor** | Driver asynchrone non-bloquant officiel pour MongoDB en Python. |
| **Observabilité** | **Prometheus, Loki, Tempo, Grafana** | Triptyque standard de supervision (Métriques, Logs centralisés, Traces distribuées). |

### 💡 Pourquoi cette stack ?

#### 1. Persistance Polyglotte (MySQL + MongoDB)
*   **MySQL (SQL)** : L'authentification et les caractéristiques de base du profil de l'utilisateur (taille, âge, sexe, poids, objectifs) requièrent de la cohérence, des transactions ACID et une structure claire. Une base relationnelle traditionnelle garantit qu'aucune donnée utilisateur critique n'est corrompue.
*   **MongoDB (NoSQL)** : Les recommandations générées par l'IA sont des structures de données profondément imbriquées (ex. listes de jours d'entraînement, exercices, repas journaliers avec macronutriments). Les stocker dans une base relationnelle exigerait des dizaines de tables jointes et des migrations coûteuses à chaque mise à jour du modèle d'IA. MongoDB permet de stocker et requêter ces plans complexes directement sous forme de documents JSON flexibles.

#### 2. Performance Asynchrone Complète (FastAPI + AsyncIO)
Grâce à `aiomysql` et `motor`, aucune requête de base de données ne bloque la boucle d'événements (event loop) de FastAPI. Cela permet de maximiser le nombre de requêtes simultanées traitées par le serveur, ce qui est critique lors d'appels à forte latence vers des APIs d'IA externes.

---

## 🏗️ 2. Architecture & Fonctionnement Interne

### Structure des Fichiers du Backend

```text
backend/
├── api/
│   └── routes/
│       ├── ai.py           # Génération de plan IA et vision (scan repas)
│       ├── auth.py         # Authentification, inscription, et onboarding
│       ├── tracking.py     # Historiques d'activité physique et alimentation
│       ├── nutrition.py    # Logs de repas et de consommation d'eau
│       ├── profile.py      # Profil utilisateur (modification d'objectifs/poids)
│       └── logs.py         # Tunnel d'ingestion de logs pour le client frontend
├── core/
│   ├── prompts/            # Fichiers Markdown de directives IA
│   ├── config.py           # Configuration de l'environnement (Settings Pydantic)
│   ├── logging_config.py   # Configuration des logs applicatifs (fichiers rotatifs)
│   ├── middleware.py       # Interception des requêtes pour les statistiques et exceptions
│   ├── nosql_db.py         # Client et session MongoDB (Motor)
│   ├── sql_db.py           # Client et session MySQL (SQLAlchemy Async Engine)
│   └── telemetry.py        # Instrumentation Prometheus & OpenTelemetry (Tempo)
├── models/
│   ├── domain.py           # 16 Schémas Pydantic de transfert et de domaine (DTO)
│   └── sql_models.py       # Définition des tables ORM SQLAlchemy
├── services/
│   ├── ai_service.py       # Interaction textuelle avec l'IA
│   ├── auth_service.py     # Gestion de la cryptographie et JWT
│   └── vision_service.py   # Logique d'analyse d'images de repas
├── tests/
│   └── unit/               # Tests unitaires isolés (API et Services)
├── main.py                 # Point d'entrée de l'application FastAPI
├── Dockerfile              # Containerisation du serveur
└── test_db_integration.py  # Script de test d'intégration de bout en bout
```

### Pipelines de Données Principaux

#### 1. Inscription, Onboarding et Génération de Plan Initial
```mermaid
sequenceDiagram
    autonumber
    Client (React Native)->>+API (auth.py): POST /auth/register
    API (auth.py)->>+MySQL (SQLAlchemy): Insère les identifiants hashés (bcrypt)
    MySQL-->>-API (auth.py): Confirmation & ID
    API (auth.py)-->>-Client (React Native): JWT Token
    Client (React Native)->>+API (auth.py): POST /auth/onboarding (avec JWT)
    API (auth.py)->>+MySQL (SQLAlchemy): Sauvegarde le profil utilisateur complet
    MySQL-->>-API (auth.py): Profil enregistré
    API (auth.py)->>+API (ai.py): Déclenche generation de plan
    API (ai.py)->>+AI Service: Requête LLM (gpt-4o-mini)
    AI Service-->>-API (ai.py): Recommandations sport & nutrition (JSON)
    API (ai.py)->>+MongoDB (Motor): Enregistre le plan dans la collection "plans"
    MongoDB-->>-API (ai.py): ID Document
    API (ai.py)-->>-Client (React Native): Plan structuré complet
```

#### 2. Analyse de Repas (Computer Vision)
1. Le client transmet l'image capturée par l'appareil photo sous forme de formulaire `FormData` (contenant le fichier image natif) à l'endpoint `POST /ai/analyze-meal`.
2. Le `VisionService` traite l'image à l'aide de la librairie **Pillow**, puis transmet le payload binaire à l'API de vision (Gemini 2.0 Flash par défaut, avec repli automatique vers GPT-4o-Mini).
3. Le modèle retourne un objet JSON décrivant précisément les aliments identifiés, leur poids estimé, les calories et les macronutriments (`protein_g`, `carbs_g`, `fat_g`).
4. Ce résultat est validé par le modèle Pydantic `MealAnalysis`, historisé dans MongoDB sous la collection `meal_analyses`, puis retourné à l'utilisateur pour validation.

---

## 📊 3. Supervision & Observabilité (Monitoring)

HealthIAi intègre une suite de supervision complète prête pour la production à travers **Prometheus**, **Grafana Loki**, **Grafana Tempo**, et **Grafana**.

```text
                               +-----------------------------+
                               |     FastAPI Backend         |
                               +-----------------------------+
                               /              |              \
                       (HTTP Metrics)   (Log Files)    (OTLP Traces)
                             /                |                \
                            v                 v                 v
                     +------------+     +-----------+     +-----------+
                     | Prometheus |     |  Promtail |     |   Tempo   |
                     +------------+     +-----------+     +-----------+
                            \                 |                 /
                             \                v                /
                              \         +-----------+         /
                               \------->|   Loki    |<-------/
                                        +-----------+
                                              |
                                              v
                                        +-----------+
                                        |  Grafana  |
                                        +-----------+
```

### 1. Prometheus (Métriques)
*   **Fonctionnement** : Scrape périodiquement l'endpoint `/metrics` du backend (exposé par `prometheus-fastapi-instrumentator`).
*   **Métriques collectées** : Latence des requêtes HTTP, volume de requêtes par endpoint, taux de réponses d'erreurs (codes 4xx/5xx).
*   **Port local** : `http://localhost:9090`

### 2. Loki & Promtail (Centralisation des logs)
*   **Fichiers suivis** :
    *   `backend/logs/healthiai.log` : Contient toutes les requêtes interceptées par le middleware de logging du backend, les messages système, ainsi que les traces d'exception complètes en cas de plantage.
    *   `backend/logs/frontend.log` : Les logs émis par l'application React Native sont capturés et persistés localement par `AppLogger`, puis envoyés par lots via l'endpoint `/logs/client` de l'API. Ils sont centralisés ici pour permettre la corrélation.
*   **Loki** indexe ces logs pour qu'ils soient instantanément filtrables par niveau (`INFO`, `WARNING`, `ERROR`), par conteneur ou par ID d'utilisateur dans Grafana.
*   **Port local Loki** : `http://localhost:3100`

### 3. Grafana Tempo (Traces Distribuées)
*   **Fonctionnement** : Utilise l'API OpenTelemetry. Si `ENABLE_TRACING=true`, le backend exporte les traces d'exécution en gRPC vers Tempo sur le port `4317`.
*   **Port local Tempo HTTP** : `http://localhost:3200`

> [!IMPORTANT]
> **Compatibilité FastAPI 0.137.0+**
> Le nouveau système de routage de FastAPI utilise des objets internes `_IncludedRouter` sans attribut `.path`, ce qui cassait les instrumentations par défaut d'OpenTelemetry et de Prometheus (générant des exceptions bloquantes).
> Le backend résout ce problème en appliquant des monkey-patches robustes dans [telemetry.py](file:///Users/hugogalley/DEV/HealthIAi/backend/core/telemetry.py) pour surcharger `_get_route_details` (OpenTelemetry) et `_get_route_name` (Prometheus) afin de garantir la continuité du traçage sans impacter le cycle de vie de l'API.

### 4. Grafana (Visualisation unifiée)
*   **Interface Web** : Accessible sur `http://localhost:3000` (Identifiants par défaut : `admin` / `admin`).
*   **Volume persistant** : La configuration de Grafana utilise le volume `grafana_data` pour éviter de perdre les données et les sources configurées lors des redémarrages.
*   **Tableau de bord pré-configuré** : Un dashboard complet est provisionné automatiquement via [healthiai-dashboard.json](file:///Users/hugogalley/DEV/HealthIAi/monitoring/grafana/dashboards/healthiai-dashboard.json) (UID stable : `d9f3a136-8548-4a76-8b09-24cf1e84c153`). Il regroupe :
    *   Les métriques de requêtes (taux, latence).
    *   Les panels d'état système du backend (Consommation CPU instantanée, occupation mémoire résidente, nombre de descripteurs de fichiers ouverts).
    *   Une console de logs croisés (Frontend & Backend mélangés et synchronisés temporellement).
    *   L'explorateur de traces pour remonter le fil d'une requête spécifique du mobile jusqu'à l'accès base de données ou l'IA.

---

## ⚙️ 5. Stratégie de Déploiement

### Déploiement Local (Développement)

La pile complète peut être démarrée via Docker Compose :
```bash
# Copier et éditer la configuration d'environnement
cp backend/.env.example backend/.env
# Renseigner au minimum : OPENROUTER_KEY et SECRET_KEY

# Lancer tous les services (Backend, Frontend Web, MySQL, MongoDB, Monitoring)
docker compose up --build
```

### Déploiement en Production (Recommandations)

Pour basculer le backend en production, il convient de suivre les étapes suivantes :

```text
                            +----------------------------------------+
                            |          Client Mobile/Web             |
                            +----------------------------------------+
                                                 |
                                       HTTPS (Port 443/SSL)
                                                 v
                            +----------------------------------------+
                            |           Reverse Proxy Nginx          |
                            |       - Gère les certificats SSL       |
                            |       - Sert les fichiers Web statiques|
                            +----------------------------------------+
                                                 |
                                     Proxy local (Port 8000)
                                                 v
                            +----------------------------------------+
                            |           Gunicorn / Uvicorn           |
                            |     - Executé via un user non-root     |
                            |     - UvicornWorkers multiples          |
                            +----------------------------------------+
                                       /                    \
                                      /                      \
                                     v                        v
                        +-----------------------+  +-----------------------+
                        |  Base MySQL Managée   |  | Base MongoDB Managée  |
                        | (ex: AWS RDS / Cloud) |  | (ex: MongoDB Atlas)   |
                        +-----------------------+  +-----------------------+
```

1.  **Désactivation du rechargement à chaud (Hot-Reload) :**
    Dans le script de démarrage du conteneur de production, lancer uvicorn sans l'option `--reload` et privilégier **Gunicorn** comme gestionnaire de processus pour orchestrer plusieurs workers Uvicorn :
    ```bash
    gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
    ```
2.  **Sécurisation de l'utilisateur Docker :**
    Modifier le `Dockerfile` de production pour ne pas exécuter le code en tant que `root`. Utiliser la directive `USER nobody` après l'installation des dépendances.
3.  **Gestion des bases de données :**
    Ne pas utiliser de conteneurs MySQL et MongoDB gérés localement sur le même serveur en production. Utiliser des bases de données managées (ex: **AWS RDS** pour MySQL et **MongoDB Atlas** pour NoSQL) qui incluent la réplication, les sauvegardes automatisées et le chiffrement au repos.
4.  **Reverse Proxy Nginx :**
    Placer un serveur Nginx devant l'API FastAPI. Nginx se chargera :
    *   De la terminaison SSL/TLS (utilisation de Let's Encrypt).
    *   De la redirection automatique du HTTP vers le HTTPS.
    *   Du routage du trafic `/api/*` vers le socket local du backend et du trafic statique vers les fichiers web compilés du frontend.
5.  **Variables d'environnement de Production :**
    S'assurer d'avoir un fichier `.env` configuré avec :
    *   `ENABLE_TRACING=true` (ou `false` si l'on souhaite limiter le trafic de traces).
    *   Des URLs de bases de données sécurisées avec mots de passe forts.
    *   Un `SECRET_KEY` cryptographique robuste pour la signature des JWT.
    *   Le niveau de log défini à `WARNING` ou `INFO` pour éviter la saturation des disques.

---

## 🧪 6. Tests & Validation

La validation de la qualité logicielle est divisée en deux volets : les tests unitaires et les tests d'intégration de bout en bout.

### 1. Tests Unitaires (`backend/tests/unit`)
Les tests unitaires vérifient la logique métier de manière totalement isolée en mockant (simulant) les bases de données et les appels réseau à l'IA.

*   **API Tests** (`tests/unit/api/`) : Testent la conformité des routes FastAPI (codes retour, structures JSON).
    *   `test_ai.py` : Valide la génération de plan, la structure du plan de recommandation et la récupération du plan courant.
    *   `test_auth.py` : Valide l'inscription, la connexion et le processus d'onboarding.
    *   `test_tracking.py` : Valide la sauvegarde et la récupération des métriques quotidiennes (eau, poids, aliments).
*   **Services Tests** (`tests/unit/services/`) : Testent la logique algorithmique pure.
    *   `test_ai_service.py` : Valide le prompt system et le nettoyage/parsing de la réponse de l'LLM.
    *   `test_vision_service.py` : Valide le parsing d'images et la conversion en structure nutritionnelle.
    *   `test_auth_service.py` : Valide le hashage de mot de passe et l'extraction des données du token JWT.

#### Exécuter les tests unitaires :
Depuis le dossier `backend` (avec l'environnement virtuel activé) :
```bash
pytest tests/unit/
```
Pour obtenir un rapport détaillé ou avec couverture de code :
```bash
pytest -v --cov=api --cov=services tests/unit/
```

### 2. Tests d'Intégration (`backend/test_db_integration.py`)
Ce script exécute un scénario complet et réel sur un serveur backend actif, permettant de s'assurer de la bonne interaction entre FastAPI, MySQL et MongoDB.

*   **Scénario testé** :
    1.  **Inscription** : Crée un utilisateur éphémère (généré dynamiquement avec un timestamp pour éviter les collisions) via `POST /auth/register`, et vérifie l'obtention du token d'accès.
    2.  **Onboarding** : Soumet un profil utilisateur complet en MySQL via `POST /auth/onboarding`.
    3.  **Planification NoSQL** : Demande la génération d'un plan d'entraînement et nutrition via `POST /ai/generate-plan`, et vérifie qu'il a bien été sauvegardé dans MongoDB.
    4.  **Vérification de Cohérence** : Récupère les données de l'utilisateur depuis MySQL via `GET /auth/user/{user_id}` pour vérifier que tout est intègre.

#### Exécuter les tests d'intégration :
1.  Démarrer le serveur localement :
    ```bash
    python main.py
    ```
2.  Dans un autre terminal, lancer le script :
    ```bash
    python test_db_integration.py
    ```
