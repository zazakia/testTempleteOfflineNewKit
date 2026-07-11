# 🚀 CoopERP — Deployment Guide

> Deploy the Cooperative ERP system to Netlify, Cloudflare Pages, or Vercel.

## Prerequisites

- Node.js 20+
- pnpm 9+
- A Netlify/Cloudflare/Vercel account
- Git repository connected to your deployment platform

---

## Option 1: Netlify (Recommended)

### One-Click Deploy (from GitHub)

1. Push code to GitHub
2. In Netlify Dashboard → "Add new site" → "Import from Git"
3. Select your repository
4. Configure:

| Setting | Value |
|---|---|
| **Build command** | `pnpm install --frozen-lockfile && cd apps/web && npx vite build` |
| **Publish directory** | `apps/web/dist` |
| **Node version** | 20 |

5. Deploy!

### CLI Deploy

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build
cd apps/web && npx vite build

# Deploy (dry run first)
npx netlify deploy --dir=dist

# Deploy to production
npx netlify deploy --prod --dir=dist
```

### Configuration

A `netlify.toml` at the repo root handles:
- ✅ SPA routing (`/*` → `/index.html`)
- ✅ PWA service worker caching
- ✅ Asset caching (immutable, 1 year)
- ✅ pnpm support

---

## Option 2: Cloudflare Pages

### Dashboard Setup

1. Go to Cloudflare Dashboard → Pages → Create a project
2. Connect your Git repository
3. Configure:

| Setting | Value |
|---|---|
| **Build command** | `pnpm install --frozen-lockfile && cd apps/web && npx vite build` |
| **Build output** | `apps/web/dist` |
| **Root directory** | (leave blank — monorepo) |

4. Add environment variable: `NODE_VERSION=20`
5. Deploy!

### CLI Deploy

```bash
# Install Wrangler
npm install -g wrangler

# Build
cd apps/web && npx vite build

# Deploy
npx wrangler pages deploy dist
```

### SPA Routing

Create `apps/web/public/_redirects` with:
```
/*    /index.html    200
```

---

## Option 3: Vercel

### One-Click Deploy

1. Push to GitHub
2. Import repo in Vercel Dashboard
3. Configure:

| Setting | Value |
|---|---|
| **Framework preset** | Vite |
| **Build command** | `cd apps/web && npx vite build` |
| **Output directory** | `apps/web/dist` |
| **Install command** | `pnpm install --frozen-lockfile` |

4. Deploy!

### vercel.json (already configured)

The root `vercel.json` handles:
- ✅ SPA rewrites
- ✅ Asset caching headers
- ✅ PWA service worker handling

---

## Option 4: Docker / Self-Hosted

For cooperatives that want private hosting:

```dockerfile
# Dockerfile at repo root
FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web/ apps/web/
COPY packages/ packages/
RUN pnpm install --frozen-lockfile
RUN cd apps/web && npx vite build

FROM nginx:alpine
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Create `apps/web/nginx.conf`:

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location /assets {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NODE_VERSION` | Yes | Set to `20` |
| `PNPM_VERSION` | Yes | Set to `9` |

No application secrets are needed for the web app (it uses local IndexedDB for storage).

---

## Post-Deployment Checklist

- [ ] Visit `https://your-site.com/` — should show CoopERP dashboard
- [ ] Visit `https://your-site.com/login` — should show login page
- [ ] Check PWA install prompt appears (mobile/desktop)
- [ ] Service worker registered (check DevTools → Application → Service Workers)
- [ ] All routes return 200 (not 404)
- [ ] Manifest loads correctly (DevTools → Application → Manifest)

---

## Troubleshooting

### Blank page after deploy

Check the browser console. Common issues:
- SPA routing not configured (add `_redirects` or `vercel.json` rewrites)
- Assets returning 404 (check publish directory path)

### PWA not working

- Ensure `public/manifest.json` exists
- Check that `vite-plugin-pwa` is configured in `vite.config.ts`
- Service worker must be in the root of the published directory

### pnpm not found

Set `NODE_VERSION=20` in environment variables and add `PNPM_VERSION=9`.
