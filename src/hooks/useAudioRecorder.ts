import { useState, useEffect, useCallback } from 'react';
import { audioRecorderService } from '../services/audioRecorder';
import { RecordingQuality } from '../types';
import * as Haptics from 'expo-haptics';

export const useAudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [metering, setMetering] = useState<number>(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isRecording && !isPaused) {
      interval = setInterval(async () => {
        const status = await audioRecorderService.getStatus();
        setDuration(status.duration);
        if (status.metering) {
          setMetering(status.metering.currentLevel);
        }
      }, 100);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRecording, isPaused]);

  const startRecording = useCallback(async (quality: RecordingQuality = 'high') => {
    try {
      await audioRecorderService.startRecording(quality);
      setIsRecording(true);
      setIsPaused(false);
      setDuration(0);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }, []);

  const pauseRecording = useCallback(async () => {
    try {
      await audioRecorderService.pauseRecording();
      setIsPaused(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Failed to pause recording:', error);
      throw error;
    }
  }, []);

  const resumeRecording = useCallback(async () => {
    try {
      await audioRecorderService.resumeRecording();
      setIsPaused(false);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Failed to resume recording:', error);
      throw error;
    }
  }, []);

  const stopRecording = useCallback(async () => {
    try {
      const result = await audioRecorderService.stopRecording();
      setIsRecording(false);
      setIsPaused(false);
      setDuration(0);
      setMetering(0);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      return result;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      setIsRecording(false);
      setIsPaused(false);
      throw error;
    }
  }, []);

  const cancelRecording = useCallback(async () => {
    try {
      await audioRecorderService.cancelRecording();
      setIsRecording(false);
      setIsPaused(false);
      setDuration(0);
      setMetering(0);
    } catch (error) {
      console.error('Failed to cancel recording:', error);
    }
  }, []);

  return {
    isRecording,
    isPaused,
    duration,
    metering,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    cancelRecording,
  };
};
