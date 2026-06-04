import { Redirect } from 'expo-router';

import { Routes } from '@/navigation/routes';

export default function Index() {
  // TODO Sprint 4 : vérifier le token AsyncStorage → rediriger vers Dashboard si connecté
  return <Redirect href={Routes.Welcome} />;
}
