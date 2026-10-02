<script setup>
import { ref, computed, watch } from 'vue';
import words from '../data/diceware-fr.json';
import { analyse } from '../strength.js';
import { settings, machine } from '../settings.js';
import { duration, countOf } from '../format.js';

const emit = defineEmits(['next']);

// The list is ordered by dice code 11111…66666, so the index is the code in base 6.
const DICE_PER_WORD = 5;
const BITS_PER_WORD = Math.log2(words.length);
const FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

const wordCount = ref(5);
const rolls = ref([[]]);   // one array of dice values (1–6) per word
const current = computed(() => rolls.value[rolls.value.length - 1]);

function wordFor(dice) {
  if (dice.length !== DICE_PER_WORD) return null;
  const idx = dice.reduce((n, d) => n * 6 + (d - 1), 0);
  return words[idx];
}
const doneWords = computed(() => rolls.value.map(wordFor).filter(Boolean));
const finished = computed(() => doneWords.value.length >= wordCount.value);
const phrase = computed(() => doneWords.value.join('-'));

// Keep `rolls` shaped as: complete words, then one open slot while words are missing.
function normalize() {
  const full = rolls.value.filter(r => r.length === DICE_PER_WORD);
  const open = rolls.value.find(r => r.length < DICE_PER_WORD) ?? [];
  rolls.value = full.length >= wordCount.value ? full : [...full, open];
}
function push(d) {
  if (finished.value) return;
  current.value.push(d);
  normalize();
}
function undo() {
  if (current.value.length === 0 || finished.value) rolls.value = rolls.value.filter(r => r.length);
  current.value?.pop();
  if (!rolls.value.length) rolls.value = [[]];
  normalize();
}
watch(wordCount, normalize);
function randomWord() {
  const buf = new Uint32Array(DICE_PER_WORD);
  crypto.getRandomValues(buf);
  for (let i = current.value.length; i < DICE_PER_WORD; i++) push((buf[i] % 6) + 1);
}

const bits = computed(() => wordCount.value * BITS_PER_WORD);
const compare = computed(() => {
  const rows = [
    { label: 'P@ssw0rd!', bits: analyse('P@ssw0rd!').bits },
    { label: 'Pistache2008!', bits: analyse('Pistache2008!').bits },
    { label: 'Xq7#mK2p (8 caractères au hasard)', bits: analyse('Xq7#mK2p').bits },
    { label: `Ta phrase (${wordCount.value} mots)`, bits: bits.value, mine: true },
  ];
  const max = Math.max(...rows.map(r => r.bits));
  return rows.map(r => ({
    ...r,
    pct: Math.max(3, (r.bits / max) * 100),
    fast: duration(Math.pow(2, r.bits) / 2 / settings.fastRate),
    slow: duration(Math.pow(2, r.bits) / 2 / settings.slowRate),
  }));
});
</script>

<template>
  <section class="station dice">
    <p class="lede">
      Lance <strong>{{ DICE_PER_WORD }} dés</strong> et tape les valeurs : chaque lancer choisit un mot parmi
      <strong>{{ words.length.toLocaleString('fr-CH') }}</strong>. Avec {{ wordCount }} mots, tu obtiens une phrase de passe très solide.
    </p>

    <div class="row">
      <span class="chip">Nombre de mots</span>
      <button v-for="n in [4, 5, 6]" :key="n" type="button" class="chip chip--btn" :class="{ 'chip--active': wordCount === n }"
        :disabled="doneWords.length > n" @click="wordCount = n">{{ n }}</button>
    </div>

    <div class="dice__layout">
      <div class="card">
        <h3 v-if="!finished">🎲 Mot {{ doneWords.length + 1 }} / {{ wordCount }} — dé {{ current.length + 1 }} / {{ DICE_PER_WORD }}</h3>
        <h3 v-else>✅ Ta phrase de passe est prête !</h3>

        <div class="dice__slots">
          <span v-for="i in DICE_PER_WORD" :key="i" class="slot" :class="{ filled: current[i - 1] }">
            {{ current[i - 1] ? FACES[current[i - 1] - 1] : '' }}
          </span>
        </div>

        <div class="dice__pad">
          <button v-for="d in 6" :key="d" type="button" class="face" :disabled="finished" @click="push(d)">
            <span class="face__glyph">{{ FACES[d - 1] }}</span><span class="face__n">{{ d }}</span>
          </button>
        </div>
        <div class="row">
          <button type="button" class="btn btn--ghost" :disabled="rolls.flat().length === 0" @click="undo">⌫ Corriger</button>
          <button type="button" class="btn btn--ghost" :disabled="finished" @click="randomWord">Pas de dés ? Tirage aléatoire</button>
        </div>
      </div>

      <div class="card">
        <h3>Tes mots</h3>
        <ol class="words">
          <li v-for="i in wordCount" :key="i" :class="{ ready: doneWords[i - 1] }">
            <span class="mono words__code">{{ rolls[i - 1]?.length === DICE_PER_WORD ? rolls[i - 1].join('') : '·····' }}</span>
            <span class="words__w">{{ doneWords[i - 1] ?? '…' }}</span>
          </li>
        </ol>
        <div v-if="finished" class="phrase mono">{{ phrase }}</div>
      </div>
    </div>

    <template v-if="finished">
      <div class="card">
        <h3>Combien de temps pour la casser avec {{ machine() }} ?</h3>
        <div class="bars__legend"><span>🗄️ site mal protégé (MD5)</span><span>🛡️ site bien protégé (bcrypt)</span></div>
        <div class="bars">
          <div v-for="r in compare" :key="r.label" class="bar" :class="{ 'bar--mine': r.mine }">
            <div class="bar__label"><span class="mono">{{ r.label }}</span><span class="bar__time">🗄️ {{ r.fast }} · 🛡️ {{ r.slow }}</span></div>
            <div class="bar__track"><div class="bar__fill" :style="{ width: r.pct + '%' }" /></div>
            <div class="bar__bits mono">{{ Math.round(r.bits) }} bits</div>
          </div>
        </div>
        <p class="note">Calcul honnête : on suppose que le pirate <strong>sait</strong> que tu as utilisé cette méthode et cette liste.
          Il doit quand même essayer {{ countOf(Math.pow(words.length, wordCount), 'combinaisons') }}.</p>
      </div>
      <div class="lesson">
        <strong>À retenir</strong>
        <ul>
          <li>Des mots tirés <strong>vraiment au hasard</strong> (dés, pas ton imagination !) = longue, solide et facile à retenir.</li>
          <li>Invente une petite histoire avec tes mots pour t’en souvenir.</li>
          <li>Refais-la chez toi : celle-ci a été affichée sur un grand écran 😉</li>
        </ul>
      </div>
      <div class="row"><button class="btn" type="button" @click="emit('next')">Épreuve suivante →</button></div>
    </template>
  </section>
