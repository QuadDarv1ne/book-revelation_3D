# Deployment Guide

## Configuration Files

All deployment configurations are in the project root:

| Platform | File | Status |
|----------|------|--------|
| Netlify | `netlify.toml` | ✅ Configured |
| Vercel | `vercel.json` | ✅ Configured |
| Cloudflare Pages | `.github/workflows/cloudflare.yml` + `wrangler.toml` | ✅ Configured |
| Railway | `railway.json` | ✅ Configured |
| Render | `render.yaml` | ✅ Configured |
| GitHub Pages | `.github/workflows/pages.yml` | ✅ Configured |
| Docker | `Dockerfile` + `docker-compose.yml` | ✅ Configured |

## Quick Deploy

### Netlify
```bash
# Connect your repo to Netlify
# Netlify will auto-detect Next.js
npm run build
```

### Vercel
```bash
# Install Vercel CLI
npm i -g vercel
# Deploy
vercel
```

### Cloudflare Pages
```bash
# Requires Cloudflare API tokens in GitHub Secrets
# CLOUDFLARE_API_TOKEN
# CLOUDFLARE_ACCOUNT_ID
# Auto-deploys on push to main
```

### Railway
```bash
# Install Railway CLI
npm i -g @railway/cli
# Deploy
railway up
```

### Render
```bash
# Connect repo in Render dashboard
# Auto-deploys on push to main
```

### GitHub Pages
```bash
# Enable GitHub Pages in repo settings
# Auto-deploys on push to main via workflow
```

### Docker
```bash
# Build and run locally
docker-compose up --build

# Or manually
docker build -t stoic-book-3d .
docker run -p 3000:3000 stoic-book-3d
```

## Environment Variables

Required environment variables for deployment:

- `NODE_VERSION=20`
- `NODE_ENV=production`

Optional (for features):

- `NEXT_PUBLIC_*` - Public environment variables

## Build Output

This project uses **Static Export** mode:
- Build command: `npm run build`
- Output directory: `out/`
- Static HTML, CSS, and JavaScript files
