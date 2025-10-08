# Expo SDK 51 Upgrade Guide

## Overview

This document describes the upgrade from Expo SDK 50 to SDK 51 that was performed to fix Android build failures.

## Problem

The Android build was failing with the following errors:

1. **Gradle Plugin Compatibility Error**:
   ```
   Could not find method android() for arguments [KotlinExpoModulesCorePlugin$_apply_closure4@...] 
   on project ':expo-sharing' of type org.gradle.api.Project
   ```

2. **Software Component Error**:
   ```
   Could not get unknown property 'release' for SoftwareComponent container of type 
   org.gradle.api.internal.component.DefaultSoftwareComponentContainer
   ```

These errors were caused by incompatibilities between Expo SDK 50 and the Android build tooling (Gradle 8.3 and Android Gradle Plugin 8.1.1).

## Solution

Upgraded to Expo SDK 51, which includes:

### Version Changes

| Package | Old Version | New Version |
|---------|-------------|-------------|
| expo | ~50.0.17 | ~51.0.39 |
| react-native | 0.73.6 | 0.74.5 |
| expo-av | ~13.10.6 | ~14.0.7 |
| expo-file-system | ~16.0.9 | ~17.0.1 |
| expo-haptics | ~12.8.1 | ~13.0.1 |
| expo-linear-gradient | ~12.7.2 | ~13.0.2 |
| expo-media-library | ~15.9.2 | ~16.0.5 |
| expo-sharing | ~11.7.0 | ~12.0.1 |
| expo-sqlite | ~13.4.0 | ~14.0.6 |
| expo-status-bar | ~1.11.1 | ~1.12.1 |
| @react-native-async-storage/async-storage | 1.21.0 | 1.23.1 |
| @react-native-community/netinfo | 11.1.0 | 11.3.1 |
| @react-native-community/slider | 4.4.2 | 4.5.2 |
| react-native-gesture-handler | ~2.14.0 | ~2.16.1 |
| react-native-safe-area-context | 4.8.2 | 4.10.5 |
| react-native-screens | ~3.29.0 | 3.31.1 |
| react-native-svg | 14.1.0 | 15.2.0 |

### Build Tools Updates

- **Gradle**: 8.3 → 8.8
- **Android Gradle Plugin**: 8.1.1 → 8.2.1
- **Kotlin**: 1.8.0 → 1.8.0 (unchanged)

## Breaking Changes

### expo-sqlite API Changes

The most significant breaking change is in `expo-sqlite`, which moved from a callback-based API to an async/await API.

#### Old API (SDK 50)
```typescript
const db = SQLite.openDatabase(DATABASE_NAME);

db.transaction(
  (tx) => {
    tx.executeSql('SELECT * FROM table', [], (_, { rows }) => {
      // Handle results
    });
  },
  (error) => console.error(error)
);
```

#### New API (SDK 51)
```typescript
const db = await SQLite.openDatabaseAsync(DATABASE_NAME);

const rows = await db.getAllAsync('SELECT * FROM table');
// Use rows directly
```

### Key API Method Changes

| Old Method | New Method |
|------------|------------|
| `openDatabase()` | `openDatabaseAsync()` |
| `transaction((tx) => {...})` | `runAsync()`, `getAllAsync()`, `getFirstAsync()` |
| `executeSql()` | `runAsync()` for writes, `getAllAsync()` or `getFirstAsync()` for reads |
| N/A (no close method) | `closeAsync()` |

## Files Modified

1. **package.json** - Updated all Expo and React Native dependencies
2. **src/storage/database.ts** - Completely refactored to use new expo-sqlite async API

## Testing

All existing tests pass:
- ✅ Type checking (`npm run type-check`)
- ✅ Unit tests (`npm test`)
- ✅ Linting (`npm run lint`)

## Migration Impact

### For Developers

If you're working on this project:
1. Delete `node_modules` and `package-lock.json`
2. Run `npm install`
3. Delete the `android` and `ios` directories
4. Run `npx expo prebuild` to regenerate native projects

### For CI/CD

The GitHub Actions workflow remains unchanged. It will automatically:
1. Install the new dependencies
2. Generate the Android project with the updated SDK
3. Build the APK successfully

## Benefits

1. **Resolved Build Errors**: Android builds now work correctly
2. **Better Performance**: Expo SDK 51 includes performance improvements
3. **Modern API**: The new async/await API is cleaner and easier to maintain
4. **Updated Dependencies**: All packages are now on supported versions
5. **Better Gradle Support**: Uses Gradle 8.8 which is more stable

## References

- [Expo SDK 51 Release Notes](https://blog.expo.dev/expo-sdk-51-7e00e48d9a57)
- [Expo SQLite Documentation](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- [React Native 0.74 Release Notes](https://reactnative.dev/blog/2024/04/22/release-0.74)
