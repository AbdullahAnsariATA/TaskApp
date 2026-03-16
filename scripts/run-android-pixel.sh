#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ANDROID_SDK_ROOT=${ANDROID_SDK_ROOT:-$HOME/Library/Android/sdk}
EMULATOR="$ANDROID_SDK_ROOT/emulator/emulator"
ADB="${ANDROID_HOME:-$ANDROID_SDK_ROOT}/platform-tools/adb"
AVD="Pixel_9"

if ! "$EMULATOR" -list-avds 2>/dev/null | grep -qx "$AVD"; then
  echo "AVD '$AVD' not found. Available AVDs:" >&2
  "$EMULATOR" -list-avds 2>/dev/null || true
  exit 1
fi

# Start emulator if no device connected
if ! $ADB devices 2>/dev/null | awk 'NR>1 && $2=="device"{exit 0} END{exit 1}'; then
  echo "Starting emulator: $AVD"
  nohup "$EMULATOR" -avd "$AVD" -no-snapshot-load -netdelay none -netfast >"$HOME/.emulator_${AVD}.log" 2>&1 &
  # wait for device and full boot
  "$ADB" wait-for-device >/dev/null 2>&1 || true
  for i in {1..180}; do
    if "$ADB" shell getprop sys.boot_completed 2>/dev/null | tr -d '\r' | grep -q '^1$'; then
      echo "Emulator $AVD booted"
      break
    fi
    sleep 1
  done
fi

# export to prefer this AVD
export ANDROID_AVD="$AVD"
SERIAL=$($ADB devices | awk 'NR>1 && $2=="device"{print $1; exit}')
if [ -n "$SERIAL" ]; then
  export ANDROID_SERIAL="$SERIAL"
fi

# Run react-native install
cd "$ROOT_DIR"
exec npx react-native run-android
