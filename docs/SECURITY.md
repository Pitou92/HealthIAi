# 🔒 Sécurité — HealthIAi

> [!CAUTION]
> Ce document contient des informations sensibles sur les vulnérabilités connues du projet.
> Ne le partagez pas publiquement tant que les correctifs ne sont pas appliqués.

---

## 1. État Actuel de la Sécurité

### 🔐 Authentification

Le système d'authentification actuel repose sur les mécanismes suivants :

| Composant | Implémentation | Statut |
|---|---|---|
| Algorithme JWT | HS256 | ✅ Fonctionnel |
| Expiration des tokens | 7 jours | ⚠️ Trop long |
| Hachage des mots de passe | bcrypt | ✅ Sécurisé |
| Schéma d'authentification | OAuth2PasswordBearer | ✅ Standard |
| Clé secrète | Valeur par défaut hardcodée | 🚨 Non sécurisé |

> [!WARNING]
> La clé secrète par défaut (`"your-super-secret-key-change-me"`) est présente dans le code source.
> Elle **doit impérativement** être remplacée par une valeur forte et unique avant tout déploiement.

---

### 🚨 Problèmes Identifiés

#### Niveau Critique

##### 1. Clé API commitée dans le dépôt

Le fichier `.env` contient une clé OpenRouter réelle, exposée dans l'historique Git.

**Actions immédiates requises :**
- 🔴 **Révoquer immédiatement** la clé sur le dashboard OpenRouter
- 🔴 **Ajouter** `.env` au fichier `.gitignore`
- 🔴 **Nettoyer l'historique Git** avec `git filter-branch` ou BFG Repo-Cleaner
- 🔴 **Utiliser des secrets GitHub Actions** pour les pipelines CI/CD

```bash
# Ajouter .env au .gitignore
echo ".env" >> .gitignore

# Nettoyer l'historique Git (avec BFG)
bfg --delete-files .env
git reflog expire --expire=now --all && git gc --prune=now --aggressive
```

##### 2. Endpoints non protégés

La majorité des endpoints de l'API ne vérifient pas l'authentification JWT :

| Endpoint | Méthode | Problème |
|---|---|---|
| `/ai/generate-plan` | POST | `user_id` en query param, sans auth |
| `/ai/current-plan` | GET | `user_id` en query param, sans auth |
| `/ai/analyze-meal` | POST | `user_id` en query param, sans auth |
| `/progress/*` | GET/POST | Tous les endpoints sans auth |
| `/auth/user/{user_id}` | GET | Accès libre aux profils utilisateurs |

> [!CAUTION]
> Un attaquant peut accéder aux données de n'importe quel utilisateur en modifiant simplement le paramètre `user_id`.
> C'est une vulnérabilité de type **IDOR** (Insecure Direct Object Reference).

##### 3. CORS ouvert à toutes les origines

```python
# ❌ Configuration actuelle dangereuse
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Autorise TOUTES les origines
)
```

```python
# ✅ Configuration recommandée
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8081",
        "https://healthiai.example.com",
    ],
)
```

##### 4. Identifiants de base de données hardcodés

Le fichier `compose.yaml` contient les identifiants MySQL en clair :

```yaml
# ❌ Actuel
MYSQL_ROOT_PASSWORD: root
MYSQL_PASSWORD: root
```

```yaml
# ✅ Recommandé — utiliser des variables d'environnement
MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
MYSQL_PASSWORD: ${MYSQL_PASSWORD}
```

---

#### Niveau Important

##### 5. Clé secrète JWT par défaut

La clé secrète JWT doit être générée aléatoirement et stockée de manière sécurisée :

```bash
# Générer une clé secrète forte
python -c "import secrets; print(secrets.token_urlsafe(64))"
```

##### 6. Absence de rate limiting

Sans limitation de débit, l'API est vulnérable aux :
- **Attaques par force brute** sur `/auth/login`
- **Attaques par déni de service (DoS)**
- **Abus des endpoints IA** (coûts API élevés)

##### 7. Pas de validation d'entrée avancée

Les réponses de l'IA sont renvoyées sans sanitization, ce qui expose à :
- **XSS** (Cross-Site Scripting) via du contenu malicieux injecté
- **Injection de prompt** via les entrées utilisateur

##### 8. Absence de HTTPS

Aucun proxy SSL n'est configuré. Les données (y compris les tokens JWT et mots de passe) transitent en clair.

##### 9. Client OpenAI synchrone

L'utilisation du client `OpenAI` synchrone bloque l'event loop de FastAPI, ce qui peut provoquer un **déni de service** si plusieurs requêtes IA arrivent simultanément.

```python
# ❌ Actuel — bloquant
from openai import OpenAI
client = OpenAI()
response = client.chat.completions.create(...)

# ✅ Recommandé — non-bloquant
from openai import AsyncOpenAI
client = AsyncOpenAI()
response = await client.chat.completions.create(...)
```

---

## 2. Recommandations de Sécurité

### 2.1 🔑 Authentification & Autorisation

