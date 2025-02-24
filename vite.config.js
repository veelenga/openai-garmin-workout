import { defineConfig } from 'vite'
import { crx } from '@crxjs/vite-plugin'
import manifest from './src/manifest.js'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    server: {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    },
    build: {
      emptyOutDir: true,
      outDir: 'build',
      rollupOptions: {
        output: {
          chunkFileNames: 'assets/chunk-[hash].js',
        },
      },
    },

    css: {
      postcss: {
        minimize: true,
      },
    },

    plugins: [crx({ manifest })],
  }
})
