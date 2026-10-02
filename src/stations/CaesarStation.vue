<script setup>
import { ref, computed, watch } from 'vue';
import { settings, machine } from '../settings.js';
import { duration } from '../format.js';
import AesBackstage from '../components/AesBackstage.vue';

const emit = defineEmits(['next']);

const MESSAGES = [
  'JULES CESAR UTILISAIT CE CODE SECRET POUR ENVOYER SES ORDRES A SES GENERAUX SANS QUE LES ENNEMIS PUISSENT LES LIRE',
  'BRAVO TU AS CASSE LE CODE VIENS DECOUVRIR LA FILIERE SECURITE INFORMATIQUE DE LA HES SO VALAIS',
  'LE TRESOR EST CACHE SOUS LE GRAND ESCALIER DE LA TOUR NORD PRENDS LA CLE ET NE LE DIS A PERSONNE',
];
// Letter frequencies in French text (%).
const FR = { A: 7.6, B: 0.9, C: 3.3, D: 3.7, E: 14.7, F: 1.1, G: 0.9, H: 0.7, I: 7.5, J: 0.5, K: 0.1, L: 5.5, M: 3.0,
  N: 7.1, O: 5.8, P: 3.0, Q: 1.4, R: 6.6, S: 7.9, T: 7.2, U: 6.3, V: 1.6, W: 0.1, X: 0.4, Y: 0.3, Z: 0.1 };
const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function rnd(n) { const b = new Uint32Array(1); crypto.getRandomValues(b); return b[0] % n; }
const plain = MESSAGES[rnd(MESSAGES.length)];
const key = 3 + rnd(21);     // never 0, rarely trivially small

function rot(text, k) {
  return text.replace(/[A-Z]/g, c => ALPHA[(ALPHA.indexOf(c) + k + 26) % 26]);
}
const cipher = rot(plain, key);

const guess = ref(0);                    // how far the visitor shifted back
const decoded = computed(() => rot(cipher, -guess.value));
const solved = computed(() => decoded.value === plain);
const showHint = ref(false);
// Once found, keep the win panel: visitors may keep playing with the slider.
const everSolved = ref(false);
watch(solved, v => { if (v) everSolved.value = true; });
const backstage = ref(false);

const freq = computed(() => {
  const counts = Object.fromEntries([...ALPHA].map(c => [c, 0]));
  let total = 0;
  for (const c of decoded.value) if (counts[c] !== undefined) { counts[c]++; total++; }
  return [...ALPHA].map(c => ({ c, pct: (counts[c] / total) * 100, ref: FR[c] }));
});
const maxPct = computed(() => Math.max(16, ...freq.value.map(f => f.pct)));
const topCipherLetter = computed(() => {
  const counts = {};
  for (const c of cipher) if (ALPHA.includes(c)) counts[c] = (counts[c] || 0) + 1;
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
});

function shift(d) { guess.value = (guess.value + d + 26) % 26; }

const caesarTime = computed(() => {
  const d = duration(25 / settings.fastRate);
  return d === 'instantané' || d === 'moins d’une seconde' ? 'un clin d’œil' : d;
});
const rateExp = computed(() => Math.floor(Math.log10(settings.fastRate)));
const rateMant = computed(() => +(settings.fastRate / Math.pow(10, rateExp.value)).toFixed(1));
const aesTime = computed(() => duration(Math.pow(2, 127) / settings.fastRate));
</script>

