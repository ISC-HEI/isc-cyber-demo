<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue';
import { analyse, SCORE_LABELS } from '../strength.js';
import { settings, machine } from '../settings.js';
import { duration, bigNumber, countOf, rate } from '../format.js';
import RaceBackstage from '../components/RaceBackstage.vue';

const backstage = ref(false);

const emit = defineEmits(['next']);

const pw = ref('');
const result = computed(() => analyse(pw.value));
const presets = ['123456', 'azerty', 'P@ssw0rd!', 'Pistache2008!', 'Xq7#mK2p', 'tortue-violon-glacier-pinceau'];

// On average an attacker finds the password halfway through their list.
const fastTime = computed(() => result.value ? result.value.guesses / 2 / settings.fastRate : 0);
const slowTime = computed(() => result.value ? result.value.guesses / 2 / settings.slowRate : 0);

function level(seconds) {
  if (seconds < 60) return 'bad';
  if (seconds < 86400 * 365) return 'warn';
  return 'ok';
}

// ── Live attack in this browser (no GPU!) ──────────────────────────────
const LIVE_MAX_MS = 12000;
const live = ref(null);   // { running, tries, ms, current, found }
let worker = null;

// Live brute force only makes sense when the browser (~1e7 tries/s) can
// finish the whole search space within LIVE_MAX_MS; dictionary words are
// "found" by the dictionary pass, whatever their length.
const liveFeasible = computed(() => {
  const r = result.value;
  return r && (r.inDictionary || Math.pow(r.charset.size, pw.value.length) < 1e8);
});

function stopLive() { worker?.terminate(); worker = null; }

function startLive() {
  stopLive();
  const target = pw.value;
  const r = result.value;
  // Step 1 — dictionary: known passwords and words fall immediately.
  if (r.inDictionary) {
    live.value = { running: false, found: true, tries: Math.max(1, Math.round(r.guesses)), ms: 1, dictionary: true, common: r.isCommon };
    return;
  }
  live.value = { running: true, tries: 0, ms: 0, current: '', found: false };
  worker = new Worker(new URL('./bruteforce.worker.js', import.meta.url), { type: 'module' });
  worker.onmessage = ({ data }) => {
    live.value = { ...live.value, ...data, running: !data.done };
    if (data.done) stopLive();
  };
  worker.postMessage({ target, chars: r.charset.chars, maxMs: LIVE_MAX_MS });
}

const browserRate = computed(() => live.value && live.value.ms > 50 ? live.value.tries / (live.value.ms / 1000) : null);

watch(pw, () => { stopLive(); live.value = null; });
onBeforeUnmount(stopLive);
</script>

