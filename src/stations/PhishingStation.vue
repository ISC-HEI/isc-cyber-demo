<script setup>
import { ref, computed } from 'vue';
import { drawMessages } from '../data/phishing.js';

const emit = defineEmits(['next']);

// Drawn once per mount — the parent's ↺ / idle reset remounts the station.
const messages = drawMessages();
const index = ref(0);
const answers = ref([]);           // 'phish' | 'legit' per message
const msg = computed(() => messages[index.value]);
const answered = computed(() => answers.value.length > index.value);
const correct = computed(() => answered.value && answers.value[index.value] === msg.value.verdict);
const over = computed(() => index.value >= messages.length);
const score = computed(() => answers.value.filter((a, i) => a === messages[i].verdict).length);

// Clue numbers follow the declaration order in `clues`.
const clueOrder = computed(() => Object.keys(msg.value?.clues ?? {}));
function n(clue) { return clueOrder.value.indexOf(clue) + 1; }
function cls(field) { return answered.value && field?.clue ? ['clue', msg.value.verdict === 'legit' ? 'clue--ok' : 'clue--bad'] : []; }

function answer(v) { if (!answered.value) answers.value.push(v); }
function nextMsg() { index.value++; }
</script>

<template>
  <section class="station phish">
    <template v-if="!over">
      <div class="row phish__top">
        <p class="lede">Ce message est-il <strong>un piège</strong> ou <strong>fiable</strong> ?</p>
        <span class="chip mono">{{ index + 1 }} / {{ messages.length }} · score {{ score }}</span>
      </div>

      <div class="phish__layout">
        <!-- ── The message mock-up ─────────────────────────────── -->
        <div class="mock" :class="'mock--' + msg.kind">
          <!-- SMS -->
          <template v-if="msg.kind === 'sms'">
            <div class="sms__head">
              <div class="sms__avatar">👤</div>
              <span :class="cls(msg.from)" :data-n="n(msg.from.clue)">{{ msg.from.text }}</span>
            </div>
            <div class="sms__bubble">
              <span v-for="(b, i) in msg.body" :key="i" :class="[cls(b), { fakelink: b.link }]" :data-n="n(b.clue)">{{ b.text }}</span>
            </div>
          </template>

          <!-- Email -->
          <template v-else-if="msg.kind === 'email'">
            <div class="mail__meta">
              <div><span class="mail__k">De :</span> <span :class="cls(msg.from)" :data-n="n(msg.from.clue)">{{ msg.from.text }}</span></div>
              <div><span class="mail__k">Objet :</span> <strong :class="cls(msg.subject)" :data-n="n(msg.subject.clue)">{{ msg.subject.text }}</strong></div>
            </div>
            <div class="mail__body">
              <span v-for="(b, i) in msg.body" :key="i" :class="cls(b)" :data-n="n(b.clue)">{{ b.text }}</span>
            </div>
            <div v-if="msg.button" class="mail__btnwrap">
              <span class="mail__btn" :class="cls(msg.button)" :data-n="n(msg.button.clue)">{{ msg.button.text }}</span>
              <div v-if="answered && msg.button.realUrl" class="mail__real mono">↳ {{ msg.button.realUrl }}</div>
            </div>
          </template>

          <!-- Web page -->
          <template v-else>
            <div class="web__bar">
              <span class="web__lock">🔒</span>
              <span class="mono" :class="cls(msg.url)" :data-n="n(msg.url.clue)">{{ msg.url.text }}</span>
            </div>
            <div class="web__page">
              <div class="web__brand">{{ msg.brand }}</div>
              <h4 :class="cls(msg.headline)" :data-n="n(msg.headline.clue)">{{ msg.headline.text }}</h4>
              <p v-for="(b, i) in msg.body" :key="i">{{ b.text }}</p>
              <div v-for="f in msg.fields" :key="f.label" class="web__field" :class="cls(f)" :data-n="n(f.clue)">
                <label>{{ f.label }}</label><div class="web__input" />
              </div>
              <span class="web__btn">{{ msg.button.text }}</span>
            </div>
          </template>
        </div>

        <!-- ── Answer / explanation ───────────────────────────── -->
        <div class="phish__side">
          <div v-if="!answered" class="card choose">
            <button type="button" class="btn btn--bad big" @click="answer('phish')">🎣 Piège</button>
            <button type="button" class="btn btn--ok big" @click="answer('legit')">✅ Fiable</button>
          </div>
          <template v-else>
            <div class="card verdict" :class="correct ? 'verdict--ok' : 'verdict--bad'">
              <div class="verdict__title">{{ correct ? '👍 Bien vu !' : '😬 Raté…' }}</div>
              <div>C’était <strong>{{ msg.verdict === 'phish' ? 'un piège' : 'un message fiable' }}</strong>.</div>
            </div>
            <div class="card">
              <h3>{{ msg.verdict === 'phish' ? 'Les indices' : 'Pourquoi c’est fiable' }}</h3>
              <ol class="clues">
                <li v-for="(text, key) in msg.clues" :key="key" :class="msg.verdict === 'legit' ? 'ok' : 'bad'">
                  <span class="clues__n">{{ n(key) }}</span><span>{{ text }}</span>
                </li>
              </ol>
            </div>
            <button type="button" class="btn" @click="nextMsg">{{ index + 1 < messages.length ? 'Message suivant →' : 'Voir mon score' }}</button>
          </template>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="card final">
        <div class="final__score">{{ score }} / {{ messages.length }}</div>
        <div class="final__msg">{{ score === messages.length ? 'Imbattable ! 🏆' : score >= messages.length - 1 ? 'Très bien, tu as l’œil 👀' : 'Les arnaqueurs sont malins… reste vigilant·e !' }}</div>
      </div>
      <div class="lesson">
        <strong>Les réflexes anti-arnaque</strong>
        <ul>
          <li><strong>Urgence, peur, cadeau, émotion</strong> : stop, on respire et on vérifie.</li>
          <li>Regarde l’<strong>expéditeur</strong> et le <strong>vrai domaine</strong> du lien, pas le logo.</li>
          <li>Jamais de mot de passe, code PIN ou code SMS transmis par message.</li>
          <li>Un doute ? Contacte l’entreprise ou la personne <strong>par un autre canal</strong> que tu connais.</li>
        </ul>
      </div>
      <div class="row"><button class="btn" type="button" @click="emit('next')">Épreuve suivante →</button></div>
    </template>
  </section>
