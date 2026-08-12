import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// Standalone Vite config for this sibling app — not managed by the Figma
// Make sandbox tooling (see ../../docs/ARCHITECTURE.md §1). Run with
// `npm run dev` from this directory once you deploy it outside the sandbox.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, './src') },
  },
  server: {
    host: '0.0.0.0',
    port: 5174,
  },
})
