# Quick Start Guide

Get up and running with the Audio Recorder App in 5 minutes!

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Expo CLI (installed via npm)
- iOS Simulator (macOS) or Android Emulator

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/ivanazaccheddu/recorder_mobile_app.git
cd recorder_mobile_app
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- React Native & Expo
- Navigation libraries
- Audio libraries (expo-av)
- Storage libraries (expo-sqlite, AsyncStorage)
- UI components (React Native Paper)

### 3. Start the Development Server

```bash
npm start
```

This will:
- Start the Expo development server
- Open Expo DevTools in your browser
- Show a QR code for device testing

## Running the App

### Option 1: Physical Device (Recommended)

1. **Install Expo Go** on your device:
   - iOS: Download from App Store
   - Android: Download from Google Play

2. **Scan the QR code** displayed in terminal or browser

3. **Grant permissions** when prompted:
   - Microphone access (required)
   - Media library access (optional)

### Option 2: iOS Simulator (macOS only)

```bash
npm run ios
```

Or press `i` in the terminal where Expo is running.

### Option 3: Android Emulator

```bash
npm run android
```

Or press `a` in the terminal where Expo is running.

## First Use

### 1. Grant Permissions

When you first open the app:
- Tap **Allow** for microphone access
- This is required for recording functionality

### 2. Make Your First Recording

1. You'll start on the **Record** tab
2. Select recording quality (High recommended)
3. Tap the **microphone button**
4. Speak into your device
5. Tap the **stop button** to save

### 3. View Your Recordings

1. Tap the **Recordings** tab at bottom
2. See your saved recording
3. Tap to play it back

### 4. Adjust Settings

1. Tap the **Settings** tab
2. Configure preferences:
   - Recording quality
   - Audio format
   - Storage options

## Development

### Project Structure

```
recorder_mobile_app/
├── src/
│   ├── components/      # Reusable UI components
│   ├── screens/         # App screens
│   ├── services/        # Audio services
│   ├── storage/         # Data persistence
│   ├── hooks/           # Custom hooks
│   ├── navigation/      # Navigation config
│   ├── context/         # State management
│   ├── types/           # TypeScript types
│   ├── utils/           # Helper functions
│   └── constants/       # App constants
├── App.tsx              # App entry point
├── package.json         # Dependencies
└── app.json            # Expo configuration
```

### Available Scripts

```bash
# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run tests
npm test

# Type check
npm run type-check

# Lint code
npm run lint
```

### Making Changes

1. Edit files in the `src/` directory
2. Changes hot-reload automatically
3. Check console for errors
4. Test on both platforms if possible

## Testing on Device vs Simulator

### Physical Device (Best for Audio)
✅ Real microphone quality
✅ Actual storage performance
✅ True user experience
✅ Background recording works
✅ Lock screen controls work

### Simulator/Emulator
⚠️ Microphone may not work properly
⚠️ Performance may differ
✅ Quick development iteration
✅ Easy debugging
✅ Good for UI testing

## Common Issues

### Issue: "Module not found"
**Solution**: 
```bash
rm -rf node_modules
npm install
```

### Issue: "Expo Go is too old"
**Solution**: Update Expo Go app on your device

### Issue: "Cannot connect to Metro"
**Solution**: 
- Check you're on same WiFi network
- Try `npm start -- --clear`

### Issue: "Microphone not working"
**Solution**: 
- Check permissions in device settings
- Restart the app
- Use physical device (not simulator)

## Next Steps

1. **Read the [User Guide](USER_GUIDE.md)** for detailed feature documentation
2. **Check [Contributing Guide](CONTRIBUTING.md)** if you want to contribute
3. **Review [README.md](README.md)** for comprehensive project information

## Need Help?

- Check the troubleshooting section in [USER_GUIDE.md](USER_GUIDE.md)
- Open an issue on GitHub
- Review existing issues and discussions

## Tips

- 🎯 Test audio features on a real device
- 🔋 Keep device charged for extended recordings
- 📱 Use "High" quality for best results
- 🗂️ Regularly check storage space
- ⭐ Star recordings to organize important ones

---

Happy recording! 🎙️

For more detailed information, see the [full README](README.md).
