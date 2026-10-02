<script setup>
import { ref, computed, nextTick } from 'vue';
import { personas } from '../data/personas.js';

const emit = defineEmits(['next']);
const MAX_TRIES = 3;

// Random target by default; the visitor (or assistant) can switch before guessing.
const pickIdx = ref((() => { const b = new Uint32Array(1); crypto.getRandomValues(b); return b[0] % personas.length; })());
const p = computed(() => personas[pickIdx.value]);

const guess = ref('');
const attempts = ref([]);   // [{ text, found: [keys] }]
const won = ref(false);
const inputEl = ref(null);

const done = computed(() => won.value || attempts.value.length >= MAX_TRIES);
const triesLeft = computed(() => MAX_TRIES - attempts.value.length);
const hint = computed(() => (!done.value && attempts.value.length > 0) ? p.value.hints[attempts.value.length - 1] : null);
const firstName = computed(() => p.value.name.split(' ')[0]);

function norm(s) { return s.trim().toLowerCase().replace(/\s+/g, ''); }

function choose(i) {
  if (attempts.value.length) return;
  pickIdx.value = i;
}

function submit() {
  const g = norm(guess.value);
  if (!g || done.value) return;
  const found = p.value.parts.filter(pt => pt.test(g)).map(pt => pt.key);
  attempts.value.push({ text: guess.value.trim(), found });
  if (g === norm(p.value.password)) won.value = true;
  guess.value = '';
  nextTick(() => inputEl.value?.focus());
}
</script>

<template>
  <section class="station osint">
    <div class="row osint__top">
      <p class="lede">
        Voici le profil <strong>public</strong> de {{ firstName }}. Son mot de passe est « impossible à deviner »…
        Lis ses publications et trouve-le en <strong>{{ MAX_TRIES }} essais</strong>.
      </p>
      <div class="picker" :class="{ locked: attempts.length }">
        <span class="picker__label">Cible :</span>
        <button v-for="(x, i) in personas" :key="x.id" type="button" class="picker__btn"
          :class="{ active: i === pickIdx }" :disabled="attempts.length > 0 && i !== pickIdx"
          :data-tooltip="x.name" data-tooltip-pos="bottom" @click="choose(i)">{{ x.initial }}</button>
      </div>
    </div>

    <div class="osint__layout">
      <!-- Fictional, unbranded social profile -->
      <div class="social card">
        <header class="social__head">
          <div class="social__avatar" aria-hidden="true">{{ p.initial }}</div>
          <div>
            <div class="social__name">{{ p.name }}</div>
            <div class="social__handle mono">{{ p.handle }}</div>
            <div class="social__bio">{{ p.bio }}</div>
          </div>
          <div class="social__stats">
            <span><strong>{{ p.posts.length }}</strong> posts</span>
            <span><strong>{{ p.followers }}</strong> abonnés</span>
          </div>
        </header>
        <div class="social__grid">
          <article v-for="post in p.posts" :key="post.id" class="post"
            :class="{ 'post--leak': done && post.leak, 'post--dim': done && !post.leak }">
            <div class="post__img" :style="{ background: post.bg }"><span>{{ post.emoji }}</span></div>
            <p class="post__text">{{ post.text }}</p>
            <div class="post__likes">♥ {{ post.likes }}</div>
            <div v-if="done && post.leak" class="post__tag">⚠️ {{ p.leakLabels[post.leak] }}</div>
          </article>
        </div>
      </div>

      <!-- Game panel -->
      <aside class="osint__panel">
        <div class="card">
          <h3>🔑 Mot de passe de {{ firstName }}</h3>
          <form v-if="!done" class="osint__form" @submit.prevent="submit">
            <input ref="inputEl" v-model="guess" class="big-input" type="text" placeholder="Ta proposition…"
              autocomplete="off" autocapitalize="off" spellcheck="false" />
            <div class="row">
              <button class="btn" type="submit" :disabled="!guess.trim()">Essayer</button>
              <span class="chip">{{ triesLeft }} essai{{ triesLeft > 1 ? 's' : '' }} restant{{ triesLeft > 1 ? 's' : '' }}</span>
            </div>
          </form>

          <ul v-if="attempts.length" class="attempts">
            <li v-for="(a, i) in attempts" :key="i">
              <span class="mono attempts__text">{{ a.text }}</span>
              <span class="attempts__parts">
                <span v-for="pt in p.parts" :key="pt.key" class="chip" :class="a.found.includes(pt.key) ? 'chip--ok' : 'chip--ko'">
                  {{ a.found.includes(pt.key) ? '✓' : '✗' }} {{ pt.label }}
                </span>
              </span>
            </li>
          </ul>
          <p v-if="hint" class="hint">💡 {{ hint }}</p>
        </div>

        <template v-if="done">
          <div class="card result" :class="won ? 'result--won' : 'result--lost'">
            <div class="result__title">{{ won ? '🎉 Bravo, tu as trouvé !' : '🔓 Le mot de passe était…' }}</div>
            <div class="result__pw mono">
              <span v-for="([txt], i) in p.display" :key="i" class="seg" :class="'seg--' + i">{{ txt }}</span>
            </div>
            <p class="result__sub">Pour un ordinateur, c’est <strong>{{ p.password.length }} caractères</strong>… mais
              pour quelqu’un qui a lu le profil, ce sont juste <strong>{{ p.display.length }} informations</strong>.</p>
          </div>

          <div class="card">
            <h3>❓ Et les « questions de sécurité » ?</h3>
            <table class="sq">
              <tr v-for="s in p.securityQuestions" :key="s.q">
                <td>{{ s.q }}</td><td class="mono sq__a">{{ s.a }}</td>
              </tr>
            </table>
            <p class="sq__note">Toutes les réponses sont sur son profil public : n’importe qui peut « récupérer » ses comptes.</p>
          </div>

          <div class="lesson">
            <strong>À retenir</strong>
            <ul>
              <li>Ce que tu publies en dit long : les pirates commencent par lire tes réseaux (OSINT).</li>
              <li>Jamais de prénom, d’animal, de date, de ville ou de numéro fétiche dans un mot de passe.</li>
              <li>Pour les questions de sécurité, invente des réponses (et note-les dans un gestionnaire).</li>
            </ul>
          </div>
          <div class="row"><button class="btn" type="button" @click="emit('next')">Épreuve suivante →</button></div>
        </template>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.osint__top { justify-content: space-between; align-items: flex-start; flex-wrap: nowrap; gap: 1.5rem; }
