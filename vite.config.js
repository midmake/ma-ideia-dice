import { defineConfig } from 'vite';

export default defineConfig({
  base: '/ma-ideia-dice/',
  build: {
    target: 'es2020',
    sourcemap: false,
  },
});
