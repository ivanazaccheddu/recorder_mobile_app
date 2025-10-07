import { Audio } from 'expo-av';
import { RecordingQuality, AudioMetering } from '../types';
import { QUALITY_PRESETS, AUDIO_MODE } from '../constants/audioConfig';
import { Platform } from 'react-native';

export class AudioRecorderService {
  private recording: Audio.Recording | null = null;
  private isRecording = false;
  private isPaused = false;

  async init(): Promise<void> {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: AUDIO_MODE.allowsRecordingIOS,
        playsInSilentModeIOS: AUDIO_MODE.playsInSilentModeIOS,
        staysActiveInBackground: AUDIO_MODE.staysActiveInBackground,
        shouldDuckAndroid: AUDIO_MODE.shouldDuckAndroid,
        playThroughEarpieceAndroid: AUDIO_MODE.playThroughEarpieceAndroid,
      });
    } catch (error) {
      console.error('Failed to initialize audio recorder:', error);
      throw error;
    }
  }

  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Failed to request permissions:', error);
      return false;
    }
  }

  async startRecording(quality: RecordingQuality = 'high'): Promise<void> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Microphone permission not granted');
      }

      await this.init();

      const preset = QUALITY_PRESETS[quality];
      const options = Platform.OS === 'ios' ? preset.ios : preset.android;

      this.recording = new Audio.Recording();
      await this.recording.prepareToRecordAsync({
        ...options,
        isMeteringEnabled: true,
      });
      await this.recording.startAsync();
      this.isRecording = true;
      this.isPaused = false;
    } catch (error) {
      console.error('Failed to start recording:', error);
      this.recording = null;
      throw error;
    }
  }

  async pauseRecording(): Promise<void> {
    try {
      if (!this.recording || !this.isRecording || this.isPaused) {
        throw new Error('No active recording to pause');
      }

      await this.recording.pauseAsync();
      this.isPaused = true;
    } catch (error) {
      console.error('Failed to pause recording:', error);
      throw error;
    }
  }

  async resumeRecording(): Promise<void> {
    try {
      if (!this.recording || !this.isRecording || !this.isPaused) {
        throw new Error('No paused recording to resume');
      }

      await this.recording.startAsync();
      this.isPaused = false;
    } catch (error) {
      console.error('Failed to resume recording:', error);
      throw error;
    }
  }

  async stopRecording(): Promise<{ uri: string; duration: number }> {
    try {
      if (!this.recording) {
        throw new Error('No active recording to stop');
      }

      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      const status = await this.recording.getStatusAsync();
      const duration = status.durationMillis || 0;

      this.recording = null;
      this.isRecording = false;
      this.isPaused = false;

      if (!uri) {
        throw new Error('Recording URI is null');
      }

      return { uri, duration };
    } catch (error) {
      console.error('Failed to stop recording:', error);
      this.recording = null;
      this.isRecording = false;
      this.isPaused = false;
      throw error;
    }
  }

  async getStatus(): Promise<{
    isRecording: boolean;
    isPaused: boolean;
    duration: number;
    metering?: AudioMetering;
  }> {
    if (!this.recording) {
      return {
        isRecording: false,
        isPaused: false,
        duration: 0,
      };
    }

    try {
      const status = await this.recording.getStatusAsync();
      
      let metering: AudioMetering | undefined;
      if (status.isRecording && status.metering !== undefined) {
        metering = {
          currentLevel: status.metering,
          averageLevel: status.metering,
          peakLevel: status.metering,
        };
      }

      return {
        isRecording: this.isRecording,
        isPaused: this.isPaused,
        duration: status.durationMillis || 0,
        metering,
      };
    } catch (error) {
      console.error('Failed to get recording status:', error);
      return {
        isRecording: this.isRecording,
        isPaused: this.isPaused,
        duration: 0,
      };
    }
  }

  getIsRecording(): boolean {
    return this.isRecording;
  }

  getIsPaused(): boolean {
    return this.isPaused;
  }

  async cancelRecording(): Promise<void> {
    try {
      if (this.recording) {
        await this.recording.stopAndUnloadAsync();
        this.recording = null;
        this.isRecording = false;
        this.isPaused = false;
      }
    } catch (error) {
      console.error('Failed to cancel recording:', error);
    }
  }
}

export const audioRecorderService = new AudioRecorderService();
