import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.wasm'],
  optimizeDeps: {
    // These packages resolve wasm with import.meta.url; pre-bundling breaks relative wasm paths in dev.
    exclude: [
      '@noir-lang/noir_js',
      '@noir-lang/acvm_js',
      '@noir-lang/noirc_abi',
      '@noir-lang/backend_barretenberg',
      '@aztec/bb.js',
    ],
  },
})
