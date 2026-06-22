# HealthIAi - Projet Gemini

## État Actuel du Projet
- Application de coaching fitness et nutrition basée sur l'IA.
- Backend : FastAPI, MySQL, Redis (prévu), Intégration IA (Vision & Chat).
- Frontend : Expo (React Native), TypeScript.

## Journal de Bord (Development Log)
- **2026-06-12** : 
    - Initialisation de la mémoire persistante pour assurer la continuité entre les sessions.
    - Correction du bug de l'application où les repas ajoutés n'apparaissaient pas dans le "Journal de bord".
    - Amélioration du mode mock (frontend) pour simuler la persistance des données.
    - Correction du backend pour filtrer les progrès et les logs par date (aujourd'hui uniquement).
    - **Ajout de la persistance locale via `AsyncStorage`** : Les données mockées (repas, hydratation) survivent désormais au rechargement (reload) de l'application.
- **2026-06-21** :
    - **Système de logging global** :
        - Backend : Configuration de logs rotatifs persistés dans `backend/logs/healthiai.log`, et mise en place d'un middleware FastAPI qui logue toutes les requêtes (méthode, chemin, durée, code de retour, IP) et les exceptions.
        - Backend : Création d'un endpoint de réception `/logs/client` enregistrant les logs clients dans `backend/logs/frontend.log`.
        - Frontend : Création d'un utilitaire `AppLogger` qui intercepte automatiquement la console (`console.log`, `console.warn`, `console.error`) et persiste les logs localement avec `AsyncStorage`.
        - Frontend : Ajout d'un écran visualiseur de logs applicatifs (`logs.tsx`) accessible via les Paramètres, permettant de filtrer, chercher, partager ou envoyer les logs au backend.
    - **Supervision & Observabilité (Prometheus, Loki, Tempo, Grafana)** :
        - Backend : Intégration de `prometheus-fastapi-instrumentator` pour générer des métriques sur le trafic HTTP `/metrics`.
        - Backend : Ajout de l'instrumentation OpenTelemetry (`telemetry.py`) pour exporter les traces distribuées vers Grafana Tempo via gRPC (port 4317).
        - Docker Compose : Ajout des services Prometheus (port 9090), Loki (port 3100), Promtail (port 9080) pour router les fichiers de logs vers Loki, Tempo (port 3200) et Grafana (port 3000).
        - Grafana : Pré-configuration des sources de données et création d'un tableau de bord d'observabilité (`healthiai-dashboard.json`) affichant les métriques, logs (backend et client frontend réunis), et permettant la recherche de traces d'exécution.
    - **Gestion de compte & Unités** :
        - Frontend : Masquage de l'accès aux logs sous la section compte (désormais activable uniquement via un geste secret : tapoter 5 fois sur l'avatar de profil).
        - Frontend : Rendu des boutons "Objectifs" et "Unités" de la section Paramètres entièrement fonctionnels via des Modals interactives de type bottom sheet.
        - Frontend : Prise en charge des unités de mesure préférées (kg/lbs pour le poids, cm/in pour la taille), avec persistance locale dans le store Zustand et conversions dynamiques (Dashboard, Profil, Historiques).
        - Frontend : Remplacement de l'édition de poids en ligne par une bottom sheet Modal. Liaison du clic sur la section "Historique de Poids" et sur "Modifier Poids" à l'ouverture de cette modal.
        - Mock & Persistance : Implémentation des historiques factices (historique de poids et historique de nutrition) et de leur persistance locale (AsyncStorage). Mise à jour dynamique de la progression quotidienne et de l'historique lors de la saisie d'un nouveau poids.
    - **Désactivation des mocks & Retrait de l'édition du poids** :
        - Configuration : Hardcodage de `USE_MOCK = false` dans `frontend/src/config/api.ts` pour désactiver définitivement le mode mock dans le code tout en conservant les fichiers sources de mocks.
        - UI/UX : Retrait du bouton "Modifier Poids" et désactivation du clic (onPress) sur la carte "Historique de Poids" dans `profile.tsx`. Suppression complète de la Modal d'édition de poids ainsi que de ses états et gestionnaires associés (`poidsVisible`, `weightInput`, `handleSave`).
    - **Correction du bug de routage OpenTelemetry & Prometheus (FastAPI 0.137.0+)** :
        - Résolution de l'erreur `TypeError: NetworkError when attempting to fetch resource` qui bloquait tous les appels API du frontend (connexions, historiques, scans de repas, téléversement des logs) vers le backend.
        - Le bug provenait d'une incompatibilité entre FastAPI 0.137.0+ et les packages d'instrumentation `opentelemetry-instrumentation-fastapi` et `prometheus-fastapi-instrumentator`. Le nouveau système de routage de FastAPI utilise des objets `_IncludedRouter` sur les sous-routeurs qui n'ont pas d'attribut `.path`, provoquant des plantages internes à chaque tentative de routage des requêtes.
        - Application de monkey-patches robustes pour `_get_route_details` d'OpenTelemetry et `_get_route_name` de Prometheus dans [telemetry.py](file:///Users/hugogalley/DEV/HealthIAi/backend/core/telemetry.py) pour gérer l'absence d'attribut `.path` et assurer un fallback fluide sans perturber le traçage et les métriques.
    - **Correction du bug d'upload de fichiers d'analyse de repas sur mobile natif** :
        - Résolution de l'erreur `TypeError: NetworkError when attempting to fetch resource` lors du scan de repas sur simulateurs et appareils natifs (iOS/Android).
        - Le bug venait de la détection de l'environnement Web dans `analyzeMeal` ([api.ts](file:///Users/hugogalley/DEV/HealthIAi/frontend/src/services/api.ts#L454-L466)) utilisant `typeof window !== 'undefined'`. Sous React Native (native), l'objet global `window` est défini, ce qui forçait l'application à exécuter la branche Web et à tenter de faire un `fetch()` sur une URI d'image locale (ce qui échoue systématiquement sur mobile natif).
        - Correction de la condition pour utiliser `Platform.OS === 'web'` afin d'adopter le bon format d'upload natif `FormData` sur iOS/Android.
    - **Sécurisation du retour arrière (Expo Router / Back Navigation)** :
        - Correction de l'erreur `The action 'GO_BACK' was not handled by any navigator` qui survenait lors d'un retour arrière (écrans scan, recherche, login, register, chargement IA) si l'utilisateur accédait à la page directement (rechargement de page ou lien profond) et que l'historique de navigation était vide.
        - Utilisation systématique de `router.canGoBack()` avant de faire `router.back()`, avec redirection de repli vers la page parente adéquate (`/(tabs)/nutrition`, `/(auth)/welcome`, `/(tabs)`).
    - **Mise à jour du poids et suppression du suivi calorique** :
        - Frontend : Suppression complète de la section "Historique Nutritionnel" (suivi calorique) sur l'écran Profil (`profile.tsx`).
        - Frontend : Restauration et liaison de la modification du poids (bottom sheet modal) accessible via le bouton "Modifier" ou en appuyant sur la carte "Historique de Poids".
        - Frontend/Store : Amélioration de l'action `updateWeight` dans `app.ts` pour enregistrer l'entrée de poids, gérer l'état de chargement (loader), mettre à jour le profil MySQL de l'utilisateur, exécuter l'ajustement du plan par l'IA et recharger les données à jour.
    - **Mise à niveau du modèle d'IA pour la génération de plans** :
        - Remplacement du modèle d'IA par défaut (`openai/gpt-oss-120b:free`), qui était excessivement lent (entre 60s et 90s par appel) et causait des timeouts réseau (`NetworkError`) lors de la sauvegarde.
        - Passage au modèle performant `"openai/gpt-4o-mini"` (par défaut ou configurable via `AI_MODEL`), ramenant le temps de génération et d'ajustement de plan de l'IA à seulement 6-7 secondes.
