import { defineConfig } from 'vite';

export default defineConfig({
  // Mantém o build portátil para domínio raiz ou subpasta (Hostinger, Pages etc.).
  base: './',
  build: {
    target: 'es2020',
    sourcemap: false,
  },
});
