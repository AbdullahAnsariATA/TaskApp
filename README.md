# TaskApp

React Native **0.83.1** · Hermes · New Architecture

---

## Prerequisites

| Tool           | Version   | Install                                                      |
|----------------|-----------|--------------------------------------------------------------|
| Node.js        | >= 20     | [nodejs.org](https://nodejs.org/) or `nvm install 20`       |
| Yarn           | 1.x       | `npm install -g yarn`                                        |
| Watchman       | latest    | `brew install watchman`                                      |
| Ruby           | >= 2.6.10 | Via [rbenv](https://github.com/rbenv/rbenv) or [rvm](https://rvm.io/) |
| Xcode          | >= 15     | [Mac App Store](https://apps.apple.com/us/app/xcode/id497799835?mt=12) (iOS) |
| Xcode CLI      | latest    | `xcode-select --install`                                     |
| Android Studio | latest    | [developer.android.com/studio](https://developer.android.com/studio) |
| JDK            | 17        | Bundled with Android Studio or `brew install --cask zulu17`  |

Add to your `~/.zshrc` (or `~/.bashrc`):

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

---

## Setup

```bash
# 1. Clone
git clone <repository-url>
cd task-project

# 2. Install JS dependencies (also runs patch-package via postinstall)
yarn

# 3. Install Ruby gems (CocoaPods)
bundle install

# 4. Install iOS pods
cd ios && bundle exec pod install && cd ..

# 5. Create env file and fill in the values
cp .env.development .env
```

### Firebase (required)

Place these files from the [Firebase Console](https://console.firebase.google.com/) — the app will crash without them:

- `android/app/google-services.json`
- `ios/TaskApp/GoogleService-Info.plist`

### Environment Variables

The `.env` file is read at build time via `react-native-dotenv`. Templates (`.env.development`, `.env.production`) are in the repo with empty values.

| Variable                  | Description                          | Required |
|---------------------------|--------------------------------------|----------|
| `API_BASE_URL`            | Backend API base URL                 | Yes      |
| `SOCKET_BASE_URL`         | WebSocket server URL                 | Yes      |
| `WEB_CLIENT_ID`           | Google Sign-In web client ID         | Yes      |
| `IOS_CLIENT_ID`           | Google Sign-In iOS client ID         | Yes      |
| `ANDROID_CLIENT_ID`       | Google Sign-In Android client ID     | Yes      |
| `MAP_API_KEY`             | Google Maps API key                  | Yes      |
| `IMAGE_URL`               | Base URL for remote images           | Yes      |
| `APPLE_CLIENT_ID_ANDROID` | Apple Sign-In service ID (Android)   | No       |
| `APPLE_REDIRECT_URI`      | Apple Sign-In redirect URI           | No       |
| `APPLE_MERCHANT_ID`       | Apple Pay merchant ID                | No       |
| `ANDROID_MAP_KEYS`        | Maps key override (Android)          | No       |
| `IOS_MAP_KEYS`            | Maps key override (iOS)              | No       |
| `MAP_KEYS`                | Fallback map key                     | No       |
| `IS_ALPHA_PHASE`          | Alpha feature flag (`true`/`false`)  | No       |
| `IOS_CHANNEL_ZENDESK`     | Zendesk channel key (iOS)            | No       |
| `ANDROID_CHANNEL_ZENDESK` | Zendesk channel key (Android)        | No       |
| `OFFLINE_ACCESS`          | OAuth offline access scope           | No       |

### Android Emulator

Open Android Studio → Virtual Device Manager → create a **Pixel 9** AVD (API 34+). The run script expects an AVD named `Pixel_9`.

---

## Run on Android

```bash
yarn android              # launches Pixel_9 emulator if needed + builds debug
```

Physical device:

```bash
yarn devices              # lists devices + adb reverse tcp:8081
yarn android
```

---

## Run on iOS

```bash
yarn ios                  # build + run on simulator (pods must be installed)
# or
yarn debugIos             # pod install + build + run
```

---

## Docker Setup (Android)

> iOS builds require macOS + Xcode and cannot run in Docker. Docker is for Android builds only.

### Dockerfile

```dockerfile
FROM reactnativecommunity/react-native-android:latest

WORKDIR /app

# Install JS dependencies (cached layer)
COPY package.json yarn.lock ./
RUN yarn --frozen-lockfile

# Copy project
COPY . .

# Environment variables
COPY .env.production .env

# Build release APK
RUN cd android && ./gradlew assembleRelease
```

### Build & extract the APK

```bash
docker build -t taskapp-android .
docker create --name extract taskapp-android
docker cp extract:/app/android/app/build/outputs/apk/release/ ./apk-output
docker rm extract
```

### Build AAB (Play Store bundle)

Replace the last `RUN` line in the Dockerfile:

```dockerfile
RUN cd android && ./gradlew bundleRelease
```

Then extract:

```bash
docker build -t taskapp-android .
docker create --name extract taskapp-android
docker cp extract:/app/android/app/build/outputs/bundle/release/ ./aab-output
docker rm extract
```

### One-liner (no Dockerfile needed)

```bash
docker run --rm -v "$PWD":/app -w /app \
  reactnativecommunity/react-native-android:latest \
  bash -c "yarn --frozen-lockfile && cd android && ./gradlew assembleRelease"
```

The APK will be at `android/app/build/outputs/apk/release/`.

The [`reactnativecommunity/react-native-android`](https://hub.docker.com/r/reactnativecommunity/react-native-android) image ships with Node, Yarn, JDK 17, and the Android SDK pre-configured.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `yarn` install fails | `yarn clean` (removes `node_modules`, clears cache, reinstalls) |
| Android OOM during build | Already set to 6 GB in `android/gradle.properties` — increase `org.gradle.jvmargs` if needed |
| iOS pod install fails | `yarn ios:clean` then `yarn pod` |
| Metro port 8081 in use | `lsof -ti:8081 \| xargs kill -9` or `yarn start --port 8082` |
| Build fails after branch switch | `yarn pod:reset` (iOS) / `yarn android:clean` (Android) |
| Firebase crash on launch | Add `google-services.json` (Android) and `GoogleService-Info.plist` (iOS) from Firebase Console |
| Emulator not found | Create a `Pixel_9` AVD in Android Studio, or edit the name in `scripts/run-android-pixel.sh` |
