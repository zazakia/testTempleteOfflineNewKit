import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png', 'robots.txt'],
      manifest: {
        name: 'CoopERP',
        short_name: 'CoopERP',
        description: 'Enterprise cooperative ERP for Philippine cooperatives — offline-first',
        theme_color: '#16a34a',
        background_color: '#f0fdf4',
        display: 'standalone',
        orientation: 'any',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
              networkTimeoutSeconds: 10,
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@repo/core': path.resolve(__dirname, '../../packages/core/src'),
      '@repo/db-dexie': path.resolve(__dirname, '../../packages/db-adapter-dexie/src'),
      '@repo/ui-core': path.resolve(__dirname, '../../packages/ui-core/src'),
      '@repo/entity-customer': path.resolve(__dirname, '../../packages/entity-customer/src'),
      '@repo/entity-member': path.resolve(__dirname, '../../packages/entity-member/src'),
      '@repo/entity-share-capital': path.resolve(__dirname, '../../packages/entity-share-capital/src'),
      '@repo/entity-savings': path.resolve(__dirname, '../../packages/entity-savings/src'),
      '@repo/entity-loan': path.resolve(__dirname, '../../packages/entity-loan/src'),
      '@repo/entity-accounting': path.resolve(__dirname, '../../packages/entity-accounting/src'),
      '@repo/entity-collection': path.resolve(__dirname, '../../packages/entity-collection/src'),
      '@repo/entity-governance': path.resolve(__dirname, '../../packages/entity-governance/src'),
    },
  },
  server: {
    port: 5173,
    strictPort: false,
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', '@tanstack/react-router', '@tanstack/react-query'],
          ui: ['lucide-react', 'react-hook-form', '@hookform/resolvers'],
          core: ['@repo/core', '@repo/db-dexie', '@repo/entity-customer'],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
})
