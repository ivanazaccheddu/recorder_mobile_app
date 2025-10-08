import React, { useState } from 'react';
import { View, StyleSheet, Text, Alert } from 'react-native';
import { Button, IconButton, Surface } from 'react-native-paper';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useRecordings } from '../context/RecordingsContext';
import { fileManager } from '../storage/fileManager';
import { settingsStorage } from '../storage/settingsStorage';
import { Recording, RecordingQuality } from '../types';
import { DEFAULT_RECORDING_NAME_PREFIX } from '../constants';
import { format } from 'date-fns';

export const RecordScreen: React.FC = () => {
  const {
    isRecording,
    isPaused,
    duration,
    metering,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
  } = useAudioRecorder();

  const { addRecording } = useRecordings();
  const [quality, setQuality] = useState<RecordingQuality>('high');

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = async () => {
    try {
      const settings = await settingsStorage.getSettings();
      await startRecording(settings.quality);
    } catch (error) {
      Alert.alert('Error', 'Failed to start recording. Please check microphone permissions.');
    }
  };

  const handleStopRecording = async () => {
    try {
      const result = await stopRecording();
      const settings = await settingsStorage.getSettings();
      
      // Save the recording
      const fileName = fileManager.generateFileName(settings.format);
      const savedUri = await fileManager.saveRecording(result.uri, fileName);
      const fileSize = await fileManager.getFileSize(savedUri);
      
      const recording: Recording = {
        id: Date.now().toString(),
        title: `${DEFAULT_RECORDING_NAME_PREFIX} ${format(new Date(), 'MMM dd, yyyy HH:mm')}`,
        uri: savedUri,
        duration: result.duration,
        size: fileSize,
        createdAt: new Date().toISOString(),
        format: settings.format,
        isFavorite: false,
      };

      await addRecording(recording);
      Alert.alert('Success', 'Recording saved successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save recording.');
    }
  };

  const handlePauseResume = async () => {
    try {
      if (isPaused) {
        await resumeRecording();
      } else {
        await pauseRecording();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pause/resume recording.');
    }
  };

  const getMeteringBar = () => {
    // Normalize metering value to 0-1 range (metering is typically -160 to 0)
    const normalized = Math.max(0, (metering + 160) / 160);
    const barWidth = normalized * 100;
    
    return (
      <View style={styles.meteringContainer}>
        <View style={[styles.meteringBar, { width: `${barWidth}%` }]} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.surface}>
        <Text style={styles.title}>Audio Recorder</Text>
        
        {!isRecording && (
          <View style={styles.qualitySelector}>
            <Button
              mode={quality === 'low' ? 'contained' : 'outlined'}
              onPress={() => setQuality('low')}
              style={styles.qualityButton}
            >
              Low
            </Button>
            <Button
              mode={quality === 'medium' ? 'contained' : 'outlined'}
              onPress={() => setQuality('medium')}
              style={styles.qualityButton}
            >
              Medium
            </Button>
            <Button
              mode={quality === 'high' ? 'contained' : 'outlined'}
              onPress={() => setQuality('high')}
              style={styles.qualityButton}
            >
              High
            </Button>
          </View>
        )}

        <View style={styles.timerContainer}>
          <Text style={styles.timer}>{formatTime(duration)}</Text>
          {isRecording && isPaused && <Text style={styles.pausedText}>PAUSED</Text>}
        </View>

        {isRecording && getMeteringBar()}

        <View style={styles.controls}>
          {!isRecording ? (
            <IconButton
              icon="microphone"
              size={80}
              mode="contained"
              onPress={handleStartRecording}
              iconColor="#fff"
              containerColor="#6200ee"
            />
          ) : (
            <>
              <IconButton
                icon={isPaused ? 'play' : 'pause'}
                size={60}
                mode="contained"
                onPress={handlePauseResume}
              />
              <IconButton
                icon="stop"
                size={80}
                mode="contained"
                onPress={handleStopRecording}
                iconColor="#fff"
                containerColor="#cf6679"
              />
            </>
          )}
        </View>

        <Text style={styles.hint}>
          {!isRecording
            ? 'Tap the microphone to start recording'
            : 'Recording in progress...'}
        </Text>
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  surface: {
    padding: 24,
    borderRadius: 16,
    elevation: 4,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  qualitySelector: {
    flexDirection: 'row',
    marginBottom: 32,
    gap: 8,
  },
  qualityButton: {
    flex: 1,
  },
  timerContainer: {
    alignItems: 'center',
    marginVertical: 32,
  },
  timer: {
    fontSize: 48,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  pausedText: {
    fontSize: 16,
    color: '#cf6679',
    marginTop: 8,
    fontWeight: 'bold',
  },
  meteringContainer: {
    width: '100%',
    height: 40,
    backgroundColor: '#e0e0e0',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
  },
  meteringBar: {
    height: '100%',
    backgroundColor: '#03dac4',
    borderRadius: 20,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginVertical: 24,
  },
  hint: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
