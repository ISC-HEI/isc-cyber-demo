import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { execSync } from 'node:child_process';

function gitHash() {
  try { return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); }
  catch { return 'dev'; }
}

export default defineConfig({
  base: './',
  plugins: [vue()],
  define: {
    __GIT_HASH__: JSON.stringify(gitHash()),
    __BUILD_DATE__: JSON.stringify(new Date().toLocaleDateString('fr-CH')),
  },
});