<template>
  <section class="station race">
    <p class="lede">
      Tape un mot de passe <strong>inventé</strong> et découvre en combien de temps une machine le retrouverait.
    </p>
    <div class="warning">⚠️ N’utilise jamais un de tes vrais mots de passe ici (ni ailleurs en public !).</div>

    <div class="card">
      <input v-model="pw" class="big-input" type="text" placeholder="Invente un mot de passe…"
        autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" autofocus />
      <div class="row presets">
        <span class="presets__label">Exemples :</span>
        <button v-for="p in presets" :key="p" type="button" class="chip chip--btn mono" @click="pw = p">{{ p }}</button>
      </div>
    </div>

    <template v-if="result">
      <div class="race__grid">
        <div class="card gauge-card">
          <h3>Solidité</h3>
          <div class="gauge" :data-score="result.score">
            <div v-for="i in 5" :key="i" class="gauge__seg" :class="{ on: i - 1 <= result.score }" />
          </div>
          <div class="gauge__label" :data-score="result.score">{{ SCORE_LABELS[result.score] }}</div>
          <div class="gauge__meta mono">
            ≈ {{ countOf(result.guesses, 'essais') }} nécessaires · {{ Math.round(result.bits) }} bits
          </div>
          <p v-if="result.warning" class="gauge__warning">⚠️ {{ result.warning }}</p>

          <h3 class="seg-title">Ce que voit un pirate</h3>
          <div class="segments">
            <span v-for="(s, i) in result.segments" :key="i" class="segment" :class="'segment--' + s.pattern">
              <span class="segment__token mono">{{ s.token }}</span>
              <span class="segment__label">{{ s.label }}</span>
            </span>
          </div>
        </div>

        <div class="card times">
          <h3>⏱️ Temps pour le retrouver avec {{ machine() }}</h3>
          <div class="time" :class="'time--' + level(fastTime)">
            <div class="time__head">
              <span>🗄️ Site <strong>mal protégé</strong></span>
              <span class="chip mono">MD5 · {{ rate(settings.fastRate) }}</span>
            </div>
            <div class="time__value">{{ duration(fastTime) }}</div>
          </div>
          <div class="time" :class="'time--' + level(slowTime)">
            <div class="time__head">
              <span>🛡️ Site <strong>bien protégé</strong></span>
              <span class="chip mono">bcrypt coût 10 · {{ rate(settings.slowRate) }}</span>
            </div>
            <div class="time__value">{{ duration(slowTime) }}</div>
          </div>
          <p class="times__note">Estimation, en moyenne, pour une attaque « intelligente » (listes de mots de passe connus, dictionnaires, dates…).
            Le même mot de passe résiste beaucoup plus longtemps si le site le stocke correctement : ça, ce n’est pas toi qui le choisis !</p>
        </div>
      </div>

      <div class="card live">
        <div class="row live__head">
          <h3>🧪 Attaque en direct, dans ce navigateur</h3>
          <button v-if="liveFeasible && !live?.running" type="button" class="btn" @click="startLive">Lancer l’attaque</button>
          <span v-else-if="!liveFeasible" class="chip">Trop long pour une démo en direct : regarde l’estimation ci-dessus 😉</span>
        </div>
        <div v-if="live" class="live__body">
          <template v-if="live.dictionary">
            <div class="live__big live__big--bad">Trouvé immédiatement !</div>
            <p v-if="live.common">Il fait partie des mots de passe les plus utilisés au monde : c’est le tout premier essai d’un pirate.</p>
            <p v-else>C’est un mot du dictionnaire (ou un prénom) : les pirates testent ces listes en premier, environ
              {{ countOf(live.tries, 'essais') }} suffisent.</p>
          </template>
          <template v-else>
            <div class="live__counter mono">
              <span>{{ countOf(live.tries, 'essais') }}</span>
              <span v-if="live.running" class="live__current">{{ live.current }}</span>
              <span>{{ (live.ms / 1000).toFixed(1).replace('.', ',') }} s</span>
            </div>
            <div v-if="!live.running && live.found" class="live__big live__big--bad">
              Trouvé en {{ (live.ms / 1000).toFixed(2).replace('.', ',') }} s !
            </div>
            <div v-else-if="!live.running" class="live__big live__big--warn">Le navigateur abandonne après {{ LIVE_MAX_MS / 1000 }} s…
              mais {{ machine() }} l’aurait trouvé en {{ duration(fastTime) }}.</div>
            <p v-if="browserRate">
              Ce navigateur teste environ <strong>{{ countOf(browserRate, 'combinaisons') }}</strong> par seconde, sans carte graphique.
              {{ machine(true) }} en teste environ <strong>{{ bigNumber(settings.fastRate) }}</strong>
              (≈ {{ bigNumber(settings.fastRate / browserRate) }} fois plus).
            </p>
          </template>
        </div>
      </div>

      <div class="card">
        <div class="row live__head">
          <h3>🔧 Dans les coulisses</h3>
          <button type="button" class="pill-btn" @click="backstage = !backstage">{{ backstage ? 'Masquer' : 'Afficher' }}</button>
        </div>
        <RaceBackstage v-if="backstage" :pw="pw" :result="result" />
      </div>

      <div class="lesson">
        <strong>À retenir</strong>
        <ul>
          <li>La <strong>longueur</strong> compte plus que les symboles : <span class="mono">P@ssw0rd!</span> est connu de tous les pirates.</li>
          <li>Remplacer un « a » par un « @ » ne trompe personne : les logiciels testent ces variantes.</li>
          <li>Un mot de passe différent pour chaque site, rangé dans un <strong>gestionnaire de mots de passe</strong>.</li>
        </ul>
      </div>
      <div class="row"><button class="btn" type="button" @click="emit('next')">Épreuve suivante →</button></div>
    </template>
  </section>