- **Ajouter la vérification JWT** à **tous** les endpoints (sauf `/auth/login` et `/auth/register`)
- **Implémenter RBAC** (Role-Based Access Control) avec au minimum deux rôles : `admin` et `user`
- **Réduire l'expiration JWT** à **1 heure** et implémenter un mécanisme de **refresh tokens** (durée de vie : 30 jours)
- **Générer une clé secrète forte** (minimum 256 bits) et la stocker dans les variables d'environnement
- **Ajouter la vérification de propriété** : un utilisateur ne peut accéder qu'à ses propres données

```python
# Exemple de middleware d'authentification
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Token invalide")
        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Token expiré ou invalide")
```

### 2.2 🛡️ Protection des Données

- **Chiffrer les données sensibles** au repos (AES-256 pour les données de santé)
- **HTTPS obligatoire** avec TLS 1.3 minimum
- **Sanitizer toutes les entrées utilisateur** avant traitement et stockage
- **Valider et limiter la taille** des fichiers uploadés (images de repas) :
  - Taille maximale : 10 Mo
  - Types autorisés : `image/jpeg`, `image/png`, `image/webp`
  - Vérification du magic number du fichier
- **Masquer les données sensibles** dans les logs (mots de passe, tokens, clés API)

### 2.3 🏗️ Infrastructure

| Mesure | Outil recommandé | Priorité |
|---|---|---|
| Gestion des secrets | HashiCorp Vault, AWS Secrets Manager, ou Docker Secrets | 🔴 Haute |
| Isolation réseau | Réseau Docker interne pour MySQL et Redis | 🔴 Haute |
| Rate limiting | Redis + `slowapi` (middleware FastAPI) | 🔴 Haute |
| WAF | Cloudflare, AWS WAF, ou ModSecurity | 🟡 Moyenne |
| Logs de sécurité | ELK Stack ou Grafana Loki | 🟡 Moyenne |
| Alertes | PagerDuty, Opsgenie, ou Slack webhooks | 🟡 Moyenne |
| Scanner de vulnérabilités | Trivy (images Docker), Dependabot (dépendances) | 🟡 Moyenne |

### 2.4 ✅ Checklist de Mise en Production

> [!IMPORTANT]
> Tous les éléments marqués comme critiques (🔴) **doivent** être complétés avant tout déploiement en production.

#### 🔴 Critiques (Bloquants)

- [ ] Révoquer et renouveler la clé OpenRouter
- [ ] Ajouter `.env` au `.gitignore` et nettoyer l'historique Git
- [ ] Changer `SECRET_KEY` en valeur forte générée aléatoirement
- [ ] Ajouter l'authentification JWT à **tous** les endpoints
- [ ] Configurer CORS avec les origines spécifiques autorisées
- [ ] Changer les credentials MySQL (`root`/`root`) en valeurs sécurisées
- [ ] Passer le client OpenAI en `AsyncOpenAI`

#### 🟠 Importants (À faire rapidement)

- [ ] Mettre en place HTTPS/TLS avec un reverse proxy (Nginx, Traefik, ou Caddy)
- [ ] Ajouter le rate limiting avec Redis + `slowapi`
- [ ] Activer les health checks Docker pour tous les services
- [ ] Configurer des backups automatisés de la base de données MySQL
- [ ] Scanner les dépendances (`npm audit`, `pip-audit`)

#### 🟡 Recommandés (Bonnes pratiques)

- [ ] Mettre en place le monitoring de sécurité (logs, alertes)
- [ ] Configurer les headers de sécurité (CSP, HSTS, X-Frame-Options)
- [ ] Implémenter un mécanisme de refresh tokens
- [ ] Ajouter la validation avancée des entrées (taille, format, sanitization)
- [ ] Mettre en place un WAF (Web Application Firewall)
- [ ] Configurer la rotation automatique des secrets et clés

---

## 3. Politique de Signalement des Vulnérabilités

### 📧 Comment signaler une vulnérabilité ?

Si vous découvrez une vulnérabilité de sécurité dans HealthIAi, veuillez la signaler de manière responsable :

1. **Ne publiez PAS** la vulnérabilité publiquement (issues GitHub, forums, réseaux sociaux)
2. **Envoyez un email** à l'équipe de développement avec :
   - Une description détaillée de la vulnérabilité
   - Les étapes pour la reproduire
   - L'impact potentiel estimé
   - Si possible, une suggestion de correctif

### 📬 Contact

- **Email** : security@healthiai.dev *(à configurer)*
- **Délai de réponse** : 48 heures maximum
- **Délai de correction** :
  - Critique : 24 heures
  - Important : 7 jours
  - Modéré : 30 jours

### 🏆 Reconnaissance

Nous remercions publiquement (avec votre accord) les personnes ayant signalé des vulnérabilités de manière responsable dans notre fichier `SECURITY_ACKNOWLEDGEMENTS.md`.

---

> [!NOTE]
> Ce document est un document vivant. Il sera mis à jour au fur et à mesure de l'évolution du projet
> et de la résolution des vulnérabilités identifiées.
>
> **Dernière mise à jour** : 17 juin 2026
