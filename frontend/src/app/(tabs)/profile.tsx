import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/store/app';
import { removeToken } from '@/services/token';
import { Routes } from '@/navigation/routes';

export default function ProfileScreen() {
  const router = useRouter();
  const { reset } = useAppStore();

  async function handleLogout() {
    await removeToken();
    reset();
    router.replace(Routes.Welcome);
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
              <View>
                <Text style={styles.userName}>Hugo Galley</Text>
                <Text style={styles.userEmail}>hugo@example.com</Text>
              </View>
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
