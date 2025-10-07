import { useState, useEffect, useCallback } from 'react';
import { AVPlaybackStatus } from 'expo-av';
import { audioPlayerService } from '../services/audioPlayer';
import { PlaybackSpeed } from '../types';
import { SKIP_INTERVALS } from '../constants/audioConfig';

export const useAudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState<PlaybackSpeed>(1.0);
  const [isLooping, setIsLooping] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    audioPlayerService.setStatusCallback(onPlaybackStatusUpdate);
    
    return () => {
      audioPlayerService.unloadSound();
    };
  }, []);

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setIsPlaying(status.isPlaying);
      setPosition(status.positionMillis);
      setDuration(status.durationMillis || 0);
      setIsLoaded(true);
    } else {
      setIsLoaded(false);
    }
  };

  const loadSound = useCallback(async (uri: string) => {
    try {
      await audioPlayerService.loadSound(uri);
      setIsLoaded(true);
    } catch (error) {
      console.error('Failed to load sound:', error);
      throw error;
    }
  }, []);

  const play = useCallback(async () => {
    try {
      await audioPlayerService.play();
    } catch (error) {
      console.error('Failed to play:', error);
      throw error;
    }
  }, []);

  const pause = useCallback(async () => {
    try {
      await audioPlayerService.pause();
    } catch (error) {
      console.error('Failed to pause:', error);
      throw error;
    }
  }, []);

  const stop = useCallback(async () => {
    try {
      await audioPlayerService.stop();
      setPosition(0);
    } catch (error) {
      console.error('Failed to stop:', error);
      throw error;
    }
  }, []);

  const seekTo = useCallback(async (positionMillis: number) => {
    try {
      await audioPlayerService.seekTo(positionMillis);
    } catch (error) {
      console.error('Failed to seek:', error);
      throw error;
    }
  }, []);

  const setPlaybackSpeed = useCallback(async (newSpeed: PlaybackSpeed) => {
    try {
      await audioPlayerService.setPlaybackSpeed(newSpeed);
      setSpeed(newSpeed);
    } catch (error) {
      console.error('Failed to set playback speed:', error);
      throw error;
    }
  }, []);

  const toggleLoop = useCallback(async () => {
    try {
      const newLooping = !isLooping;
      await audioPlayerService.setIsLooping(newLooping);
      setIsLooping(newLooping);
    } catch (error) {
      console.error('Failed to toggle loop:', error);
      throw error;
    }
  }, [isLooping]);

  const skipForward = useCallback(async (interval: 'short' | 'long' = 'short') => {
    try {
      const milliseconds = interval === 'short' ? SKIP_INTERVALS.short : SKIP_INTERVALS.long;
      await audioPlayerService.skipForward(milliseconds);
    } catch (error) {
      console.error('Failed to skip forward:', error);
      throw error;
    }
  }, []);

  const skipBackward = useCallback(async (interval: 'short' | 'long' = 'short') => {
    try {
      const milliseconds = interval === 'short' ? SKIP_INTERVALS.short : SKIP_INTERVALS.long;
      await audioPlayerService.skipBackward(milliseconds);
    } catch (error) {
      console.error('Failed to skip backward:', error);
      throw error;
    }
  }, []);

  const unload = useCallback(async () => {
    try {
      await audioPlayerService.unloadSound();
      setIsPlaying(false);
      setPosition(0);
      setDuration(0);
      setIsLoaded(false);
    } catch (error) {
      console.error('Failed to unload:', error);
    }
  }, []);

  return {
    isPlaying,
    position,
    duration,
    speed,
    isLooping,
    isLoaded,
    loadSound,
    play,
    pause,
    stop,
    seekTo,
    setPlaybackSpeed,
    toggleLoop,
    skipForward,
    skipBackward,
    unload,
  };
};
