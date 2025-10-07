import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  List,
  Switch,
  Button,
  Divider,
  Text,
  Surface,
  RadioButton,
} from 'react-native-paper';
import { settingsStorage } from '../storage/settingsStorage';
import { fileManager } from '../storage/fileManager';
import { databaseService } from '../storage/database';
import { RecordingSettings, StorageInfo } from '../types';

export const SettingsScreen: React.FC = () => {
  const [settings, setSettings] = useState<RecordingSettings>({
    quality: 'high',
    format: 'm4a',
    autoDelete: false,
    autoDeleteDays: 30,
    namingConvention: 'timestamp',
  });
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  const [stats, setStats] = useState({
    totalRecordings: 0,
    totalDuration: 0,
    totalSize: 0,
  });

  useEffect(() => {
    loadSettings();
    loadStorageInfo();
    loadStats();
  }, []);

  const loadSettings = async () => {
    try {
      const loadedSettings = await settingsStorage.getSettings();
      setSettings(loadedSettings);
    } catch (error) {
      Alert.alert('Error', 'Failed to load settings.');
    }
  };

  const loadStorageInfo = async () => {
    try {
      const info = await fileManager.getStorageInfo();
      setStorageInfo(info);
    } catch (error) {
      console.error('Failed to load storage info:', error);
    }
  };

  const loadStats = async () => {
    try {
      const statistics = await databaseService.getStatistics();
      setStats(statistics);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  };

  const handleUpdateSetting = async (updates: Partial<RecordingSettings>) => {
    try {
      const newSettings = { ...settings, ...updates };
      await settingsStorage.saveSettings(newSettings);
      setSettings(newSettings);
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings.');
    }
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await settingsStorage.resetSettings();
              await loadSettings();
              Alert.alert('Success', 'Settings reset to default.');
            } catch (error) {
              Alert.alert('Error', 'Failed to reset settings.');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.section}>
        <Text style={styles.sectionTitle}>Recording Quality</Text>
        <RadioButton.Group
          onValueChange={(value) =>
            handleUpdateSetting({ quality: value as 'low' | 'medium' | 'high' })
          }
          value={settings.quality}
        >
          <RadioButton.Item label="Low (64 kbps)" value="low" />
          <RadioButton.Item label="Medium (96 kbps)" value="medium" />
          <RadioButton.Item label="High (128 kbps)" value="high" />
        </RadioButton.Group>
      </Surface>

      <Surface style={styles.section}>
        <Text style={styles.sectionTitle}>Audio Format</Text>
        <RadioButton.Group
          onValueChange={(value) =>
            handleUpdateSetting({ format: value as 'm4a' | 'mp3' | 'wav' })
          }
          value={settings.format}
        >
          <RadioButton.Item label="M4A (recommended)" value="m4a" />
          <RadioButton.Item label="MP3" value="mp3" />
          <RadioButton.Item label="WAV" value="wav" />
        </RadioButton.Group>
      </Surface>

      <Surface style={styles.section}>
        <Text style={styles.sectionTitle}>Auto-Delete Old Recordings</Text>
        <List.Item
          title="Enable Auto-Delete"
          description={`Delete recordings older than ${settings.autoDeleteDays} days`}
          right={() => (
            <Switch
              value={settings.autoDelete}
              onValueChange={(value) => handleUpdateSetting({ autoDelete: value })}
            />
          )}
        />
      </Surface>

      <Surface style={styles.section}>
        <Text style={styles.sectionTitle}>Storage</Text>
        {storageInfo && (
          <>
            <List.Item
              title="Available Space"
              description={fileManager.formatBytes(storageInfo.available)}
              left={(props) => <List.Icon {...props} icon="harddisk" />}
            />
            <List.Item
              title="Used Space"
              description={fileManager.formatBytes(storageInfo.used)}
              left={(props) => <List.Icon {...props} icon="folder" />}
            />
            {storageInfo.isLow && (
              <Text style={styles.warningText}>⚠️ Storage space is low!</Text>
            )}
          </>
        )}
      </Surface>

      <Surface style={styles.section}>
        <Text style={styles.sectionTitle}>Statistics</Text>
        <List.Item
          title="Total Recordings"
          description={stats.totalRecordings.toString()}
          left={(props) => <List.Icon {...props} icon="file-music" />}
        />
        <List.Item
          title="Total Duration"
          description={fileManager.formatDuration(stats.totalDuration)}
          left={(props) => <List.Icon {...props} icon="clock" />}
        />
        <List.Item
          title="Total Size"
          description={fileManager.formatBytes(stats.totalSize)}
          left={(props) => <List.Icon {...props} icon="database" />}
        />
        <Button mode="outlined" onPress={loadStats} style={styles.refreshButton}>
          Refresh Statistics
        </Button>
      </Surface>

      <Surface style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <List.Item
          title="Version"
          description="1.0.0"
          left={(props) => <List.Icon {...props} icon="information" />}
        />
        <List.Item
          title="Offline-First"
          description="Works 100% without internet"
          left={(props) => <List.Icon {...props} icon="cloud-off-outline" />}
        />
      </Surface>

      <Button
        mode="outlined"
        onPress={handleResetSettings}
        style={styles.resetButton}
        textColor="#cf6679"
      >
        Reset All Settings
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    margin: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  warningText: {
    color: '#cf6679',
    marginTop: 8,
    fontSize: 14,
  },
  refreshButton: {
    marginTop: 12,
  },
  resetButton: {
    margin: 16,
    marginTop: 8,
  },
});
