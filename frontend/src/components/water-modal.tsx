import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useAppStore } from '@/store/app';

interface WaterModalProps {
  visible: boolean;
  onClose: () => void;
}

export function WaterModal({ visible, onClose }: WaterModalProps) {
  const { addWater, dailyProgress } = useAppStore();
  const [customAmount, setCustomAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddWater = async (amount: number) => {
    setLoading(true);
    try {
      await addWater(amount);
      onClose();
      setCustomAmount('');
    } catch (e) {
      Alert.alert("Erreur", "Impossible d'enregistrer l'hydratation.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCustom = async () => {
    const amountVal = parseInt(customAmount, 10);
    if (isNaN(amountVal) || amountVal <= 0) {
      Alert.alert("Erreur", "Veuillez entrer une quantité valide.");
      return;
    }
    await handleAddWater(amountVal);
  };

  const target = dailyProgress?.water_target_ml ?? 2000;
  const consumed = dailyProgress?.water_consumed_ml ?? 0;
  const progressPercent = Math.min(consumed / target, 1) * 100;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Ajouter de l'eau</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeBtnText}>Fermer</Text>
            </TouchableOpacity>
          </View>

          <View style={{ gap: 20 }}>
            {/* Visual Progress */}
            <View style={styles.progressContainer}>
              <View style={styles.rowBetween}>
                <Text style={styles.progressText}>Aujourd'hui</Text>
                <Text style={styles.progressValues}>
                  {consumed} ml / {target} ml
                </Text>
              </View>
              <View style={styles.track}>
                <View style={[styles.fill, { width: `${progressPercent}%` }]} />
              </View>
            </View>

            {/* Quick add chips */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Ajout rapide</Text>
              <View style={styles.chipRow}>
                <TouchableOpacity style={styles.chip} onPress={() => handleAddWater(250)} disabled={loading}>
                  <Text style={styles.chipEmoji}>💧</Text>
                  <Text style={styles.chipText}>Verre (250 ml)</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.chip} onPress={() => handleAddWater(500)} disabled={loading}>
                  <Text style={styles.chipEmoji}>🍶</Text>
                  <Text style={styles.chipText}>Gourde (500 ml)</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.chip} onPress={() => handleAddWater(750)} disabled={loading}>
                  <Text style={styles.chipEmoji}>🥤</Text>
                  <Text style={styles.chipText}>Bouteille (750 ml)</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Custom input */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Quantité personnalisée (ml)</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.modalInput}
                  value={customAmount}
                  onChangeText={setCustomAmount}
                  keyboardType="numeric"
                  placeholder="Ex: 330"
                  editable={!loading}
                />
                <TouchableOpacity style={styles.saveBtn} onPress={handleSaveCustom} disabled={loading}>
                  {loading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.saveBtnText}>Ajouter</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
  progressContainer: {
    backgroundColor: '#F2F2F7',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  progressValues: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  track: {
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  section: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  chipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  chip: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  chipEmoji: {
    fontSize: 20,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3A3A3C',
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  modalInput: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 16,
  },
  saveBtn: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    height: 44,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
