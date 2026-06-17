# 🏭 Infrastructure & Déploiement — HealthIAi

## 1. Vue d'Ensemble de l'Infrastructure

HealthIAi utilise une architecture entièrement conteneurisée avec **Docker** et orchestrée localement via **Docker Compose**. L'environnement de développement reproduit fidèlement la topologie d'une infrastructure de production avec des services séparés.

### Services Actuels (`compose.yaml`)
| Service | Image | Port (Hôte:Conteneur) | Rôle |
|---------|-------|-----------------------|------|
| `backend` | Build local (`./backend`) | 8000:8000 | API FastAPI |
| `frontend` | Build local (`./frontend`) | 5173:5173 | Application Expo (Web) |
| `db` | `mysql:8.0` | 3306:3306 | Base de données relationnelle (Comptes) |
| `mongodb` | `mongo:latest` | 27017:27017 | Base de données NoSQL (Logs & IA) |

### Volumes Persistants
- `db_data` : Assure la persistance des données MySQL entre les redémarrages des conteneurs.
- `mongodb_data` : Assure la persistance des données MongoDB.

## 2. Docker

### 2.1 Docker Compose
Le fichier `compose.yaml` (à la racine) relie les 4 services.
- **Réseau** : Les services utilisent le réseau par défaut de Docker Compose, ce qui leur permet de communiquer via le nom de leur service (ex: le backend accède à MySQL via le hostname `db`).
- **Dépendances** : Le `backend` dépend de `db` et `mongodb`. Le `frontend` dépend du `backend`.

### 2.2 Dockerfile Backend
Situé dans `/backend/Dockerfile`.
- **Image de base** : `python:3.11`
- **Installation** : Copie et installe `requirements.txt` sans cache.
- **Orchestration interne** : Utilise le script utilitaire `wait-for-it.sh` pour s'assurer que le service TCP de MySQL (port 3306) est accessible avant de lancer l'application (pour éviter les crashs de connexion SQLAlchemy au démarrage).
- **Lancement** : Utilise `uvicorn` avec le flag `--reload` activé, conçu pour le développement en direct.

### 2.3 Dockerfile Frontend
Situé dans `/frontend/Dockerfile`.
- **Image de base** : `node:20`
- **Dépendances système** : Installe `libnss3`, `libnspr4`, et `libasound2` (nécessaires pour certains outils de développement React Native).
- **Lancement** : Lance le serveur de développement Expo en mode web (`npx expo start --web --port 5173`).

## 3. Environnements et Démarrage

### 3.1 Développement Local (avec Docker - Recommandé)
C'est la méthode la plus simple pour démarrer l'ensemble du projet sans installer les bases de données sur la machine hôte.

```bash
# Copier les variables d'environnement backend
cp backend/.env.example backend/.env
# Remplir OPENROUTER_KEY dans backend/.env

# Lancer la stack complète
docker compose up --build
```
Les services seront disponibles aux adresses suivantes :
- Backend : `http://localhost:8000`
- Frontend : `http://localhost:5173`

### 3.2 Développement Local (sans Docker)
**Prérequis** : Python 3.11+, Node.js 20+, Serveur MySQL local (port 3306), Serveur MongoDB local (port 27017).

**Backend :**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env # Penser à éditer
python main.py
```

**Frontend :**
```bash
cd frontend
npm install
# Le frontend pointera par défaut sur localhost:8000 via son API_BASE_URL
npx expo start
```

## 4. Intégration et Déploiement Continus (CI/CD)

### 4.1 GitHub Actions (Actuel)
Le projet contient un pipeline `.github/workflows/analysys.yml` déclenché lors d'un Push ou Pull Request sur `main`.
- **Job CodeAnalysis** : Prévu pour SonarCloud et Trivy (actuellement commenté/désactivé).
- **Job SecurityAnalysis** : Exécute Checkmarx Vorpal avec ReviewDog pour l'analyse de sécurité du backend.

### 4.2 Pipeline CI/CD Cible (Recommandé)
Il est fortement recommandé de faire évoluer le pipeline actuel pour y inclure l'exécution automatique des tests :
1. **Linting** : Exécution de `npx expo lint` sur le frontend.
2. **Tests Backend** : Lancement d'instances MySQL et MongoDB éphémères dans GitHub Actions (`services:`), puis exécution de la suite `pytest` avec `pytest-asyncio`.
3. **Build des Images** : Test du build des Dockerfiles backend et frontend à chaque PR pour éviter les régressions de build.

## 5. Déploiement en Production (Recommandations)

Le projet ne contenant actuellement que des configurations orientées "développement" (ex: uvicorn --reload, clés par défaut), voici l'architecture recommandée pour le passage en production :

### Infrastructure Cloud (Ex: VPS ou AWS/GCP)
- **Nginx (Reverse Proxy)** : Un serveur Nginx en amont pour gérer les certificats SSL/TLS (Let's Encrypt), forcer le HTTPS et router le trafic externe (`/api/` vers `localhost:8000`).
- **Bases de Données Gérées** : Utilisation de services managés comme *MongoDB Atlas* et *AWS RDS / DigitalOcean Managed Databases* (pour MySQL) afin d'assurer les sauvegardes, la haute disponibilité et réduire la surface d'attaque.
- **Frontend** : Compiler le frontend Expo pour le Web en production (`npx expo export:web`) et le servir en statique via Nginx ou un CDN (Vercel, Netlify).

### Adaptation Docker Compose pour la Production
Créer un fichier `docker-compose.prod.yml` contenant :
- `uvicorn` sans le flag `--reload`.
- Spécification des utilisateurs non-root dans les Dockerfiles (`USER node`, `USER nobody`).
- Isolation réseau : Les bases de données sur un réseau `backend_network` (non exposé à l'hôte), et l'API sur un `frontend_network`.
- Tag d'images précis (ex: `mongo:7.0` au lieu de `mongo:latest`).

## 6. Scripts Utilitaires
Le projet comprend quelques scripts utiles pour l'administration et l'évaluation :
- `/backend/scripts/evaluate_ai.py` : Script d'évaluation de la précision de l'IA (Vision & Text) avec un mode mock.
- `/frontend/scripts/reset-project.js` : Permet de nettoyer l'application Expo (utile après de gros changements de packages).
