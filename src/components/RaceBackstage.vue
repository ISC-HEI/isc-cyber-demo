<script setup>
// "Behind the scenes" for the race station — the defender's view:
// how a site should store a password, and where the estimate comes from.
import { ref, computed, watch } from 'vue';
import { settings } from '../settings.js';
import { bigNumber, countOf } from '../format.js';

const props = defineProps({ pw: { type: String, required: true }, result: { type: Object, required: true } });

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}
function randomSalt() {
  const b = new Uint8Array(8); crypto.getRandomValues(b);
  return [...b].map(x => x.toString(16).padStart(2, '0')).join('');
}

const hash = ref('');
const hashTwin = ref('');
const salt = ref('');
const saltedHash = ref('');
// Same password with its last character bumped — shows the avalanche effect.
const twin = computed(() => {
  const s = props.pw;
  const last = s.charCodeAt(s.length - 1);
  return s.slice(0, -1) + String.fromCharCode(last >= 126 ? 33 : last + 1);
});
const diffCount = computed(() => [...hash.value].filter((c, i) => c !== hashTwin.value[i]).length);

watch(() => props.pw, async pw => {
  if (!pw) return;
  salt.value = randomSalt();
  [hash.value, hashTwin.value, saltedHash.value] = await Promise.all([sha256(pw), sha256(twin.value), sha256(salt.value + pw)]);
}, { immediate: true });

const cs = computed(() => props.result.charset);
const ratio = computed(() => settings.fastRate / settings.slowRate);
</script>

<template>
  <div class="backstage">
    <section class="bs">
      <h4>1 · Un site ne garde (normalement) jamais ton mot de passe</h4>
      <p>Il garde son <strong>empreinte</strong> (un <em>hash</em>) : une fonction mathématique à sens unique.
        À la connexion, il recalcule l’empreinte de ce que tu tapes et compare.</p>
      <div class="kv mono"><span>mot de passe</span><span>{{ pw }}</span></div>
      <div class="kv mono"><span>SHA-256</span><span class="hex">{{ hash }}</span></div>
    </section>

    <section class="bs">
      <h4>2 · L’effet avalanche</h4>
      <p>Change un seul caractère : l’empreinte change complètement. Impossible de « s’approcher » de la bonne réponse.</p>
      <div class="kv mono"><span>{{ twin }}</span>
        <span class="hex"><span v-for="(c, i) in hashTwin" :key="i" :class="{ diff: c !== hash[i] }">{{ c }}</span></span>
      </div>
      <p class="small">{{ diffCount }} caractères sur 64 ont changé.</p>
    </section>

    <section class="bs">
      <h4>3 · Le sel : une empreinte unique par compte</h4>
      <p>Si deux personnes ont le même mot de passe, elles auraient la même empreinte. Le site ajoute donc un
        <strong>sel</strong> aléatoire, différent pour chaque compte, et le stocke à côté.</p>
      <div class="kv mono"><span>sel</span><span>{{ salt }}</span></div>
      <div class="kv mono"><span>SHA-256(sel + mdp)</span><span class="hex">{{ saltedHash }}</span></div>
    </section>

    <section class="bs">
      <h4>4 · Rapide = mauvais, lent = bon</h4>
      <p><strong>MD5</strong> ou <strong>SHA-256</strong> sont conçus pour être <em>rapides</em> (vérifier des fichiers…). Pour des mots de passe,
        on utilise des fonctions volontairement <em>lentes</em> et réglables : <strong>bcrypt</strong>, <strong>scrypt</strong>, <strong>Argon2</strong>.
        Pour l’utilisateur, 0,1 s à la connexion ne se voit pas ; pour une machine qui voudrait tout essayer, c’est
        ≈ {{ bigNumber(ratio) }} fois plus lent.</p>
    </section>

    <section class="bs">
      <h4>5 · D’où viennent les chiffres ?</h4>
      <p>Alphabet utilisé : <strong>{{ cs.size }}</strong> symboles ({{ cs.labels.join(', ') }}), longueur <strong>{{ pw.length }}</strong>.</p>
      <div class="formula mono">{{ cs.size }}<sup>{{ pw.length }}</sup> = {{ countOf(result.brute, 'combinaisons') }} possibles</div>
      <p>Mais un mot de passe humain n’est pas aléatoire : l’estimation (bibliothèque <span class="mono">zxcvbn</span>) découpe
        le mot de passe en morceaux connus (mots, années, prénoms…) et ne compte que les choix réels :
        ≈ <strong>{{ bigNumber(result.guesses) }}</strong>, soit <strong>{{ Math.round(result.bits) }} bits</strong> d’entropie.</p>
      <p class="small">Chaque bit en plus double le travail : +10 bits = ×1024. Un mot de plus dans une phrase Diceware = +12,9 bits.</p>
    </section>
  </div>
</template>

<style scoped>
.backstage { display: grid; grid-template-columns: repeat(auto-fit, minmax(22rem, 1fr)); gap: 1rem; margin-top: 1rem; }
.bs { background: var(--surface-2); border: 1px solid var(--border); border-radius: 14px; padding: 0.9rem 1.1rem; }
.bs h4 { margin: 0 0 0.4rem; font-size: 0.95rem; color: var(--accent); }
.bs p { margin: 0.3rem 0; font-size: 0.82rem; line-height: 1.45; }
.small { color: var(--muted); font-size: 0.75rem !important; }
.kv { display: grid; grid-template-columns: 9rem 1fr; gap: 0.6rem; font-size: 0.72rem; padding: 0.25rem 0; border-top: 1px dashed var(--border); }
.kv > span:first-child { color: var(--muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.hex { word-break: break-all; }
.diff { color: var(--bad); font-weight: 700; }
.formula { font-size: 1rem; font-weight: 600; margin: 0.4rem 0; }
</style>
