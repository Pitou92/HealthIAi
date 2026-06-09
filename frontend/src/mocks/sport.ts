export const mockSport = {
  weeklyPlan: [
    {
      day: 'Lundi',
      type: 'Cardio',
      duration: 45,
      intensity: 'Modérée',
      exercises: ['Course 20 min', 'Vélo 15 min', 'Corde à sauter 10 min'],
    },
    {
      day: 'Mercredi',
      type: 'Musculation',
      duration: 60,
      intensity: 'Élevée',
      exercises: ['Squats 4×12', 'Pompes 3×15', 'Tractions 3×8', 'Gainage 3×45s'],
    },
    {
      day: 'Vendredi',
      type: 'Yoga',
      duration: 30,
      intensity: 'Légère',
      exercises: ['Salutation au soleil', 'Posture du guerrier', 'Étirements'],
    },
  ],
  tips: [
    'Échauffez-vous 5-10 min avant chaque séance',
    "Hydratez-vous pendant l'effort",
    'Récupérez au moins 48h entre les séances intenses',
    'Dormez suffisamment pour optimiser la récupération musculaire',
  ],
};

export type SportSession = (typeof mockSport.weeklyPlan)[number];
export type MockSport = typeof mockSport;