<template>
  <section class="station caesar">
    <p class="lede">
      Un message a été chiffré en <strong>décalant chaque lettre</strong> dans l’alphabet (A→D, B→E…).
      Trouve le bon décalage ! Astuce : compare les barres avec les fréquences des lettres en français.
    </p>

    <div class="card">
      <div class="label">Message chiffré</div>
      <div class="cipher mono">{{ cipher }}</div>
      <div class="label">Ton déchiffrement</div>
      <div class="plain mono" :class="{ solved }">{{ decoded }}</div>

      <div class="dial">
        <button type="button" class="btn btn--ghost dial__btn" @click="shift(-1)">◀</button>
        <div class="dial__mid">
          <div class="dial__value mono">décalage {{ guess }}</div>
          <input v-model.number="guess" type="range" min="0" max="25" class="dial__range" />
          <div class="dial__map mono">{{ ALPHA[guess] }} devient A, {{ ALPHA[(guess + 1) % 26] }} devient B…</div>
        </div>
        <button type="button" class="btn btn--ghost dial__btn" @click="shift(1)">▶</button>
      </div>
    </div>

    <div class="card">
      <div class="row freq__head">
        <h3>Fréquence des lettres</h3>
        <span class="legend"><i class="legend__mine" /> ton texte <i class="legend__ref" /> français normal</span>
        <button v-if="!everSolved && !showHint" type="button" class="pill-btn" @click="showHint = true">💡 Indice</button>
      </div>
      <p v-if="showHint && !everSolved" class="hint">
        En français, la lettre la plus fréquente est le <strong>E</strong>. Dans le message chiffré, c’est le
        <strong>{{ topCipherLetter }}</strong>… que doit devenir le {{ topCipherLetter }} ?
      </p>
      <div class="freq">
        <div v-for="f in freq" :key="f.c" class="freq__col">
          <div class="freq__bars">
            <div class="freq__ref" :style="{ height: (f.ref / maxPct) * 100 + '%' }" />
            <div class="freq__mine" :style="{ height: (f.pct / maxPct) * 100 + '%' }" />
          </div>
          <div class="freq__letter mono">{{ f.c }}</div>
        </div>
      </div>
    </div>

    <template v-if="everSolved">
      <div class="card win">
        <div class="win__title">🎉 Code cassé ! La clé était {{ key }}.</div>
        <p>Il n’existe que <strong>25 décalages possibles</strong> : {{ machine() }} les teste tous en <strong>{{ caesarTime }}</strong>.</p>
        <p>Aujourd’hui on utilise <strong>AES</strong>, avec 2<sup>128</sup> clés possibles. Même en testant
          <template v-if="rateMant !== 1">{{ String(rateMant).replace('.', ',') }} × </template>10<sup>{{ rateExp }}</sup> clés par seconde, il faudrait en moyenne : <strong>{{ aesTime }}</strong>.</p>
      </div>
      <div class="lesson">
        <strong>À retenir</strong>
        <ul>
          <li>Un chiffrement « maison » ou ancien se casse avec des statistiques.</li>
          <li>La sécurité moderne repose sur des <strong>mathématiques solides</strong> et des clés immenses, pas sur le secret de la méthode.</li>
          <li>C’est ce qui protège tes messages, ta banque en ligne et le cadenas 🔒 de ton navigateur.</li>
        </ul>
      </div>
      <div class="card">
        <div class="row backstage__head">
          <h3>🔧 Dans les coulisses : pourquoi les fréquences ne marchent pas contre AES</h3>
          <button type="button" class="pill-btn" @click="backstage = !backstage">{{ backstage ? 'Masquer' : 'Afficher' }}</button>
        </div>
        <AesBackstage v-if="backstage" :plain="plain" :cipher="cipher" :shift="key" />
      </div>
      <div class="row"><button class="btn" type="button" @click="emit('next')">Terminer le parcours ✓</button></div>
    </template>
  </section>
</template>

<style scoped>
.label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); margin: 0.4rem 0 0.3rem; font-weight: 600; }
.cipher, .plain { font-size: 1.35rem; line-height: 1.6; word-spacing: 0.3em; letter-spacing: 0.08em; font-weight: 600; }
.cipher { color: var(--muted); }
.plain { color: var(--accent); min-height: 2em; transition: color .3s ease; }
.plain.solved { color: var(--ok); }

.dial { display: flex; align-items: center; gap: 1rem; margin-top: 1.2rem; }
.dial__btn { font-size: 1.6rem; padding: 0.6rem 1.2rem; }
.dial__mid { flex: 1; text-align: center; }
.dial__value { font-size: 1.2rem; font-weight: 700; }
.dial__range { width: 100%; accent-color: var(--accent); height: 2rem; }
.dial__map { color: var(--muted); font-size: 0.8rem; }

.freq__head { justify-content: space-between; }
.freq__head h3 { margin: 0; }
.legend { font-size: 0.75rem; color: var(--muted); display: inline-flex; align-items: center; gap: 0.4rem; }
.legend i { display: inline-block; width: 0.9rem; height: 0.9rem; border-radius: 3px; }
.legend__mine { background: var(--accent); }
.legend__ref { background: var(--petal-teal); margin-left: 0.6rem; }
.hint { font-weight: 600; color: var(--warn); margin: 0.6rem 0 0; }
.freq { display: grid; grid-template-columns: repeat(26, 1fr); gap: 0.25rem; height: 12rem; margin-top: 1rem; }
.freq__col { display: flex; flex-direction: column; }
.freq__bars { flex: 1; position: relative; display: flex; align-items: flex-end; justify-content: center; gap: 2px; }
.freq__ref, .freq__mine { width: 45%; border-radius: 4px 4px 0 0; transition: height .35s ease; }
.freq__ref { background: var(--petal-teal); }
.freq__mine { background: var(--accent); }
.freq__letter { text-align: center; font-size: 0.75rem; font-weight: 600; margin-top: 0.2rem; }

.win { border: 2px solid var(--ok); }
.backstage__head { justify-content: space-between; }
.backstage__head h3 { margin: 0; }
.win__title { font-size: 1.4rem; font-weight: 800; color: var(--ok); }
.win p { margin: 0.5rem 0 0; }
</style>
