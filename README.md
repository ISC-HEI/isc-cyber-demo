# Cyber-parcours ISC

Stand « mots de passe & ingénierie sociale » pour la journée portes ouvertes de la filière
Sécurité informatique (ISC, HES-SO Valais). Cinq épreuves de 4–5 minutes au total, encadrées par un·e assistant·e,
sur grand écran.

| # | Épreuve | Message |
|---|---------|---------|
| 1 | **Devine le mot de passe**: 5 profils publics fictifs (Léa, Noah, Inès, Marc, Chloé), 3 essais | OSINT, questions de sécurité |
| 2 | **La course contre la machine**: jauge zxcvbn, temps MD5 vs bcrypt, brute-force en direct (si < 10⁸ combinaisons), coulisses : hash, sel, avalanche, entropie | longueur > complexité, stockage côté site |
| 3 | **La phrase de passe aux dés**: Diceware FR, 7776 mots, vrais dés | phrase de passe aléatoire |
| 4 | **Piège ou pas piège ?**: 4 messages tirés parmi 6 (SMS, emails, pages), marques fictives | réflexes anti-phishing |
| 5 | **Casse le code de César**: analyse de fréquences ; coulisses : vrai AES-128 et pourquoi les fréquences échouent | crypto moderne |

Rien n'est stocké ni envoyé : tout tourne dans le navigateur, hors ligne. Après 90 s d'inactivité
(réglable), retour à l'accueil et effacement des saisies.

## Lancer

```bash
bun install
bun run dev          # développement
bun run build        # → dist/ statique, à copier sur la machine du stand
```

`@isc-hei/design` vient du dépôt public `github:ISC-HEI/isc-design` (aucun token nécessaire).
Le `dist/` produit est autonome.

## Sur le stand (DGX Spark ou autre)

```bash
sudo apt install fonts-noto-color-emoji          # sinon les emojis s'affichent en carrés
cd dist && python3 -m http.server 8080 &         # le Web Worker exige http://, pas file://
chromium --kiosk http://localhost:8080             # pas --incognito : il effacerait les réglages
```

**Réglages de l'assistant** : cliquer 3 fois sur le ❤️ du pied de page. On y règle le nom de la machine,
les débits de hash et le délai d'inactivité.

Le panneau propose des préréglages. **RTX 5080** (par défaut) : MD5 mesuré à 89 348,2 MH/s ; bcrypt mesuré à 103,0 kH/s au coût 5 (celui du benchmark hashcat), affiché au coût 10, réaliste pour un site, soit ÷ 32 ≈ 3 200/s. **DGX Spark** : MD5 10¹⁰/s et bcrypt 10⁴/s, tous deux estimés. Il faut les calibrer sur la machine réelle,
puis reporter les valeurs mesurées dans le panneau (gardées dans le `localStorage` du navigateur) ou, plus sûr, dans
`DEFAULTS` de `src/settings.js` avant de rebuilder :

```bash
hashcat -b -m 0      # MD5
hashcat -b -m 3200   # bcrypt
```

## Crédits

- Liste Diceware : [ArthurPons/diceware-fr-alt](https://github.com/ArthurPons/diceware-fr-alt) (MIT, voir `src/data/diceware-fr.LICENSE`). 26 mots peu adaptés à un public jeune ont été remplacés.
- Estimation de robustesse : [zxcvbn-ts](https://github.com/zxcvbn-ts/zxcvbn) avec dictionnaires FR, plus la liste Diceware
- Personnes, marques, domaines et numéros des épreuves 1 et 4 : entièrement fictifs
