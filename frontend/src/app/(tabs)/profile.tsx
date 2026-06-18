import { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/store/app';
import { removeToken } from '@/services/token';
import { Routes } from '@/navigation/routes';

export default function ProfileScreen() {
  const router = useRouter();
  const { userProfile, nutritionHistory, weightHistory, fetchHistoryAndProfile, updateUserProfileAndAdjustPlan, reset, loading } = useAppStore();
  
  const [editing, setEditing] = useState(false);
  const [weightInput, setWeightInput] = useState('');

  useEffect(() => {
    fetchHistoryAndProfile();
  }, []);

  useEffect(() => {
    if (userProfile && !editing) {
      setWeightInput(String(userProfile.weight_kg || ''));
    }
  }, [userProfile, editing]);

  async function handleLogout() {
    await removeToken();
    reset();
    router.replace(Routes.Welcome);
  }

  async function handleSave() {
    if (!userProfile) return;
    const newWeight = parseFloat(weightInput);
    if (isNaN(newWeight)) return;
    
    await updateUserProfileAndAdjustPlan({
      age: userProfile.age || 25,
      height: userProfile.height_cm || 175,
      weight: newWeight,
      sex: userProfile.sex?.toLowerCase() || 'other',
      goal: userProfile.goal === 'Weight Loss' ? 'weight_loss' : userProfile.goal === 'Muscle Gain' ? 'muscle_gain' : 'fitness',
      activityFrequency: userProfile.workouts_per_week || 3,
      activityType: 'mixed',
      activityLevel: 'moderate'
    });
    setEditing(false);
  }

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Profil</Text>
          
          <View style={styles.card}>
            <View style={styles.profileHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>H</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.userName}>Utilisateur</Text>
                {userProfile && (
                  <Text style={styles.userEmail}>{userProfile.goal} • {userProfile.fitness_level}</Text>
                )}
              </View>
              <TouchableOpacity onPress={() => setEditing(!editing)} style={styles.editBtn}>
                <Text style={styles.editBtnText}>{editing ? 'Annuler' : 'Modifier'}</Text>
              </TouchableOpacity>
            </View>

            {editing && (
              <View style={styles.editForm}>
                <Text style={styles.label}>Poids (kg)</Text>
                <TextInput 
                  style={styles.input}
                  value={weightInput}
                  onChangeText={setWeightInput}
                  keyboardType="numeric"
                />
                <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
                  {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Enregistrer & Ajuster Plan</Text>}
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Historique Poids */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Historique de Poids</Text>
            <View style={styles.card}>
              {weightHistory && weightHistory.length === 0 ? (
                <Text style={styles.emptyText}>Aucune donnée.</Text>
              ) : (
                weightHistory?.slice(-5).map((entry, i) => (
                  <View key={i} style={[styles.historyRow, i < weightHistory.length - 1 && styles.divider]}>
                    <Text style={styles.historyDate}>{entry.date}</Text>
                    <Text style={styles.historyValue}>{entry.weight_kg} kg</Text>
                  </View>
                ))
              )}
            </View>
          </View>

          {/* Historique Nutrition */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Historique Nutritionnel</Text>
            <View style={styles.card}>
              {nutritionHistory && nutritionHistory.length === 0 ? (
                <Text style={styles.emptyText}>Aucune donnée.</Text>
              ) : (
                nutritionHistory?.slice(-7).map((entry, i) => (
                  <View key={i} style={[styles.historyRow, i < nutritionHistory.length - 1 && styles.divider]}>
                    <Text style={styles.historyDate}>{entry.date}</Text>
                    <View style={styles.barContainer}>
                      <View style={[styles.barFill, { width: `${Math.min((entry.calories / 2500) * 100, 100)}%` }]} />
                    </View>
                    <Text style={styles.historyValue}>{entry.calories} kcal</Text>
                  </View>
                ))
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Paramètres</Text>
            <View style={styles.card}>
              <MenuButton label="Objectifs" icon="🎯" />
              <MenuButton label="Unités" icon="📏" divider={false} />
            </View>
          </View>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function MenuButton({ label, icon, divider = true }: any) {
  return (
    <TouchableOpacity style={[styles.menuBtn, divider && styles.divider]}>
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
  historyValue: { width: 70, fontSize: 15, fontWeight: '600', color: '#000', textAlign: 'right' },
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
});
