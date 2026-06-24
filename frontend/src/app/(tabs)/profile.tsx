import { useState, useEffect } from 'react';
import { ScrollView, TouchableOpacity, View, TextInput, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/store/app';
import { removeToken } from '@/services/token';
import { Routes } from '@/navigation/routes';
import type { UserProfile, Goal, Sex, ActivityLevel } from '@/types/user';
import { AILoader } from '@/components/ai-loader';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { SymbolView } from 'expo-symbols';
import { Colors } from '@/constants/theme';
import { useAppColorScheme } from '@/hooks/use-app-color-scheme';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Button } from '@/components/ui/button';

// Mapper to normalize backend profile structure to frontend UserProfile
function getFrontendProfile(profile: any): UserProfile {
  if (!profile) {
    return {
      age: 25,
      height: 175,
      weight: 70,
      sex: 'male',
      goal: 'fitness',
      activityFrequency: 3,
      activityType: 'mixed',
      activityLevel: 'moderate'
    };
  }

  let goal: Goal = 'fitness';
  const g = String(profile.goal || '').toLowerCase();
  if (g.includes('loss') || g.includes('perte') || g === 'weight_loss') {
    goal = 'weight_loss';
  } else if (g.includes('gain') || g.includes('prise') || g === 'muscle_gain') {
    goal = 'muscle_gain';
  }

  let sex: Sex = 'other';
  const s = String(profile.sex || '').toLowerCase();
  if (s === 'male' || s === 'homme') sex = 'male';
  else if (s === 'female' || s === 'femme') sex = 'female';

  let activityLevel: ActivityLevel = 'moderate';
  const fl = String(profile.fitness_level || '').toLowerCase();
  if (fl === 'beginner' || fl === 'débutant') activityLevel = 'sedentary';
  else if (fl === 'intermediate' || fl === 'intermédiaire') activityLevel = 'light';
  else if (fl === 'advanced' || fl === 'avancé') activityLevel = 'moderate';
  else if (fl === 'expert') activityLevel = 'intense';

  return {
    age: profile.age ?? 25,
    height: profile.height_cm ?? 175,
    weight: profile.weight_kg ?? 70,
    sex,
    goal,
    activityFrequency: profile.workouts_per_week ?? 3,
    activityType: 'mixed',
    activityLevel
  };
}

