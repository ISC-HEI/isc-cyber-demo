#!/usr/bin/env bash
# Manual kiosk: serve dist/ locally and open it in a fullscreen Chromium.
# Usage: bun run build && kiosk/start.sh   (closing Chromium stops everything)
set -eu

HERE="$(cd "$(dirname "$0")" && pwd)"
APP_DIR="${APP_DIR:-$(dirname "$HERE")/dist}"
PORT="${PORT:-8080}"
URL="http://127.0.0.1:${PORT}"

[ -f "$APP_DIR/index.html" ] || { echo "dist/ missing: run 'bun run build' first" >&2; exit 1; }

for b in chromium chromium-browser google-chrome; do
  command -v "$b" >/dev/null && { BROWSER="$b"; break; }
done
[ -n "${BROWSER:-}" ] || { echo "no Chromium/Chrome found" >&2; exit 1; }

# The worker needs http://, not file://. Loopback only.
python3 -m http.server "$PORT" --bind 127.0.0.1 --directory "$APP_DIR" >/dev/null 2>&1 &
SERVER=$!
trap 'kill $SERVER 2>/dev/null' EXIT

# Dedicated profile, no --incognito: it would wipe the settings kept in localStorage.
# Snap Chromium (default on Ubuntu) is confined and cannot write ~/.config: use its own
# writable dir instead ("failed to create data directory" otherwise).
PROFILE="${PROFILE_DIR:-$HOME/.config/isc-kiosk}"
# /usr/bin/chromium(-browser) is only a shim to the snap, so also ask snapd.
if [ "$BROWSER" != google-chrome ] && { case "$(readlink -f "$(command -v "$BROWSER")")" in /snap/*|*/snap/bin/*) true ;; *) false ;; esac \
    || { command -v snap >/dev/null && snap list chromium >/dev/null 2>&1; }; }; then
  PROFILE="${PROFILE_DIR:-$HOME/snap/chromium/common/isc-kiosk}"
fi
mkdir -p "$PROFILE"

"$BROWSER" --kiosk --user-data-dir="$PROFILE" \
  --noerrdialogs --disable-infobars --no-first-run --no-default-browser-check \
  --disable-session-crashed-bubble "$URL"
