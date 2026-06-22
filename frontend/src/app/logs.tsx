import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Share,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useAppStore } from '@/store/app';
import { AppLogger, LogEntry, LogLevel } from '@/utils/logger';

export default function LogsScreen() {
  const { userId } = useAppStore();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [search, setSearch] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<LogLevel | 'ALL'>('ALL');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<boolean | null>(null);

  function loadLogs() {
    // Fetch logs from logger
    const retrieved = AppLogger.getLogs();
    // Reverse to show newest logs at the top
    setLogs([...retrieved].reverse());
  }

  // Load logs on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      loadLogs();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  async function handleClear() {
    await AppLogger.clearLogs();
    loadLogs();
  }

  async function handleShare() {
    const formatted = logs
      .map((l) => `[${l.timestamp}] [${l.level}] [${l.tag || 'App'}] ${l.message}`)
      .join('\n');
    try {
      await Share.share({
        message: formatted,
        title: 'Application Logs',
      });
    } catch (e) {
      console.error('Error sharing logs', e);
    }
  }

  async function handleUpload() {
    setIsUploading(true);
    setUploadSuccess(null);
    try {
      const ok = await AppLogger.uploadLogs(userId ?? 0, true);
      setUploadSuccess(ok);
      // Reset status indicator after 3 seconds
      setTimeout(() => setUploadSuccess(null), 3000);
    } catch (e) {
      setUploadSuccess(false);
    } finally {
      setIsUploading(false);
    }
  }

  // Filter logs based on search and level
  const filteredLogs = logs.filter((log) => {
    const matchesLevel = selectedLevel === 'ALL' || log.level === selectedLevel;
    const matchesSearch =
      log.message.toLowerCase().includes(search.toLowerCase()) ||
      (log.tag && log.tag.toLowerCase().includes(search.toLowerCase()));
    return matchesLevel && matchesSearch;
  });

  const getLevelColor = (level: LogLevel) => {
    switch (level) {
      case 'ERROR':
        return '#FF3B30';
      case 'WARN':
        return '#FF9500';
      case 'DEBUG':
        return '#8E8E93';
      case 'INFO':
      default:
        return '#34C759';
    }
  };

  const renderLogItem = ({ item }: { item: LogEntry }) => {
    const color = getLevelColor(item.level);
    const dateFormatted = new Date(item.timestamp).toLocaleTimeString();
    
    return (
      <View style={styles.logCard}>
        <View style={styles.logHeader}>
          <View style={styles.row}>
            <View style={[styles.badge, { backgroundColor: color }]}>
              <Text style={styles.badgeText}>{item.level}</Text>
            </View>
            {item.tag && <Text style={styles.tagText}>{item.tag}</Text>}
          </View>
          <Text style={styles.timeText}>{dateFormatted}</Text>
        </View>
        <Text style={styles.messageText}>{item.message}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Action Bar */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.btnSecondary} onPress={handleClear}>
          <Text style={styles.btnTextSecondary}>Tout effacer</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnSecondary} onPress={handleShare}>
          <Text style={styles.btnTextSecondary}>Partager</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnPrimary} onPress={handleUpload} disabled={isUploading}>
          {isUploading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.btnTextPrimary}>
              {uploadSuccess === true
                ? 'Envoyé !'
                : uploadSuccess === false
                ? 'Erreur'
                : 'Envoyer au serveur'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <TextInput
        style={styles.searchBar}
        placeholder="Rechercher dans les logs..."
        placeholderTextColor="#8E8E93"
        value={search}
        onChangeText={setSearch}
      />

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        {(['ALL', 'DEBUG', 'INFO', 'WARN', 'ERROR'] as const).map((lvl) => (
          <TouchableOpacity
            key={lvl}
            style={[styles.filterTab, selectedLevel === lvl && styles.filterTabActive]}
            onPress={() => setSelectedLevel(lvl)}
          >
            <Text
              style={[
                styles.filterTabText,
                selectedLevel === lvl && styles.filterTabTextActive,
              ]}
            >
              {lvl}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Logs List */}
      <FlatList
        data={filteredLogs}
        keyExtractor={(item, index) => `${item.timestamp}-${index}`}
        renderItem={renderLogItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucun log correspondant.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
    padding: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  btnPrimary: {
    flex: 1.5,
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSecondary: {
    flex: 1,
    backgroundColor: '#2C2C2E',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnTextPrimary: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  btnTextSecondary: {
    color: '#E5E5EA',
    fontWeight: '500',
    fontSize: 14,
  },
  searchBar: {
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    color: '#FFF',
    fontSize: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 16,
    height: 36,
  },
  filterTab: {
    paddingHorizontal: 16,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  filterTabActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterTabText: {
    color: '#8E8E93',
    fontSize: 13,
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  listContainer: {
    paddingBottom: 24,
    gap: 10,
  },
  logCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  tagText: {
    color: '#AEAEB2',
    fontSize: 12,
    fontWeight: '600',
  },
  timeText: {
    color: '#8E8E93',
    fontSize: 11,
  },
  messageText: {
    color: '#E5E5EA',
    fontSize: 13,
    fontFamily: 'Courier',
    lineHeight: 16,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#8E8E93',
    fontSize: 15,
  },
});