@media (max-width: 1000px) { .osint__top { flex-wrap: wrap; } }
.picker { display: flex; align-items: center; gap: 0.4rem; flex: none; }
.picker__label { font-size: 0.8rem; color: var(--muted); }
.picker__btn {
  width: 2.4rem; height: 2.4rem; border-radius: 50%;
  border: 2px solid var(--border); background: var(--surface);
  font-weight: 700; cursor: pointer; transition: transform .12s ease;
}
.picker__btn:hover:not(:disabled) { transform: scale(1.08); }
.picker__btn.active { border-color: var(--accent); background: var(--accent); color: #fff; }
.picker__btn:disabled { opacity: .3; cursor: default; }

.osint__layout { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr); gap: 1.4rem; align-items: start; }
.osint__panel { display: flex; flex-direction: column; gap: 1rem; position: sticky; top: 1rem; }
@media (max-width: 1000px) { .osint__layout { grid-template-columns: 1fr; } .osint__panel { position: static; } }

.social__head { display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; margin-bottom: 1rem; }
.social__avatar {
  width: 4.2rem; height: 4.2rem; border-radius: 50%;
  display: grid; place-items: center; font-size: 1.8rem; font-weight: 700; color: #fff;
  background: conic-gradient(#f7f19f, #e2abba, #a890c0, #8cc6e6, #98c7bf, #f7f19f);
  box-shadow: inset 0 0 0 4px var(--surface);
}
.social__name { font-weight: 700; font-size: 1.15rem; }
.social__handle { color: var(--muted); font-size: 0.8rem; }
.social__bio { font-size: 0.85rem; margin-top: 0.2rem; }
.social__stats { margin-left: auto; display: flex; gap: 1rem; font-size: 0.8rem; color: var(--muted); }
.social__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr)); gap: 0.8rem; }

.post {
  position: relative; border-radius: 14px; overflow: hidden;
  background: var(--surface); border: 1px solid var(--border);
  transition: opacity .4s ease, transform .4s ease, box-shadow .4s ease;
}
.post__img { aspect-ratio: 4 / 3; display: grid; place-items: center; font-size: 3rem; }
.post__text { margin: 0; padding: 0.5rem 0.7rem 0.2rem; font-size: 0.75rem; line-height: 1.35; }
.post__likes { padding: 0 0.7rem 0.5rem; font-size: 0.7rem; color: var(--muted); }
.post--dim { opacity: 0.35; }
.post--leak { box-shadow: 0 0 0 4px var(--bad); transform: scale(1.02); }
.post__tag {
  position: absolute; top: 0.4rem; left: 0.4rem; right: 0.4rem;
  background: var(--bad); color: #fff; font-size: 0.65rem; font-weight: 700;
  border-radius: 8px; padding: 0.2rem 0.5rem; text-align: center;
}

.osint__form { display: flex; flex-direction: column; gap: 0.8rem; }
.attempts { list-style: none; margin: 1rem 0 0; padding: 0; display: flex; flex-direction: column; gap: 0.6rem; }
.attempts li { display: flex; flex-direction: column; gap: 0.3rem; padding-top: 0.6rem; border-top: 1px dashed var(--border); }
.attempts__text { font-size: 1rem; font-weight: 600; word-break: break-all; }
.attempts__parts { display: flex; flex-wrap: wrap; gap: 0.3rem; }
.chip--ok { background: var(--ok-soft); border-color: var(--ok); }
.chip--ko { opacity: 0.6; }
.hint { margin: 0.8rem 0 0; font-weight: 600; color: var(--warn); }

.result { text-align: center; }
.result--won { border: 2px solid var(--ok); }
.result--lost { border: 2px solid var(--bad); }
.result__title { font-size: 1.2rem; font-weight: 700; }
.result__pw { font-size: 2.2rem; font-weight: 700; margin: 0.6rem 0; }
.seg { padding: 0 0.15rem; border-radius: 6px; }
.seg--0 { background: rgba(255, 169, 77, .35); }
.seg--1 { background: rgba(230, 73, 128, .3); }
.seg--2 { background: rgba(151, 117, 250, .35); }
.result__sub { margin: 0; font-size: 0.85rem; color: var(--muted); }

.sq { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.sq td { padding: 0.35rem 0; border-bottom: 1px solid var(--border); }
.sq__a { text-align: right; font-weight: 700; color: var(--bad); }
.sq__note { margin: 0.6rem 0 0; font-size: 0.8rem; color: var(--muted); }
</style>
