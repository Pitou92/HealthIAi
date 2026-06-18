import { useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '@/store/app';
import { useRouter } from 'expo-router';
import { WaterModal } from '@/components/water-modal';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { CircularProgress } from '@/components/ui/circular-progress';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { SymbolView } from 'expo-symbols';
import { Colors } from '@/constants/theme';
import { useAppColorScheme } from '@/hooks/use-app-color-scheme';

export default function NutritionScreen() {
  const router = useRouter();
  const [waterVisible, setWaterVisible] = useState(false);
  const { recommendations: data, dailyProgress: progress, nutritionLogs: logs, favoriteMeals } = useAppStore();
  const { isDark } = useAppColorScheme();

  if (!data || !progress) return null;

  return (
    <View className="flex-1 bg-background">
      <WaterModal visible={waterVisible} onClose={() => setWaterVisible(false)} />
      <SafeAreaView className="flex-1" edges={['top']}>
        <ScrollView contentContainerClassName="px-5 pb-10 gap-6" showsVerticalScrollIndicator={false}>
          <Text variant="h1" className="mt-2">Nutrition</Text>

          {/* Actions principales */}
          <View className="flex-row gap-3">
            <TouchableOpacity 
              activeOpacity={0.8}
              className="flex-1 bg-primary rounded-2xl p-4 items-center gap-2"
              onPress={() => router.push('/nutrition/scan')}
            >
              <Text className="text-2xl">📸</Text>
              <Text className="font-bold text-primary-foreground text-sm">Scanner</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              activeOpacity={0.8}
              className="flex-1 bg-orange-500 rounded-2xl p-4 items-center gap-2"
              onPress={() => router.push('/nutrition/search')}
            >
              <Text className="text-2xl">🔍</Text>
              <Text className="font-bold text-white text-sm">Rechercher</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              activeOpacity={0.8}
              className="flex-1 bg-blue-500 rounded-2xl p-4 items-center gap-2"
              onPress={() => setWaterVisible(true)}
            >
              <Text className="text-2xl">💧</Text>
              <Text className="font-bold text-white text-sm">Eau</Text>
            </TouchableOpacity>
          </View>

          {/* Favoris */}
          {favoriteMeals && favoriteMeals.length > 0 && (
            <View className="gap-3">
              <Text variant="large">Repas Favoris</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-3">
                {favoriteMeals.map((fav, i) => (
                  <Card key={i} className="p-3 w-36 gap-2 border-none items-center">
                    <Text className="text-2xl">⭐</Text>
                    <View className="items-center">
                      <Text className="font-semibold text-center text-sm" numberOfLines={1}>{fav.name}</Text>
                      <Text variant="muted" className="text-xs">{fav.calories} kcal</Text>
                    </View>
                  </Card>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Résumé du jour */}
          <View className="gap-3">
            <View className="flex-row justify-between items-center">
              <Text variant="large">Aujourd'hui</Text>
              <Text variant="muted" className="font-semibold">{progress.calories_target - progress.calories_consumed} kcal restants</Text>
            </View>
            <View className="flex-row gap-3">
              <MacroItem label="Protéines" current={progress.protein_consumed} target={progress.protein_target} color="#F59E0B" />
              <MacroItem label="Glucides" current={progress.carbs_consumed} target={progress.carbs_target} color="#10B981" />
              <MacroItem label="Lipides" current={progress.fat_consumed} target={progress.fat_target} color="#8B5CF6" />
            </View>
          </View>

          {/* Hydratation */}
          <View className="gap-3">
            <Text variant="large">Hydratation</Text>
            <Card className="p-4 gap-4 border-none">
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center gap-3">
                  <Text className="text-3xl">💧</Text>
                  <View>
                    <Text className="font-bold text-lg">
                      {progress.water_consumed_ml} ml <Text variant="muted" className="text-sm font-normal">/ {progress.water_target_ml} ml</Text>
                    </Text>
                    <Text variant="muted" className="text-xs">Objectif quotidien d'hydratation</Text>
                  </View>
                </View>
                <Button 
                  label="Ajouter" 
                  size="sm" 
                  onPress={() => setWaterVisible(true)} 
                />
              </View>
              {/* Progress bar */}
              <Progress value={Math.min(progress.water_consumed_ml / progress.water_target_ml, 1) * 100} color="#3B82F6" className="h-2" />
            </Card>
          </View>

          {/* Journal de bord */}
          <View className="gap-3">
            <Text variant="large">Journal de bord</Text>
            {logs.length === 0 ? (
              <Card className="items-center py-8 border-dashed bg-transparent">
                <Text variant="muted">Aucun repas enregistré aujourd'hui.</Text>
              </Card>
            ) : (
              <View className="gap-3">
                {logs.map((log, i) => (
                  <Card key={i} className="p-4 gap-2 border-none">
                    <View className="flex-row justify-between items-start">
                      <View>
                        <Text className="font-semibold text-lg">{log.name}</Text>
                        <Text variant="muted" className="text-xs">{new Date(log.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</Text>
                      </View>
                      <View className="items-end">
                        <Text className="font-bold text-lg">{log.calories} <Text variant="muted" className="text-sm font-medium">kcal</Text></Text>
                      </View>
                    </View>
                    <Text variant="muted" className="text-sm leading-relaxed">{log.items.join(', ')}</Text>
                  </Card>
                ))}
              </View>
            )}
          </View>

          {/* Recommandations IA */}
          <View className="gap-3">
            <Text variant="large">Plan IA</Text>
            <Card className="p-0 overflow-hidden border-none">
              {data.nutrition.meals.map((meal, i) => (
                <View key={i} className={`p-4 gap-2 ${i < data.nutrition.meals.length - 1 ? 'border-b border-border' : ''}`}>
                  <View className="flex-row justify-between items-center">
                    <Text className="font-semibold text-base">{meal.name}</Text>
                    <Text className="font-bold text-secondary">{meal.calories} kcal</Text>
                  </View>
                  <Text variant="muted" className="text-sm leading-relaxed">{meal.items.join(', ')}</Text>
                </View>
              ))}
            </Card>
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function MacroItem({ label, current, target, color }: any) {
  return (
    <Card className="flex-1 p-3 items-center gap-2 border-none">
      <Text className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</Text>
      <CircularProgress 
        value={current} 
        max={target} 
        size={60} 
        strokeWidth={6} 
        color={color} 
      />
      <Text className="font-bold text-sm">{Math.round(current)}<Text variant="muted" className="font-normal">/{target}g</Text></Text>
    </Card>
  );
}
