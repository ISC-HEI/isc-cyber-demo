#!/usr/bin/env bash
# Install the ISC cyber demo as a kiosk on Ubuntu (GDM, 22.04+). Run with sudo from the repo:
#   bun run build && sudo kiosk/install-ubuntu.sh
# Reboot afterwards. To undo: sudo kiosk/install-ubuntu.sh --uninstall
set -euo pipefail

[ "$(id -u)" -eq 0 ] || { echo "run with sudo" >&2; exit 1; }
HERE="$(cd "$(dirname "$0")" && pwd)"
REPO="$(dirname "$HERE")"
DEST=/opt/isc-cyber-demo
KUSER=kiosk
GDM_CONF=/etc/gdm3/custom.conf
SESSION_FILE=/usr/share/wayland-sessions/isc-kiosk.desktop

if [ "${1:-}" = "--uninstall" ]; then
  sed -i '/# isc-kiosk begin/,/# isc-kiosk end/d' "$GDM_CONF"
  rm -rf "$DEST" "$SESSION_FILE" "/var/lib/AccountsService/users/$KUSER"
  echo "Removed (user '$KUSER' kept; delete with: sudo userdel -r $KUSER)"; exit 0
fi

[ -f "$REPO/dist/index.html" ] || { echo "dist/ missing: run 'bun run build' first" >&2; exit 1; }

apt-get update
apt-get install -y cage python3
if ! command -v google-chrome >/dev/null && ! command -v chromium-browser >/dev/null && ! command -v chromium >/dev/null; then
  apt-get install -y chromium-browser || snap install chromium
fi

# Unprivileged, passwordless user: cannot sudo, nothing to log into.
id "$KUSER" >/dev/null 2>&1 || adduser --disabled-password --gecos "ISC kiosk" "$KUSER"
deluser "$KUSER" sudo >/dev/null 2>&1 || true

# App + session script, owned by root so the kiosk user cannot alter them.
rm -rf "$DEST"; mkdir -p "$DEST"
cp -r "$REPO/dist" "$DEST/dist"
install -m 755 "$HERE/kiosk-session.sh" "$DEST/kiosk-session.sh"

cat > "$SESSION_FILE" <<DESK
[Desktop Entry]
Name=ISC Kiosk
Exec=$DEST/kiosk-session.sh
Type=Application
DESK

# Auto-login + select the kiosk session.
sed -i '/# isc-kiosk begin/,/# isc-kiosk end/d' "$GDM_CONF"
sed -i "/^\[daemon\]/a # isc-kiosk begin\nAutomaticLoginEnable=true\nAutomaticLogin=$KUSER\nWaylandEnable=true\n# isc-kiosk end" "$GDM_CONF"
mkdir -p /var/lib/AccountsService/users
printf '[User]\nSession=isc-kiosk\nXSession=isc-kiosk\nSystemAccount=false\n' > "/var/lib/AccountsService/users/$KUSER"

# No sleep / suspend / screen blanking.
systemctl mask sleep.target suspend.target hibernate.target hybrid-sleep.target

echo "Done. Reboot to start the kiosk."
