# Kiosk Ubuntu

## Installation

Mode kiosque pour la machine du stand (Ubuntu 22.04+, GDM). Au démarrage : auto-login de
l'utilisateur `kiosk` → session `cage` (compositeur Wayland mono-application, sans
barre, sans Alt+Tab, sans changement de console) → Chromium plein écran sur
`http://127.0.0.1:8080` (serveur statique local). Chromium est relancé s'il se ferme.

```bash
bun install
bun run build
sudo kiosk/install-ubuntu.sh   # puis redémarrer
sudo kiosk/install-ubuntu.sh --uninstall
```

Notes :

- Pas de `--incognito` : les réglages de l'assistant sont dans `localStorage`, dans un
  profil dédié (`~/.config/isc-kiosk`, ou `~/snap/chromium/common/isc-kiosk` pour le
  snap).

## Retour en mode normal

Il y a 2 options pour administrer la machine : SSH, ou démarrer en mode recovery. Les
commandes `Ctrl+Alt+F1` à `Ctrl+Alt+F6` sont bloquées.
