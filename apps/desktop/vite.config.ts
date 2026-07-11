import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 5173,
    strictPort: true,
  },
  envPrefix: ['VITE_', 'TAURI_'],
  build: {
    target: ['es2021', 'chrome100', 'safari13'],
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    sourcemap: !!process.env.TAURI_DEBUG,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@repo/core': path.resolve(__dirname, '../../packages/core/src'),
      '@repo/db-tauri-sql': path.resolve(__dirname, '../../packages/db-adapter-tauri-sql/src'),
      '@repo/ui-core': path.resolve(__dirname, '../../packages/ui-core/src'),
      '@repo/entity-customer': path.resolve(__dirname, '../../packages/entity-customer/src'),
      '@repo/entity-member': path.resolve(__dirname, '../../packages/entity-member/src'),
      '@repo/entity-loan': path.resolve(__dirname, '../../packages/entity-loan/src'),
      '@repo/entity-savings': path.resolve(__dirname, '../../packages/entity-savings/src'),
      '@repo/entity-share-capital': path.resolve(__dirname, '../../packages/entity-share-capital/src'),
      '@repo/entity-accounting': path.resolve(__dirname, '../../packages/entity-accounting/src'),
      '@repo/entity-collection': path.resolve(__dirname, '../../packages/entity-collection/src'),
      '@repo/entity-governance': path.resolve(__dirname, '../../packages/entity-governance/src'),
      '@repo/multi-tenant': path.resolve(__dirname, '../../packages/multi-tenant/src'),
      '@repo/feature-flags': path.resolve(__dirname, '../../packages/feature-flags/src'),
      '@repo/audit-trail': path.resolve(__dirname, '../../packages/audit-trail/src'),
    },
  },
})
