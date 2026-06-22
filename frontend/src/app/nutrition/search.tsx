import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { searchFood, saveNutritionLog, type FoodItemSearchResult } from '@/services/api';
import { useAppStore } from '@/store/app';

export default function SearchScreen() {
  const router = useRouter();

  function safeGoBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/nutrition');
    }
  }
  const { userId, fetchProgress } = useAppStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodItemSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch() {
    if (query.length < 2) return;
    setLoading(true);
    setError(null);
    try {
      const data = await searchFood(query);
      setResults(data);
    } catch (e) {
      setError("Erreur lors de la recherche.");
    } finally {
      setLoading(false);
    }
  }

  async function logFood(food: FoodItemSearchResult) {
    if (!userId) return;
    setLoading(true);
    try {
      // Assuming 100g portion for simplicity in this MVP
      await saveNutritionLog({
        user_id: userId,
        name: food.name,
        calories: food.calories_100g,
        protein_g: food.protein_100g,
        carbs_g: food.carbs_100g,
        fat_g: food.fat_100g,
        items: [`${food.name} (100g)`]
      });
      await fetchProgress(userId);
      safeGoBack();
    } catch (e) {
      setError("Impossible d'ajouter l'aliment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={safeGoBack} style={styles.backBtn}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Rechercher</Text>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nom de l'aliment..."
            placeholderTextColor="#8E8E93"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoFocus
          />
          <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
            <Text style={styles.searchBtnText}>🔍</Text>
          </TouchableOpacity>
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        {loading ? (
          <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.card} onPress={() => logFood(item)}>
                <View style={styles.rowBetween}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.foodName}>{item.name}</Text>
                    <Text style={styles.foodBrand}>{item.brand || 'Générique'} • 100g</Text>
                  </View>
                  <Text style={styles.foodKcal}>{Math.round(item.calories_100g)} kcal</Text>
                </View>
                <View style={styles.macroRow}>
                  <Text style={styles.macroText}>P: {item.protein_100g}g</Text>
                  <Text style={styles.macroText}>G: {item.carbs_100g}g</Text>
                  <Text style={styles.macroText}>L: {item.fat_100g}g</Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              query.length >= 2 && !loading && results.length === 0 ? (
                <Text style={styles.emptyText}>{`Aucun résultat pour "${query}".`}</Text>
              ) : null
            }
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F2F2F7' },
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10, gap: 16 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E5E5EA', borderRadius: 20 },
  backIcon: { fontSize: 24, fontWeight: '500', color: '#000', lineHeight: 28 },
  title: { fontSize: 24, fontWeight: '800', color: '#000' },
  
  searchContainer: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 16 },
  input: { 
    flex: 1, backgroundColor: '#FFF', height: 50, borderRadius: 12, paddingHorizontal: 16,
    fontSize: 16, color: '#000', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2
  },
  searchBtn: { 
    width: 50, height: 50, backgroundColor: '#007AFF', borderRadius: 12, 
    alignItems: 'center', justifyContent: 'center' 
  },
  searchBtnText: { fontSize: 20 },

  errorText: { color: '#FF3B30', textAlign: 'center', marginHorizontal: 20, marginBottom: 16 },
  emptyText: { textAlign: 'center', color: '#8E8E93', marginTop: 40, fontSize: 16 },

  list: { paddingHorizontal: 20, paddingBottom: 40, gap: 12 },
  card: { 
    backgroundColor: '#FFF', borderRadius: 12, padding: 16, gap: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 16 },
  foodName: { fontSize: 16, fontWeight: '600', color: '#000' },
  foodBrand: { fontSize: 13, color: '#8E8E93', marginTop: 2 },
  foodKcal: { fontSize: 16, fontWeight: '700', color: '#007AFF' },
  macroRow: { flexDirection: 'row', gap: 12 },
  macroText: { fontSize: 13, color: '#8E8E93', fontWeight: '500' }
});
