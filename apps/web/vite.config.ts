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
      '@repo/entity-water-station': path.resolve(__dirname, '../../packages/entity-water-station/src'),
      '@repo/multi-tenant': path.resolve(__dirname, '../../packages/multi-tenant/src'),
      '@repo/feature-flags': path.resolve(__dirname, '../../packages/feature-flags/src'),
      '@repo/audit-trail': path.resolve(__dirname, '../../packages/audit-trail/src'),
      '@repo/sync-engine': path.resolve(__dirname, '../../packages/sync-engine/src'),
      '@repo/observability': path.resolve(__dirname, '../../packages/observability/src'),
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
        manualChunks(id: string) {
          // Vendor: big frameworks
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) return 'vendor-react'
          if (id.includes('node_modules/@tanstack')) return 'vendor-tanstack'
          if (id.includes('node_modules/lucide-react')) return 'vendor-icons'
          if (id.includes('node_modules/zustand')) return 'vendor-state'
          if (id.includes('node_modules/react-hook-form') || id.includes('node_modules/@hookform')) return 'vendor-forms'
          if (id.includes('node_modules/zod')) return 'vendor-validation'
          if (id.includes('node_modules/dexie') || id.includes('node_modules/uuid')) return 'vendor-db'

          // Package-based: split entity packages
          if (id.includes('packages/entity-')) return `entity-${id.split('entity-')[1]?.split('/')[0]}`
          if (id.includes('packages/core')) return 'pkg-core'
          if (id.includes('packages/db-adapter')) return 'pkg-db'
          if (id.includes('packages/ui-core')) return 'pkg-ui'
          if (id.includes('packages/multi-tenant')) return 'pkg-tenant'
          if (id.includes('packages/feature-flags')) return 'pkg-flags'
          if (id.includes('packages/audit-trail')) return 'pkg-audit'

          // Route-based: split large pages
          if (id.includes('routes/reports')) return 'page-reports'
          if (id.includes('routes/loans') || id.includes('routes/loan-')) return 'page-loans'
          if (id.includes('routes/members') || id.includes('routes/member')) return 'page-members'
          if (id.includes('routes/accounting')) return 'page-accounting'
          if (id.includes('routes/portal')) return 'page-portals'
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
})