</template>

<style scoped>
.phish__top { justify-content: space-between; }
.phish__layout { display: grid; grid-template-columns: 1.3fr 1fr; gap: 1.4rem; align-items: start; }
@media (max-width: 1000px) { .phish__layout { grid-template-columns: 1fr; } }
.phish__side { display: flex; flex-direction: column; gap: 1rem; }

.mock {
  background: var(--surface); border: 1px solid var(--border); border-radius: 22px;
  box-shadow: var(--shadow); overflow: hidden; font-size: 1rem;
}
/* SMS */
.mock--sms { max-width: 30rem; padding: 1rem; background: var(--surface-2); }
.sms__head { display: flex; align-items: center; gap: 0.7rem; font-weight: 600; margin-bottom: 1rem; font-size: 0.9rem; }
.sms__avatar { width: 2.4rem; height: 2.4rem; border-radius: 50%; background: var(--border); display: grid; place-items: center; }
.sms__bubble { background: var(--surface); border-radius: 18px 18px 18px 4px; padding: 0.9rem 1.1rem; line-height: 1.5; box-shadow: var(--shadow); }
.fakelink { color: #1c7ed6; text-decoration: underline; }
/* Email */
.mail__meta { padding: 1rem 1.3rem; border-bottom: 1px solid var(--border); display: flex; flex-direction: column; gap: 0.4rem; font-size: 0.9rem; background: var(--surface-2); }
.mail__k { color: var(--muted); }
.mail__body { padding: 1.2rem 1.3rem; white-space: pre-line; line-height: 1.55; }
.mail__btnwrap { padding: 0 1.3rem 1.4rem; }
.mail__btn { display: inline-block; background: #1c7ed6; color: #fff; padding: 0.6rem 1.3rem; border-radius: 8px; font-weight: 700; }
.mail__real { margin-top: 0.5rem; color: var(--bad); font-size: 0.8rem; font-weight: 600; }
/* Web */
.web__bar { display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1rem; background: var(--surface-2); border-bottom: 1px solid var(--border); font-size: 0.8rem; }
.web__page { padding: 1.4rem; display: flex; flex-direction: column; gap: 0.7rem; }
.web__brand { font-weight: 800; font-size: 1.4rem; color: #e03131; letter-spacing: -0.02em; }
.web__page h4 { margin: 0; font-size: 1.2rem; }
.web__page p { margin: 0; color: var(--muted); }
.web__field label { font-size: 0.75rem; font-weight: 600; }
.web__input { height: 2.2rem; border: 1px solid var(--border); border-radius: 8px; background: var(--surface-2); }
.web__btn { align-self: flex-start; background: #e03131; color: #fff; padding: 0.6rem 1.3rem; border-radius: 8px; font-weight: 700; }

/* Highlighted clues with a numbered badge */
.clue { position: relative; border-radius: 6px; padding: 0 0.15rem; }
.clue--bad { background: var(--bad-soft); box-shadow: 0 0 0 2px var(--bad); }
.clue--ok { background: var(--ok-soft); box-shadow: 0 0 0 2px var(--ok); }
.clue::after {
  content: attr(data-n);
  position: absolute; top: -0.75rem; right: -0.6rem;
  width: 1.3rem; height: 1.3rem; border-radius: 50%;
  font: 700 0.7rem var(--font-mono); color: #fff;
  display: grid; place-items: center;
}
.clue--bad::after { background: var(--bad); }
.clue--ok::after { background: var(--ok); }
.web__field.clue { display: block; padding: 0.2rem; }
.mail__btn.clue { background: #1c7ed6; box-shadow: 0 0 0 3px var(--bad); padding: 0.6rem 1.3rem; }

.choose { display: flex; flex-direction: column; gap: 1rem; }
.big { font-size: 1.4rem; padding: 1.1rem; }
.verdict { text-align: center; }
.verdict--ok { border: 2px solid var(--ok); }
.verdict--bad { border: 2px solid var(--bad); }
.verdict__title { font-size: 1.5rem; font-weight: 800; }
.clues { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.6rem; font-size: 0.9rem; }
.clues li { display: flex; gap: 0.6rem; align-items: flex-start; }
.clues__n { flex: none; width: 1.4rem; height: 1.4rem; border-radius: 50%; display: grid; place-items: center; color: #fff; font: 700 0.75rem var(--font-mono); }
.clues li.bad .clues__n { background: var(--bad); }
.clues li.ok .clues__n { background: var(--ok); }

.final { text-align: center; }
.final__score { font-size: 4rem; font-weight: 800; color: var(--accent); }
.final__msg { font-size: 1.3rem; font-weight: 600; }
</style>
