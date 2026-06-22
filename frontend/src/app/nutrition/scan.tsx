import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAppStore } from '@/store/app';

type ScanStep = 'pick' | 'uploading' | 'analyzing' | 'result';

export default function ScanMealScreen() {
  const router = useRouter();
  const scanMeal = useAppStore(s => s.scanMeal);

  function safeGoBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/nutrition');
    }
  }
  
  const [step, setStep] = useState<ScanStep>('pick');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const steps = [
    { id: 'pick', label: 'Image' },
    { id: 'uploading', label: 'Envoi' },
    { id: 'analyzing', label: 'IA' },
    { id: 'result', label: 'Fini' },
  ];

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0].uri) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      startAnalysis(uri);
    }
  }

  async function startAnalysis(uri: string) {
    setError(null);
    setAnalysis(null);
    
    // Étape 1 : Envoi
    setStep('uploading');
    
    try {
      // On passe directement à l'analyse car scanMeal fait tout le travail (upload + AI)
      // On peut forcer un petit état visuel pour l'étape "IA" après un court moment
      const resultPromise = scanMeal(uri);
      
      // Petit délai visuel pour montrer l'étape "IA" sinon c'est trop rapide ou figé
      setTimeout(() => {
        if (analysis === null) setStep('analyzing');
      }, 800);

      const result = await resultPromise;
      
      console.log('Analyse reçue:', result);
      setAnalysis(result);
      setStep('result');
    } catch (e) {
      console.error('Erreur scan:', e);
      setError(e instanceof Error ? e.message : "Erreur lors de l'analyse");
      setStep('pick');
    }
  }

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={safeGoBack}>
            <Text style={styles.backBtn}>Annuler</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Analyse Nutritionnelle</Text>
          <View style={{ width: 50 }} />
        </View>

        {/* Stepper */}
        <View style={styles.stepper}>
          {steps.map((s, i) => (
            <View key={s.id} style={styles.stepItem}>
              <View style={[
                styles.stepCircle, 
                step === s.id && styles.stepCircleActive,
                steps.findIndex(st => st.id === step) > i && styles.stepCircleDone
              ]}>
                {steps.findIndex(st => st.id === step) > i ? (
                  <Text style={styles.stepCheck}>✓</Text>
                ) : (
                  <Text style={[styles.stepNumber, step === s.id && styles.stepNumberActive]}>{i + 1}</Text>
                )}
              </View>
              <Text style={[styles.stepLabel, step === s.id && styles.stepLabelActive]}>{s.label}</Text>
            </View>
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {step === 'pick' && (
            <View style={styles.pickView}>
              <View style={styles.iconContainer}>
                <Text style={styles.mainIcon}>🥗</Text>
              </View>
              <Text style={styles.title}>{"Qu'avez-vous mangé ?"}</Text>
              <Text style={styles.subtitle}>Notre IA va identifier les aliments et calculer les calories pour vous.</Text>
              
              <TouchableOpacity style={styles.mainBtn} onPress={pickImage}>
                <Text style={styles.mainBtnText}>Choisir une photo</Text>
              </TouchableOpacity>
              
              {error && <Text style={styles.errorText}>{error}</Text>}
            </View>
          )}

          {(step === 'uploading' || step === 'analyzing') && (
            <View style={styles.loadingView}>
              <View style={styles.imagePreviewContainer}>
                {imageUri && <Image source={{ uri: imageUri }} style={styles.imagePreview} />}
                <View style={styles.overlay}>
                  <ActivityIndicator size="large" color="#FFF" />
                </View>
              </View>
              <Text style={styles.loadingTitle}>
                {step === 'uploading' ? "Envoi de l'image..." : "L'IA analyse votre plat..."}
              </Text>
              <Text style={styles.loadingSubtitle}>
                {step === 'uploading' ? "Nous préparons vos données." : "Identification des ingrédients en cours."}
              </Text>
            </View>
          )}

          {step === 'result' && analysis && (
            <View style={styles.resultView}>
              <View style={styles.imagePreviewContainerSmall}>
                 {imageUri && <Image source={{ uri: imageUri }} style={styles.imagePreviewSmall} />}
              </View>

              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Analyse terminée !</Text>
                <Text style={styles.summaryText}>{analysis.analysis_summary}</Text>
                
                <View style={styles.totalRow}>
                  <View style={styles.totalItem}>
                    <Text style={styles.totalVal}>{Math.round(analysis.total_calories)}</Text>
                    <Text style={styles.totalLabel}>kcal</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.totalItem}>
                    <Text style={styles.totalVal}>{Math.round(analysis.total_protein)}g</Text>
                    <Text style={styles.totalLabel}>Prot</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.totalItem}>
                    <Text style={styles.totalVal}>{Math.round(analysis.total_carbs)}g</Text>
                    <Text style={styles.totalLabel}>Gluc</Text>
                  </View>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Aliments détectés</Text>
              {analysis.detected_foods.map((food: any, i: number) => (
                <View key={i} style={styles.foodRow}>
                  <View>
                    <Text style={styles.foodName}>{food.name}</Text>
                    <Text style={styles.foodQty}>{food.estimated_quantity}</Text>
                  </View>
                  <Text style={styles.foodKcal}>{food.calories} kcal</Text>
                </View>
              ))}

              <TouchableOpacity 
                style={styles.confirmBtn} 
                onPress={async () => {
                  await useAppStore.getState().confirmMeal(analysis);
                  safeGoBack();
                }}
              >
                <Text style={styles.confirmBtnText}>Ajouter à mon journal</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFF' },
  safe: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10 },
  backBtn: { fontSize: 16, color: '#007AFF' },
  headerTitle: { fontSize: 17, fontWeight: '600' },
  
  stepper: { flexDirection: 'row', justifyContent: 'center', gap: 20, paddingVertical: 20, borderBottomWidth: 0.5, borderBottomColor: '#E5E5EA' },
  stepItem: { alignItems: 'center', gap: 4 },
  stepCircle: { width: 24, height: 24, borderRadius: 12, borderWidth: 1, borderColor: '#C7C7CC', alignItems: 'center', justifyContent: 'center' },
  stepCircleActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  stepCircleDone: { backgroundColor: '#34C759', borderColor: '#34C759' },
  stepNumber: { fontSize: 12, color: '#C7C7CC', fontWeight: '600' },
  stepNumberActive: { color: '#FFF' },
  stepCheck: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  stepLabel: { fontSize: 11, color: '#C7C7CC', fontWeight: '500' },
  stepLabelActive: { color: '#007AFF' },

  content: { padding: 20, paddingBottom: 40 },
  
  pickView: { alignItems: 'center', marginTop: 40, gap: 20 },
  iconContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F2F2F7', alignItems: 'center', justifyContent: 'center' },
  mainIcon: { fontSize: 50 },
  title: { fontSize: 24, fontWeight: '800', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#8E8E93', textAlign: 'center', lineHeight: 22, paddingHorizontal: 20 },
  mainBtn: { backgroundColor: '#007AFF', paddingHorizontal: 40, paddingVertical: 16, borderRadius: 14, marginTop: 20 },
  mainBtnText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
  errorText: { color: '#FF3B30', marginTop: 10 },

  loadingView: { alignItems: 'center', marginTop: 20, gap: 20 },
  imagePreviewContainer: { width: '100%', aspectRatio: 4/3, borderRadius: 16, overflow: 'hidden', position: 'relative' },
  imagePreview: { width: '100%', height: '100%' },
  overlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  loadingTitle: { fontSize: 20, fontWeight: '700' },
  loadingSubtitle: { fontSize: 15, color: '#8E8E93' },

  resultView: { gap: 20 },
  imagePreviewContainerSmall: { width: '100%', height: 120, borderRadius: 12, overflow: 'hidden' },
  imagePreviewSmall: { width: '100%', height: '100%', opacity: 0.8 },
  summaryCard: { backgroundColor: '#F2F2F7', borderRadius: 16, padding: 20, gap: 12 },
  summaryTitle: { fontSize: 18, fontWeight: '700' },
  summaryText: { fontSize: 15, color: '#3C3C43', lineHeight: 20 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginTop: 10, paddingTop: 15, borderTopWidth: 0.5, borderTopColor: '#C7C7CC' },
  totalItem: { alignItems: 'center' },
  totalVal: { fontSize: 20, fontWeight: '800', color: '#007AFF' },
  totalLabel: { fontSize: 12, color: '#8E8E93', fontWeight: '600' },
  divider: { width: 1, height: 30, backgroundColor: '#C7C7CC' },

  sectionTitle: { fontSize: 20, fontWeight: '700', marginTop: 10 },
  foodRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#E5E5EA' },
  foodName: { fontSize: 17, fontWeight: '600' },
  foodQty: { fontSize: 14, color: '#8E8E93' },
  foodKcal: { fontSize: 16, fontWeight: '700', color: '#000' },
  
  confirmBtn: { backgroundColor: '#34C759', paddingVertical: 18, borderRadius: 16, alignItems: 'center', marginTop: 20 },
  confirmBtnText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
});
