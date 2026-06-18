import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '@/store/app';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const DAYS_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
function todayFR() { return DAYS_FR[new Date().getDay()] ?? ''; }

export default function SportScreen() {
  const { recommendations: data } = useAppStore();

  if (!data) return null;
  const today = todayFR();

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1" edges={['top']}>
        <ScrollView contentContainerClassName="px-5 pb-10 gap-6" showsVerticalScrollIndicator={false}>
          <Text variant="h1" className="mt-2">Sport</Text>
          
          <View className="gap-3">
            <Text variant="large">Plan de la semaine</Text>
            <View className="gap-3">
              {data.sport.weeklyPlan.map((day, i) => {
                const isToday = day.day === today;
                return (
                  <Card key={i} className={`p-4 gap-3 ${isToday ? 'border-primary border-2 bg-primary/5' : 'border-none'}`}>
                    <View className="flex-row justify-between items-center">
                      <View className="flex-row items-center gap-2">
                        <Text className="font-bold text-lg">{day.day}</Text>
                        {isToday && <Badge label="Aujourd'hui" variant="default" className="scale-90" />}
                      </View>
                      <Badge 
                        label={day.intensity} 
                        variant={day.intensity === 'Intense' ? 'destructive' : day.intensity === 'Modérée' ? 'secondary' : 'muted'} 
                      />
                    </View>
                    <Text className="font-medium text-foreground text-base">{day.type}</Text>
                    {day.exercises.length > 0 && (
                      <View className="gap-1.5 mt-1">
                        {day.exercises.map((ex, j) => (
                          <Text key={j} variant="muted" className="text-sm">• {ex}</Text>
                        ))}
                      </View>
                    )}
                  </Card>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
