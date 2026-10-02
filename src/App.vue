<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { ISCHeader, Footer, AmbientBackground, useTheme } from '@isc-hei/design';
import { stations } from './stations.js';
import { idleSeconds } from './settings.js';
import { t } from './i18n.js';
import SettingsPanel from './components/SettingsPanel.vue';

const { mode, cycle } = useTheme();

const currentId = ref(null);
const current = computed(() => stations.find(s => s.id === currentId.value) ?? null);
// Bumping the key remounts the station → every input and score is wiped.
const runKey = ref(0);
const settingsOpen = ref(false);
const build = `v${__GIT_HASH__} · ${__BUILD_DATE__}`;

function open(id) { currentId.value = id; runKey.value++; window.scrollTo({ top: 0 }); }
function goHome() { currentId.value = null; runKey.value++; window.scrollTo({ top: 0 }); }
function restart() { runKey.value++; window.scrollTo({ top: 0 }); }
function next() {
  const i = stations.findIndex(s => s.id === currentId.value);
  if (i >= 0 && i < stations.length - 1) open(stations[i + 1].id); else goHome();
}

// Idle auto-reset so the next visitor never sees the previous one's input.
const lastActivity = ref(Date.now());
const now = ref(Date.now());
let tick = null;
function touch() { lastActivity.value = Date.now(); }
const idleLeft = computed(() => Math.max(0, idleSeconds() - Math.floor((now.value - lastActivity.value) / 1000)));
const showIdleWarning = computed(() => currentId.value && !settingsOpen.value && idleLeft.value <= 15);

onMounted(() => {
  for (const ev of ['pointerdown', 'keydown', 'wheel', 'touchstart']) window.addEventListener(ev, touch, { passive: true });
  tick = setInterval(() => {
    now.value = Date.now();
    if (currentId.value && !settingsOpen.value && idleLeft.value === 0) { goHome(); touch(); }
  }, 1000);
});
onBeforeUnmount(() => {
  clearInterval(tick);
  for (const ev of ['pointerdown', 'keydown', 'wheel', 'touchstart']) window.removeEventListener(ev, touch);
});
</script>

<template>
  <AmbientBackground
    bg-style="blobs"
    :intensity="0.18"
    :colors="['rgb(247,241,159)','rgb(140,198,230)','rgb(168,144,192)','rgb(226,171,186)','rgb(152,199,191)']"
    :colors-dark="['rgb(180,170,80)','rgb(80,140,180)','rgb(130,100,160)','rgb(170,100,130)','rgb(80,150,140)']"
  />
  <div class="app">
    <ISCHeader
      accent-light="#e2abba"
      accent-dark="#b1718d"
      :surtitle="t.surtitle"
      :title="current ? current.title : t.title"
      hub-href="#"
      tooltip-back-to-hub="ISC"
    >
      <template #meta>
        <button v-if="current" type="button" class="pill-btn" @click="restart">↺ {{ t.restart }}</button>
        <button v-if="current" type="button" class="pill-btn pill-btn--strong" @click="goHome">⌂ {{ t.home }}</button>
        <button type="button" class="isc-fab theme-fab"
          :data-tooltip="mode === 'light' ? t.themeLight : t.themeDark"
          data-tooltip-pos="bottom" @click="cycle">
          <svg v-if="mode === 'light'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <circle cx="12" cy="12" r="4"/>
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
          </svg>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </button>
      </template>
    </ISCHeader>

    <main class="main">
      <section v-if="!current" class="home">
        <h2 class="home__title">{{ t.intro }}</h2>
        <p class="home__privacy">🔒 {{ t.privacy }}</p>
        <div class="home__grid">
          <button v-for="s in stations" :key="s.id" type="button" class="tile"
            :style="{ '--tile': s.color }" @click="open(s.id)">
            <span class="tile__step">{{ s.step }}</span>
            <span class="tile__emoji" aria-hidden="true">{{ s.emoji }}</span>
            <span class="tile__title">{{ s.title }}</span>
            <span class="tile__pitch">{{ s.pitch }}</span>
          </button>
        </div>
      </section>

      <component v-else :is="current.component" :key="runKey" @next="next" @home="goHome" />
    </main>

    <Footer @secret-click="settingsOpen = true" />
    <div class="build">{{ build }}</div>
  </div>

  <transition name="fade">
    <div v-if="showIdleWarning" class="idle-banner" @click="touch">
      {{ t.idle }} <strong>{{ idleLeft }} s</strong> — touche l’écran pour continuer
    </div>
  </transition>

  <SettingsPanel v-if="settingsOpen" @close="settingsOpen = false" />
</template>
