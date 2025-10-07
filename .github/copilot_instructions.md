# Mobile Recording App Development Prompt

## Project Overview
Build a cross-platform mobile recording application with robust offline functionality. The app should allow users to record, store, manage, and playback audio recordings entirely offline, with optional cloud sync capabilities.

## Core Requirements

### 1. Platform & Technology Stack
- **Framework**: React Native with Expo (Managed Workflow)
- **Expo SDK**: Latest stable version (SDK 50+)
- **Target Platforms**: iOS and Android
- **Minimum Versions**: iOS 13+, Android 8.0+
- **Language**: TypeScript
- **Build System**: EAS Build for production builds

### 2. Recording Features
- **Audio Recording**:
  - High-quality audio capture (minimum 44.1kHz, 16-bit)
  - Support for multiple audio formats (MP3, WAV, M4A)
  - Real-time recording duration display
  - Pause/resume recording functionality
  - Visual waveform display during recording
  - Audio level meter/visualizer
  - Background recording support

- **Recording Controls**:
  - Start/Stop/Pause/Resume buttons
  - Timer display (elapsed time)
  - File size estimation
  - Recording quality selector (low/medium/high)

### 3. Offline Storage & Management
- **Local Storage**:
  - Store all recordings locally using device storage
  - Implement efficient file management system
  - Support for large file storage
  - Automatic storage space checking
  - Warning when storage is low

- **Recording Management**:
  - List view of all recordings with metadata
  - Sort by: date, name, duration, size
  - Search/filter functionality
  - Rename recordings
  - Delete recordings (with confirmation)
  - Folder/category organization
  - Batch operations (delete multiple, move)

### 4. Playback Features
- **Audio Player**:
  - Play/pause controls
  - Seek bar with timeline
  - Playback speed control (0.5x, 1x, 1.5x, 2x)
  - Skip forward/backward (10/30 seconds)
  - Loop/repeat options
  - Background playback support
  - Lock screen controls

- **Player UI**:
  - Waveform visualization during playback
  - Current time and total duration
  - Remaining time display

### 5. Offline-First Architecture
- **Data Persistence**:
  - Use SQLite or Realm for metadata storage
  - Store recordings in app's private storage
  - Implement proper file path management
  - Cache management for efficient performance

- **Offline Capabilities**:
  - Full app functionality without internet
  - Queue actions for sync when online
  - Offline indicator in UI
  - No network dependency for core features

### 6. User Interface
- **Design Requirements**:
  - Clean, intuitive interface
  - Material Design (Android) and Human Interface (iOS) guidelines
  - Dark mode support
  - Responsive layouts for different screen sizes
  - Accessibility features (screen reader support, proper contrast)

- **Key Screens**:
  - Home/Recording screen
  - Recordings library/list
  - Playback screen
  - Settings screen
  - Recording details/info screen

### 7. Additional Features
- **Metadata Management**:
  - Automatic timestamp
  - Recording title (auto-generated or user-defined)
  - Tags/labels
  - Notes/descriptions
  - Favorite/star recordings

- **Export & Share**:
  - Export recordings to device storage
  - Share via native share sheet
  - Support for multiple file format exports

- **Settings**:
  - Default recording quality
  - Default file format
  - Storage location preferences
  - Auto-delete old recordings option
  - Recording file naming convention

### 8. Optional Cloud Sync (Future Enhancement)
- Design architecture to support future cloud sync
- Implement conflict resolution strategy
- Sync status indicators
- Manual and automatic sync options

## Technical Implementation Guidelines

### State Management
- Use appropriate state management (Redux, MobX, Provider, or Riverpod)
- Implement proper separation of concerns

### Permissions
- Request and handle microphone permissions
- Request storage permissions (Android)
- Provide clear permission rationale to users

### Error Handling
- Graceful error handling for recording failures
- Storage full scenarios
- Permission denied cases
- Corrupted file handling

### Performance
- Optimize for battery life during recording
- Efficient memory management
- Lazy loading for large recording lists
- Background task management

### Testing
- Unit tests for core business logic
- Integration tests for recording/playback
- UI tests for critical user flows

## File Structure
```
/src
  /components      # Reusable UI components
  /screens         # Screen components
  /services        # Audio recording/playback services
  /storage         # Local storage management
  /utils           # Helper functions
  /models          # Data models
  /navigation      # Navigation configuration
  /constants       # App constants
  /assets          # Images, icons, fonts
```

## Deliverables
1. Fully functional mobile app with all core features
2. Clean, documented code
3. README with setup instructions
4. Basic user documentation
5. Build instructions for both platforms

## Priority Order
1. Basic recording and local storage
2. Playback functionality
3. Recording list and management
4. UI polish and additional features
5. Settings and customization options

## Success Criteria
- App works 100% offline
- Stable recording without crashes
- Smooth playback experience
- Intuitive user interface
- Efficient storage management
- Cross-platform compatibility

Please implement this application following best practices for mobile development, ensuring code quality, performance optimization, and user experience excellence.