<script setup>
import { onMounted, onBeforeUnmount } from 'vue';
import { settings, resetSettings, DEFAULTS, PRESETS, applyPreset } from '../settings.js';
import { rate } from '../format.js';

const emit = defineEmits(['close']);
function onKey(e) { if (e.key === 'Escape') emit('close'); }
onMounted(() => window.addEventListener('keydown', onKey));
onBeforeUnmount(() => window.removeEventListener('keydown', onKey));

// Inputs in scientific notation are easier to type than 10000000000.
function setRate(key, ev) {
  const v = Number(ev.target.value);
  if (isFinite(v) && v > 0) settings[key] = v;
}
</script>

<template>
  <div class="modal-backdrop" @click.self="emit('close')">
    <div class="modal" role="dialog" aria-label="Réglages assistant">
      <header class="modal__head">
        <h2>Réglages de l’assistant</h2>
        <button type="button" class="pill-btn" @click="emit('close')">✕</button>
      </header>

      <div class="field">
        <span>Préréglages</span>
        <div class="presets">
          <button v-for="p in PRESETS" :key="p.machineName" type="button" class="pill-btn"
            :class="{ 'pill-btn--strong': settings.machineName === p.machineName && settings.fastRate === p.fastRate }"
            @click="applyPreset(p)">
            {{ p.machineName }} · MD5 {{ p.measured.fast ? 'mesuré' : 'estimé' }}, bcrypt {{ p.measured.slow ? 'mesuré' : 'estimé' }}
          </button>
        </div>
      </div>

      <label class="field">
        <span>Nom de la machine affiché</span>
        <div class="presets">
          <select v-model="settings.machineArticle"><option>le</option><option>la</option><option value="l’">l’</option></select>
          <input v-model="settings.machineName" type="text" autocomplete="off" />
        </div>
      </label>

      <label class="field">
        <span>Débit hash rapide (MD5) — essais/s</span>
        <input :value="settings.fastRate.toExponential()" type="text" autocomplete="off" @change="setRate('fastRate', $event)" />
        <small>{{ rate(settings.fastRate) }} · mesurer avec <code>hashcat -b -m 0</code></small>
      </label>

      <label class="field">
        <span>Débit hash lent (bcrypt, coût 10) — essais/s</span>
        <input :value="settings.slowRate.toExponential()" type="text" autocomplete="off" @change="setRate('slowRate', $event)" />
        <small>{{ rate(settings.slowRate) }} · mesurer avec <code>hashcat -b -m 3200</code> (coût 5) puis diviser par 32</small>
      </label>

      <label class="field">
        <span>Retour automatique à l’accueil après (s)</span>
        <input v-model.lazy.number="settings.idleSeconds" type="number" min="20" max="600" />
      </label>

      <p class="modal__note">
        Valeurs par défaut : {{ DEFAULTS.machineName }}, MD5 89 348 MH/s et bcrypt 103 kH/s (coût 5) mesurés le 02.10.2026 ;
        bcrypt est affiché au coût 10, soit ≈ {{ Math.round(DEFAULTS.slowRate).toLocaleString('fr-CH') }} essais/s.
      </p>
      <button type="button" class="pill-btn" @click="resetSettings">Valeurs par défaut</button>
    </div>
  </div>
</template>

<style scoped>
.presets { display: flex; flex-wrap: wrap; gap: 0.4rem; }
.presets select { border-radius: 10px; border: 1px solid var(--border); background: var(--surface-2); padding: 0 0.4rem; }
.presets input { flex: 1; }
</style>
