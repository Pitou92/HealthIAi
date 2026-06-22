import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@/config/api';

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  tag?: string;
  message: string;
}

const MAX_LOGS = 500;
const STORAGE_KEY = 'healthai_app_logs';
const LAST_SENT_KEY = 'healthai_last_sent_timestamp';

let inMemoryLogs: LogEntry[] = [];
let isInterceptiveActive = false;
let lastSentTimestamp = '';
let autoUploadInterval: any = null;
let uploadTimeout: any = null;

// Store original console methods
const originalConsole = {
  log: console.log,
  info: console.info,
  warn: console.warn,
  error: console.error,
};

export const AppLogger = {
  async init() {
    try {
      const savedLogs = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedLogs) {
        inMemoryLogs = JSON.parse(savedLogs);
      }
      const savedLastSent = await AsyncStorage.getItem(LAST_SENT_KEY);
      if (savedLastSent) {
        lastSentTimestamp = savedLastSent;
      }
    } catch (e) {
      originalConsole.error('Failed to load logs from AsyncStorage:', e);
    }
    
    this.startIntercepting();
    this.info('Logger', 'Frontend logging system initialized.');
    
    // Start background auto-upload process
    this.startAutoUpload();
  },

  startIntercepting() {
    if (isInterceptiveActive) return;
    isInterceptiveActive = true;

    console.log = (...args: any[]) => {
      const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
      this.addLog('INFO', 'Console', message);
      originalConsole.log(...args);
    };

    console.info = (...args: any[]) => {
      const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
      this.addLog('INFO', 'Console', message);
      originalConsole.info(...args);
    };

    console.warn = (...args: any[]) => {
      const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
      this.addLog('WARN', 'Console', message);
      originalConsole.warn(...args);
    };

    console.error = (...args: any[]) => {
      const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
      this.addLog('ERROR', 'Console', message);
      originalConsole.error(...args);
    };
  },

  stopIntercepting() {
    if (!isInterceptiveActive) return;
    isInterceptiveActive = false;
    console.log = originalConsole.log;
    console.info = originalConsole.info;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
    this.stopAutoUpload();
  },

  startAutoUpload() {
    if (autoUploadInterval) return;
    
    // Initial sync shortly after startup
    setTimeout(() => {
      this.uploadLogs().catch(() => {});
    }, 2000);

    // Periodically sync new logs every 30 seconds
    autoUploadInterval = setInterval(() => {
      const unsent = inMemoryLogs.filter(log => log.timestamp > lastSentTimestamp);
      if (unsent.length > 0) {
        this.uploadLogs().catch(() => {});
      }
    }, 30000);
  },

  stopAutoUpload() {
    if (autoUploadInterval) {
      clearInterval(autoUploadInterval);
      autoUploadInterval = null;
    }
  },

  triggerQuickUpload() {
    if (uploadTimeout) clearTimeout(uploadTimeout);
    uploadTimeout = setTimeout(() => {
      this.uploadLogs().catch(() => {});
    }, 2000);
  },

  addLog(level: LogLevel, tag: string, message: string) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      tag,
      message,
    };

    inMemoryLogs.push(entry);
    if (inMemoryLogs.length > MAX_LOGS) {
      inMemoryLogs.shift();
    }

    // Persist logs in the background without blocking the main thread
    this.persistLogs();

    // Trigger an immediate/fast sync for errors, otherwise let periodic auto-upload handle it
    if (level === 'ERROR') {
      this.triggerQuickUpload();
    }
  },

  async persistLogs() {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(inMemoryLogs));
    } catch (e) {
      // Use original console to avoid recursion loop
      originalConsole.error('Error saving logs to AsyncStorage', e);
    }
  },

  debug(tag: string, message: string) {
    this.addLog('DEBUG', tag, message);
    if (__DEV__) {
      originalConsole.log(`[DEBUG] [${tag}] ${message}`);
    }
  },

  info(tag: string, message: string) {
    this.addLog('INFO', tag, message);
    if (__DEV__) {
      originalConsole.info(`[INFO] [${tag}] ${message}`);
    }
  },

  warn(tag: string, message: string) {
    this.addLog('WARN', tag, message);
    if (__DEV__) {
      originalConsole.warn(`[WARN] [${tag}] ${message}`);
    }
  },

  error(tag: string, message: string) {
    this.addLog('ERROR', tag, message);
    if (__DEV__) {
      originalConsole.error(`[ERROR] [${tag}] ${message}`);
    }
  },

  getLogs(): LogEntry[] {
    return [...inMemoryLogs];
  },

  async clearLogs() {
    inMemoryLogs = [];
    lastSentTimestamp = '';
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      await AsyncStorage.removeItem(LAST_SENT_KEY);
      this.info('Logger', 'Logs cleared successfully.');
    } catch (e) {
      originalConsole.error('Failed to clear logs from storage:', e);
    }
  },

  async uploadLogs(userId?: number, force = false): Promise<boolean> {
    try {
      const allLogs = this.getLogs();
      const logsToSend = force 
        ? allLogs 
        : allLogs.filter((log) => log.timestamp > lastSentTimestamp);

      if (logsToSend.length === 0) {
        return true;
      }

      const response = await fetch(`${API_BASE_URL}/logs/client`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId ?? 0,
          device: 'React Native (Expo)',
          logs: logsToSend,
        }),
      });

      if (response.ok) {
        if (logsToSend.length > 0) {
          const latestLog = logsToSend[logsToSend.length - 1];
          lastSentTimestamp = latestLog.timestamp;
          await AsyncStorage.setItem(LAST_SENT_KEY, lastSentTimestamp);
        }
        originalConsole.info(`[AppLogger] Synchronized ${logsToSend.length} logs with backend.`);
        return true;
      }
      originalConsole.warn(`[AppLogger] Failed to upload logs to backend. Status: ${response.status}`);
      return false;
    } catch (e) {
      originalConsole.error('Failed to upload logs to backend:', e);
      return false;
    }
  },
};
