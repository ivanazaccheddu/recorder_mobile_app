import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, IconButton, Surface, Chip, Menu } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { useRecordings } from '../context/RecordingsContext';
import { fileManager } from '../storage/fileManager';
import { PlaybackSpeed } from '../types';
import { PLAYBACK_SPEEDS } from '../constants/audioConfig';
import { RouteProp, useRoute } from '@react-navigation/native';
import { NavigationParams } from '../types';
import * as Sharing from 'expo-sharing';

type PlaybackScreenRouteProp = RouteProp<NavigationParams, 'Playback'>;

export const PlaybackScreen: React.FC = () => {
  const route = useRoute<PlaybackScreenRouteProp>();
  const { recordingId } = route.params;
  
  const {
    isPlaying,
    position,
    duration,
    speed,
    isLooping,
    isLoaded,
    loadSound,
    play,
    pause,
    seekTo,
    setPlaybackSpeed,
    toggleLoop,
    skipForward,
    skipBackward,
    unload,
  } = useAudioPlayer();

  const { recordings, updateRecording } = useRecordings();
  const [recording, setRecording] = useState(
    recordings.find((r) => r.id === recordingId)
  );
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  useEffect(() => {
    const currentRecording = recordings.find((r) => r.id === recordingId);
    setRecording(currentRecording);
    
    if (currentRecording) {
      loadSound(currentRecording.uri).catch(() => {
        Alert.alert('Error', 'Failed to load recording.');
      });
    }

    return () => {
      unload();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordingId, recordings]);

  const handlePlayPause = async () => {
    try {
      if (isPlaying) {
        await pause();
      } else {
        await play();
      }
    } catch (error) {
      Alert.alert('Error', 'Playback failed.');
    }
  };

  const handleSeek = async (value: number) => {
    try {
      await seekTo(value);
    } catch (error) {
      console.error('Seek failed:', error);
    }
  };

  const handleSpeedChange = async (newSpeed: PlaybackSpeed) => {
    try {
      await setPlaybackSpeed(newSpeed);
      setShowSpeedMenu(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to change playback speed.');
    }
  };

  const handleToggleFavorite = async () => {
    if (!recording) return;
    
    try {
      await updateRecording({
        id: recording.id,
        isFavorite: !recording.isFavorite,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to update favorite status.');
    }
  };

  const handleShare = async () => {
    if (!recording) return;

    try {
      const exportUri = await fileManager.exportRecording(recording.uri);
      if (exportUri) {
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(exportUri, {
            dialogTitle: 'Share Recording',
            mimeType: `audio/${recording.format}`,
          });
        } else {
          Alert.alert('Error', 'Sharing is not available on this device.');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share recording.');
    }
  };

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!recording) {
    return (
      <View style={styles.centerContainer}>
        <Text>Recording not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Surface style={styles.surface}>
        <View style={styles.header}>
          <Text style={styles.title}>{recording.title}</Text>
          <IconButton
            icon={recording.isFavorite ? 'star' : 'star-outline'}
            size={24}
            iconColor={recording.isFavorite ? '#FFD700' : undefined}
            onPress={handleToggleFavorite}
          />
        </View>

        <View style={styles.metadata}>
          <Chip icon="file-outline">{fileManager.formatBytes(recording.size)}</Chip>
          <Chip>{recording.format.toUpperCase()}</Chip>
        </View>

        <View style={styles.waveformContainer}>
          <View style={styles.waveformPlaceholder}>
            <Text style={styles.waveformText}>♪ ♫ ♪ ♫</Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <Text style={styles.time}>{formatTime(position)}</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={duration}
            value={position}
            onSlidingComplete={handleSeek}
            minimumTrackTintColor="#6200ee"
            maximumTrackTintColor="#d3d3d3"
            thumbTintColor="#6200ee"
          />
          <Text style={styles.time}>{formatTime(duration)}</Text>
        </View>

        <View style={styles.controls}>
          <IconButton
            icon="rewind-10"
            size={32}
            onPress={() => skipBackward('short')}
            disabled={!isLoaded}
          />
          <IconButton
            icon={isPlaying ? 'pause-circle' : 'play-circle'}
            size={64}
            onPress={handlePlayPause}
            disabled={!isLoaded}
          />
          <IconButton
            icon="fast-forward-10"
            size={32}
            onPress={() => skipForward('short')}
            disabled={!isLoaded}
          />
        </View>

        <View style={styles.secondaryControls}>
          <IconButton
            icon="replay-30"
            size={24}
            onPress={() => skipBackward('long')}
            disabled={!isLoaded}
          />
          <IconButton
            icon={isLooping ? 'repeat-once' : 'repeat'}
            size={24}
            onPress={toggleLoop}
            disabled={!isLoaded}
            iconColor={isLooping ? '#6200ee' : undefined}
          />
          <Menu
            visible={showSpeedMenu}
            onDismiss={() => setShowSpeedMenu(false)}
            anchor={
              <IconButton
                icon="speedometer"
                size={24}
                onPress={() => setShowSpeedMenu(true)}
                disabled={!isLoaded}
              />
            }
          >
            {PLAYBACK_SPEEDS.map((s) => (
              <Menu.Item
                key={s}
                onPress={() => handleSpeedChange(s)}
                title={`${s}x`}
                leadingIcon={speed === s ? 'check' : undefined}
              />
            ))}
          </Menu>
          <IconButton
            icon="share-variant"
            size={24}
            onPress={handleShare}
          />
        </View>

        {recording.notes && (
          <View style={styles.notesContainer}>
            <Text style={styles.notesLabel}>Notes:</Text>
            <Text style={styles.notes}>{recording.notes}</Text>
          </View>
        )}
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  surface: {
    flex: 1,
    padding: 24,
    borderRadius: 16,
    elevation: 4,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  metadata: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  waveformContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 24,
  },
  waveformPlaceholder: {
    width: '100%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  waveformText: {
    fontSize: 48,
    color: '#6200ee',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  slider: {
    flex: 1,
  },
  time: {
    fontSize: 12,
    fontFamily: 'monospace',
    minWidth: 40,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  secondaryControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  notesContainer: {
    marginTop: 24,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#666',
  },
  notes: {
    fontSize: 14,
  },
});
