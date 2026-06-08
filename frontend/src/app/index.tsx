import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';

import { Routes } from '@/navigation/routes';
import { getToken } from '@/services/token';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    getToken().then((token) => {
      if (token) {
        router.replace(Routes.Dashboard);
      } else {
        router.replace(Routes.Welcome);
      }
    });
  }, []);

  // Fond bleu pendant la vérification du token (seamless avec le splash)
  return <View style={{ flex: 1, backgroundColor: '#208AEF' }} />;
}
