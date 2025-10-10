# Testing Guide for SDK 54 Update

## Quick Start

After merging this PR, test the changes:

### 1. Local Development Test

```bash
# Clone fresh or pull changes
git pull origin main

# Clean install
rm -rf node_modules package-lock.json
npm install

# Run all checks (should all pass)
npm run type-check
npm test
npm run lint

# Test Android prebuild
npx expo prebuild --platform android --clean

# Verify Android project structure
ls -la android/
# Should see: app/, gradle/, build.gradle, gradlew, etc.
```

### 2. Manual Build Test (Optional)

If you want to test building locally:

```bash
cd android
chmod +x gradlew
./gradlew assembleDebug

# APK will be at:
# android/app/build/outputs/apk/debug/app-debug.apk
```

Note: This requires Android SDK to be installed locally.

### 3. GitHub Actions Test

The real test is in GitHub Actions:

1. **Merge this PR to main** (or your target branch)
2. **Watch the Android Build workflow**:
   - Go to: Actions → Android Build
   - Check that all steps pass:
     - ✅ Checkout
     - ✅ Setup JDK 17
     - ✅ Setup Node.js 18
     - ✅ Install dependencies
     - ✅ Type check
     - ✅ Tests
     - ✅ Lint
     - ✅ Generate native Android project
     - ✅ Build Android APK
     - ✅ Upload APK artifact

3. **Download and test the APK**:
   - Scroll to the bottom of the workflow run
   - Download the `app-release` artifact
   - Extract the ZIP to get `app-release.apk`
   - Install on an Android device/emulator
   - Test basic functionality:
     - Record an audio file
     - Play it back
     - Save and retrieve recordings

## What Changed

### For Users
- App functionality remains the same
- UI/UX unchanged
- All features work as before

### For Developers
- Expo SDK 54 (was SDK 51)
- React 19 (was React 18)
- React Native 0.81 (was 0.74)
- Production builds in CI/CD (was debug builds)
- Legacy expo-file-system API for compatibility

## Troubleshooting

### If build fails in CI

1. **Check logs** for the specific error
2. **Compare Gradle versions**:
   - Should be using Gradle 8.8
   - Should be using AGP 8.2.1
3. **Verify dependencies** installed correctly:
   - Check `npm ci` step succeeded
   - No version conflicts reported

### If you get type errors locally

```bash
# Regenerate TypeScript cache
rm -rf node_modules/.cache
npm run type-check
```

### If tests fail

```bash
# Clear Jest cache
npm test -- --clearCache
npm test
```

### If prebuild fails

```bash
# Clean everything
rm -rf android ios node_modules package-lock.json
npm install
npx expo prebuild --clean
```

## Expected Behavior

### ✅ Success Indicators
- All npm scripts pass (type-check, test, lint)
- Prebuild generates android/ directory without errors
- Gradle build completes successfully
- APK is generated and downloadable
- App installs and runs on Android device

### ❌ Failure Indicators (Should NOT happen)
- TypeScript errors in database.ts
- expo-sqlite import errors
- Gradle plugin not found errors
- "Could not find method android()" errors
- Build fails at assembleDebug step

## Rollback Plan

If issues occur after merging:

1. **Immediate rollback**:
   ```bash
   git revert <merge-commit-sha>
   git push origin main
   ```

2. **Alternative**: Cherry-pick just the essential fixes if needed

3. **Nuclear option**: Restore to previous commit before the merge

## Questions?

- Check `UPGRADE_TO_SDK54.md` for detailed migration info
- Check `UPGRADE_TO_SDK51.md` for previous SDK upgrade
- Check `BUILD_FIX_SUMMARY.md` for quick reference
- Review the original issue for context

## Success Checklist

- [ ] Local `npm install` completes without errors
- [ ] `npm run type-check` passes
- [ ] `npm test` passes (10/10 tests)
- [ ] `npm run lint` passes
- [ ] `npx expo prebuild --platform android` succeeds
- [ ] GitHub Actions workflow completes successfully
- [ ] APK artifact is downloadable from Actions
- [ ] APK installs on Android device
- [ ] App launches and basic features work
