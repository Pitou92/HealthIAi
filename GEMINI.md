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

## Plan d'Action Courant
1. [x] Stabiliser le système de mémoire (GEMINI.md / MEMORY.md).
2. [x] Identifier et corriger le bug du "Journal de bord" de l'application.
3. [x] Implémenter la persistance locale (AsyncStorage) pour le mode mock.
4. [ ] Poursuivre le développement selon les directives précédentes.

## Conventions
- Utiliser Vanilla CSS pour le web (si applicable).
- Suivre les docs Expo v55.0.0.
