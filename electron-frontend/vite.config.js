import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    __dirname: JSON.stringify(path.resolve())
  },
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
