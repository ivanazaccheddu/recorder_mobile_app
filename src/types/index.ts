// Core types for the audio recorder app

export interface Recording {
  id: string;
  title: string;
  uri: string;
  duration: number;
  size: number;
  createdAt: string;
  format: AudioFormat;
  category?: string;
  tags?: string[];
  notes?: string;
  isFavorite: boolean;
}

export type AudioFormat = 'm4a' | 'mp3' | 'wav';

export type RecordingQuality = 'low' | 'medium' | 'high';

export type SortOption = 'date' | 'name' | 'duration' | 'size';

export type SortOrder = 'asc' | 'desc';

export interface RecordingSettings {
  quality: RecordingQuality;
  format: AudioFormat;
  autoDelete: boolean;
  autoDeleteDays?: number;
  namingConvention: 'timestamp' | 'custom';
}

export interface PlaybackState {
  isPlaying: boolean;
  position: number;
  duration: number;
  speed: number;
  isLooping: boolean;
}

export interface StorageInfo {
  used: number;
  available: number;
  total: number;
  isLow: boolean;
}

export interface AudioMetering {
  currentLevel: number;
  averageLevel: number;
  peakLevel: number;
}

export type PlaybackSpeed = 0.5 | 0.75 | 1.0 | 1.25 | 1.5 | 2.0;

export interface NavigationParams {
  Home: undefined;
  RecordingsList: undefined;
  Playback: { recordingId: string };
  Settings: undefined;
}
