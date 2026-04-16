import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import electron from 'vite-plugin-electron/simple'
import { readFileSync } from 'node:fs'

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8')) as { version: string }

// https://vite.dev/config/
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  build: {
    // Electron ships its own Chromium, so target esnext to skip transpilation overhead
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router'],
          jose: ['jose'],
        },
      },
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    electron({
      main: {
        entry: 'electron/main.ts',
        vite: {
          build: {
            // Match Electron 40's bundled Node.js version
            target: 'node22',
          },
        },
      },
      preload: {
        input: 'electron/preload.ts',
        vite: {
          build: {
            target: 'node22',
          },
        },
      },
    }),
  ],
})
