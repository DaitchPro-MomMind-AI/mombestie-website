import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// Standalone Vite config for this sibling app — not managed by the Figma
// Make sandbox tooling (see ../../docs/ARCHITECTURE.md §1). Run with
// `npm run dev` from this directory once you deploy it outside the sandbox.
export default defineConfig({
  // GitHub Pages serves project sites from /<repo-name>/, so the built
  // asset URLs need that prefix in CI. VITE_BASE_PATH is set only in
  // .github/workflows/deploy-pages.yml; local dev is unaffected (defaults
  // to '/').
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, './src') },
  },
  server: {
    host: '0.0.0.0',
    port: 5174,
  },
})
