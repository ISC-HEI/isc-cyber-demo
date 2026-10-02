import { reactive, watch } from 'vue';

// Assistant-only knobs, edited from the hidden panel (triple-click the footer ❤️).
// Rates come from `hashcat -b -m 0` (MD5) and `hashcat -b -m 3200` (bcrypt);
// `measured` says which ones are real benchmarks rather than estimates.
export const PRESETS = [
  {
    machineName: 'RTX 5080', article: 'la',
    fastRate: 8.93482e10,   // measured: hashcat -b -m 0 → 89348.2 MH/s (2026-10-02)
    // measured: hashcat -b -m 3200 → 103.0 kH/s, but that benchmark runs bcrypt
    // at cost 5; real sites use ≥ 10, and each cost step doubles the work.
    slowRate: 103.0e3 / 2 ** (10 - 5),
    measured: { fast: true, slow: true },
  },
  {
    machineName: 'DGX Spark', article: 'le',
    fastRate: 1e10,         // estimate
    slowRate: 1e4,          // estimate
    measured: { fast: false, slow: false },
  },
];

export const DEFAULTS = {
  machineName: PRESETS[0].machineName,
  machineArticle: PRESETS[0].article,
  fastRate: PRESETS[0].fastRate,
  slowRate: PRESETS[0].slowRate,
  idleSeconds: 90,
};

export function applyPreset(p) {
  Object.assign(settings, { machineName: p.machineName, machineArticle: p.article, fastRate: p.fastRate, slowRate: p.slowRate });
}

const KEY = 'isc.cyber.settings';

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
    const out = { ...DEFAULTS };
    for (const k of Object.keys(DEFAULTS)) {
      if (typeof raw[k] === typeof DEFAULTS[k]) out[k] = raw[k];
    }
    return out;
  } catch { return { ...DEFAULTS }; }
}

export const settings = reactive(load());

watch(settings, v => {
  try { localStorage.setItem(KEY, JSON.stringify(v)); } catch {}
}, { deep: true });

export function resetSettings() { Object.assign(settings, DEFAULTS); }

// A cleared or silly idle field must not kick every station home each second.
export function idleSeconds() {
  const v = Number(settings.idleSeconds);
  return v >= 20 ? v : DEFAULTS.idleSeconds;
}

// "la RTX 5080" / "le DGX Spark" — French needs the article to agree.
export function machine(capitalize = false) {
  const a = settings.machineArticle || 'le';
  const s = a.endsWith('’') ? `${a}${settings.machineName}` : `${a} ${settings.machineName}`;
  return capitalize ? s[0].toUpperCase() + s.slice(1) : s;
}
