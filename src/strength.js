import { zxcvbn, zxcvbnOptions } from '@zxcvbn-ts/core';
import * as common from '@zxcvbn-ts/language-common';
import * as fr from '@zxcvbn-ts/language-fr';
import dicewareFr from './data/diceware-fr.json';

zxcvbnOptions.setOptions({
  translations: fr.translations,
  graphs: common.adjacencyGraphs,
  // The diceware list too: an attacker who knows passphrases come from it
  // would use it — and the dice station's words must not look random.
  dictionary: { ...common.dictionary, ...fr.dictionary, dicewareFr },
});

export const CLASSES = [
  { re: /[a-z]/, size: 26, label: 'minuscules', chars: 'abcdefghijklmnopqrstuvwxyz' },
  { re: /[A-Z]/, size: 26, label: 'majuscules', chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' },
  { re: /[0-9]/, size: 10, label: 'chiffres', chars: '0123456789' },
  { re: /[^a-zA-Z0-9]/, size: 33, label: 'symboles', chars: ' !"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~' },
];

export function charsetOf(s) {
  const used = CLASSES.filter(c => c.re.test(s));
  return { size: used.reduce((n, c) => n + c.size, 0), labels: used.map(c => c.label), chars: used.map(c => c.chars).join('') };
}

const PATTERN_LABELS = {
  dictionary: m => m.l33t ? 'mot connu déguisé (l33t)' : m.reversed ? 'mot connu à l’envers'
    : ({ passwords: 'mot de passe très courant', commonWords: 'mot du dictionnaire', firstnames: 'prénom',
         lastnames: 'nom de famille', wikipedia: 'mot courant', diceware: 'mot courant', dicewareFr: 'mot courant', userInputs: 'info personnelle' }[m.dictionaryName] ?? 'mot connu'),
  spatial: () => 'suite de touches du clavier',
  repeat: () => 'répétition',
  sequence: () => 'suite logique (abc, 123…)',
  regex: m => m.regexName === 'recentYear' ? 'une année' : 'motif',
  date: () => 'une date',
  separator: () => 'séparateur',
  bruteforce: () => 'caractères au hasard',
};

// zxcvbn models a smart attacker, but its brute-force fallback assumes only
// 10 symbols per char — too pessimistic for truly random strings like
// "Xq7#mK2p". Re-price the bruteforce segments that look random (no run of
// 4+ letters, which is more likely an unlisted word) with their real alphabet.
function looksRandom(token) {
  return !/[a-zA-Z]{4,}/.test(token);
}

export function analyse(password) {
  if (!password) return null;
  const r = zxcvbn(password);
  let smart = r.guesses;
  const segments = r.sequence.map(m => {
    let guesses = m.guesses;
    if (m.pattern === 'bruteforce' && looksRandom(m.token)) {
      const real = Math.pow(charsetOf(m.token).size, m.token.length);
      if (real > m.guesses) { smart *= real / m.guesses; guesses = real; }
    }
    const label = m.pattern === 'bruteforce' && !looksRandom(m.token) ? 'mot absent de ses listes'
      : (PATTERN_LABELS[m.pattern] ?? (() => m.pattern))(m);
    return { token: m.token, pattern: m.pattern, label, guesses, dictionaryName: m.dictionaryName, rank: m.rank, l33t: !!m.l33t };
  });
  const cs = charsetOf(password);
  const brute = Math.pow(cs.size, password.length);
  const guesses = Math.min(smart, brute);
  const bits = Math.log2(guesses);
  const score = bits < 20 ? 0 : bits < 33 ? 1 : bits < 45 ? 2 : bits < 60 ? 3 : 4;
  return {
    guesses, bits, score, brute, segments, charset: cs,
    warning: r.feedback.warning,
    suggestions: r.feedback.suggestions,
    // A single known word (any list, l33t or not) is the attacker's very first pass.
    inDictionary: r.sequence.length === 1 && r.sequence[0].pattern === 'dictionary',
    isCommon: r.sequence.length === 1 && r.sequence[0].pattern === 'dictionary' && r.sequence[0].dictionaryName === 'passwords',
  };
}

export const SCORE_LABELS = ['Catastrophique', 'Très faible', 'Faible', 'Correct', 'Solide'];
