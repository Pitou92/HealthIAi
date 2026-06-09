export const mockNutrition = {
  meals: [
    {
      id: '1',
      name: 'Petit-déjeuner',
      time: '07:30',
      calories: 420,
      proteins: 28,
      carbs: 52,
      fats: 14,
      items: ["Flocons d'avoine", 'Banane', 'Lait végétal', 'Myrtilles'],
    },
    {
      id: '2',
      name: 'Déjeuner',
      time: '12:30',
      calories: 580,
      proteins: 42,
      carbs: 68,
      fats: 18,
      items: ['Poulet grillé', 'Riz complet', 'Brocolis', "Huile d'olive"],
    },
    {
      id: '3',
      name: 'Collation',
      time: '16:00',
      calories: 180,
      proteins: 15,
      carbs: 22,
      fats: 5,
      items: ['Yaourt grec', 'Amandes', 'Pomme'],
    },
    {
      id: '4',
      name: 'Dîner',
      time: '19:30',
      calories: 520,
      proteins: 38,
      carbs: 48,
      fats: 22,
      items: ['Saumon', 'Patate douce', 'Épinards', 'Citron'],
    },
  ],
  tips: [
    "Buvez 2L d'eau par jour",
    'Privilégiez les protéines au petit-déjeuner',
    'Évitez les sucres rapides après 18h',
    'Mangez lentement pour mieux ressentir la satiété',
  ],
};

export type NutritionMeal = (typeof mockNutrition.meals)[number];
export type MockNutrition = typeof mockNutrition;
