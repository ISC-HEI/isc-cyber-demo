// Human-readable durations for a French-speaking audience.
const UNITS = [
  [1, 'seconde', 'secondes'],
  [60, 'minute', 'minutes'],
  [3600, 'heure', 'heures'],
  [86400, 'jour', 'jours'],
  [86400 * 30.44, 'mois', 'mois'],
  [86400 * 365.25, 'an', 'ans'],
];
const UNIVERSE_AGE_S = 13.8e9 * 365.25 * 86400;

export function duration(seconds) {
  if (!isFinite(seconds)) return 'une éternité';
  if (seconds < 0.001) return 'instantané';
  if (seconds < 1) return 'moins d’une seconde';
  if (seconds > UNIVERSE_AGE_S) {
    const k = seconds / UNIVERSE_AGE_S;
    return k < 10 ? 'plus que l’âge de l’Univers' : `${bigNumber(k)} × l’âge de l’Univers`;
  }
  let u = UNITS[0];
  for (const unit of UNITS) if (seconds >= unit[0]) u = unit;
  const n = seconds / u[0];
  if (u[1] === 'an' && n >= 1000) return `${bigNumber(n)} ans`;
  const r = Math.round(n);
  return `${r} ${r > 1 ? u[2] : u[1]}`;
}

// 1.2e15 → "1,2 million de milliards"-style is overkill; keep it readable.
export function bigNumber(n) {
  if (n < 1e4) return Math.round(n).toLocaleString('fr-CH');
  const steps = [[1e18, 'trillions'], [1e15, 'billiards'], [1e12, 'billions'], [1e9, 'milliards'], [1e6, 'millions'], [1e3, 'mille']];
  for (const [v, name] of steps) {
    if (n >= v) {
      const k = n / v;
      if (k >= 1000 && v === 1e18) return `10^${Math.floor(Math.log10(n))}`;
      return `${k < 10 ? k.toFixed(1).replace('.', ',') : Math.round(k).toLocaleString('fr-CH')} ${name}`;
    }
  }
  return String(n);
}

// "410 millions de essais" → French needs "de" after the big-number nouns.
export function countOf(n, noun) {
  const num = bigNumber(n);
  return /(ions|iards|liards)$/.test(num) ? `${num} d${/^[aeiouyhé]/i.test(noun) ? '’' : 'e '}${noun}` : `${num} ${noun}`;
}

export function rate(hps) { return `${countOf(hps, 'essais')} / seconde`; }
