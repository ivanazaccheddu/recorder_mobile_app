import { Audio } from 'expo-av';
import * as MediaLibrary from 'expo-media-library';
import { Alert, Platform } from 'react-native';

export async function requestAudioPermissions(): Promise<boolean> {
  try {
    const { status } = await Audio.requestPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'This app needs access to your microphone to record audio. Please grant permission in your device settings.',
        [{ text: 'OK' }]
      );
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error requesting audio permissions:', error);
    return false;
  }
}

export async function requestMediaLibraryPermissions(): Promise<boolean> {
  try {
    if (Platform.OS === 'web') {
      return true;
    }

    const { status } = await MediaLibrary.requestPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'To save recordings to your media library, please grant permission in your device settings.',
        [{ text: 'OK' }]
      );
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error requesting media library permissions:', error);
    return false;
  }
}
