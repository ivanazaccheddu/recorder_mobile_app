import * as FileSystem from 'expo-file-system';
import { StorageInfo } from '../types';
import { LOW_STORAGE_THRESHOLD } from '../constants';

class FileManager {
  private recordingsDir: string;

  constructor() {
    this.recordingsDir = `${FileSystem.documentDirectory}recordings/`;
  }

  async init(): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.recordingsDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.recordingsDir, { intermediates: true });
      }
    } catch (error) {
      console.error('Failed to initialize file manager:', error);
      throw error;
    }
  }

  async saveRecording(uri: string, fileName: string): Promise<string> {
    const destinationUri = this.recordingsDir + fileName;
    try {
      await FileSystem.copyAsync({
        from: uri,
        to: destinationUri,
      });
      return destinationUri;
    } catch (error) {
      console.error('Failed to save recording:', error);
      throw error;
    }
  }

  async deleteRecording(uri: string): Promise<void> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(uri);
      }
    } catch (error) {
      console.error('Failed to delete recording:', error);
      throw error;
    }
  }

  async deleteMultipleRecordings(uris: string[]): Promise<void> {
    await Promise.all(uris.map(uri => this.deleteRecording(uri)));
  }

  async getFileSize(uri: string): Promise<number> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      return fileInfo.exists && 'size' in fileInfo ? fileInfo.size : 0;
    } catch (error) {
      console.error('Failed to get file size:', error);
      return 0;
    }
  }

  async getStorageInfo(): Promise<StorageInfo> {
    try {
      const freeSpace = await FileSystem.getFreeDiskStorageAsync();
      const totalSpace = await FileSystem.getTotalDiskCapacityAsync();
      const used = totalSpace - freeSpace;

      return {
        used,
        available: freeSpace,
        total: totalSpace,
        isLow: freeSpace < LOW_STORAGE_THRESHOLD,
      };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return {
        used: 0,
        available: 0,
        total: 0,
        isLow: false,
      };
    }
  }

  async exportRecording(uri: string): Promise<string | null> {
    try {
      const fileName = uri.split('/').pop() || 'recording.m4a';
      const cacheUri = FileSystem.cacheDirectory + fileName;
      
      await FileSystem.copyAsync({
        from: uri,
        to: cacheUri,
      });
      
      return cacheUri;
    } catch (error) {
      console.error('Failed to export recording:', error);
      return null;
    }
  }

  getRecordingsDirectory(): string {
    return this.recordingsDir;
  }

  async fileExists(uri: string): Promise<boolean> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      return fileInfo.exists;
    } catch (error) {
      return false;
    }
  }

  async getAllRecordingFiles(): Promise<string[]> {
    try {
      const files = await FileSystem.readDirectoryAsync(this.recordingsDir);
      return files.map(file => this.recordingsDir + file);
    } catch (error) {
      console.error('Failed to get all recording files:', error);
      return [];
    }
  }

  generateFileName(format: string): string {
    const timestamp = new Date().getTime();
    return `recording_${timestamp}.${format}`;
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  formatDuration(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}

export const fileManager = new FileManager();
