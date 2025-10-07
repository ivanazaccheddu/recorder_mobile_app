import AsyncStorage from '@react-native-async-storage/async-storage';
import { RecordingSettings } from '../types';
import { STORAGE_KEYS } from '../constants';

const DEFAULT_SETTINGS: RecordingSettings = {
  quality: 'high',
  format: 'm4a',
  autoDelete: false,
  autoDeleteDays: 30,
  namingConvention: 'timestamp',
};

class SettingsStorage {
  async getSettings(): Promise<RecordingSettings> {
    try {
      const settingsJson = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (settingsJson) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(settingsJson) };
      }
      return DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Failed to load settings:', error);
      return DEFAULT_SETTINGS;
    }
  }

  async saveSettings(settings: Partial<RecordingSettings>): Promise<void> {
    try {
      const currentSettings = await this.getSettings();
      const updatedSettings = { ...currentSettings, ...settings };
      await AsyncStorage.setItem(
        STORAGE_KEYS.SETTINGS,
        JSON.stringify(updatedSettings)
      );
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw error;
    }
  }

  async resetSettings(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.SETTINGS,
        JSON.stringify(DEFAULT_SETTINGS)
      );
    } catch (error) {
      console.error('Failed to reset settings:', error);
      throw error;
    }
  }

  async getTheme(): Promise<'light' | 'dark' | 'auto'> {
    try {
      const theme = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
      return (theme as 'light' | 'dark' | 'auto') || 'auto';
    } catch (error) {
      console.error('Failed to load theme:', error);
      return 'auto';
    }
  }

  async saveTheme(theme: 'light' | 'dark' | 'auto'): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch (error) {
      console.error('Failed to save theme:', error);
      throw error;
    }
  }
}

export const settingsStorage = new SettingsStorage();
