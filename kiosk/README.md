# Kiosk

Lancement manuel, sans session dédiée ni auto-login : un serveur statique local et
Chromium en plein écran (`--kiosk`) sur `http://127.0.0.1:8080`.

```bash
sudo apt install fonts-noto-color-emoji   # sinon les emojis s'affichent en carrés
bun install
bun run build
kiosk/start.sh
```

Quitter : `Alt+F4` (ou `Ctrl+W`). Le serveur s'arrête avec Chromium.

Notes :

- Pas de `--incognito` : les réglages de l'assistant sont dans `localStorage`, dans un
  profil dédié (`~/.config/isc-kiosk`, ou `~/snap/chromium/common/isc-kiosk` pour Chromium snap).
- Variables optionnelles : `PORT` (défaut 8080) et `APP_DIR` (défaut `dist/`).
