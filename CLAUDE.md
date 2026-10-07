# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A kiosk web app for an ISC (HES-SO Valais) open-day stand on passwords and social engineering: five short
"stations" (épreuves) run on a big screen, guided by an assistant. All UI text and content is in **French**
(tutoiement, aimed at teenagers). Everything runs offline in the browser; nothing is stored or sent.
The README (French) is the authoritative description of the stations and of the on-site deployment.

## Commands

Bun only (never npm/pnpm/yarn). No tests, no linter.

```bash
bun install
bun run dev        # Vite dev server
bun run build      # static dist/ (base './', self-contained)
bun run preview
```

`@isc-hei/design` is pulled from `github:ISC-HEI/isc-design#<tag>` (public, no token). The build injects
`__GIT_HASH__` and `__BUILD_DATE__` via `vite.config.js`; they are shown bottom-left of the page.

The built `dist/` must be served over `http://` (the brute-force Web Worker does not load from `file://`).

## Architecture

**Shell** (`src/App.vue`): home grid of tiles → one station at a time. There is no router; `currentId`
selects a station from `src/stations.js`, and `<component :is :key="runKey">` renders it. Bumping `runKey`
remounts the station, which is how "Recommencer", "Accueil" and the idle auto-reset wipe all visitor input.
The idle timer (default 90 s, floor 20 s) lives in `App.vue` and is paused while the settings panel is open.

**Station contract**: each `src/stations/*Station.vue` is a self-contained `<script setup>` component that
`defineEmits(['next'])` and emits `next` from its final button. Order, step number, emoji, title, pitch
and petal colour are declared only in `src/stations.js` (lazy-loaded with `defineAsyncComponent`). To add a
station: create the component, append an entry there. The last station's button says "Terminer" and `next`
on the last entry returns home.

**Shared modules**:
- `src/strength.js` — zxcvbn-ts with FR dictionaries **plus the Diceware list** (so dice passphrases are
  scored as known words, not random). `analyse()` re-prices zxcvbn's brute-force segments that look random
  with the real charset size, and caps everything at exhaustive search. Returns `guesses`, `bits`, `score`
  (0–4), labelled `segments`, `inDictionary`, `isCommon`.
- `src/settings.js` — reactive assistant settings persisted in `localStorage` (`isc.cyber.settings`):
  machine name + French article, MD5 (`fastRate`) and bcrypt (`slowRate`) hash rates, idle delay. `PRESETS`
  hold hashcat benchmark values; bcrypt is measured at cost 5 and divided by 2^5 to display cost 10. Change
  `DEFAULTS`/`PRESETS` here when the stand machine is re-benchmarked. `machine()` returns "la RTX 5080" /
  "le DGX Spark" with the article agreed.
- `src/format.js` — French human durations and big numbers (`duration`, `bigNumber`, `countOf`, `rate`),
  including the "de/d’" liaison after millions/milliards.
- `src/i18n.js` — only the chrome strings (`t`). Station content stays inline in components and in
  `src/data/*.js`, French being the single source of truth.

**Station-specific mechanics worth knowing**:
- Race (`RaceStation.vue` + `bruteforce.worker.js`): the displayed crack times are
  `guesses / 2 / rate`. The *live* in-browser attack only runs when the password is a dictionary hit or the
  full keyspace is < 1e8; the worker does a real odometer enumeration with a 12 s cap and progress messages.
  `RaceBackstage.vue` is the hash/salt/avalanche explainer.
- OSINT (`src/data/personas.js`): each persona's password is split into `parts` with predicate `test`
  functions applied to the lower-cased guess; posts tagged `leak` reveal those parts. Guess feedback is
  per-part, not binary.
- Phishing (`src/data/phishing.js`): `drawMessages()` always draws exactly one legit message plus phish
  ones, using `crypto.getRandomValues`. Links are never real `<a href>`; the destination is text only.
  Message bodies are arrays of text fields with optional `clue` keys highlighted after answering.
- Caesar: random shift in 3–23 drawn per mount; `AesBackstage.vue` encrypts the same text with real
  AES-GCM via WebCrypto to contrast histograms.
- Diceware: `src/data/diceware-fr.json` (7776 words, MIT, see adjacent LICENSE). 26 words were replaced for
  a young audience; keep the file at exactly 7776 entries.

**Settings panel** opens on a triple-click of the footer ❤️ (the design package Footer's `secret-click`
event). Escape closes it.

## Styling

`src/style.css` imports `@isc-hei/design/style.css` and defines the five petal tokens
(`--petal-yellow/cyan/purple/pink/teal`), magenta accent, and ok/warn/bad semantic colours with dark-mode
overrides under `:root[data-theme="dark"]`. The root font size is viewport-scaled (`clamp`) because the
target is a large screen. Station tiles take their colour from `--tile`. Reuse the existing classes
(`card`, `btn`, `pill-btn`, `chip`, `row`, `lede`, `warning`, `mono`, `isc-fab`) rather than adding
per-station styles for common elements.

## Content rules

All personas, brands, domains, phone numbers and sample passwords are fictional and must stay so. The app
tells visitors never to type a real password; keep that warning and never add any network calls or
persistence beyond the assistant settings.