</template>

<style scoped>
.presets { margin-top: 0.8rem; }
.presets__label { color: var(--muted); font-size: 0.8rem; }
.chip--btn { cursor: pointer; font-size: 0.8rem; }
.chip--btn:hover { border-color: var(--accent); }

.race__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem; }
@media (max-width: 1000px) { .race__grid { grid-template-columns: 1fr; } }

.gauge { display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.4rem; }
.gauge__seg { height: 1.1rem; border-radius: 6px; background: var(--surface-2); border: 1px solid var(--border); transition: background .3s ease; }
.gauge[data-score="0"] .on { background: var(--bad); }
.gauge[data-score="1"] .on { background: #e8590c; }
.gauge[data-score="2"] .on { background: var(--warn); }
.gauge[data-score="3"] .on { background: #74b816; }
.gauge[data-score="4"] .on { background: var(--ok); }
.gauge__label { font-size: 1.6rem; font-weight: 800; margin-top: 0.5rem; }
.gauge__label[data-score="0"], .gauge__label[data-score="1"] { color: var(--bad); }
.gauge__label[data-score="2"] { color: var(--warn); }
.gauge__label[data-score="3"], .gauge__label[data-score="4"] { color: var(--ok); }
.gauge__meta { color: var(--muted); font-size: 0.8rem; }
.gauge__warning { font-weight: 600; margin: 0.6rem 0 0; }

.seg-title { margin-top: 1.2rem !important; }
.segments { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.segment { display: flex; flex-direction: column; border-radius: 10px; padding: 0.4rem 0.7rem; background: var(--surface-2); border: 1px solid var(--border); }
.segment__token { font-weight: 700; font-size: 1.05rem; white-space: pre; }
.segment__label { font-size: 0.7rem; color: var(--muted); }
.segment--dictionary, .segment--regex, .segment--date, .segment--spatial, .segment--sequence, .segment--repeat { border-color: var(--bad); background: var(--bad-soft); }
.segment--bruteforce { border-color: var(--ok); background: var(--ok-soft); }

.times { display: flex; flex-direction: column; gap: 0.8rem; }
.time { border-radius: 14px; padding: 0.8rem 1rem; border: 2px solid var(--border); }
.time--bad { border-color: var(--bad); background: var(--bad-soft); }
.time--warn { border-color: var(--warn); background: var(--warn-soft); }
.time--ok { border-color: var(--ok); background: var(--ok-soft); }
.time__head { display: flex; justify-content: space-between; gap: 0.6rem; flex-wrap: wrap; font-size: 0.85rem; }
.time__value { font-size: 2rem; font-weight: 800; margin-top: 0.2rem; }
.times__note { margin: 0; color: var(--muted); font-size: 0.75rem; }

.live__head { justify-content: space-between; }
.live__head h3 { margin: 0; }
.live__body { margin-top: 0.8rem; }
.live__body p { margin: 0.6rem 0 0; font-size: 0.9rem; }
.live__counter { display: flex; gap: 1.5rem; font-size: 1.3rem; font-weight: 600; flex-wrap: wrap; }
.live__current { color: var(--accent); min-width: 8ch; }
.live__big { font-size: 2rem; font-weight: 800; margin-top: 0.4rem; }
.live__big--bad { color: var(--bad); }
.live__big--warn { color: var(--warn); font-size: 1.4rem; }
</style>
