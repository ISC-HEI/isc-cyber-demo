# Kiosk Ubuntu

Mode kiosque pour la machine du stand (Ubuntu 22.04+, GDM). Au démarrage : auto-login de
l'utilisateur `kiosk` → session `cage` (compositeur Wayland mono-application, sans
barre, sans Alt+Tab, sans changement de console) → Chromium plein écran sur
`http://127.0.0.1:8080` (serveur statique local). Chromium est relancé s'il se ferme.

```bash
bun run build
sudo kiosk/install-ubuntu.sh   # puis redémarrer
sudo kiosk/install-ubuntu.sh --uninstall
```

Après une mise à jour de l'app : `bun run build` puis relancer l'installateur.

Notes :

- Pas de `--incognito` : les réglages de l'assistant sont dans `localStorage`, dans un
  profil dédié (`~/.config/isc-kiosk`, ou `~/snap/chromium/common/isc-kiosk` pour le
  snap).
- Pour administrer la machine : SSH, ou Ctrl+Alt+F3 est désactivé par `cage` — utiliser
  SSH ou démarrer en mode recovery. Pour tester sans redémarrer :
  `kiosk/kiosk-session.sh` depuis une session graphique (avec `APP_DIR=$PWD/dist`).
- Hors logiciel : mot de passe BIOS, boot USB désactivé, clavier masqué/verrouillé.
