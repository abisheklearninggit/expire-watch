# FreshTrack Mobile Setup Guide

FreshTrack uses Capacitor to provide native mobile features including camera access and push notifications.

## Prerequisites

- Node.js and npm installed
- For iOS: macOS with Xcode installed
- For Android: Android Studio installed

## Setup Instructions

### 1. Clone and Install

First, transfer your project to GitHub and clone it locally:

```bash
git clone <your-github-url>
cd <project-folder>
npm install
```

### 2. Initialize Capacitor

Capacitor is already configured in `capacitor.config.ts`. The configuration includes:
- App ID: `app.lovable.59d5b5db67bf4705af2eee96d82c9cdb`
- App Name: `FreshTrack`
- Hot reload enabled for development

### 3. Add Mobile Platforms

Add iOS and/or Android platforms:

```bash
# For iOS (requires macOS)
npx cap add ios

# For Android
npx cap add android
```

### 4. Build Your Web Assets

Build the web application first:

```bash
npm run build
```

### 5. Sync Capacitor

Sync your built web assets and native dependencies:

```bash
npx cap sync
```

Run this command whenever you:
- Make changes to native plugins
- Update dependencies
- Make changes to capacitor.config.ts

### 6. Run on Device/Emulator

#### For iOS:

```bash
npx cap open ios
```

This opens Xcode. Then:
1. Select your target device/simulator
2. Click the Play button to build and run

#### For Android:

```bash
npx cap open android
```

This opens Android Studio. Then:
1. Select your target device/emulator
2. Click the Run button

Alternatively, you can run directly:

```bash
# iOS
npx cap run ios

# Android
npx cap run android
```

## Features Enabled

### 📸 Native Camera Access
- Take photos using device camera
- Select images from photo gallery
- Real-time OCR and product recognition

### 🔔 Local Notifications
- Scheduled reminders before product expiry
- Customizable notification timing
- Background notification support

### 🔄 Hot Reload (Development)
- Live updates from Lovable preview
- No need to rebuild for code changes
- Configured in capacitor.config.ts

## Development Workflow

1. Make changes in Lovable editor
2. Changes appear automatically on device (hot reload)
3. For native plugin changes:
   ```bash
   npx cap sync
   ```
4. Rebuild app if needed

## Permissions

The app requests these permissions:
- **Camera**: For scanning product labels
- **Photos**: For selecting images from gallery
- **Notifications**: For expiry reminders

Permissions are requested at runtime when features are first used.

## Troubleshooting

### Build Errors
```bash
# Clean and reinstall
rm -rf node_modules package-lock.json
npm install
npx cap sync
```

### iOS Signing Issues
- Open Xcode project
- Select your development team in Signing & Capabilities
- Ensure bundle identifier matches config

### Android Gradle Issues
- Open Android Studio
- File → Sync Project with Gradle Files
- Check Android Studio SDK settings

## Production Build

### Disable Hot Reload

For production builds, remove or comment out the `server` section in `capacitor.config.ts`:

```typescript
const config: CapacitorConfig = {
  appId: 'app.lovable.59d5b5db67bf4705af2eee96d82c9cdb',
  appName: 'FreshTrack',
  webDir: 'dist',
  // Remove or comment out for production:
  // server: { ... }
};
```

Then rebuild:
```bash
npm run build
npx cap sync
```

### Build for Stores

Follow platform-specific guides:
- iOS: [Apple App Store Connect](https://developer.apple.com/app-store-connect/)
- Android: [Google Play Console](https://play.google.com/console)

## Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Capacitor Camera Plugin](https://capacitorjs.com/docs/apis/camera)
- [Capacitor Local Notifications](https://capacitorjs.com/docs/apis/local-notifications)
- [Lovable Capacitor Guide](https://docs.lovable.dev/features/capacitor)
