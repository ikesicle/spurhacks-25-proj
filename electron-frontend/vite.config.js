import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  root: 'src',
  fs: {
    strict: false,
    allow: ['..']
  },
  build: {
    outDir: '../../dist/renderer',
  },
  server: {
    port: 3000,
  }
});
