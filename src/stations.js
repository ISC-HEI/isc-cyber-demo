import { defineAsyncComponent } from 'vue';

// Order = the suggested route around the stand.
export const stations = [
  {
    id: 'lea', step: 1, emoji: '🕵️', color: 'var(--petal-pink)',
    title: 'Devine le mot de passe',
    pitch: 'Fouille un profil public… et trouve le mot de passe en 3 essais.',
    component: defineAsyncComponent(() => import('./stations/OsintStation.vue')),
  },
  {
    id: 'race', step: 2, emoji: '⏱️', color: 'var(--petal-cyan)',
    title: 'La course contre la machine',
    pitch: 'Combien de temps un ordinateur met-il pour trouver ton mot de passe ?',
    component: defineAsyncComponent(() => import('./stations/RaceStation.vue')),
  },
  {
    id: 'dice', step: 3, emoji: '🎲', color: 'var(--petal-yellow)',
    title: 'La phrase de passe aux dés',
    pitch: 'Lance les dés et fabrique un mot de passe solide… et facile à retenir.',
    component: defineAsyncComponent(() => import('./stations/DicewareStation.vue')),
  },
  {
    id: 'phish', step: 4, emoji: '🎣', color: 'var(--petal-purple)',
    title: 'Piège ou pas piège ?',
    pitch: 'Emails, SMS, pages de connexion : repère les arnaques.',
    component: defineAsyncComponent(() => import('./stations/PhishingStation.vue')),
  },
  {
    id: 'caesar', step: 5, emoji: '🔐', color: 'var(--petal-teal)',
    title: 'Casse le code de César',
    pitch: 'Déchiffre un message secret grâce aux fréquences des lettres.',
    component: defineAsyncComponent(() => import('./stations/CaesarStation.vue')),
  },
];