- **2026-06-22** :
    - **Écran de chargement IA sur le Profil** :
        - Intégration de la modal d'overlay plein écran `AILoader` sur la page de profil lors des modifications de poids ou d'objectifs pour remplacer le simple indicateur d'activité textuel (spinner).
        - Fournit une expérience utilisateur premium, immersive et cohérente avec l'animation de création de plan de l'onboarding (fonds colorés dynamiques, micro-animations et messages personnalisés).
    - **Restauration et amélioration du Dashboard Grafana** :
        - Fixation d'un UID stable (`d9f3a136-8548-4a76-8b09-24cf1e84c153`) dans la configuration de provisionnement pour correspondre aux URLs de suivi existantes et corriger les erreurs 404 de chargement.
        - Ajout de la persistance de l'état de Grafana via un volume nommé (`grafana_data`) dans `compose.yaml` pour éviter les pertes de données au redémarrage des conteneurs.
        - Extension du tableau de bord avec 3 nouveaux panels de suivi des ressources système du backend FastAPI (consommation CPU en temps réel, usage de la mémoire résidente et nombre de descripteurs de fichiers ouverts).
    - **Suivi de l'hydratation (Suivi d'eau)** :
        - Création d'un composant de modal réutilisable `WaterModal` ([water-modal.tsx](file:///Users/hugogalley/DEV/HealthIAi/frontend/src/components/water-modal.tsx)) permettant d'afficher la progression du jour, de proposer des presets rapides (verre 250ml, gourde 500ml, bouteille 750ml) et de saisir une quantité d'eau personnalisée.
        - Intégration dans le tableau de bord principal ([index.tsx](file:///Users/hugogalley/DEV/HealthIAi/frontend/src/app/(tabs)/index.tsx)) : le clic sur la carte "Hydratation" ouvre désormais cette modal au lieu d'ajouter 250ml par défaut.
        - Intégration dans l'onglet Nutrition ([nutrition.tsx](file:///Users/hugogalley/DEV/HealthIAi/frontend/src/app/(tabs)/nutrition.tsx)) : ajout d'une section dédiée à l'hydratation avec barre de progression interactive et bouton "Ajouter", et ajout d'un bouton d'action "Eau" dans la grille d'actions principales.



## Plan d'Action Courant
1. [x] Stabiliser le système de mémoire (GEMINI.md / MEMORY.md).
2. [x] Identifier et corriger le bug du "Journal de bord" de l'application.
3. [x] Implémenter la persistance locale (AsyncStorage) pour le mode mock.
4. [x] Implémenter un système de logging global (Frontend + Backend + Tunneling de logs).
5. [x] Mettre en place la supervision et observabilité (Docker Compose + Prometheus + Loki + Tempo + Grafana).
6. [x] Rendre la gestion de compte (Objectifs, Unités) fonctionnelle et masquer l'accès direct aux logs.

## Conventions
- Utiliser Vanilla CSS pour le web (si applicable).
- Suivre les docs Expo v55.0.0.

