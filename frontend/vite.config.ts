import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    wasm(),
    topLevelAwait(),
  ],
  assetsInclude: ['**/*.wasm'],
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  optimizeDeps: {
    // These packages resolve wasm with import.meta.url; pre-bundling breaks relative wasm paths in dev.
    exclude: [
      '@noir-lang/noir_js',
      '@noir-lang/acvm_js',
      '@noir-lang/noirc_abi',
      '@aztec/bb.js',
    ],
  },
})
