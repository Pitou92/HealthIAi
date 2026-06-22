# Documentation Technique — HealthIAi Frontend

> Application mobile cross-platform (iOS · Android · Web) construite avec **Expo SDK 56 / React Native 0.85**.  
> Stack : Expo Router v3, Zustand, NativeWind, TypeScript strict, mock-first API.

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Prérequis & Installation](#2-prérequis--installation)
3. [Variables d'environnement](#3-variables-denvironnement)
4. [Architecture des dossiers](#4-architecture-des-dossiers)
5. [Routage — Expo Router](#5-routage--expo-router)
6. [Écrans (app/)](#6-écrans-app)
7. [Composants (components/)](#7-composants-components)
8. [État global — Zustand (store/)](#8-état-global--zustand-store)
9. [Services (services/)](#9-services-services)
10. [Types TypeScript (types/)](#10-types-typescript-types)
11. [Constantes & Design System (constants/)](#11-constantes--design-system-constants)
12. [Navigation (navigation/)](#12-navigation-navigation)
13. [Mocks (mocks/)](#13-mocks-mocks)
14. [Utilitaires (utils/)](#14-utilitaires-utils)
15. [Hooks personnalisés (hooks/)](#15-hooks-personnalisés-hooks)
16. [Configuration du projet](#16-configuration-du-projet)
17. [Flux applicatif complet](#17-flux-applicatif-complet)
18. [Stratégie Mock vs Backend réel](#18-stratégie-mock-vs-backend-réel)
19. [Design System — thème iOS Light](#19-design-system--thème-ios-light)
20. [Commandes utiles](#20-commandes-utiles)

---

## 1. Vue d'ensemble

HealthIAi est une application de santé personnalisée pilotée par IA. Elle guide l'utilisateur à travers :

- **Onboarding** : collecte du profil (âge, taille, poids, sexe, objectif, activité)
- **Génération de plan IA** : appel backend → plan nutrition + sport personnalisé
- **Suivi quotidien** : calories, macros, hydratation, poids
- **Nutrition** : scan de repas par photo, recherche aliments (OpenFoodFacts), journal de bord
- **Sport** : plan hebdomadaire détaillé
- **Profil** : historique, édition, déconnexion

### Technologies principales

| Technologie | Version | Rôle |
|---|---|---|
| Expo | 56.0.12 | Framework mobile |
| React Native | 0.85.3 | Moteur UI natif |
| React | 19.2.3 | Librairie UI |
| Expo Router | v3 | Routage fichier-based |
| Zustand | 5.0.14 | État global |
| NativeWind | 4.2.5 | Tailwind pour RN |
| TypeScript | strict | Typage statique |
| expo-secure-store | — | Stockage token (native) |
| @react-native-async-storage | — | Persistance Zustand |

---

## 2. Prérequis & Installation

```bash
# Prérequis
node >= 18
npm >= 9
npx expo-cli (ou via npx)

# Installer les dépendances
cd frontend
npm install

# Lancer en développement
npm run dev          # ou : npx expo start
# puis : w (web) | a (Android) | i (iOS)
```

---

## 3. Variables d'environnement

Fichier `.env` à la racine du dossier `frontend/` (**ne jamais committer**) :

```env
EXPO_PUBLIC_API_URL=http://localhost:9000   # URL du backend
EXPO_PUBLIC_USE_MOCK=true                   # true = mode mock, false = backend réel
```

Un fichier `.env.example` est fourni comme modèle.

> **Important :** toutes les variables Expo publiques doivent commencer par `EXPO_PUBLIC_` pour être exposées au bundle client.

---

## 4. Architecture des dossiers

```
frontend/
├── src/
│   ├── app/                    # Routage Expo Router (pages)
│   │   ├── _layout.tsx         # Root layout (Stack + splash)
│   │   ├── index.tsx           # Entrée : redirige auth/dashboard
│   │   ├── ai-loading.tsx      # Écran chargement IA post-onboarding
│   │   ├── (auth)/             # Groupe authentification
│   │   │   ├── _layout.tsx
│   │   │   ├── welcome.tsx
│   │   │   ├── login.tsx
│   │   │   └── register.tsx
│   │   ├── (onboarding)/       # Groupe onboarding 3 étapes
│   │   │   ├── _layout.tsx
│   │   │   ├── step1.tsx
│   │   │   ├── step2.tsx
│   │   │   └── step3.tsx
│   │   ├── (tabs)/             # Groupe onglets principaux
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx       # Dashboard / Résumé
│   │   │   ├── nutrition.tsx
│   │   │   ├── sport.tsx
│   │   │   └── profile.tsx
│   │   └── nutrition/          # Sous-routes nutrition
│   │       ├── scan.tsx
│   │       └── search.tsx
│   ├── components/             # Composants réutilisables
│   │   ├── ai-loader.tsx
│   │   ├── animated-background.tsx
│   │   ├── animated-icon.tsx
│   │   ├── animated-icon.web.tsx
│   │   ├── app-tabs.tsx
│   │   ├── app-tabs.web.tsx
│   │   ├── external-link.tsx
│   │   ├── hint-row.tsx
│   │   ├── themed-text.tsx
│   │   ├── themed-view.tsx
│   │   ├── web-badge.tsx
│   │   └── ui/
│   │       ├── badge.tsx
│   │       ├── card.tsx
│   │       ├── collapsible.tsx
│   │       ├── progress.tsx
│   │       ├── separator.tsx
│   │       └── text.tsx
│   ├── store/
│   │   ├── index.ts            # Re-exports
│   │   ├── app.ts              # Store principal (AppStore)
│   │   └── onboarding.ts       # Store onboarding
│   ├── services/
│   │   ├── api.ts              # Tous les appels API + mocks
│   │   └── token.ts            # Gestion token JWT
│   ├── types/
│   │   ├── user.ts
│   │   └── recommendations.ts
│   ├── constants/
│   │   └── theme.ts            # Design tokens (SP palette + Spacing)
│   ├── config/
│   │   └── api.ts              # URL base, USE_MOCK, délais
│   ├── navigation/
│   │   └── routes.ts           # Constantes de routes
│   ├── mocks/
│   │   ├── nutrition.ts
│   │   ├── sport.ts
│   │   └── recommendations.ts
│   ├── utils/
│   │   └── index.ts
│   └── hooks/
│       ├── use-color-scheme.ts
│       ├── use-color-scheme.web.ts
│       └── use-theme.ts
├── app.json                    # Config Expo
├── package.json
├── tsconfig.json
├── babel.config.js
├── metro.config.js
├── tailwind.config.js
├── global.css
├── .env                        # ⚠️ Ne pas committer
└── .env.example
```

---

## 5. Routage — Expo Router

Le projet utilise **Expo Router v3** (routage basé sur le système de fichiers). Chaque fichier dans `src/app/` correspond à une URL.

### Groupes de routes

| Groupe | Dossier | Rôle |
|---|---|---|
| Auth | `(auth)/` | welcome, login, register |
| Onboarding | `(onboarding)/` | step1, step2, step3 |
| Tabs | `(tabs)/` | dashboard, nutrition, sport, profil |

Les parenthèses `()` indiquent des groupes de layout — elles n'apparaissent **pas** dans l'URL.

### Layouts

- **Root `_layout.tsx`** : `<Stack>` global avec `StatusBar` light, overlay `AnimatedSplashOverlay`, fond `#111827`
- **`(auth)/_layout.tsx`** : Stack avec animation `fade`, `headerShown: false`
- **`(onboarding)/_layout.tsx`** : Stack avec animation `slide_from_right`, `gestureEnabled: false` (empêche le retour arrière)
- **`(tabs)/_layout.tsx`** : `<Tabs>` avec 4 onglets, tab bar iOS light (`#FFF`, active `#007AFF`)

### Fichier `src/app/index.tsx` — Point d'entrée

Ce fichier est le premier écran chargé. Il :
1. Lit le token stocké via `getToken()`
2. Si token présent → redirige vers `/(tabs)/` (Dashboard)
3. Si absent → redirige vers `/(auth)/welcome`

---

## 6. Écrans (app/)

### 6.1 `(auth)/welcome.tsx`

**Rôle :** Landing page de l'application.

**UI :**
- Logo `H` bleu `#007AFF` avec ombre colorée
- Titre `HealthIAi` (Health en bleu, IAi en noir)
- Sous-titre + pill badge "Nutrition · Sport · IA personnalisée"
- Card blanche en bas avec 2 boutons

**Actions :**
- "Commencer gratuitement" → `router.push(Routes.Register)`
- "J'ai déjà un compte" → `router.push(Routes.Login)`

**Dépendances :** `expo-router`, `react-native-safe-area-context`, `@/constants/theme`

---

### 6.2 `(auth)/login.tsx`

**Rôle :** Connexion utilisateur.

**État local :** `email`, `password`, `loading`, `error`

**Validation :** champs non vides avant soumission.

**Flux :**
```
handleLogin()
  → login(email, password)        [services/api.ts]
  → saveToken(token)              [services/token.ts]
  → router.replace(Routes.Dashboard)
```

**Gestion d'erreur :** message inline "Email ou mot de passe incorrect."

**UI :** fond `#F2F2F7`, card blanche, inputs `#F2F2F7`, bouton `#007AFF`, lien vers Register.

---

### 6.3 `(auth)/register.tsx`

**Rôle :** Inscription nouvel utilisateur.

**État local :** `email`, `password`, `loading`, `error`

**Validation :**
- Champs non vides
- Mot de passe minimum 6 caractères

**Flux :**
```
handleRegister()
  → register(email, password)     [services/api.ts]
  → saveToken(token)              [services/token.ts]
  → router.push(Routes.OnboardingStep1)
```

**UI :** identique à login.tsx (même thème light).

---

### 6.4 `(onboarding)/step1.tsx`

**Rôle :** Collecte des données physiques de l'utilisateur.

**Champs :**
| Champ | Type | Validation |
|---|---|---|
| Âge | `number` | 1–129 |
| Taille | `number` cm | 51–279 |
| Poids | `number` kg | 10–499 |
| Sexe | `Sex` enum | `male / female / other` |

**Validation locale** : bouton "Suivant" désactivé (`opacity: 0.38`) si formulaire invalide.

**Action :** `setStep1({ age, height, weight, sex })` → `router.push(Routes.OnboardingStep2)`

**UI :** progress bar 3 segments (actif `#007AFF`, inactif `#E5E5EA`), inputs blancs, chips de sexe.

---

### 6.5 `(onboarding)/step2.tsx`

**Rôle :** Choix de l'objectif principal.

**Options :**
| Label | Valeur | Emoji |
|---|---|---|
| Perte de poids | `weight_loss` | 🔥 |
| Prise de masse | `muscle_gain` | 💪 |
| Forme générale | `fitness` | ⚡️ |

**UI :** cards avec radio button, card active en `rgba(0,122,255,0.06)`.

**Action :** `setStep2({ goal })` → `router.push(Routes.OnboardingStep3)`

---

### 6.6 `(onboarding)/step3.tsx`

**Rôle :** Collecte de l'activité physique.

**Champs :**
| Champ | Type | Options |
|---|---|---|
| Fréquence | `number` séances/semaine | 1–7 (grid) |
| Type d'activité | `ActivityType` | cardio, strength, mixed, yoga, none |
| Niveau | `ActivityLevel` | sedentary, light, moderate, intense |

**Action :** `setStep3({ activityFrequency, activityType, activityLevel })` → `router.push(Routes.AILoading)`

**UI :** progress bar étape 3/3 (segments done `#34C759`), grille de chips pour fréquence.

---

### 6.7 `ai-loading.tsx`

**Rôle :** Écran de transition pendant la génération du plan IA après l'onboarding.

**Logique :**
```
useEffect → si onboardingData.age && !loading && !success && !error
  → submitAndFetch(profile)       [store/app.ts]

useEffect → si success
  → setTimeout 3s → resetOnboarding() → router.replace(Routes.Dashboard)
```

**États affichés :**
- **Chargement** : composant `<AILoader visible={true} />`
- **Erreur** : message d'erreur + bouton "Retourner en arrière" (`clearError()` + `router.back()`)

**UI :** fond `#F2F2F7`, erreur en texte noir/gris, bouton retour `#007AFF`.

---

### 6.8 `(tabs)/index.tsx` — Dashboard

**Rôle :** Vue principale avec les KPIs du jour.

**Données consommées :** `useAppStore()` → `recommendations`, `dailyProgress`, `streak`

**Sections :**

1. **Header** : date formatée en français, badge streak 🔥, avatar initial `H`
2. **KPIs principaux** (grille 2 colonnes) :
   - Calories (rouge `#FF3B30`) avec barre de progression
   - Hydratation (bleu `#007AFF`) — tap → `addWater(250 ml)`
3. **Macronutriments** : barres Protéines (orange), Glucides (vert), Lipides (violet)
4. **Physique** : poids actuel

**État vide** (`!data && !loading`) : écran "Prêt à commencer ?" avec bouton vers l'onboarding.

**Composants internes :**
- `KPICard({ title, value, target, unit, color, icon, onPress })` — card KPI avec barre
- `MacroBar({ label, current, target, color })` — ligne macro avec progression

**Au mount :** `loadRecommendations()` si pas de données.

---

### 6.9 `(tabs)/nutrition.tsx`

**Rôle :** Onglet nutrition complet.

**Sections :**
1. **Actions rapides** : boutons Scanner 📸 et Rechercher 🔍
2. **Résumé du jour** : kcal restantes + 3 cards macros (Protéines/Glucides/Lipides)
3. **Journal de bord** : liste des `nutritionLogs` du jour avec heure et calories
4. **Plan IA** : liste des repas recommandés (Petit-déjeuner, Déjeuner, Collation, Dîner) avec kcal

**Navigation :**
- Scanner → `router.push('/nutrition/scan')`
- Rechercher → `router.push('/nutrition/search')`

**Composant interne :** `MacroItem({ label, current, target, color })` — card macro compacte.

---

### 6.10 `(tabs)/sport.tsx`

**Rôle :** Onglet sport — plan hebdomadaire.

**Données :** `recommendations.sport.weeklyPlan` — liste de `SportDay`

**Affichage par jour :**
- Nom du jour + type d'activité (gris)
- Badge intensité coloré (Légère `#34C759`, Modérée `#FF9500`, Élevée `#FF3B30`)
- Liste des exercices avec détails

---

### 6.11 `(tabs)/profile.tsx`

**Rôle :** Profil utilisateur et paramètres.

**Sections :**
1. **En-tête** : avatar bleu `#007AFF` avec initiale, nom/objectif/niveau, bouton "Modifier"
2. **Mode édition** : champ poids → `updateWeight(weight)`
3. **Historique de Poids** : liste `weightHistory` ou "Aucune donnée."
4. **Historique Nutritionnel** : liste `nutritionHistory` ou "Aucune donnée."
5. **Paramètres** : lignes "Objectifs" et "Unités" (flèche `›`)
6. **Déconnexion** : bouton rouge `#FF3B30` → `removeToken()` + `reset()` + `router.replace(Routes.Welcome)`

**Au mount :** `fetchHistoryAndProfile()` pour charger les historiques.

---

### 6.12 `nutrition/scan.tsx`

**Rôle :** Analyse d'un repas par photo.

**Étapes visuelles (stepper) :**
1. **Image** — sélection via `expo-image-picker` (galerie ou appareil photo)
2. **Envoi** — upload vers le backend
3. **IA** — analyse en cours
4. **Fini** — résultat affiché

**Résultat :** liste d'aliments détectés + macros estimées + bouton "Confirmer ce repas"

**Actions :**
- `scanMeal(imageUri)` [store/app.ts] → `analyzeMeal()` [api.ts]
- `confirmMeal(analysis)` → log le repas

---

### 6.13 `nutrition/search.tsx`

**Rôle :** Recherche d'aliments pour logger manuellement.

**Source de données :** OpenFoodFacts API (via `searchFood(query)` dans api.ts)

**Affichage par résultat :** nom du produit, calories/100g, macros (P/G/L)

**Action :** "Ajouter" → `saveNutritionLog()` avec les macros de l'aliment sélectionné.

---

## 7. Composants (components/)

### 7.1 `ai-loader.tsx`

**Rôle :** Overlay plein écran animé affiché pendant le chargement du plan IA.

**Props :**
```typescript
interface AILoaderProps {
  visible: boolean;
}
```

**Animations :**
- Fade in/out du conteneur (`containerFade`)
- 3 dots pulsants en décalé (dot1, dot2, dot3 avec délais 0/200/400ms)
- 3 blobs de fond avec scale + opacity en boucle (périodes 3.8s / 5.2s / 4.5s)
- Rotation des messages toutes les 2.5s avec fade cross-dissolve

**Messages affichés (en boucle) :**
1. "Analyse de votre profil unique..."
2. "L'IA prépare votre avenir en pleine santé..."
3. "Calcul de vos besoins caloriques optimaux..."
4. "Génération d'un plan nutritionnel sur mesure..."
5. "Votre coach IA peaufine vos exercices..."
6. "Presque prêt à transformer votre quotidien..."
7. "Votre plan personnalisé est en route !"

**UI :** fond `#F2F2F7`, logo carré bleu `#007AFF`, blobs bleu/vert légers, texte `#8E8E93`.

---

### 7.2 `animated-background.tsx`

**Rôle :** Fond animé avec 3 blobs flottants (utilisé sur l'écran welcome dans les anciennes versions).

**Props :**
```typescript
interface Props {
  intensity?: 'soft' | 'normal';  // défaut: 'normal'
}
```

**Comportement :** blobs en position absolue, animations de scale et opacité en boucle infinie via `Animated.loop`.

---

### 7.3 `animated-icon.tsx` / `animated-icon.web.tsx`

**Rôle :** Splash screen animé avec logo HealthIAi.

- **Native** : gradient bleu + glow rotatif + logo centré
- **Web** (`animated-icon.web.tsx`) : fond `div` CSS avec background gradient, sans dépendance expo

Ces composants sont utilisés dans le root layout (`_layout.tsx`) pour l'overlay de splash.

---

### 7.4 `external-link.tsx`

**Rôle :** Wrapper de `Link` d'Expo Router qui ouvre les liens externes dans le navigateur système sur mobile.

**Usage :**
```tsx
<ExternalLink href="https://expo.dev">Ouvrir</ExternalLink>
```

---

### 7.5 `themed-text.tsx`

**Rôle :** Composant Text thématisé.

**Types disponibles :**
| Type | Style |
|---|---|
| `default` | fontSize 16, lineHeight 24 |
| `title` | fontSize 32, bold |
| `small` | fontSize 14 |
| `smallBold` | fontSize 14, bold |
| `subtitle` | fontSize 20, bold |
| `link` | fontSize 16, bleu |
| `code` | monospace |

---

### 7.6 `themed-view.tsx`

**Rôle :** Composant View avec fond issu du thème.

**Types :** `background`, `backgroundElement`, `backgroundSelected`

---

### 7.7 `ui/badge.tsx`

**Rôle :** Badge textuel avec variantes.

**Variantes :** `default`, `secondary`, `success`, `muted`

**Usage :**
```tsx
<Badge variant="success">Élevée</Badge>
```

---

### 7.8 `ui/card.tsx`

**Rôle :** Composant Card avec sous-composants.

**Exports :** `Card`, `CardHeader`, `CardContent`

Utilise `forwardRef` et supporte `className` NativeWind.

---

### 7.9 `ui/collapsible.tsx`

**Rôle :** Section dépliable/repliable avec animation.

**Comportement :** chevron rotatif + contenu en `FadeIn` animé. Utilise `ThemedView` et `ThemedText`.

---

### 7.10 `ui/progress.tsx`

**Rôle :** Barre de progression (0–100%).

**Props :** `value: number`, `color?: string`

---

### 7.11 `ui/separator.tsx`

**Rôle :** Ligne diviseur (`h-px`, `bg-white/8`).

---

### 7.12 `ui/text.tsx`

**Rôle :** Wrapper `Text` avec support `className` NativeWind.

---

## 8. État global — Zustand (store/)

### 8.1 `store/app.ts` — AppStore

**Import :**
```typescript
import { useAppStore } from '@/store/app';
```

#### État

```typescript
interface AppState {
  loading: boolean;
  error: string | null;
  success: boolean;
  recommendations: Recommendations | null;
  dailyProgress: DailyProgress | null;
  nutritionLogs: NutritionLog[];
  streak: StreakInfo | null;
  nutritionHistory: NutritionHistoryEntry[];
  weightHistory: WeightHistoryEntry[];
  userProfile: UserProfile | null;
  favoriteMeals: SavedMeal[];
  userId: string | null;
}
```

#### Actions

| Action | Paramètres | Description |
|---|---|---|
| `submitAndFetch` | `profile: UserProfile` | Soumet l'onboarding + récupère le plan + progress + logs |
| `loadRecommendations` | — | Charge le plan existant ; si absent, set `error: 'NO_PROFILE'` |
| `fetchProgress` | `userId: string` | Rafraîchit `dailyProgress` + `nutritionLogs` |
| `fetchHistoryAndProfile` | — | Charge `nutritionHistory`, `weightHistory`, `userProfile`, `favoriteMeals` |
| `addWater` | `amount: number` (ml) | Log d'hydratation local + API |
| `updateWeight` | `weight: number` (kg) | Log du poids |
| `scanMeal` | `imageUri: string` | Analyse image repas via API |
| `confirmMeal` | `analysis` | Log le repas analysé |
| `updateUserProfileAndAdjustPlan` | `profile: Partial<UserProfile>` | Met à jour profil + ajuste plan IA |
| `clearError` | — | Réinitialise `error` à null |
| `reset` | — | Réinitialise tout le store |

#### Persistance

- Librairie : `zustand/middleware` → `persist`
- Clé AsyncStorage : `'healthai-app-storage'`
- Champs persistés : `userId`, `recommendations`, `dailyProgress`, `nutritionLogs`, `streak`, `userProfile`

---

### 8.2 `store/onboarding.ts` — OnboardingStore

**Import :**
```typescript
import { useOnboardingStore } from '@/store/onboarding';
```

#### État

```typescript
interface OnboardingData {
  age?: number;
  height?: number;
  weight?: number;
  sex?: Sex;
  goal?: Goal;
  activityFrequency?: number;
  activityType?: ActivityType;
  activityLevel?: ActivityLevel;
}

interface OnboardingState {
  data: OnboardingData;
}
```

#### Actions

| Action | Paramètres | Description |
|---|---|---|
| `setStep1` | `{ age, height, weight, sex }` | Met à jour les données étape 1 |
| `setStep2` | `{ goal }` | Met à jour les données étape 2 |
| `setStep3` | `{ activityFrequency, activityType, activityLevel }` | Met à jour les données étape 3 |
| `reset` | — | Réinitialise toutes les données onboarding |

#### Persistance

- Clé AsyncStorage : `'healthai-onboarding-storage'`

---

## 9. Services (services/)

### 9.1 `services/token.ts`

Gestion du token JWT de l'utilisateur connecté.

| Fonction | Description |
|---|---|
| `saveToken(token: string)` | Sauvegarde le token (SecureStore sur native, localStorage sur web) |
| `getToken(): Promise<string \| null>` | Récupère le token stocké |
| `removeToken()` | Supprime le token (déconnexion) |

**Stockage conditionnel :**
- **Native (iOS/Android)** : `expo-secure-store` (chiffré)
- **Web** : `localStorage`

---

### 9.2 `services/api.ts`

Fichier central de tous les appels réseau. Supporte le mode **mock** et le mode **réel**.

#### Configuration

```typescript
// src/config/api.ts
API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000'
USE_MOCK      = process.env.EXPO_PUBLIC_USE_MOCK !== 'false'  // true par défaut
MOCK_SUBMIT_DELAY_MS = 600
MOCK_RECO_DELAY_MS   = 2200
```

#### Helpers internes

| Helper | Description |
|---|---|
| `delay(ms)` | Simule la latence réseau en mode mock |
| `bearer()` | Retourne les headers `Authorization: Bearer <token>` |
| `toBackendProfile(profile)` | Convertit `UserProfile` → `BackendProfile` (mapping enums) |
| `fromBackendPlan(plan)` | Convertit `BackendPlan` → `Recommendations` (parse repas + sport) |

#### Endpoints

**Authentification**
| Fonction | Méthode | Endpoint |
|---|---|---|
| `login(email, password)` | POST | `/auth/login` |
| `register(email, password)` | POST | `/auth/register` |

**Onboarding**
| Fonction | Méthode | Endpoint |
|---|---|---|
| `submitOnboardingData(userId, profile)` | POST | `/users/{id}/profile` |

**Recommandations**
| Fonction | Méthode | Endpoint |
|---|---|---|
| `fetchRecommendations(userId, profile)` | POST | `/recommendations` |
| `fetchCurrentPlan(userId)` | GET | `/users/{id}/plan` |
| `adjustPlan(userId, profile)` | PUT | `/users/{id}/plan/adjust` |

**Suivi quotidien**
| Fonction | Méthode | Endpoint |
|---|---|---|
| `fetchTodayProgress(userId)` | GET | `/users/{id}/progress/today` |
| `logHydration(userId, amount)` | POST | `/users/{id}/logs/hydration` |
| `logWeight(userId, weight)` | POST | `/users/{id}/logs/weight` |
| `fetchNutritionLogs(userId)` | GET | `/users/{id}/logs/nutrition/today` |
| `fetchStreak(userId)` | GET | `/users/{id}/streak` |

**Analyse de repas**
| Fonction | Méthode | Endpoint |
|---|---|---|
| `analyzeMeal(userId, imageUri)` | POST | `/meals/analyze` (multipart/form-data) |
| `saveNutritionLog(userId, entry)` | POST | `/users/{id}/logs/nutrition` |

**Historique**
| Fonction | Méthode | Endpoint |
|---|---|---|
| `fetchNutritionHistory(userId)` | GET | `/users/{id}/history/nutrition` |
| `fetchWeightHistory(userId)` | GET | `/users/{id}/history/weight` |

**Recherche aliments**
| Fonction | Méthode | Endpoint externe |
|---|---|---|
| `searchFood(query)` | GET | OpenFoodFacts API |

**Favoris**
| Fonction | Méthode | Endpoint |
|---|---|---|
| `saveFavoriteMeal(userId, meal)` | POST | `/users/{id}/favorites` |
| `getFavoriteMeals(userId)` | GET | `/users/{id}/favorites` |

**Profil**
| Fonction | Méthode | Endpoint |
|---|---|---|
| `fetchProfile(userId)` | GET | `/users/{id}/profile` |
| `updateProfile(userId, profile)` | PUT | `/users/{id}/profile` |

---

## 10. Types TypeScript (types/)

### 10.1 `types/user.ts`

```typescript
type Sex = 'male' | 'female' | 'other'

type Goal = 'weight_loss' | 'muscle_gain' | 'fitness'

type ActivityType = 'cardio' | 'strength' | 'mixed' | 'yoga' | 'none'

type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'intense'

interface UserProfile {
  age: number
  height: number          // cm
  weight: number          // kg
  sex: Sex
  goal: Goal
  activityFrequency: number  // séances/semaine
  activityType: ActivityType
  activityLevel: ActivityLevel
}

interface AuthUser {
  id: string
  email: string
  token: string
}
```

---

### 10.2 `types/recommendations.ts`

```typescript
interface Meal {
  name: string
  items: string[]
  calories: number
  time?: string
}

interface SportDay {
  day: string             // 'Lundi', 'Mercredi', etc.
  type: string            // 'Cardio', 'Musculation', etc.
  intensity: 'Légère' | 'Modérée' | 'Élevée'
  duration: number        // minutes
  exercises: string[]
}

interface Recommendations {
  calories: { target: number; consumed: number }
  macros: {
    proteins: { target: number; consumed: number }
    carbs:    { target: number; consumed: number }
    fats:     { target: number; consumed: number }
  }
  hydration: { targetMl: number; consumedMl: number }
  nutrition: { meals: Meal[]; tips: string[] }
  sport:     { weeklyPlan: SportDay[]; tips: string[] }
}
```

#### Types API supplémentaires (définis dans `services/api.ts`)

```typescript
interface DailyProgress {
  calories_consumed: number
  calories_target: number
  protein_consumed: number;  protein_target: number
  carbs_consumed: number;    carbs_target: number
  fat_consumed: number;      fat_target: number
  water_consumed_ml: number; water_target_ml: number
  current_weight_kg: number | null
  workout_completed: boolean
}

interface NutritionLog {
  id: string
  food_name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  logged_at: string       // ISO timestamp
  meal_type: string       // 'Petit Déjeuner', 'Déjeuner', etc.
}

interface StreakInfo {
  current_streak: number
  last_activity_date: string
}
```

---

## 11. Constantes & Design System (constants/)

### 11.1 `constants/theme.ts`

#### Palette SP (dark branding — utilisée uniquement en interne pour l'historique)

```typescript
export const SP = {
  bg: '#111827',        // Gris très foncé
  bgCard: '#1F2937',    // Carte dark
  bgInput: '#374151',   // Input dark
  text: '#F9FAFB',      // Blanc cassé
  textDim: '#D1D5DB',   // Gris clair
  textMuted: '#9CA3AF', // Gris moyen
  primary: '#22C55E',   // Vert (branding original)
  primaryDeep: '#16A34A',
  secondary: '#3B82F6', // Bleu (ancien loader)
  border: 'rgba(34, 197, 94, 0.25)',
  borderDim: 'rgba(255, 255, 255, 0.08)',
}
```

#### Spacing

```typescript
export const Spacing = {
  half: 2,
  one:  4,
  two:  8,
  three: 16,
  four:  24,
  five:  32,
  six:   64,
}
```

#### Autres exports

```typescript
export const BottomTabInset = { ios: 50, android: 80 }
export const MaxContentWidth = 800
```

---

## 12. Navigation (navigation/)

### `navigation/routes.ts`

Constantes centralisées pour toutes les routes de l'application. À utiliser partout avec `router.push(Routes.X)`.

```typescript
export const Routes = {
  Welcome:         '/(auth)/welcome',
  Login:           '/(auth)/login',
  Register:        '/(auth)/register',
  OnboardingStep1: '/(onboarding)/step1',
  OnboardingStep2: '/(onboarding)/step2',
  OnboardingStep3: '/(onboarding)/step3',
  AILoading:       '/ai-loading',
  Dashboard:       '/(tabs)/',
}
```

> **Bonne pratique :** toujours utiliser `Routes.X` plutôt qu'une chaîne de caractères brute pour éviter les fautes de frappe.

---

## 13. Mocks (mocks/)

Les mocks fournissent des données de test réalistes quand `USE_MOCK=true`.

### `mocks/nutrition.ts` — `mockNutrition`

4 repas avec aliments, calories et macros :
- Petit-déjeuner : 420 kcal (Flocons d'avoine, Banane, Lait végétal, Myrtilles)
- Déjeuner : 580 kcal (Poulet grillé, Riz complet, Brocolis, Huile d'olive)
- Collation : 180 kcal (Yaourt grec, Amandes)
- Dîner : 520 kcal (Saumon, Quinoa, Épinards, Citron)

### `mocks/sport.ts` — `mockSport`

3 sessions hebdomadaires :
- Lundi : Cardio 45 min — Légère
- Mercredi : Musculation 60 min — Élevée
- Vendredi : Yoga 30 min — Légère

### `mocks/recommendations.ts` — `mockRecommendations`

Combine nutrition + sport avec targets :
- 2 200 kcal/jour
- Protéines 165g / Glucides 250g / Lipides 70g
- Hydratation 2 500 ml

`mockUserProfile` : homme, 28 ans, 175 cm, 75 kg, objectif fitness, activité modérée.

---

## 14. Utilitaires (utils/)

### `utils/index.ts`

```typescript
clamp(value: number, min: number, max: number): number
// Limite une valeur entre min et max

formatCalories(kcal: number): string
// → "2 200 kcal"

formatWeight(kg: number): string
// → "75 kg"

formatHeight(cm: number): string
// → "175 cm"
```

---

## 15. Hooks personnalisés (hooks/)

### `use-color-scheme.ts` (native)

Ré-export simple de `useColorScheme` de `react-native`.

### `use-color-scheme.web.ts` (web)

Wrapper qui retourne `'light'` côté serveur (SSR) pour éviter l'hydration mismatch, puis la vraie valeur côté client.

### `use-theme.ts`

```typescript
// Retourne les couleurs du thème actif
const colors = useTheme();
// colors.background, colors.text, etc.
```

---

## 16. Configuration du projet

### `app.json`

```json
{
  "expo": {
    "name": "HealthIAi",
    "slug": "healthiai",
    "version": "1.0.0",
    "sdkVersion": "56.0.0",
    "plugins": [
      "expo-router",
      "expo-font",
      "expo-image",
      ["expo-secure-store", { ... }]
    ],
    "splash": { "backgroundColor": "#111827" },
    "ios": { "supportsTablet": true },
    "android": { "adaptiveIcon": { ... } },
    "web": { "bundler": "metro" }
  }
}
```

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["src/*"],
      "@/assets/*": ["assets/*"]
    }
  }
}
```

### `tailwind.config.js`

```javascript
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:      '#111827',   // SP.bg
        primary: '#22C55E',   // SP.primary (green)
        // ...
      }
    }
  }
}
```

> **Note :** les classes NativeWind (`bg-bg`, `bg-primary`) mappent vers la palette SP (dark). Les écrans en thème light utilisent directement des valeurs hexadécimales dans `StyleSheet.create()`.

### `babel.config.js`

```javascript
module.exports = {
  presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }]],
  plugins: ['nativewind/babel'],
}
```

### `metro.config.js`

Configuré pour NativeWind : pointe vers `global.css` comme fichier d'entrée CSS.

---

## 17. Flux applicatif complet

```
Lancement
    │
    ▼
src/app/index.tsx
    │── getToken() ──┬── token présent ──→ /(tabs)/  [Dashboard]
                     └── pas de token ──→ /(auth)/welcome

/(auth)/welcome ──→ Register ──→ Onboarding Step 1
                └──→ Login   ──→ Dashboard (si token ok)

Onboarding:
  Step 1 (profil) ──→ Step 2 (objectif) ──→ Step 3 (activité) ──→ /ai-loading
      │                                                                  │
      └── setStep1()        setStep2()        setStep3()    submitAndFetch(profile)
                                                                         │
                                                              ┌──────────┴──────────┐
                                                           succès              erreur
                                                              │                    │
                                                     router.replace(Dashboard)  message + back

Tabs:
  [Résumé]    → loadRecommendations() au mount
  [Nutrition] → scan → /nutrition/scan   (expo-image-picker + analyzeMeal)
             → search → /nutrition/search (OpenFoodFacts)
  [Sport]     → affiche weeklyPlan
  [Profil]    → fetchHistoryAndProfile() → édition poids → déconnexion
```

---

## 18. Stratégie Mock vs Backend réel

Le flag `USE_MOCK` dans `.env` contrôle le comportement de **toutes** les fonctions de `services/api.ts`.

### Mode mock (`EXPO_PUBLIC_USE_MOCK=true`)

- Chaque fonction API retourne des données fixes issues de `src/mocks/`
- Un `delay()` simule la latence (600ms ou 2200ms selon l'appel)
- Les logs d'hydratation et nutrition sont persistés en `AsyncStorage` même en mock
- Aucun serveur backend requis

### Mode réel (`EXPO_PUBLIC_USE_MOCK=false`)

- Les appels HTTP réels sont effectués vers `EXPO_PUBLIC_API_URL`
- Authentification via token JWT (header `Authorization: Bearer`)
- Le token est stocké dans `expo-secure-store` (iOS/Android) ou `localStorage` (web)

### Basculer entre les modes

```env
# .env
EXPO_PUBLIC_USE_MOCK=true    # → mode mock (développement)
EXPO_PUBLIC_USE_MOCK=false   # → backend réel
EXPO_PUBLIC_API_URL=http://192.168.x.x:9000  # IP du backend sur le réseau local
```

Redémarrer le bundler après modification du `.env`.

---

## 19. Design System — thème iOS Light

Toute l'application (sauf `ai-loading.tsx` en tant qu'overlay) utilise un thème iOS light inspiré d'Apple Health.

### Palette de couleurs

| Rôle | Valeur | Usage |
|---|---|---|
| Fond principal | `#F2F2F7` | `backgroundColor` des écrans |
| Fond card | `#FFFFFF` | Cards, inputs groupés |
| Fond input | `#F2F2F7` | Champs de saisie dans une card |
| Texte principal | `#000000` | Titres, valeurs importantes |
| Texte secondaire | `#8E8E93` | Labels, descriptions, placeholders |
| Primaire (bleu iOS) | `#007AFF` | Boutons, liens, états actifs, icônes |
| Succès / Progression | `#34C759` | Indicateurs "done", barres complétées |
| Alerte / Erreur | `#FF3B30` | Messages d'erreur, calories hors limite |
| Avertissement | `#FF9500` | Intensité modérée sport |
| Séparateur | `#E5E5EA` | Lignes diviseurs, bordures |

### Ombres standard (cards)

```typescript
{
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 2,
  elevation: 2,
}
```

### Typographie standard

| Élément | fontSize | fontWeight |
|---|---|---|
| Grand titre (page) | 34 | `800` |
| Titre section | 20 | `700` |
| Corps principal | 17 | `500` |
| Label | 13 | `600` + uppercase |
| Texte secondaire | 14–15 | `400` |
| Bouton principal | 17 | `700` |

### Rayons de bordure

| Élément | borderRadius |
|---|---|
| Card principale | 16 |
| Bouton | 12–14 |
| Input | 10 |
| Badge | 999 (pill) |

---

## 20. Commandes utiles

```bash
# Démarrer le serveur de développement
npm run dev
npx expo start

# Ouvrir sur une plateforme spécifique
# (dans le terminal expo)
w   # → web (localhost:8081)
a   # → Android (émulateur ou appareil)
i   # → iOS (simulateur Mac uniquement)

# Vérifier les types TypeScript
npx tsc --noEmit

# Installer un package compatible avec la version Expo
npx expo install <package>

# Nettoyer le cache Metro
npx expo start --clear

# Lancer les tests (si configurés)
npm test
```

### Branches git

| Branche | Rôle |
|---|---|
| `main` | Branche principale / production |
| `fix/style` | Uniformisation thème iOS light |

### Fichiers à ne jamais committer

```
.env          # contient API_URL et USE_MOCK (secrets potentiels)
```

---

*Documentation générée le 22/06/2026 — HealthIAi Frontend v1.0*
