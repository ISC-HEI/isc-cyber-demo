<script setup>
// Why frequency analysis works on César but not on AES — encrypts the same
// message with a real AES-GCM key (WebCrypto) and compares the histograms.
import { ref, computed, onMounted } from 'vue';

const props = defineProps({ plain: { type: String, required: true }, cipher: { type: String, required: true }, shift: { type: Number, required: true } });

const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const HEX = '0123456789abcdef';
const mode = ref('message');           // 'message' | 'eeee'
const aesHex = ref('');
const aesHex2 = ref('');               // same text, encrypted a second time
let key = null;

const source = computed(() => mode.value === 'message' ? props.plain : 'E'.repeat(props.plain.length));

async function encrypt(text) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const buf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}
async function run() {
  [aesHex.value, aesHex2.value] = [await encrypt(source.value), await encrypt(source.value)];
}
onMounted(async () => {
  key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 128 }, false, ['encrypt']);
  run();
});
function setMode(m) { mode.value = m; run(); }

function histogram(text, symbols) {
  const counts = Object.fromEntries([...symbols].map(c => [c, 0]));
  let total = 0;
  for (const c of text) if (counts[c] !== undefined) { counts[c]++; total++; }
  const rows = [...symbols].map(c => ({ c, pct: total ? (counts[c] / total) * 100 : 0 }));
  const max = Math.max(...rows.map(r => r.pct), 1);
  return rows.map(r => ({ ...r, h: (r.pct / max) * 100 }));
}
const caesarSrc = computed(() => mode.value === 'message' ? props.cipher : ALPHA[(4 + props.shift) % 26].repeat(props.plain.length));
const caesarHist = computed(() => histogram(caesarSrc.value, ALPHA));
const aesHist = computed(() => histogram(aesHex.value, HEX));
</script>

<template>
  <div class="aes">
    <div class="row aes__modes">
      <span class="small">Message à chiffrer :</span>
      <button type="button" class="chip chip--btn" :class="{ 'chip--active': mode === 'message' }" @click="setMode('message')">le message secret</button>
      <button type="button" class="chip chip--btn" :class="{ 'chip--active': mode === 'eeee' }" @click="setMode('eeee')">que des « E »</button>
      <button type="button" class="pill-btn" @click="run">↻ Rechiffrer</button>
    </div>

    <div class="aes__grid">
      <div class="bs">
        <h4>César</h4>
        <div class="out mono">{{ caesarSrc }}</div>
        <div class="hist">
          <div v-for="r in caesarHist" :key="r.c" class="hist__col"><div class="hist__bar hist__bar--c" :style="{ height: r.h + '%' }" /><span>{{ r.c }}</span></div>
        </div>
        <p>Chaque lettre devient <strong>toujours</strong> la même lettre : les pics du français restent visibles, juste décalés.</p>
      </div>
      <div class="bs">
        <h4>AES-128 (vrai chiffrement, clé aléatoire)</h4>
        <div class="out mono">{{ aesHex }}</div>
        <div class="hist">
          <div v-for="r in aesHist" :key="r.c" class="hist__col"><div class="hist__bar hist__bar--a" :style="{ height: r.h + '%' }" /><span>{{ r.c }}</span></div>
        </div>
        <p>Résultat : du « bruit » à peu près plat. Plus aucune trace des lettres de départ, même avec un message rempli de E.</p>
      </div>
    </div>

    <div class="bs">
      <h4>Le même message, chiffré une 2ᵉ fois avec la même clé</h4>
      <div class="out mono">{{ aesHex2 }}</div>
      <p class="small">Complètement différent : chaque chiffrement utilise un nombre aléatoire unique (le <em>nonce</em> ou IV).</p>
    </div>

    <div class="why">
      <div class="bs"><h4>🧱 Par blocs</h4><p>AES ne chiffre pas lettre par lettre mais par blocs de 16 octets : chaque octet de sortie dépend de tout le bloc.</p></div>
      <div class="bs"><h4>🌀 Confusion + diffusion</h4><p>10 tours de substitutions, permutations et mélanges : changer 1 bit en entrée change environ la moitié des bits en sortie (effet avalanche).</p></div>
      <div class="bs"><h4>🎲 Jamais deux fois pareil</h4><p>Grâce au nonce, le même texte donne un chiffré différent à chaque fois : impossible de repérer des répétitions.</p></div>
      <div class="bs"><h4>🔑 Une clé immense</h4><p>2<sup>128</sup> clés possibles, contre 25 pour César : il ne reste aucun raccourci statistique, ni essai exhaustif possible.</p></div>
    </div>
  </div>
</template>

<style scoped>
.aes { display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem; }
.aes__grid, .why { display: grid; grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr)); gap: 1rem; }
.why { grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr)); }
.bs { background: var(--surface-2); border: 1px solid var(--border); border-radius: 14px; padding: 0.9rem 1.1rem; }
.bs h4 { margin: 0 0 0.4rem; font-size: 0.95rem; color: var(--accent); }
.bs p { margin: 0.4rem 0 0; font-size: 0.82rem; line-height: 1.45; }
.small { color: var(--muted); font-size: 0.75rem !important; }
.out { font-size: 0.7rem; word-break: break-all; max-height: 4.5em; overflow: hidden; color: var(--muted); }
.hist { display: flex; align-items: flex-end; gap: 2px; height: 6rem; margin-top: 0.6rem; }
.hist__col { flex: 1; height: 100%; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; font: 0.55rem var(--font-mono); }
.hist__bar { width: 100%; border-radius: 3px 3px 0 0; transition: height .35s ease; }
.hist__bar--c { background: var(--accent); }
.hist__bar--a { background: var(--petal-cyan); }
.chip--btn { cursor: pointer; }
.chip--active { background: var(--accent); border-color: var(--accent); color: #fff; }
</style>
