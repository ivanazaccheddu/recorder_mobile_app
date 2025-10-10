# APK Filename Fix

## Issue

The GitHub Actions workflow was failing with the following error after a successful Gradle build:

```
✅ Gradle build completed successfully
Checking for APK file...
❌ APK file not found
Listing build output directory:
-rw-r--r-- 1 runner runner 85326375 Oct 10 08:50 app-release.apk
```

The build was successful and the APK was created, but the workflow verification step failed because it was looking for the wrong filename.

## Root Cause

The workflow was checking for `app-release-unsigned.apk`, but the actual file produced by the Gradle build was `app-release.apk` (without the `-unsigned` suffix). This mismatch likely occurred due to changes in how Expo/Gradle names output APK files in newer SDK versions.

From the error output, we can see:
- The workflow looked for: `android/app/build/outputs/apk/release/app-release-unsigned.apk`
- The actual file created: `android/app/build/outputs/apk/release/app-release.apk`

## Solution

Updated the workflow and all documentation to use the correct filename: `app-release.apk`.

### Changes Made

#### 1. GitHub Actions Workflow (`.github/workflows/android-build.yml`)

**Verification Step:**
```yaml
- name: Verify APK was created
  run: |
    echo "Checking for APK file..."
    if [ -f "android/app/build/outputs/apk/release/app-release.apk" ]; then
      echo "✅ APK file found"
      ls -lh android/app/build/outputs/apk/release/app-release.apk
    else
      echo "❌ APK file not found"
      exit 1
    fi
```

**Upload Step:**
```yaml
- name: Upload APK artifact
  if: success()
  uses: actions/upload-artifact@v4
  with:
    name: app-release
    path: android/app/build/outputs/apk/release/app-release.apk
    retention-days: 30
    if-no-files-found: error
```

#### 2. Documentation Updates

Updated the following files to reference the correct filename:
- `BUILD_UPLOAD_FIX.md` - Build and upload documentation
- `JS_BUNDLE_FIX.md` - JavaScript bundle fix documentation
- `README.md` - Main project README
- `TESTING_GUIDE.md` - Testing instructions
- `UPGRADE_TO_SDK54.md` - SDK upgrade documentation

All references to `app-release-unsigned.apk` were changed to `app-release.apk`.

## Impact

This is a minimal change that fixes the immediate issue:
- ✅ The workflow will now find the APK file after a successful build
- ✅ The APK artifact will be uploaded correctly
- ✅ Users can download the APK from GitHub Actions
- ✅ No changes to build logic or configuration needed
- ✅ No changes to code or dependencies

## Testing

### Verification Test

Created a test to verify the fix:

```bash
# Create test structure
mkdir -p test/android/app/build/outputs/apk/release
touch test/android/app/build/outputs/apk/release/app-release.apk

# Test new logic (should pass)
cd test
if [ -f "android/app/build/outputs/apk/release/app-release.apk" ]; then
  echo "✅ APK file found"
fi

# Test old logic (should fail)
if [ -f "android/app/build/outputs/apk/release/app-release-unsigned.apk" ]; then
  echo "✅ APK file found"
else
  echo "❌ APK file not found"
  ls -la android/app/build/outputs/apk/release/
fi
```

**Result:**
- New logic: ✅ APK file found
- Old logic: ❌ APK file not found (shows `app-release.apk` in directory listing)

This confirms the fix correctly addresses the filename mismatch.

## Files Changed

1. `.github/workflows/android-build.yml` - Updated APK verification and upload paths
2. `BUILD_UPLOAD_FIX.md` - Updated documentation examples
3. `JS_BUNDLE_FIX.md` - Updated workflow examples and local build instructions
4. `README.md` - Updated CI/CD and local build instructions
5. `TESTING_GUIDE.md` - Updated testing instructions
6. `UPGRADE_TO_SDK54.md` - Updated workflow examples

## Summary

This fix resolves the "APK not found" error by correcting the APK filename expectation in the workflow. The build was always successful; we just needed to look for the correct filename. This is a surgical, minimal change that ensures the workflow can properly verify and upload the built APK artifact.
