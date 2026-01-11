# Square Away Mobile App

Mobile version of Square Away - focused on video creation and viewing.

## Prerequisites

1. **Node.js** (v18 or later)
2. **Expo CLI**: Install globally
   ```bash
   npm install -g expo-cli
   ```
3. **Expo Go app** on your phone (iOS or Android)
   - iOS: Download from App Store
   - Android: Download from Google Play Store

## Setup

1. **Install dependencies**:
   ```bash
   cd mobile
   npm install
   ```

2. **Configure Backend URL**:
   - Open `mobile/services/videoService.ts`
   - Update `API_BASE_URL` with your backend URL:
     - For local testing with physical device: Use your computer's IP address (e.g., `http://192.168.1.100:5000`)
     - For production: Use your deployed backend URL

3. **Start the development server**:
   ```bash
   npm start
   ```
   This will open Expo DevTools in your browser and show a QR code.

## Testing Methods

### Method 1: Expo Go (Easiest - Recommended for Quick Testing)

**On Physical Device:**
1. Make sure your phone and computer are on the same WiFi network
2. Open Expo Go app on your phone
3. Scan the QR code shown in terminal/browser
4. App will load on your device

**Pros:**
- Fastest setup
- Works on real device
- Hot reload enabled

**Cons:**
- Some native modules may not work
- Limited to Expo SDK features

### Method 2: iOS Simulator (Mac Only)

1. Install Xcode from App Store
2. Open iOS Simulator:
   ```bash
   npm run ios
   ```
3. Simulator will open automatically

**Pros:**
- Full iOS testing environment
- No physical device needed

**Cons:**
- Mac only
- Requires Xcode (large download)

### Method 3: Android Emulator

1. Install Android Studio
2. Set up an Android Virtual Device (AVD)
3. Start emulator from Android Studio
4. Run:
   ```bash
   npm run android
   ```

**Pros:**
- Full Android testing environment
- No physical device needed

**Cons:**
- Requires Android Studio setup
- Emulator can be slow

### Method 4: Web Browser (Limited)

```bash
npm run web
```

**Note:** This is limited - video playback may not work properly. Use for UI testing only.

## Important Notes for Testing

### Backend Connection

The mobile app needs to connect to your Flask backend. For local testing:

1. **If testing on physical device:**
   - Find your computer's IP address:
     - Mac/Linux: `ifconfig | grep "inet "`
     - Windows: `ipconfig`
   - Update `API_BASE_URL` in `videoService.ts` to use your IP (e.g., `http://192.168.1.100:5000`)
   - Make sure your Flask server is running and accessible on your network

2. **If testing on simulator/emulator:**
   - iOS Simulator: Use `http://localhost:5000` or `http://127.0.0.1:5000`
   - Android Emulator: Use `http://10.0.2.2:5000` (special IP for Android emulator)

### Supabase Configuration

The Supabase credentials are already configured in `services/supabase.ts`. Make sure:
- Your Supabase project is accessible
- RLS policies allow mobile app access
- Storage bucket permissions are set correctly

## Troubleshooting

### "Unable to connect to server"
- Check that your Flask backend is running
- Verify the API_BASE_URL is correct
- For physical devices, ensure phone and computer are on same network
- Check firewall settings

### "Network request failed"
- Verify backend URL is correct
- Check if backend CORS is configured to allow mobile app
- Try accessing the backend URL directly in browser

### Video not playing
- Check video URL is accessible
- Verify Supabase storage bucket is public or has proper permissions
- Check network connection

### Expo Go not connecting
- Ensure phone and computer are on same WiFi
- Try switching to "Tunnel" mode in Expo DevTools (slower but works across networks)
- Restart Expo server

## Development Workflow

1. Make changes to code
2. Save file - changes will hot reload automatically
3. Shake device (or press `Cmd+D` on iOS simulator / `Cmd+M` on Android) to open developer menu
4. Use "Reload" to refresh the app

## Building for Production

When ready to build standalone apps:

```bash
# iOS
eas build --platform ios

# Android
eas build --platform android
```

Requires Expo account and EAS (Expo Application Services) setup.