</template>

<style scoped>
.dice__layout { display: grid; grid-template-columns: 1.1fr 1fr; gap: 1.2rem; }
@media (max-width: 1000px) { .dice__layout { grid-template-columns: 1fr; } }
.chip--btn { cursor: pointer; font-size: 0.85rem; padding: 0.3rem 0.9rem; }
.chip--active { background: var(--accent); border-color: var(--accent); color: #fff; }

.dice__slots { display: flex; gap: 0.6rem; margin: 0.4rem 0 1rem; }
.slot {
  width: 3.6rem; height: 3.6rem; border-radius: 12px;
  border: 2px dashed var(--border); display: grid; place-items: center;
  font-size: 2.8rem; line-height: 1;
}
.slot.filled { border-style: solid; border-color: var(--accent); background: var(--accent-soft); }
.dice__pad { display: grid; grid-template-columns: repeat(6, 1fr); gap: 0.6rem; margin-bottom: 1rem; }
.face {
  display: flex; flex-direction: column; align-items: center; gap: 0.1rem;
  padding: 0.5rem 0; border-radius: 14px; border: 1px solid var(--border);
  background: var(--surface); cursor: pointer; transition: transform .1s ease;
}
.face:active { transform: scale(.94); }
.face:disabled { opacity: .4; cursor: default; }
.face__glyph { font-size: 3rem; line-height: 1; }
.face__n { font: 600 0.8rem var(--font-mono); color: var(--muted); }

.words { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 0.5rem; }
.words li { display: flex; gap: 1rem; align-items: baseline; padding: 0.4rem 0.6rem; border-radius: 10px; background: var(--surface-2); }
.words li.ready { background: var(--ok-soft); }
.words__code { color: var(--muted); font-size: 0.8rem; }
.words__w { font-size: 1.4rem; font-weight: 700; }
.phrase {
  margin-top: 1rem; padding: 0.8rem 1rem; border-radius: 12px;
  background: var(--accent-soft); border: 2px solid var(--accent);
  font-size: 1.4rem; font-weight: 700; overflow-wrap: break-word; text-align: center;
}

.bars__legend { display: flex; gap: 1.5rem; font-size: 0.75rem; color: var(--muted); margin-bottom: 0.8rem; }
.bars { display: flex; flex-direction: column; gap: 0.8rem; }
.bar__label { display: flex; justify-content: space-between; gap: 1rem; font-size: 0.85rem; flex-wrap: wrap; }
.bar__time { font-weight: 700; }
.bar__track { height: 1.1rem; background: var(--surface-2); border-radius: 999px; overflow: hidden; margin-top: 0.25rem; }
.bar__fill { height: 100%; background: var(--bad); border-radius: 999px; transition: width .6s ease; }
.bar--mine .bar__fill { background: var(--ok); }
.bar--mine .bar__label { font-weight: 700; }
.bar__bits { font-size: 0.7rem; color: var(--muted); }
.note { margin: 1rem 0 0; font-size: 0.8rem; color: var(--muted); }
</style>
