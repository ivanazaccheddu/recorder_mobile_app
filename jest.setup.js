// Mock native modules that are not fully supported in jest-expo SDK 54 yet
jest.mock('expo-av', () => ({
  Audio: {
    setAudioModeAsync: jest.fn(),
    Recording: jest.fn(),
    Sound: jest.fn(),
    AndroidOutputFormat: {
      MPEG_4: 2,
    },
    AndroidAudioEncoder: {
      AAC: 3,
    },
    IOSOutputFormat: {
      MPEG4AAC: 'aac',
    },
    IOSAudioQuality: {
      LOW: 0x00,
      MEDIUM: 0x20,
      HIGH: 0x40,
    },
    RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4: 2,
    RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC: 3,
    RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC: 'aac',
    RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH: 0x40,
    INTERRUPTION_MODE_ANDROID_DO_NOT_MIX: 1,
    INTERRUPTION_MODE_IOS_DO_NOT_MIX: 1,
  },
}));

jest.mock('expo-media-library', () => ({
  requestPermissionsAsync: jest.fn(),
  saveToLibraryAsync: jest.fn(),
}));

jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'file:///mock/documents/',
  cacheDirectory: 'file:///mock/cache/',
  getInfoAsync: jest.fn(),
  makeDirectoryAsync: jest.fn(),
  copyAsync: jest.fn(),
  deleteAsync: jest.fn(),
  readDirectoryAsync: jest.fn(),
  getFreeDiskStorageAsync: jest.fn(),
  getTotalDiskCapacityAsync: jest.fn(),
}));
