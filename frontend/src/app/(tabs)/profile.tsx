import { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput, ActivityIndicator, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/store/app';
import { removeToken } from '@/services/token';
import { Routes } from '@/navigation/routes';
import type { UserProfile, Goal, Sex, ActivityLevel } from '@/types/user';
import { AILoader } from '@/components/ai-loader';

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
    nutritionHistory, 
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
    <View style={styles.root}>
      <AILoader visible={loading} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Profil</Text>
          
          <View style={styles.card}>
            <View style={styles.profileHeader}>
              <TouchableOpacity style={styles.avatar} onPress={handleAvatarPress} activeOpacity={0.85}>
                <Text style={styles.avatarText}>H</Text>
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <Text style={styles.userName}>Utilisateur</Text>
                {userProfile && (
                  <Text style={styles.userEmail}>
                  {getGoalLabel(userProfile.goal)} • {getFitnessLabel(userProfile.fitness_level)}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Historique Poids */}
          <View style={styles.section}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.sectionTitle}>Historique de Poids</Text>
              <TouchableOpacity onPress={openWeight}>
                <Text style={{ color: '#007AFF', fontSize: 16, fontWeight: '600', marginRight: 4 }}>Modifier</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.card} onPress={openWeight} activeOpacity={0.7}>
              {weightHistory && weightHistory.length === 0 ? (
                <Text style={styles.emptyText}>Aucune donnée.</Text>
              ) : (
                weightHistory?.slice(-5).map((entry, i) => (
                  <View key={i} style={[styles.historyRow, i < weightHistory.length - 1 && styles.divider]}>
                    <Text style={styles.historyDate}>{entry.date}</Text>
                    <Text style={styles.historyValue}>
                      {weightUnit === 'lbs' 
                        ? `${Math.round(entry.weight_kg * 2.20462 * 10) / 10} lbs` 
                        : `${entry.weight_kg} kg`}
                    </Text>
                  </View>
                ))
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Paramètres</Text>
            <View style={styles.card}>
              <MenuButton label="Objectifs" icon="🎯" onPress={openObjectifs} />
              <MenuButton label="Unités" icon="📏" divider={isDevMode} onPress={() => setUnitsVisible(true)} />
              {isDevMode && (
                <MenuButton label="Logs de l'application" icon="📋" divider={false} onPress={() => router.push(Routes.Logs as any)} />
              )}
            </View>
          </View>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>



      {/* Modal Objectifs */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={objectifsVisible}
        onRequestClose={() => setObjectifsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Modifier les Objectifs</Text>
              <TouchableOpacity onPress={() => setObjectifsVisible(false)}>
                <Text style={styles.closeBtnText}>Fermer</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ gap: 20 }} showsVerticalScrollIndicator={false}>
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Objectif principal</Text>
                <View style={styles.chipRow}>
                  {(['weight_loss', 'muscle_gain', 'fitness'] as const).map((g) => (
                    <TouchableOpacity
                      key={g}
                      style={[styles.chip, selectedGoal === g && styles.chipActive]}
                      onPress={() => setSelectedGoal(g)}
                    >
                      <Text style={[styles.chipText, selectedGoal === g && styles.chipTextActive]}>
                        {g === 'weight_loss' ? 'Perte de poids' : g === 'muscle_gain' ? 'Prise de muscle' : 'Remise en forme'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Entraînements par semaine</Text>
                <View style={styles.chipRow}>
                  {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                    <TouchableOpacity
                      key={num}
                      style={[styles.chip, workoutsFreq === num && styles.chipActive, { minWidth: 40, alignItems: 'center' }]}
                      onPress={() => setWorkoutsFreq(num)}
                    >
                      <Text style={[styles.chipText, workoutsFreq === num && styles.chipTextActive]}>
                        {num}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Âge (ans)</Text>
                <TextInput
                  style={styles.modalInput}
                  value={String(userAge || '')}
                  onChangeText={(val) => setUserAge(parseInt(val) || 0)}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Taille ({heightUnit})</Text>
                <TextInput
                  style={styles.modalInput}
                  value={String(userHeight || '')}
                  onChangeText={(val) => setUserHeight(parseFloat(val) || 0)}
                  keyboardType="numeric"
                />
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveObjectifs} disabled={loading}>
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Enregistrer & Réajuster Plan</Text>}
              </TouchableOpacity>
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Unités de Mesure</Text>
              <TouchableOpacity onPress={() => setUnitsVisible(false)}>
                <Text style={styles.closeBtnText}>Fermer</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ gap: 24 }} showsVerticalScrollIndicator={false}>
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Unité de poids</Text>
                <View style={styles.chipRow}>
                  <TouchableOpacity
                    style={[styles.chip, weightUnit === 'kg' && styles.chipActive]}
                    onPress={() => setWeightUnit('kg')}
                  >
                    <Text style={[styles.chipText, weightUnit === 'kg' && styles.chipTextActive]}>
                      Kilogrammes (kg)
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.chip, weightUnit === 'lbs' && styles.chipActive]}
                    onPress={() => setWeightUnit('lbs')}
                  >
                    <Text style={[styles.chipText, weightUnit === 'lbs' && styles.chipTextActive]}>
                      Livres (lbs)
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Unité de taille</Text>
                <View style={styles.chipRow}>
                  <TouchableOpacity
                    style={[styles.chip, heightUnit === 'cm' && styles.chipActive]}
                    onPress={() => setHeightUnit('cm')}
                  >
                    <Text style={[styles.chipText, heightUnit === 'cm' && styles.chipTextActive]}>
                      Centimètres (cm)
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.chip, heightUnit === 'in' && styles.chipActive]}
                    onPress={() => setHeightUnit('in')}
                  >
                    <Text style={[styles.chipText, heightUnit === 'in' && styles.chipTextActive]}>
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Mettre à jour le poids</Text>
              <TouchableOpacity onPress={() => setWeightVisible(false)}>
                <Text style={styles.closeBtnText}>Fermer</Text>
              </TouchableOpacity>
            </View>

            <View style={{ gap: 20 }}>
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Poids actuel ({weightUnit})</Text>
                <TextInput
                  style={styles.modalInput}
                  value={weightInput}
                  onChangeText={setWeightInput}
                  keyboardType="numeric"
                  placeholder={`Ex: ${weightUnit === 'lbs' ? '150' : '70'}`}
                />
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveWeight} disabled={loading}>
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Enregistrer</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function MenuButton({ label, icon, divider = true, onPress }: any) {
  return (
    <TouchableOpacity style={[styles.menuBtn, divider && styles.divider]} onPress={onPress}>
      <View style={styles.rowBetween}>
        <View style={styles.menuLabelRow}>
          <Text style={styles.menuIcon}>{icon}</Text>
          <Text style={styles.menuLabel}>{label}</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F2F2F7' },
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingBottom: 40, gap: 24 },
  title: { fontSize: 34, fontWeight: '800', color: '#000', marginTop: 10 },
  section: { gap: 10 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#000', marginLeft: 4 },
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  
  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#007AFF', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 24, fontWeight: '700', color: '#FFF' },
  userName: { fontSize: 20, fontWeight: '700', color: '#000' },
  userEmail: { fontSize: 15, color: '#8E8E93' },
  editBtn: { backgroundColor: '#F2F2F7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  editBtnText: { color: '#007AFF', fontSize: 14, fontWeight: '600' },

  editForm: { marginTop: 16, gap: 12, borderTopWidth: 1, borderTopColor: '#E5E5EA', paddingTop: 16 },
  label: { fontSize: 15, fontWeight: '500', color: '#000' },
  input: { backgroundColor: '#F2F2F7', borderRadius: 8, paddingHorizontal: 12, height: 44, fontSize: 16 },
  saveBtn: { backgroundColor: '#34C759', borderRadius: 8, height: 44, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '600' },

  historyRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  historyDate: { width: 90, fontSize: 14, color: '#8E8E93' },
  historyValue: { width: 90, fontSize: 15, fontWeight: '600', color: '#000', textAlign: 'right' },
  barContainer: { flex: 1, height: 6, backgroundColor: '#F2F2F7', borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#FF9500' },
  emptyText: { textAlign: 'center', color: '#8E8E93', fontSize: 15, paddingVertical: 10 },

  menuBtn: { paddingVertical: 12 },
  divider: { borderBottomWidth: 0.5, borderBottomColor: '#E5E5EA' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  menuLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuIcon: { fontSize: 20 },
  menuLabel: { fontSize: 17, fontWeight: '500', color: '#000' },
  chevron: { fontSize: 20, color: '#C7C7CC' },
  logoutBtn: { marginTop: 20, paddingVertical: 12, alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12 },
  logoutText: { color: '#FF3B30', fontSize: 17, fontWeight: '600' },

  // Modals Styling
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  closeBtnText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  modalSection: {
    marginBottom: 20,
    gap: 8,
  },
  modalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  chipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  chipText: {
    fontSize: 14,
    color: '#3A3A3C',
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  modalInput: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 16,
    marginTop: 4,
  },
});
