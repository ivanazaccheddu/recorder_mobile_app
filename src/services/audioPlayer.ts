import { Audio, AVPlaybackStatus } from 'expo-av';
import { PlaybackSpeed } from '../types';
import { AUDIO_MODE } from '../constants/audioConfig';

export class AudioPlayerService {
  private sound: Audio.Sound | null = null;
  private currentUri: string | null = null;
  private statusCallback: ((status: AVPlaybackStatus) => void) | null = null;

  async init(): Promise<void> {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: AUDIO_MODE.playsInSilentModeIOS,
        staysActiveInBackground: AUDIO_MODE.staysActiveInBackground,
        shouldDuckAndroid: AUDIO_MODE.shouldDuckAndroid,
        playThroughEarpieceAndroid: AUDIO_MODE.playThroughEarpieceAndroid,
      });
    } catch (error) {
      console.error('Failed to initialize audio player:', error);
      throw error;
    }
  }

  async loadSound(uri: string): Promise<void> {
    try {
      // Unload previous sound if exists
      if (this.sound) {
        await this.unloadSound();
      }

      await this.init();

      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false },
        this.onPlaybackStatusUpdate.bind(this)
      );

      this.sound = sound;
      this.currentUri = uri;
    } catch (error) {
      console.error('Failed to load sound:', error);
      throw error;
    }
  }

  async play(): Promise<void> {
    try {
      if (!this.sound) {
        throw new Error('No sound loaded');
      }

      await this.sound.playAsync();
    } catch (error) {
      console.error('Failed to play sound:', error);
      throw error;
    }
  }

  async pause(): Promise<void> {
    try {
      if (!this.sound) {
        throw new Error('No sound loaded');
      }

      await this.sound.pauseAsync();
    } catch (error) {
      console.error('Failed to pause sound:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    try {
      if (!this.sound) {
        return;
      }

      await this.sound.stopAsync();
      await this.sound.setPositionAsync(0);
    } catch (error) {
      console.error('Failed to stop sound:', error);
      throw error;
    }
  }

  async seekTo(positionMillis: number): Promise<void> {
    try {
      if (!this.sound) {
        throw new Error('No sound loaded');
      }

      await this.sound.setPositionAsync(positionMillis);
    } catch (error) {
      console.error('Failed to seek:', error);
      throw error;
    }
  }

  async setPlaybackSpeed(speed: PlaybackSpeed): Promise<void> {
    try {
      if (!this.sound) {
        throw new Error('No sound loaded');
      }

      await this.sound.setRateAsync(speed, true);
    } catch (error) {
      console.error('Failed to set playback speed:', error);
      throw error;
    }
  }

  async setIsLooping(isLooping: boolean): Promise<void> {
    try {
      if (!this.sound) {
        throw new Error('No sound loaded');
      }

      await this.sound.setIsLoopingAsync(isLooping);
    } catch (error) {
      console.error('Failed to set looping:', error);
      throw error;
    }
  }

  async skipForward(milliseconds: number): Promise<void> {
    try {
      if (!this.sound) {
        throw new Error('No sound loaded');
      }

      const status = await this.sound.getStatusAsync();
      if (status.isLoaded) {
        const newPosition = Math.min(
          status.positionMillis + milliseconds,
          status.durationMillis || 0
        );
        await this.sound.setPositionAsync(newPosition);
      }
    } catch (error) {
      console.error('Failed to skip forward:', error);
      throw error;
    }
  }

  async skipBackward(milliseconds: number): Promise<void> {
    try {
      if (!this.sound) {
        throw new Error('No sound loaded');
      }

      const status = await this.sound.getStatusAsync();
      if (status.isLoaded) {
        const newPosition = Math.max(status.positionMillis - milliseconds, 0);
        await this.sound.setPositionAsync(newPosition);
      }
    } catch (error) {
      console.error('Failed to skip backward:', error);
      throw error;
    }
  }

  async getStatus(): Promise<AVPlaybackStatus | null> {
    try {
      if (!this.sound) {
        return null;
      }

      return await this.sound.getStatusAsync();
    } catch (error) {
      console.error('Failed to get status:', error);
      return null;
    }
  }

  setStatusCallback(callback: (status: AVPlaybackStatus) => void): void {
    this.statusCallback = callback;
  }

  private onPlaybackStatusUpdate(status: AVPlaybackStatus): void {
    if (this.statusCallback) {
      this.statusCallback(status);
    }
  }

  async unloadSound(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
        this.currentUri = null;
      }
    } catch (error) {
      console.error('Failed to unload sound:', error);
    }
  }

  getCurrentUri(): string | null {
    return this.currentUri;
  }

  isLoaded(): boolean {
    return this.sound !== null;
  }
}

export const audioPlayerService = new AudioPlayerService();
