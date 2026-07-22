// vite.config.ts
import { defineConfig } from "file:///D:/GitHub/testTempleteOfflineNewKit/node_modules/.pnpm/vite@6.4.3_@types+node@25.9.5_jiti@1.21.7_lightningcss@1.27.0_terser@5.48.0_tsx@4.23.0/node_modules/vite/dist/node/index.js";
import react from "file:///D:/GitHub/testTempleteOfflineNewKit/node_modules/.pnpm/@vitejs+plugin-react@4.7.0_vite@6.4.3_@types+node@25.9.5_jiti@1.21.7_lightningcss@1.27.0_terser@5.48.0_tsx@4.23.0_/node_modules/@vitejs/plugin-react/dist/index.js";
import { VitePWA } from "file:///D:/GitHub/testTempleteOfflineNewKit/node_modules/.pnpm/vite-plugin-pwa@0.20.5_vite@6.4.3_@types+node@25.9.5_jiti@1.21.7_lightningcss@1.27.0_terser@5_oww4a5tbfc7r6sdebj322l5nam/node_modules/vite-plugin-pwa/dist/index.js";
import { visualizer } from "file:///D:/GitHub/testTempleteOfflineNewKit/node_modules/.pnpm/rollup-plugin-visualizer@7.0.1_rollup@4.62.2/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
import path from "path";
var __vite_injected_original_dirname = "D:\\GitHub\\testTempleteOfflineNewKit\\apps\\web";
var vite_config_default = defineConfig({
  base: "/",
  plugins: [
    react(),
    visualizer({ filename: "dist/stats.html", open: false, gzipSize: true }),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/*.png", "robots.txt"],
      manifest: {
        name: "CoopERP",
        short_name: "CoopERP",
        description: "Enterprise cooperative ERP for Philippine cooperatives \u2014 offline-first",
        theme_color: "#16a34a",
        background_color: "#f0fdf4",
        display: "standalone",
        orientation: "any",
        start_url: "/",
        scope: "/",
        icons: [
          { src: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
          {
            src: "/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24
                // 24 hours
              },
              networkTimeoutSeconds: 10
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "src"),
      "@repo/core": path.resolve(__vite_injected_original_dirname, "../../packages/core/src"),
      "@repo/db-dexie": path.resolve(__vite_injected_original_dirname, "../../packages/db-adapter-dexie/src"),
      "@repo/ui-core": path.resolve(__vite_injected_original_dirname, "../../packages/ui-core/src"),
      "@repo/entity-customer": path.resolve(__vite_injected_original_dirname, "../../packages/entity-customer/src"),
      "@repo/entity-member": path.resolve(__vite_injected_original_dirname, "../../packages/entity-member/src"),
      "@repo/entity-share-capital": path.resolve(__vite_injected_original_dirname, "../../packages/entity-share-capital/src"),
      "@repo/entity-savings": path.resolve(__vite_injected_original_dirname, "../../packages/entity-savings/src"),
      "@repo/entity-loan": path.resolve(__vite_injected_original_dirname, "../../packages/entity-loan/src"),
      "@repo/entity-accounting": path.resolve(__vite_injected_original_dirname, "../../packages/entity-accounting/src"),
      "@repo/entity-collection": path.resolve(__vite_injected_original_dirname, "../../packages/entity-collection/src"),
      "@repo/entity-governance": path.resolve(__vite_injected_original_dirname, "../../packages/entity-governance/src"),
      "@repo/entity-water-station": path.resolve(__vite_injected_original_dirname, "../../packages/entity-water-station/src"),
      "@repo/multi-tenant": path.resolve(__vite_injected_original_dirname, "../../packages/multi-tenant/src"),
      "@repo/feature-flags": path.resolve(__vite_injected_original_dirname, "../../packages/feature-flags/src"),
      "@repo/audit-trail": path.resolve(__vite_injected_original_dirname, "../../packages/audit-trail/src"),
      "@repo/sync-engine": path.resolve(__vite_injected_original_dirname, "../../packages/sync-engine/src"),
      "@repo/observability": path.resolve(__vite_injected_original_dirname, "../../packages/observability/src")
    }
  },
  server: {
    port: 5173,
    strictPort: false
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react") || id.includes("node_modules/react-dom")) return "vendor-react";
          if (id.includes("node_modules/@tanstack")) return "vendor-tanstack";
          if (id.includes("node_modules/lucide-react")) return "vendor-icons";
          if (id.includes("node_modules/zustand")) return "vendor-state";
          if (id.includes("node_modules/react-hook-form") || id.includes("node_modules/@hookform")) return "vendor-forms";
          if (id.includes("node_modules/zod")) return "vendor-validation";
          if (id.includes("node_modules/dexie") || id.includes("node_modules/uuid")) return "vendor-db";
          if (id.includes("packages/entity-")) return `entity-${id.split("entity-")[1]?.split("/")[0]}`;
          if (id.includes("packages/core")) return "pkg-core";
          if (id.includes("packages/db-adapter")) return "pkg-db";
          if (id.includes("packages/ui-core")) return "pkg-ui";
          if (id.includes("packages/multi-tenant")) return "pkg-tenant";
          if (id.includes("packages/feature-flags")) return "pkg-flags";
          if (id.includes("packages/audit-trail")) return "pkg-audit";
          if (id.includes("routes/reports")) return "page-reports";
          if (id.includes("routes/loans") || id.includes("routes/loan-")) return "page-loans";
          if (id.includes("routes/members") || id.includes("routes/member")) return "page-members";
          if (id.includes("routes/accounting")) return "page-accounting";
          if (id.includes("routes/portal")) return "page-portals";
        }
      }
    }
  },
  test: {
    globals: true,
    environment: "jsdom"
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxHaXRIdWJcXFxcdGVzdFRlbXBsZXRlT2ZmbGluZU5ld0tpdFxcXFxhcHBzXFxcXHdlYlwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcR2l0SHViXFxcXHRlc3RUZW1wbGV0ZU9mZmxpbmVOZXdLaXRcXFxcYXBwc1xcXFx3ZWJcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L0dpdEh1Yi90ZXN0VGVtcGxldGVPZmZsaW5lTmV3S2l0L2FwcHMvd2ViL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcclxuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xyXG5pbXBvcnQgeyBWaXRlUFdBIH0gZnJvbSAndml0ZS1wbHVnaW4tcHdhJ1xyXG5pbXBvcnQgeyB2aXN1YWxpemVyIH0gZnJvbSAncm9sbHVwLXBsdWdpbi12aXN1YWxpemVyJ1xyXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICBiYXNlOiAnLycsXHJcbiAgcGx1Z2luczogW1xyXG4gICAgcmVhY3QoKSxcclxuICAgIHZpc3VhbGl6ZXIoeyBmaWxlbmFtZTogJ2Rpc3Qvc3RhdHMuaHRtbCcsIG9wZW46IGZhbHNlLCBnemlwU2l6ZTogdHJ1ZSB9KSxcclxuICAgIFZpdGVQV0Eoe1xyXG4gICAgICByZWdpc3RlclR5cGU6ICdhdXRvVXBkYXRlJyxcclxuICAgICAgaW5jbHVkZUFzc2V0czogWydpY29ucy8qLnBuZycsICdyb2JvdHMudHh0J10sXHJcbiAgICAgIG1hbmlmZXN0OiB7XHJcbiAgICAgICAgbmFtZTogJ0Nvb3BFUlAnLFxyXG4gICAgICAgIHNob3J0X25hbWU6ICdDb29wRVJQJyxcclxuICAgICAgICBkZXNjcmlwdGlvbjogJ0VudGVycHJpc2UgY29vcGVyYXRpdmUgRVJQIGZvciBQaGlsaXBwaW5lIGNvb3BlcmF0aXZlcyBcdTIwMTQgb2ZmbGluZS1maXJzdCcsXHJcbiAgICAgICAgdGhlbWVfY29sb3I6ICcjMTZhMzRhJyxcclxuICAgICAgICBiYWNrZ3JvdW5kX2NvbG9yOiAnI2YwZmRmNCcsXHJcbiAgICAgICAgZGlzcGxheTogJ3N0YW5kYWxvbmUnLFxyXG4gICAgICAgIG9yaWVudGF0aW9uOiAnYW55JyxcclxuICAgICAgICBzdGFydF91cmw6ICcvJyxcclxuICAgICAgICBzY29wZTogJy8nLFxyXG4gICAgICAgIGljb25zOiBbXHJcbiAgICAgICAgICB7IHNyYzogJy9pY29ucy9pY29uLTE5MngxOTIucG5nJywgc2l6ZXM6ICcxOTJ4MTkyJywgdHlwZTogJ2ltYWdlL3BuZycgfSxcclxuICAgICAgICAgIHsgc3JjOiAnL2ljb25zL2ljb24tNTEyeDUxMi5wbmcnLCBzaXplczogJzUxMng1MTInLCB0eXBlOiAnaW1hZ2UvcG5nJyB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBzcmM6ICcvaWNvbnMvaWNvbi01MTJ4NTEyLnBuZycsXHJcbiAgICAgICAgICAgIHNpemVzOiAnNTEyeDUxMicsXHJcbiAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnLFxyXG4gICAgICAgICAgICBwdXJwb3NlOiAnbWFza2FibGUnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICBdLFxyXG4gICAgICB9LFxyXG4gICAgICB3b3JrYm94OiB7XHJcbiAgICAgICAgZ2xvYlBhdHRlcm5zOiBbJyoqLyoue2pzLGNzcyxodG1sLGljbyxwbmcsc3ZnLHdvZmYyfSddLFxyXG4gICAgICAgIHJ1bnRpbWVDYWNoaW5nOiBbXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHVybFBhdHRlcm46IC9eaHR0cHM6XFwvXFwvYXBpXFwuKi9pLFxyXG4gICAgICAgICAgICBoYW5kbGVyOiAnTmV0d29ya0ZpcnN0JyxcclxuICAgICAgICAgICAgb3B0aW9uczoge1xyXG4gICAgICAgICAgICAgIGNhY2hlTmFtZTogJ2FwaS1jYWNoZScsXHJcbiAgICAgICAgICAgICAgZXhwaXJhdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgbWF4RW50cmllczogMTAwLFxyXG4gICAgICAgICAgICAgICAgbWF4QWdlU2Vjb25kczogNjAgKiA2MCAqIDI0LCAvLyAyNCBob3Vyc1xyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgbmV0d29ya1RpbWVvdXRTZWNvbmRzOiAxMCxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgXSxcclxuICAgICAgfSxcclxuICAgIH0pLFxyXG4gIF0sXHJcbiAgcmVzb2x2ZToge1xyXG4gICAgYWxpYXM6IHtcclxuICAgICAgJ0AnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnc3JjJyksXHJcbiAgICAgICdAcmVwby9jb3JlJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjJyksXHJcbiAgICAgICdAcmVwby9kYi1kZXhpZSc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9wYWNrYWdlcy9kYi1hZGFwdGVyLWRleGllL3NyYycpLFxyXG4gICAgICAnQHJlcG8vdWktY29yZSc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9wYWNrYWdlcy91aS1jb3JlL3NyYycpLFxyXG4gICAgICAnQHJlcG8vZW50aXR5LWN1c3RvbWVyJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL3BhY2thZ2VzL2VudGl0eS1jdXN0b21lci9zcmMnKSxcclxuICAgICAgJ0ByZXBvL2VudGl0eS1tZW1iZXInOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vcGFja2FnZXMvZW50aXR5LW1lbWJlci9zcmMnKSxcclxuICAgICAgJ0ByZXBvL2VudGl0eS1zaGFyZS1jYXBpdGFsJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL3BhY2thZ2VzL2VudGl0eS1zaGFyZS1jYXBpdGFsL3NyYycpLFxyXG4gICAgICAnQHJlcG8vZW50aXR5LXNhdmluZ3MnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vcGFja2FnZXMvZW50aXR5LXNhdmluZ3Mvc3JjJyksXHJcbiAgICAgICdAcmVwby9lbnRpdHktbG9hbic6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9wYWNrYWdlcy9lbnRpdHktbG9hbi9zcmMnKSxcclxuICAgICAgJ0ByZXBvL2VudGl0eS1hY2NvdW50aW5nJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL3BhY2thZ2VzL2VudGl0eS1hY2NvdW50aW5nL3NyYycpLFxyXG4gICAgICAnQHJlcG8vZW50aXR5LWNvbGxlY3Rpb24nOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vcGFja2FnZXMvZW50aXR5LWNvbGxlY3Rpb24vc3JjJyksXHJcbiAgICAgICdAcmVwby9lbnRpdHktZ292ZXJuYW5jZSc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9wYWNrYWdlcy9lbnRpdHktZ292ZXJuYW5jZS9zcmMnKSxcclxuICAgICAgJ0ByZXBvL2VudGl0eS13YXRlci1zdGF0aW9uJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL3BhY2thZ2VzL2VudGl0eS13YXRlci1zdGF0aW9uL3NyYycpLFxyXG4gICAgICAnQHJlcG8vbXVsdGktdGVuYW50JzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL3BhY2thZ2VzL211bHRpLXRlbmFudC9zcmMnKSxcclxuICAgICAgJ0ByZXBvL2ZlYXR1cmUtZmxhZ3MnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vcGFja2FnZXMvZmVhdHVyZS1mbGFncy9zcmMnKSxcclxuICAgICAgJ0ByZXBvL2F1ZGl0LXRyYWlsJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL3BhY2thZ2VzL2F1ZGl0LXRyYWlsL3NyYycpLFxyXG4gICAgICAnQHJlcG8vc3luYy1lbmdpbmUnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vcGFja2FnZXMvc3luYy1lbmdpbmUvc3JjJyksXHJcbiAgICAgICdAcmVwby9vYnNlcnZhYmlsaXR5JzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL3BhY2thZ2VzL29ic2VydmFiaWxpdHkvc3JjJyksXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgc2VydmVyOiB7XHJcbiAgICBwb3J0OiA1MTczLFxyXG4gICAgc3RyaWN0UG9ydDogZmFsc2UsXHJcbiAgfSxcclxuICBidWlsZDoge1xyXG4gICAgc291cmNlbWFwOiB0cnVlLFxyXG4gICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICBvdXRwdXQ6IHtcclxuICAgICAgICBtYW51YWxDaHVua3MoaWQ6IHN0cmluZykge1xyXG4gICAgICAgICAgLy8gVmVuZG9yOiBiaWcgZnJhbWV3b3Jrc1xyXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvcmVhY3QnKSB8fCBpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL3JlYWN0LWRvbScpKSByZXR1cm4gJ3ZlbmRvci1yZWFjdCdcclxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL0B0YW5zdGFjaycpKSByZXR1cm4gJ3ZlbmRvci10YW5zdGFjaydcclxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL2x1Y2lkZS1yZWFjdCcpKSByZXR1cm4gJ3ZlbmRvci1pY29ucydcclxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL3p1c3RhbmQnKSkgcmV0dXJuICd2ZW5kb3Itc3RhdGUnXHJcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9yZWFjdC1ob29rLWZvcm0nKSB8fCBpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL0Bob29rZm9ybScpKSByZXR1cm4gJ3ZlbmRvci1mb3JtcydcclxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL3pvZCcpKSByZXR1cm4gJ3ZlbmRvci12YWxpZGF0aW9uJ1xyXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvZGV4aWUnKSB8fCBpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL3V1aWQnKSkgcmV0dXJuICd2ZW5kb3ItZGInXHJcblxyXG4gICAgICAgICAgLy8gUGFja2FnZS1iYXNlZDogc3BsaXQgZW50aXR5IHBhY2thZ2VzXHJcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ3BhY2thZ2VzL2VudGl0eS0nKSkgcmV0dXJuIGBlbnRpdHktJHtpZC5zcGxpdCgnZW50aXR5LScpWzFdPy5zcGxpdCgnLycpWzBdfWBcclxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygncGFja2FnZXMvY29yZScpKSByZXR1cm4gJ3BrZy1jb3JlJ1xyXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdwYWNrYWdlcy9kYi1hZGFwdGVyJykpIHJldHVybiAncGtnLWRiJ1xyXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdwYWNrYWdlcy91aS1jb3JlJykpIHJldHVybiAncGtnLXVpJ1xyXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdwYWNrYWdlcy9tdWx0aS10ZW5hbnQnKSkgcmV0dXJuICdwa2ctdGVuYW50J1xyXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdwYWNrYWdlcy9mZWF0dXJlLWZsYWdzJykpIHJldHVybiAncGtnLWZsYWdzJ1xyXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdwYWNrYWdlcy9hdWRpdC10cmFpbCcpKSByZXR1cm4gJ3BrZy1hdWRpdCdcclxuXHJcbiAgICAgICAgICAvLyBSb3V0ZS1iYXNlZDogc3BsaXQgbGFyZ2UgcGFnZXNcclxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygncm91dGVzL3JlcG9ydHMnKSkgcmV0dXJuICdwYWdlLXJlcG9ydHMnXHJcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ3JvdXRlcy9sb2FucycpIHx8IGlkLmluY2x1ZGVzKCdyb3V0ZXMvbG9hbi0nKSkgcmV0dXJuICdwYWdlLWxvYW5zJ1xyXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdyb3V0ZXMvbWVtYmVycycpIHx8IGlkLmluY2x1ZGVzKCdyb3V0ZXMvbWVtYmVyJykpIHJldHVybiAncGFnZS1tZW1iZXJzJ1xyXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdyb3V0ZXMvYWNjb3VudGluZycpKSByZXR1cm4gJ3BhZ2UtYWNjb3VudGluZydcclxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygncm91dGVzL3BvcnRhbCcpKSByZXR1cm4gJ3BhZ2UtcG9ydGFscydcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICB9LFxyXG4gIHRlc3Q6IHtcclxuICAgIGdsb2JhbHM6IHRydWUsXHJcbiAgICBlbnZpcm9ubWVudDogJ2pzZG9tJyxcclxuICB9LFxyXG59KVxyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQWdVLFNBQVMsb0JBQW9CO0FBQzdWLE9BQU8sV0FBVztBQUNsQixTQUFTLGVBQWU7QUFDeEIsU0FBUyxrQkFBa0I7QUFDM0IsT0FBTyxVQUFVO0FBSmpCLElBQU0sbUNBQW1DO0FBTXpDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLE1BQU07QUFBQSxFQUNOLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLFdBQVcsRUFBRSxVQUFVLG1CQUFtQixNQUFNLE9BQU8sVUFBVSxLQUFLLENBQUM7QUFBQSxJQUN2RSxRQUFRO0FBQUEsTUFDTixjQUFjO0FBQUEsTUFDZCxlQUFlLENBQUMsZUFBZSxZQUFZO0FB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
