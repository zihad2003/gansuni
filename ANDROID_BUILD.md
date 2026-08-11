# Gaansuni — Android APK Build Instructions

## Prerequisites

- **Node.js** >= 18.17.0 (with pnpm 9.7.0)
- **Java JDK** 17 (required by Capacitor 6 / Gradle 8.x)
- **Android SDK** (API 34) with SDK Platform-Tools and Build-Tools
- **Android Studio** (for SDK Manager and device emulation)

---

## Step 1 — Install Dependencies

```bash
pnpm install
cd apps/web
pnpm install
```

---

## Step 2 — Install Capacitor CLI Globally (if not installed)

```bash
npm install -g @capacitor/cli
```

---

## Step 3 — Initialize Capacitor (first time only)

```bash
cd apps/web
npx cap init Gaansuni app.gansuni.player --web-dir out
npx cap add android
```

> This creates the `android/` project and syncs the web build output.

---

## Step 4 — Build Web Assets & Sync to Android

```bash
pnpm export
npx cap sync android
```

> `pnpm export` runs `next build && next export` → outputs static files to `apps/web/out/`
> `npx cap sync android` copies those files into `android/app/src/main/assets/public/`

---

## Step 5 — Build Debug APK

```bash
cd android
./gradlew assembleDebug
```

> Debug APK output: `android/app/build/outputs/apk/debug/app-debug.apk`

### Build Release APK (for distribution)

```bash
cd android
./gradlew assembleRelease
```

> Release APK output: `android/app/build/outputs/apk/release/app-release-unsigned.apk`

---

## Step 6 — Install on Device (Debug)

```bash
cd android
./gradlew installDebug
```

Or via ADB directly:
```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

---

## Alternative: One-Command Build Scripts

From project root (`D:\GanSuni`):

```bash
# Debug APK
cd apps/web && pnpm apk:debug

# Release APK (unsigned)
cd apps/web && pnpm apk:release
```

These scripts run: `pnpm export && pnpm cap:sync && cd android && ./gradlew assembleDebug`

---

## Key Android Configuration

| Setting | Value |
|---------|-------|
| Package ID | `app.gansuni.player` |
| Min SDK | 24 (Android 7.0) |
| Target SDK | 34 (Android 14) |
| Permissions | `INTERNET`, `WAKE_LOCK`, `FOREGROUND_SERVICE`, `FOREGROUND_SERVICE_MEDIA_PLAYBACK` |
| Cleartext | Disabled (except whitelisted domains in `network_security_config.xml`) |
| Audio Engine | HTML5 Audio + YouTube extractor (Piped/Invidious/Cobalt) |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Gradle build fails | Ensure JDK 17 is set: `export JAVA_HOME=/path/to/jdk-17` |
| `adb` not found | Add Android SDK `platform-tools/` to PATH |
| Audio doesn't play on device | Check `network_security_config.xml` whitelist; ensure `INTERNET` permission is granted |
| CORS errors | The app uses `/api/stream` proxy via Capacitor HTTP plugin |
| APK won't install | Uninstall old version first: `adb uninstall app.gansuni.player` |

---

## File Structure

```
apps/web/
├── capacitor.config.ts          # Capacitor config (appId, webDir, plugins)
├── next.config.js               # Next.js config with PWA caching for audio
├── android/
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml
│   │   │   ├── java/app/gansuni/player/MainActivity.java
│   │   │   ├── res/
│   │   │   │   ├── values/strings.xml
│   │   │   │   ├── values/styles.xml
│   │   │   │   └── xml/network_security_config.xml
│   │   └── build.gradle
│   ├── settings.gradle
│   ├── build.gradle
│   ├── gradle.properties
│   └── gradle/wrapper/gradle-wrapper.properties
├── out/                          # Next.js static export output (after pnpm export)
└── src/
    └── store/useAudioPlayer.ts   # Updated YouTube-first streaming store
```
