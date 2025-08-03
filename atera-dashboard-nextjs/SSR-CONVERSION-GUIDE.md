# SSR Conversion Guide for Atera Dashboard

This guide documents how to convert the Atera Dashboard from static export to Server-Side Rendering (SSR).

## Static Export vs SSR Comparison

### Current Setup (Static Export)
- **Configuration**: `output: 'export'` in next.config.ts
- **Build Output**: Static HTML/CSS/JS files in `/out` directory
- **Hosting**: Can use any static file host (GitHub Pages, S3, CDN)
- **Runtime**: No server needed, files served directly
- **Headers**: Cannot set HTTP security headers
- **API Keys**: Must be client-side (less secure)

### SSR Setup
- **Configuration**: No `output: 'export'` (default Next.js behavior)
- **Build Output**: `.next` directory with server and client builds
- **Hosting**: Requires Node.js server (Vercel, Railway, Docker, etc.)
- **Runtime**: Next.js server processes each request
- **Headers**: Full control over HTTP headers
- **API Keys**: Can be server-side only (more secure)

## Conversion Steps

### 1. Remove Static Export Configuration

Edit `next.config.ts`:
```typescript
const nextConfig: NextConfig = {
  // Remove this line:
  // output: 'export',
  
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Headers will work with SSR:
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://app.atera.com; font-src 'self' data:; frame-ancestors 'none';",
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};
```

### 2. Update Package Scripts

Edit `package.json`:
```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    // Remove or rename export:
    // "export": "next build",
    "lint": "next lint",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "type-check": "tsc --noEmit"
  }
}
```

### 3. Update GitHub Actions Workflow

Update `.github/workflows/ci-cd.yml`:
```yaml
# Remove export step:
# - name: Export static files
#   working-directory: ./atera-dashboard-nextjs  
#   run: npm run export

# Update deployment for Node.js hosting:
deploy:
  needs: [test, security]
  runs-on: ubuntu-latest
  if: github.ref == 'refs/heads/main' && github.event_name == 'push'
  
  steps:
  - uses: actions/checkout@v4
  
  - name: Setup Node.js
    uses: actions/setup-node@v4
    with:
      node-version: '20.x'
  
  - name: Install dependencies
    working-directory: ./atera-dashboard-nextjs
    run: npm ci
  
  - name: Build for production
    working-directory: ./atera-dashboard-nextjs
    run: npm run build
  
  # Platform-specific deployment examples:
  
  # For Vercel:
  # - name: Deploy to Vercel
  #   uses: vercel/action@v20
  #   with:
  #     vercel-token: ${{ secrets.VERCEL_TOKEN }}
  
  # For Railway:
  # - name: Deploy to Railway
  #   uses: railwayapp/deploy-action@v1
  #   with:
  #     railway_token: ${{ secrets.RAILWAY_TOKEN }}
```

### 4. Environment Variables Setup

Create `.env.local` for development:
```bash
# Move sensitive data to server-side
ATERA_API_ENDPOINT=https://app.atera.com/api/v3
# API key would be server-side only:
# ATERA_API_KEY=your-key-here
```

### 5. (Optional) Create Server-Side API Routes

Create `app/api/devices/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';

// Server-side API route - API key never exposed to client
export async function GET(request: NextRequest) {
  const apiKey = process.env.ATERA_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }
  
  try {
    const response = await fetch('https://app.atera.com/api/v3/devices', {
      headers: {
        'X-Api-Key': apiKey,
        'Accept': 'application/json',
      },
    });
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch devices' }, { status: 500 });
  }
}
```

Update client to use API route instead of direct Atera API calls:
```typescript
// Before (client-side):
const response = await fetch('https://app.atera.com/api/v3/devices', {
  headers: { 'X-Api-Key': clientSideApiKey }
});

// After (server-side):
const response = await fetch('/api/devices');
```

## Deployment Options for SSR

### 1. Vercel (Recommended)
- **Pros**: Made by Next.js team, zero-config deployment
- **Setup**: Connect GitHub repo, auto-deploys on push
- **Pricing**: Free tier available
```bash
npm i -g vercel
vercel
```

### 2. Railway
- **Pros**: Simple, good for small projects
- **Setup**: Connect GitHub, auto-deploys
- **Pricing**: $5/month starting

### 3. Netlify (with Functions)
- **Pros**: Familiar if already using for static sites
- **Setup**: Requires `@netlify/plugin-nextjs`
- **Note**: More complex than Vercel for Next.js

### 4. Docker (Self-hosted or Cloud)
Create `Dockerfile`:
```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### 5. AWS/Google Cloud/Azure
- Use managed container services (ECS, Cloud Run, App Service)
- Or traditional VM with PM2

## Benefits of SSR

1. **Security Headers Work**: All headers in next.config.ts are applied
2. **API Key Security**: Keep Atera API key server-side only
3. **Better Performance**: Can implement caching, compression
4. **Full Next.js Features**: Middleware, API routes, ISR
5. **Dynamic Content**: Real-time data without client-side fetching

## Trade-offs

### Static Export
- ✅ Simpler hosting
- ✅ Better CDN performance
- ✅ Lower hosting costs
- ❌ No server features
- ❌ Client-side API keys

### SSR
- ✅ Full security features
- ✅ Server-side API keys
- ✅ Dynamic capabilities
- ❌ Requires Node.js hosting
- ❌ Higher hosting complexity/cost

## Testing SSR Locally

```bash
# Development (already SSR):
npm run dev

# Production build and test:
npm run build
npm start

# Visit http://localhost:3000
# Check headers in browser DevTools Network tab
```

## Migration Checklist

- [ ] Remove `output: 'export'` from next.config.ts
- [ ] Add security headers back to next.config.ts
- [ ] Update package.json scripts
- [ ] Update GitHub Actions workflow
- [ ] Choose hosting platform
- [ ] Set up environment variables
- [ ] (Optional) Move API calls to server-side
- [ ] Test build and deployment
- [ ] Verify security headers are working
- [ ] Update documentation

## Notes

- You can always convert back to static export if needed
- Start with minimal changes (just remove `output: 'export'`)
- Add server-side features gradually
- Keep SECURITY-HEADERS.md as reference for static hosting