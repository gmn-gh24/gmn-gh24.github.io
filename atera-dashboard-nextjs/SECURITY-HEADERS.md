# Security Headers Configuration

This document contains the security headers that should be configured at the hosting platform level for the Atera Dashboard application.

## Required Security Headers

The following headers were previously configured in `next.config.ts` but have been moved here since they're incompatible with static export (`output: 'export'`).

### 1. Content-Security-Policy (CSP)
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://app.atera.com; font-src 'self' data:; frame-ancestors 'none';
```

**Purpose**: Prevents XSS attacks by controlling which resources can be loaded.

**Note**: `'unsafe-inline'` and `'unsafe-eval'` are included for Next.js compatibility but should be removed if possible for better security.

### 2. X-Frame-Options
```
X-Frame-Options: DENY
```

**Purpose**: Prevents clickjacking attacks by disallowing the page from being embedded in iframes.

### 3. X-Content-Type-Options
```
X-Content-Type-Options: nosniff
```

**Purpose**: Prevents MIME type sniffing attacks.

### 4. Referrer-Policy
```
Referrer-Policy: strict-origin-when-cross-origin
```

**Purpose**: Controls how much referrer information is sent with requests.

### 5. X-XSS-Protection (Legacy)
```
X-XSS-Protection: 1; mode=block
```

**Purpose**: Legacy XSS protection for older browsers (modern browsers use CSP instead).

### 6. Permissions-Policy
```
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

**Purpose**: Disables access to sensitive browser features.

## Platform-Specific Implementation

### Vercel
Add a `vercel.json` file to your project root:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://app.atera.com; font-src 'self' data:; frame-ancestors 'none';"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    }
  ]
}
```

### Netlify
Add a `_headers` file to your `public` directory:
```
/*
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://app.atera.com; font-src 'self' data:; frame-ancestors 'none';
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-XSS-Protection: 1; mode=block
  Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### Cloudflare Pages
Add a `_headers` file to your output directory:
```
/*
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://app.atera.com; font-src 'self' data:; frame-ancestors 'none';
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-XSS-Protection: 1; mode=block
  Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### AWS S3 + CloudFront
Configure headers in CloudFront distribution settings or use Lambda@Edge to add headers.

### Docker/Nginx
If self-hosting with Nginx, add to your server configuration:
```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://app.atera.com; font-src 'self' data:; frame-ancestors 'none';" always;
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
```

## Testing Headers

After deployment, verify headers are properly set using:
- Browser Developer Tools (Network tab)
- Online tools like https://securityheaders.com
- Command line: `curl -I https://your-domain.com`

## Notes

- These headers were removed from `next.config.ts` because they're incompatible with `output: 'export'`
- If you switch to server-side rendering (removing `output: 'export'`), you can move these headers back to `next.config.ts`
- Always test your CSP policy thoroughly as it can break functionality if too restrictive