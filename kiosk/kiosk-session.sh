#!/usr/bin/env bash
# Session script run by GDM for the `kiosk` user: static server + Chromium inside
# the `cage` single-app Wayland compositor (no panel, no Alt+Tab, no VT switching).
set -u

APP_DIR="${APP_DIR:-/opt/isc-cyber-demo/dist}"
PORT="${PORT:-8080}"
URL="http://127.0.0.1:${PORT}"

# Chromium: prefer Google Chrome / Debian chromium, fall back to the snap.
if command -v google-chrome >/dev/null; then BROWSER=google-chrome; PROFILE="$HOME/.config/isc-kiosk"
elif command -v chromium-browser >/dev/null; then BROWSER=chromium-browser; PROFILE="$HOME/snap/chromium/common/isc-kiosk"
elif command -v chromium >/dev/null; then BROWSER=chromium; PROFILE="$HOME/.config/isc-kiosk"
else echo "no Chromium/Chrome found" >&2; exit 1; fi
mkdir -p "$PROFILE"

# The worker needs http://, not file://. Loopback only.
python3 -m http.server "$PORT" --bind 127.0.0.1 --directory "$APP_DIR" >/dev/null 2>&1 &
SERVER=$!
trap 'kill $SERVER 2>/dev/null' EXIT

# No --incognito: it would wipe the assistant settings kept in localStorage.
# Respawn the browser if it ever crashes or is closed.
while true; do
  cage -d -- "$BROWSER" \
    --kiosk --user-data-dir="$PROFILE" \
    --ozone-platform=wayland --noerrdialogs --disable-infobars \
    --no-first-run --no-default-browser-check --disable-translate \
    --disable-session-crashed-bubble --disable-features=TranslateUI \
    --disable-pinch --overscroll-history-navigation=0 \
    --check-for-update-interval=31536000 \
    --disable-dev-tools --disable-extensions \
    "$URL"
  sleep 2
done