export default function ProfileScreen() {
  const router = useRouter();
  const { 
    userProfile, 
    weightHistory, 
    fetchHistoryAndProfile, 
    updateUserProfileAndAdjustPlan, 
    updateWeight,
    reset, 
    loading,
    weightUnit,
    heightUnit,
    setWeightUnit,
    setHeightUnit
  } = useAppStore();

  const { isDark } = useAppColorScheme();

  // Modals visibility
  const [objectifsVisible, setObjectifsVisible] = useState(false);
  const [unitsVisible, setUnitsVisible] = useState(false);
  const [weightVisible, setWeightVisible] = useState(false);
  const [weightInput, setWeightInput] = useState('');

  // Objectifs modal state
  const [selectedGoal, setSelectedGoal] = useState<'weight_loss' | 'muscle_gain' | 'fitness'>('fitness');
  const [workoutsFreq, setWorkoutsFreq] = useState(3);
  const [userAge, setUserAge] = useState(25);
  const [userHeight, setUserHeight] = useState(175);

  // Dev mode (Easter egg: click avatar 5 times to reveal logs button)
  const [devClicks, setDevClicks] = useState(0);
  const [isDevMode, setIsDevMode] = useState(false);

  useEffect(() => {
    fetchHistoryAndProfile();
  }, [fetchHistoryAndProfile]);

  async function handleLogout() {
    await removeToken();
    reset();
    router.replace(Routes.Welcome);
  }

  const openWeight = () => {
    const feProfile = getFrontendProfile(userProfile);
    let currentWeight = feProfile.weight;
    if (weightHistory && weightHistory.length > 0) {
      currentWeight = weightHistory[weightHistory.length - 1].weight_kg;
    }
    const displayWeight = weightUnit === 'lbs'
      ? Math.round(currentWeight * 2.20462 * 10) / 10
      : currentWeight;
    setWeightInput(String(displayWeight));
    setWeightVisible(true);
  };

  const handleSaveWeight = async () => {
    let weightVal = parseFloat(weightInput);
    if (isNaN(weightVal) || weightVal <= 0) {
      Alert.alert("Erreur", "Veuillez entrer un poids valide.");
      return;
    }
    if (weightUnit === 'lbs') {
      weightVal = weightVal / 2.20462;
    }
    await updateWeight(weightVal);
    setWeightVisible(false);
  };

  const openObjectifs = () => {
    if (!userProfile) return;
    const feProfile = getFrontendProfile(userProfile);
    setSelectedGoal(feProfile.goal);
    setWorkoutsFreq(feProfile.activityFrequency);
    setUserAge(feProfile.age);
    
    const displayHeight = heightUnit === 'in'
      ? Math.round(feProfile.height * 0.393701 * 10) / 10
      : feProfile.height;
    setUserHeight(displayHeight);
    
    setObjectifsVisible(true);
  };

  const handleSaveObjectifs = async () => {
    if (!userProfile) return;
    const feProfile = getFrontendProfile(userProfile);
    
    let finalHeight = parseFloat(String(userHeight));
    if (isNaN(finalHeight)) {
      finalHeight = feProfile.height;
    } else if (heightUnit === 'in') {
      finalHeight = finalHeight / 0.393701;
    }

    const ageNum = parseInt(String(userAge));

    await updateUserProfileAndAdjustPlan({
      ...feProfile,
      goal: selectedGoal,
      activityFrequency: workoutsFreq,
      age: isNaN(ageNum) ? feProfile.age : ageNum,
      height: finalHeight,
    });
    setObjectifsVisible(false);
  };

  const handleAvatarPress = () => {
    setDevClicks((prev) => {
      const next = prev + 1;
      if (next >= 5) {
        setIsDevMode(true);
        Alert.alert("Mode Développeur Activé", "Vous pouvez maintenant accéder aux logs de l'application sous les Paramètres.");
        return 0;
      }
      return next;
    });
  };

  const getGoalLabel = (goalStr: string) => {
    const g = String(goalStr).toLowerCase();
    if (g.includes('loss') || g.includes('perte') || g === 'weight_loss') return 'Perte de poids';
    if (g.includes('gain') || g.includes('prise') || g === 'muscle_gain') return 'Prise de muscle';
    return 'Remise en forme';
  };

  const getFitnessLabel = (flStr: string) => {
    const fl = String(flStr).toLowerCase();
    if (fl === 'beginner' || fl === 'débutant') return 'Débutant';
    if (fl === 'intermediate' || fl === 'intermédiaire') return 'Intermédiaire';
    if (fl === 'advanced' || fl === 'avancé') return 'Avancé';
    if (fl === 'expert') return 'Expert';
    return flStr || 'Intermédiaire';
  };

  return (
    <View className="flex-1 bg-background">
      <AILoader visible={loading} />
      <SafeAreaView className="flex-1" edges={['top']}>
        <ScrollView contentContainerClassName="px-5 pb-10 gap-6" showsVerticalScrollIndicator={false}>
          <Text variant="h1" className="mt-2">Profil</Text>

          {/* Avatar card with dev clicks */}
          <Card className="p-4 border-none bg-secondary/10 flex-row items-center gap-4">
            <TouchableOpacity className="w-16 h-16 rounded-full bg-primary items-center justify-center" onPress={handleAvatarPress} activeOpacity={0.85}>
              <Text className="text-2xl font-bold text-primary-foreground">H</Text>
            </TouchableOpacity>
            <View>
              <Text variant="h3">Mon Compte</Text>
              {userProfile ? (
                <Text variant="muted">
                  {getGoalLabel(userProfile.goal)} • {getFitnessLabel(userProfile.fitness_level)}
                </Text>
              ) : (
                <Text variant="muted">Chargement...</Text>
              )}
            </View>
          </Card>

          {/* Theme card */}
          <View className="gap-3">
            <Text variant="large">Apparence</Text>
            <Card className="p-4 border-none flex-row justify-between items-center">
              <View className="flex-row items-center gap-3">
                <SymbolView 
                  name={{ ios: 'paintpalette.fill', android: 'palette', web: 'palette' } as any} 
                  size={20} 
                  tintColor={isDark ? Colors.dark.foreground : Colors.light.foreground} 
                />
                <Text className="font-medium text-base">Thème de l'application</Text>
              </View>
              <ThemeToggle />
            </Card>
          </View>

          {/* Historique Poids */}
          <View className="gap-3">
            <View className="flex-row justify-between items-center px-1">
              <Text variant="large">Historique de Poids</Text>
              <TouchableOpacity onPress={openWeight}>
                <Text className="text-primary font-semibold text-base">Modifier</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={openWeight} activeOpacity={0.7}>
              <Card className="p-4 gap-2 border-none">
                {weightHistory && weightHistory.length === 0 ? (
                  <Text variant="muted" className="text-center py-4">Aucune donnée.</Text>
                ) : (
                  weightHistory?.slice(-5).map((entry, i) => (
                    <View key={i} className={`flex-row justify-between items-center py-2 ${i < weightHistory.length - 1 ? 'border-b border-border' : ''}`}>
                      <Text variant="muted" className="text-sm">{entry.date}</Text>
                      <Text className="font-bold text-base">
                        {weightUnit === 'lbs' 
                          ? `${Math.round(entry.weight_kg * 2.20462 * 10) / 10} lbs` 
                          : `${entry.weight_kg} kg`}
                      </Text>
                    </View>
                  ))
                )}
              </Card>
            </TouchableOpacity>
          </View>

          {/* Paramètres */}
          <View className="gap-3">
            <Text variant="large">Paramètres</Text>
            <Card className="p-0 overflow-hidden border-none">
              <MenuButton label="Objectifs" icon="🎯" divider={true} onPress={openObjectifs} />
              <MenuButton label="Unités" icon="📏" divider={isDevMode} onPress={() => setUnitsVisible(true)} />
              {isDevMode && (
                <MenuButton label="Logs de l'application" icon="📋" divider={false} onPress={() => router.push(Routes.Logs as any)} />
              )}
            </Card>
          </View>

          <Button 
            variant="destructive" 
            label="Se déconnecter" 
            onPress={handleLogout}
            className="mt-4"
          />
        </ScrollView>
      </SafeAreaView>

      {/* Modal Objectifs */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={objectifsVisible}
        onRequestClose={() => setObjectifsVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className={`rounded-t-[32px] p-6 pb-10 max-h-[90%] ${isDark ? 'bg-card border-t border-border' : 'bg-white'}`}>
            <View className="flex-row justify-between items-center mb-6">
              <Text variant="h2">Modifier les Objectifs</Text>
              <TouchableOpacity onPress={() => setObjectifsVisible(false)}>
                <Text className="text-primary font-semibold text-base">Fermer</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerClassName="gap-6" showsVerticalScrollIndicator={false}>
              <View className="gap-2">
                <Text className="font-semibold text-foreground">Objectif principal</Text>
                <View className="flex-row gap-2 flex-wrap">
                  {(['weight_loss', 'muscle_gain', 'fitness'] as const).map((g) => {
                    const active = selectedGoal === g;
                    return (
                      <TouchableOpacity
                        key={g}
                        activeOpacity={0.7}
                        className={`rounded-xl px-4 py-2 border ${active ? 'bg-primary/10 border-primary' : 'bg-background border-border'}`}
                        onPress={() => setSelectedGoal(g)}
                      >
                        <Text className={`font-semibold ${active ? 'text-primary' : 'text-muted-foreground'}`}>
                          {g === 'weight_loss' ? 'Perte de poids' : g === 'muscle_gain' ? 'Prise de muscle' : 'Remise en forme'}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View className="gap-2">
                <Text className="font-semibold text-foreground">Entraînements par semaine</Text>
                <View className="flex-row gap-2 flex-wrap">
                  {[1, 2, 3, 4, 5, 6, 7].map((num) => {
                    const active = workoutsFreq === num;
                    return (
                      <TouchableOpacity
                        key={num}
                        activeOpacity={0.7}
                        className={`rounded-xl w-10 h-10 items-center justify-center border ${active ? 'bg-primary/10 border-primary' : 'bg-background border-border'}`}
                        onPress={() => setWorkoutsFreq(num)}
                      >
                        <Text className={`font-semibold ${active ? 'text-primary' : 'text-muted-foreground'}`}>
                          {num}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View className="gap-2">
                <Text className="font-semibold text-foreground">Âge (ans)</Text>
                <TextInput
                  className={`rounded-xl px-4 py-3 border text-foreground ${isDark ? 'bg-background border-border' : 'bg-gray-100 border-transparent'}`}
                  value={String(userAge || '')}
                  onChangeText={(val) => setUserAge(parseInt(val) || 0)}
                  keyboardType="numeric"
                  placeholderTextColor={isDark ? '#4B5563' : '#9CA3AF'}
                />
              </View>

              <View className="gap-2">
                <Text className="font-semibold text-foreground">Taille ({heightUnit})</Text>
                <TextInput
                  className={`rounded-xl px-4 py-3 border text-foreground ${isDark ? 'bg-background border-border' : 'bg-gray-100 border-transparent'}`}
                  value={String(userHeight || '')}
                  onChangeText={(val) => setUserHeight(parseFloat(val) || 0)}
                  keyboardType="numeric"
                  placeholderTextColor={isDark ? '#4B5563' : '#9CA3AF'}
                />
              </View>

              <Button 
                label="Enregistrer & Réajuster Plan" 
                size="lg"
                onPress={handleSaveObjectifs} 
                disabled={loading} 
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal Unités */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={unitsVisible}
        onRequestClose={() => setUnitsVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className={`rounded-t-[32px] p-6 pb-10 max-h-[90%] ${isDark ? 'bg-card border-t border-border' : 'bg-white'}`}>
            <View className="flex-row justify-between items-center mb-6">
              <Text variant="h2">Unités de Mesure</Text>
              <TouchableOpacity onPress={() => setUnitsVisible(false)}>
                <Text className="text-primary font-semibold text-base">Fermer</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerClassName="gap-6" showsVerticalScrollIndicator={false}>
              <View className="gap-2">
                <Text className="font-semibold text-foreground">Unité de poids</Text>
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    activeOpacity={0.7}
                    className={`flex-1 rounded-xl py-3 items-center border ${weightUnit === 'kg' ? 'bg-primary/10 border-primary' : 'bg-background border-border'}`}
                    onPress={() => setWeightUnit('kg')}
                  >
                    <Text className={`font-semibold ${weightUnit === 'kg' ? 'text-primary' : 'text-muted-foreground'}`}>
                      Kilogrammes (kg)
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    className={`flex-1 rounded-xl py-3 items-center border ${weightUnit === 'lbs' ? 'bg-primary/10 border-primary' : 'bg-background border-border'}`}
                    onPress={() => setWeightUnit('lbs')}
                  >
                    <Text className={`font-semibold ${weightUnit === 'lbs' ? 'text-primary' : 'text-muted-foreground'}`}>
                      Livres (lbs)
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View className="gap-2">
                <Text className="font-semibold text-foreground">Unité de taille</Text>
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    activeOpacity={0.7}
                    className={`flex-1 rounded-xl py-3 items-center border ${heightUnit === 'cm' ? 'bg-primary/10 border-primary' : 'bg-background border-border'}`}
                    onPress={() => setHeightUnit('cm')}
                  >
                    <Text className={`font-semibold ${heightUnit === 'cm' ? 'text-primary' : 'text-muted-foreground'}`}>
                      Centimètres (cm)
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    className={`flex-1 rounded-xl py-3 items-center border ${heightUnit === 'in' ? 'bg-primary/10 border-primary' : 'bg-background border-border'}`}
                    onPress={() => setHeightUnit('in')}
                  >
                    <Text className={`font-semibold ${heightUnit === 'in' ? 'text-primary' : 'text-muted-foreground'}`}>
                      Pouces (in)
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal Poids */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={weightVisible}
        onRequestClose={() => setWeightVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className={`rounded-t-[32px] p-6 pb-10 max-h-[90%] ${isDark ? 'bg-card border-t border-border' : 'bg-white'}`}>
            <View className="flex-row justify-between items-center mb-6">
              <Text variant="h2">Mettre à jour le poids</Text>
              <TouchableOpacity onPress={() => setWeightVisible(false)}>
                <Text className="text-primary font-semibold text-base">Fermer</Text>
              </TouchableOpacity>
            </View>

            <View className="gap-6">
              <View className="gap-2">
                <Text className="font-semibold text-foreground">Poids actuel ({weightUnit})</Text>
                <TextInput
                  className={`rounded-xl px-4 py-3 border text-foreground ${isDark ? 'bg-background border-border' : 'bg-gray-100 border-transparent'}`}
                  value={weightInput}
                  onChangeText={setWeightInput}
                  keyboardType="numeric"
                  placeholder={`Ex: ${weightUnit === 'lbs' ? '150' : '70'}`}
                  placeholderTextColor={isDark ? '#4B5563' : '#9CA3AF'}
                />
              </View>

              <Button 
                label="Enregistrer" 
                size="lg"
                onPress={handleSaveWeight} 
                disabled={loading} 
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function MenuButton({ label, icon, divider = true, onPress }: any) {
  return (
    <TouchableOpacity activeOpacity={0.7} className={`p-4 flex-row justify-between items-center ${divider ? 'border-b border-border' : ''}`} onPress={onPress}>
      <View className="flex-row items-center gap-3">
        <Text className="text-xl">{icon}</Text>
        <Text className="font-medium text-base">{label}</Text>
      </View>
      <Text variant="muted" className="text-xl">›</Text>
    </TouchableOpacity>
  );
}
