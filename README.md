<![CDATA[<div align="center">

# 🏋️‍♂️ HealthIAi 🥗

**Votre coach fitness & nutrition propulsé par l'Intelligence Artificielle**

[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Expo](https://img.shields.io/badge/Expo_SDK_56-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React_Native_0.85-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev/)
[![MySQL](https://img.shields.io/badge/MySQL_8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/Licence-MIT-yellow.svg?style=for-the-badge)](LICENSE)

---

*Application mobile et web de coaching personnalisé combinant plans d'entraînement générés par IA, analyse nutritionnelle par photo et suivi quotidien complet.*

[Démarrage Rapide](#-démarrage-rapide) •
[Fonctionnalités](#-fonctionnalités) •
[Stack Technique](#-stack-technique) •
[Documentation](#-documentation)

</div>

---

## 📖 Introduction

**HealthIAi** est une application complète de coaching fitness et nutrition qui exploite la puissance de l'Intelligence Artificielle pour offrir une expérience personnalisée à chaque utilisateur.

L'application permet de :

- 🎯 **Générer des plans d'entraînement** adaptés à votre profil, vos objectifs et votre niveau
- 📸 **Analyser vos repas par photo** grâce à la Vision AI pour un suivi nutritionnel sans effort
- 📊 **Suivre votre progression** quotidienne (calories, macronutriments, hydratation, poids)
- 💬 **Interagir avec un coach IA** pour obtenir des conseils personnalisés en temps réel

Le projet repose sur un backend **FastAPI** performant et asynchrone, couplé à un frontend **Expo (React Native)** déployable sur iOS, Android et Web.

---

## ✨ Fonctionnalités

| Fonctionnalité | Description |
|---|---|
| 🤖 **Plans IA Personnalisés** | Génération de programmes d'entraînement hebdomadaires via OpenRouter (GPT) adaptés à votre profil |
| 📸 **Analyse de Repas par Photo** | Vision AI (Gemini 2.0 Flash + GPT-4o Mini en fallback) pour identifier les aliments et estimer les macros |
| 📊 **Suivi Quotidien** | Tracking complet : calories, protéines, glucides, lipides, hydratation et poids |
| 🏃 **Entraînements Hebdomadaires** | Plans structurés avec exercices, séries, répétitions et temps de repos |
| 🔐 **Authentification Sécurisée** | JWT avec refresh tokens, hachage bcrypt des mots de passe |
| 📱 **Multi-plateforme** | Application native iOS/Android + version Web via Expo |
| 🧪 **Mode Mock** | Mode développement avec données simulées et persistance locale (AsyncStorage) |
| 🐳 **Déploiement Docker** | Infrastructure complète orchestrée via Docker Compose |

---

## 🛠 Stack Technique

### Backend

| Technologie | Rôle |
|---|---|
| **Python 3.14** | Langage principal |
| **FastAPI** | Framework API asynchrone |
| **Uvicorn** | Serveur ASGI |
| **MySQL 8.0** | Base de données relationnelle (utilisateurs, tracking) |
| **SQLAlchemy** (async) + **aiomysql** | ORM et driver MySQL asynchrone |
| **MongoDB** + **Motor** (async) | Base NoSQL (plans IA, analyses, logs) |
| **OpenAI SDK** via **OpenRouter** | Intégration IA (Chat + Vision) |
| **python-jose** + **passlib[bcrypt]** | Authentification JWT + hachage |
| **Pydantic v2** | Validation des données |
| **Pillow** | Traitement d'images |

### Frontend

| Technologie | Rôle |
|---|---|
| **Expo SDK 56** | Framework de développement mobile |
| **React Native 0.85** | UI native multi-plateforme |
| **React 19** | Bibliothèque UI avec React Compiler |
| **TypeScript 6.0** (strict) | Typage statique |
| **Expo Router** | Routage basé sur le système de fichiers |
| **Zustand v5** | State management avec persistance |
| **NativeWind v4** + **Tailwind CSS 3.4** | Styles utilitaires natifs |
| **expo-secure-store** | Stockage sécurisé des tokens |
| **expo-image-picker** | Capture et sélection de photos |

### Infrastructure

| Technologie | Rôle |
|---|---|
| **Docker** + **Docker Compose** | Conteneurisation (4 services) |
| **GitHub Actions** | CI/CD (analyse automatisée) |
| **wait-for-it.sh** | Orchestration du démarrage des services |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT (Expo / React Native)                 │
│                     iOS  •  Android  •  Web (:5173)                 │
└──────────────────────────────┬──────────────────────────────────────┘
                               │  HTTP / REST
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│                      BACKEND (FastAPI :8000)                         │
│                                                                      │
│   ┌──────────┐    ┌──────────────┐    ┌────────────────────┐         │
│   │  Auth    │    │   Tracking   │    │    AI Service       │         │
│   │  Routes  │    │   Routes     │    │    (Chat + Vision)  │         │
│   └────┬─────┘    └──────┬───────┘    └─────────┬──────────┘         │
│        │                 │                      │                    │
│   ┌────▼─────────────────▼───┐          ┌───────▼──────────────┐     │
│   │      Services Layer      │          │   OpenRouter API     │     │
│   │  (auth, tracking, ai)    │          │  ┌────────────────┐  │     │
│   └────┬─────────────────┬───┘          │  │ Gemini 2.0     │  │     │
│        │                 │              │  │ Flash (Vision)  │  │     │
│        ▼                 ▼              │  ├────────────────┤  │     │
│   ┌─────────┐     ┌───────────┐         │  │ GPT-4o Mini    │  │     │
│   │  MySQL  │     │  MongoDB  │         │  │ (Fallback)     │  │     │
│   │  :3306  │     │  :27017   │         │  └────────────────┘  │     │
│   └─────────┘     └───────────┘         └──────────────────────┘     │
└──────────────────────────────────────────────────────────────────────┘

   MySQL : Utilisateurs, authentification, données de suivi
   MongoDB : Plans d'entraînement IA, analyses nutritionnelles, logs
```

---

## 🚀 Démarrage Rapide

### Prérequis

- **Docker** & **Docker Compose** (recommandé) — [Installer Docker](https://docs.docker.com/get-docker/)
- **OU** installation locale :
  - Python 3.11+ (3.14 recommandé)
  - Node.js 20+
  - MySQL 8.0
  - MongoDB

### Option 1 : Docker (Recommandé) 🐳

```bash
# 1. Cloner le dépôt
git clone https://github.com/Pitou92/HealthIAi.git
cd HealthIAi

# 2. Configurer les variables d'environnement
cp backend/.env.example backend/.env
# ⚠️ Éditez backend/.env et ajoutez votre OPENROUTER_KEY

# 3. Lancer l'application
docker compose up --build
```

> [!TIP]
> L'orchestration via `wait-for-it.sh` garantit que MySQL et MongoDB sont prêts avant le démarrage du backend.

Une fois lancé, accédez à :

| Service | URL |
|---|---|
| 🖥 **Frontend** | [http://localhost:5173](http://localhost:5173) |
| ⚙️ **Backend API** | [http://localhost:8000](http://localhost:8000) |
| 📚 **Documentation API** (Swagger) | [http://localhost:8000/docs](http://localhost:8000/docs) |
| 📘 **Documentation API** (ReDoc) | [http://localhost:8000/redoc](http://localhost:8000/redoc) |

### Option 2 : Installation Locale 💻

#### Backend

```bash
# 1. Accéder au dossier backend
cd backend

# 2. Créer et activer l'environnement virtuel
python -m venv .venv
source .venv/bin/activate   # macOS/Linux
# .venv\Scripts\activate    # Windows

# 3. Installer les dépendances
pip install -r requirements.txt

# 4. Configurer les variables d'environnement
cp .env.example .env
# ⚠️ Éditez .env avec vos paramètres (DATABASE_URL, MONGODB_URL, OPENROUTER_KEY)

# 5. Lancer le serveur
python main.py
```

#### Frontend

```bash
# 1. Accéder au dossier frontend
cd frontend

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env
# Ajustez EXPO_PUBLIC_API_URL si nécessaire

# 4. Lancer l'application
npm start
```

> [!NOTE]
> Par défaut, le frontend démarre en **mode mock** (`EXPO_PUBLIC_USE_MOCK=true`). Passez à `false` pour connecter le vrai backend.

---

## 🔧 Variables d'Environnement

### Backend (`backend/.env`)

| Variable | Description | Requis | Valeur par défaut |
|---|---|:---:|---|
| `OPENROUTER_KEY` | Clé API OpenRouter pour l'IA | ✅ Oui | — |
| `DATABASE_URL` | URL de connexion MySQL | ✅ Oui | `mysql+aiomysql://root:password@localhost:3306/healthiai` |
| `MONGODB_URL` | URL de connexion MongoDB | ✅ Oui | `mongodb://localhost:27017` |
| `MONGODB_DB_NAME` | Nom de la base MongoDB | ❌ Non | `Healthai` |
| `SECRET_KEY` | Clé secrète pour les tokens JWT | ✅ Prod | `your-super-secret-key-change-me` |

### Frontend (`frontend/.env`)

| Variable | Description | Requis | Valeur par défaut |
|---|---|:---:|---|
| `EXPO_PUBLIC_API_URL` | URL du backend API | ❌ Non | `http://localhost:8000` |
| `EXPO_PUBLIC_USE_MOCK` | Activer le mode mock (données simulées) | ❌ Non | `true` |

> [!WARNING]
> Ne commitez **jamais** vos clés API ni votre `SECRET_KEY` de production. Utilisez les fichiers `.env` (ignorés par `.gitignore`).

---

## 📁 Structure du Projet

```
HealthIAi/
├── 📂 backend/                  # API FastAPI
│   ├── 📂 api/
│   │   └── 📂 routes/
│   │       ├── ai.py            # Routes IA (plans, analyse, chat)
│   │       ├── auth.py          # Routes authentification (login, register)
│   │       └── tracking.py      # Routes suivi (nutrition, hydratation, poids)
│   ├── 📂 core/
│   │   ├── config.py            # Configuration & variables d'environnement
│   │   ├── sql_db.py            # Connexion MySQL (SQLAlchemy async)
│   │   ├── nosql_db.py          # Connexion MongoDB (Motor async)
│   │   ├── utils.py             # Utilitaires
│   │   └── 📂 prompts/          # Prompts système pour l'IA
│   ├── 📂 models/
│   │   ├── domain.py            # Modèles Pydantic (schémas API)
│   │   └── sql_models.py        # Modèles SQLAlchemy (tables MySQL)
│   ├── 📂 services/
│   │   ├── ai_service.py        # Logique IA (génération de plans)
│   │   ├── auth_service.py      # Logique authentification (JWT, bcrypt)
│   │   └── vision_service.py    # Logique Vision AI (analyse photo)
│   ├── 📂 scripts/
│   │   └── evaluate_ai.py       # Script d'évaluation des réponses IA
│   ├── 📂 tests/                # Tests unitaires (pytest)
│   ├── main.py                  # Point d'entrée du serveur
│   ├── Dockerfile               # Image Docker du backend
│   ├── requirements.txt         # Dépendances Python
│   ├── wait-for-it.sh           # Script d'attente des services
│   └── .env.example             # Template des variables d'environnement
│
├── 📂 frontend/                 # Application Expo (React Native)
│   ├── 📂 src/
│   │   ├── 📂 app/              # Pages (Expo Router - file-based routing)
│   │   ├── 📂 components/       # Composants React réutilisables
│   │   ├── 📂 config/           # Configuration de l'application
│   │   ├── 📂 constants/        # Constantes (couleurs, dimensions, etc.)
│   │   ├── 📂 hooks/            # Hooks React personnalisés
│   │   ├── 📂 mocks/            # Données mockées pour le développement
│   │   ├── 📂 navigation/       # Configuration de la navigation
│   │   ├── 📂 services/         # Services API (appels au backend)
│   │   ├── 📂 store/            # State management (Zustand)
│   │   ├── 📂 types/            # Types TypeScript
│   │   └── 📂 utils/            # Fonctions utilitaires
│   ├── 📂 assets/               # Images, polices, etc.
│   ├── app.json                 # Configuration Expo
│   ├── package.json             # Dépendances npm
│   ├── tailwind.config.js       # Configuration Tailwind CSS
│   ├── tsconfig.json            # Configuration TypeScript
│   ├── Dockerfile               # Image Docker du frontend
│   └── .env.example             # Template des variables d'environnement
│
├── 📂 .github/
│   └── 📂 workflows/
│       └── analysys.yml         # Pipeline CI/CD GitHub Actions
│
├── compose.yaml                 # Docker Compose (4 services)
├── GEMINI.md                    # Mémoire persistante du projet
└── README.md                    # 📍 Vous êtes ici !
```

---

## 📚 Documentation

Une documentation détaillée est disponible dans le dossier `docs/` :

| Document | Description |
|---|---|
| 📐 [Architecture Technique](docs/ARCHITECTURE.md) | Architecture du système, flux de données, décisions techniques |
| 🔌 [Documentation API](docs/API.md) | Endpoints REST, requêtes/réponses, codes d'erreur |
| ⚙️ [Guide Backend](docs/BACKEND.md) | Configuration, services, modèles, base de données |
| 📱 [Guide Frontend](docs/FRONTEND.md) | Composants, navigation, state management, styles |
| 🐳 [Infrastructure & Déploiement](docs/INFRASTRUCTURE.md) | Docker, CI/CD, monitoring, mise en production |
| 🔒 [Sécurité](docs/SECURITY.md) | Authentification, autorisation, bonnes pratiques |
| 🤝 [Guide de Contribution](docs/CONTRIBUTING.md) | Conventions, workflow Git, standards de code |

---

## 🧪 Tests

### Tests unitaires (Backend)

```bash
cd backend
source .venv/bin/activate

# Lancer tous les tests
pytest tests/

# Avec couverture de code
pytest tests/ --cov=. --cov-report=html

# Tests verbeux
pytest tests/ -v
```

### Test d'intégration Base de Données

```bash
cd backend
python test_db_integration.py
```

### Évaluation de l'IA

```bash
cd backend

# Mode mock (sans clé API)
python scripts/evaluate_ai.py --mode mock

# Mode réel (nécessite OPENROUTER_KEY)
python scripts/evaluate_ai.py --mode live
```

---

## 🗺 Roadmap

- [x] Authentification JWT (inscription / connexion)
- [x] Génération de plans d'entraînement via IA
- [x] Analyse de repas par Vision AI
- [x] Suivi quotidien (nutrition, hydratation, poids)
- [x] Mode mock avec persistance locale (AsyncStorage)
- [x] Infrastructure Docker Compose
- [ ] Notifications push (rappels d'entraînement / hydratation)
- [ ] Cache Redis pour les sessions et les données fréquentes
- [ ] Historique et graphiques de progression
- [ ] Export des données (PDF / CSV)
- [ ] Mode hors-ligne complet

---

## 📄 Licence

Ce projet est distribué sous la licence **MIT**. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

```
MIT License

Copyright (c) 2026 Hugo Galley

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

## 👨‍💻 Auteur

<div align="center">

**Hugo Galley** — [@Pitou92](https://github.com/Pitou92)

Développé avec ❤️ et beaucoup de ☕

⭐ **Si ce projet vous plaît, n'hésitez pas à lui donner une étoile !** ⭐

</div>
]]>
