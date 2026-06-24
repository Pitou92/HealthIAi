# Redesign Complet HealthIAi — Dark Élégant Minimaliste

## Contexte & Problème

L'interface actuelle souffre de **deux problèmes majeurs d'incohérence** :

1. **Double personnalité visuelle** : Les écrans auth/onboarding utilisent le thème dark (`SP.bg: #111827`, accents verts) tandis que les écrans tabs utilisent un thème iOS clair (`#F2F2F7` fond, `#FFF` cards, `#000` texte). Le résultat est une app qui change complètement de style après la connexion.
2. **Approche de styling chaotique** : Mélange de `StyleSheet.create()` avec des couleurs hardcodées, classes NativeWind/Tailwind (`className="flex-1 bg-bg"`), et constantes thème (`SP`) — parfois dans le même fichier.
3. **Bug existant** : `Text` et `StyleSheet` ne sont pas importés dans `index.tsx`.

## Décisions Validées

1. **Librairie de charts** : Utilisation de `victory-native` (avec `@shopify/react-native-skia`).
2. **Design System** : Utilisation de `react-native-reusables` (shadcn/ui pour RN) et ajout de ses dépendances.
3. **Périmètre** : L'écran de scan de nutrition (`nutrition/scan.tsx`) est inclus dans ce redesign.
4. **Données Profil** : Suppression des mocks hardcodés ("Hugo Galley"). Les données proviendront du store/backend.

---

## Proposed Changes (Plan d'Implémentation)

L'implémentation suit cette stratégie : **Design System → Composants → Écrans** (du plus fondamental au plus spécifique).

### Phase 1 : Fondations — Design System & Dépendances

**Dépendances à installer :**
```bash
npm install @rn-primitives/slot @rn-primitives/types class-variance-authority clsx tailwind-merge
npm install victory-native @shopify/react-native-skia
npm install @expo-google-fonts/inter expo-font
```

**Fichiers modifiés :**
- `tailwind.config.js` : Refonte complète du design system Tailwind (Palette dark élégante zinc-950, accents verts, palette light, spacing, radius).
- `src/constants/theme.ts` : Refonte pour exposer les tokens dark/light et helper `useThemeColors()`.
- `src/global.css` : Ajout des variables CSS pour le theming et les animations.
- `src/lib/utils.ts` : [NOUVEAU] Utilitaire `cn()` (classnames merge).

### Phase 2 : Composants UI — Style shadcn/ui

Amélioration des composants existants dans `src/components/ui/` avec le style shadcn (utilisation de NativeWind) :

- **Composants existants mis à jour** : `card.tsx` (glassmorphism subtil), `badge.tsx`, `progress.tsx` (animation fluide), `text.tsx` (font Inter), `separator.tsx`.
- **Nouveaux composants** :
  - `button.tsx` : Variantes shadcn, micro-animation press.
  - `input.tsx` : Focus ring animé.
  - `circular-progress.tsx` : SVG animé avec Reanimated.
  - `streak-badge.tsx` : Badge gamification.
  - `theme-toggle.tsx` : Switch dark/light.

### Phase 3 : Écrans Tabs (Priorité #1)

- **(tabs)/_layout.tsx** : Tab bar avec le nouveau thème et icônes animées.
- **(tabs)/index.tsx (Dashboard)** : 
  - 2 cartes avec `CircularProgress` (Calories, Hydratation).
  - Barres de macros.
  - Badge de streak.
  - Card Physique avec mini-chart `victory-native`.
- **(tabs)/nutrition.tsx (Nutrition)** :
  - Scan CTA redesigné.
  - 3 CircularProgress pour les macros du jour.
  - Cards individuelles pour le journal de bord.
- **nutrition/scan.tsx (Scan)** :
  - Redesign du stepper d'analyse.
  - Amélioration de l'UI de la caméra/upload et de la présentation des résultats.
- **(tabs)/sport.tsx (Sport)** :
  - Jour actuel mis en avant.
  - Cards individuelles par jour avec badges d'intensité.
- **(tabs)/profile.tsx (Profil)** :
  - Suppression des mocks hardcodés (récupération user via `useAppStore`).
  - Avatar stylisé, menu de paramètres avec theme toggle.

### Phase 4 : Écrans Auth & Onboarding

Alignement complet sur le nouveau design system (remplacement des anciens `SP` et composants par les nouveaux composants shadcn) :
- `(auth)/welcome.tsx`, `(auth)/login.tsx`, `(auth)/register.tsx`
- `(onboarding)/step1.tsx`, `(onboarding)/step2.tsx`, `(onboarding)/step3.tsx`

### Phase 5 : Dark/Light Mode

- Création de `src/hooks/use-app-color-scheme.ts` (persistance via AsyncStorage).
- Modification de `_layout.tsx` (root) pour wrapper l'app avec un `ThemeProvider`.

---

## Verification Plan

1. **Automated Tests** : S'assurer que `npx jest` passe toujours.
2. **Manual Verification** : 
   - Vérifier la cohérence visuelle sur tous les écrans.
   - Tester le toggle Dark/Light et sa persistance.
   - Valider les animations (charts, progress, transitions).
   - Vérifier l'intégration fonctionnelle sans régression (authentification, formulaires, scan).
