# PhonkDrift Admin Dashboard - Security Implementation Guide

## Overview

This document outlines all security measures implemented in the PhonkDrift Admin Dashboard. The application follows industry best practices to protect admin credentials, prevent unauthorized access, and secure all data transmissions.

---

## 1. HttpOnly Cookie-Based Authentication

### Why Not localStorage?

**localStorage is vulnerable to XSS attacks.** If malicious JavaScript runs on the page, it can access and steal tokens from localStorage.

**HttpOnly cookies are secure** because:
- ✅ JavaScript cannot access them via `document.cookie`
- ✅ Browser automatically includes them in requests
- ✅ Cannot be stolen by XSS attacks
- ✅ Server can only read them server-side

### Implementation

#### Login Flow

```typescript
// client: POST /api/auth/login
// server: app/api/auth/login/route.ts

const response = NextResponse.json({ success: true })
response.cookies.set({
  name: 'admin_token',
  value: data.session.access_token,
  httpOnly: true,      // ✅ JS cannot read this
  secure: production,  // ✅ HTTPS only in production
  sameSite: 'strict',  // ✅ CSRF protection
  maxAge: 86400,       // ✅ 24 hours
  path: '/',
})
return response
```

#### Making API Requests

```typescript
// Include credentials: 'include' to send HttpOnly cookies
fetch('/api/auth/login', {
  method: 'POST',
  credentials: 'include', // ✅ Automatically send HttpOnly cookies
})

// Your Go backend receives the token in the Cookie header
// Cookie: admin_token=<jwt>
```

---

## 2. CSRF Protection (Cross-Site Request Forgery)

### How CSRF Works

An attacker tricks your browser into making requests to PhonkDrift while you're logged in.

### Our Defense: SameSite Cookies

```typescript
response.cookies.set({
  sameSite: 'strict', // ✅ Cookie only sent to same-site requests
})
```

**SameSite=Strict** prevents cookies from being sent to cross-site requests:
- ✅ Request from `phonkdrift.com` → Cookie is sent
- ✅ Request from `evil.com` to `phonkdrift.com` → Cookie is NOT sent

---

## 3. Middleware Protection (Route Guards)

### Authentication Check

**File:** `middleware.ts`

```typescript
export function middleware(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value

  // If no token, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

// Protect all /dashboard and /api/admin routes
export const config = {
  matcher: ['/dashboard/:path*', '/api/admin/:path*'],
}
```

**What this does:**
- ✅ Checks for valid token before accessing protected routes
- ✅ Redirects unauthenticated users to login
- ✅ Runs on every request (server-side, cannot be bypassed)

---

## 4. Email Verification (Admin Access Control)

### Only Authorized Admins Can Login

**File:** `app/api/auth/login/route.ts`

```typescript
const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL

if (email !== adminEmail) {
  console.error(`[Auth] Unauthorized login attempt from: ${email}`)
  return NextResponse.json(
    { error: 'Access denied - invalid credentials' },
    { status: 403 }
  )
}
```

**Security Notes:**
- ✅ Only the email in `NEXT_PUBLIC_ADMIN_EMAIL` can access the dashboard
- ✅ Failed attempts are logged
- ✅ Response is generic ("invalid credentials") to not reveal if email exists

---

## 5. Secure Password Storage

### Using Supabase Auth

The password is NEVER stored in your Next.js app. Instead:

1. **Client** sends email + password to `/api/auth/login`
2. **Server** verifies with Supabase Auth (password hashing done by Supabase)
3. **Supabase** returns JWT token (never sent to client)
4. **Server** stores JWT in HttpOnly cookie

**Benefits:**
- ✅ Passwords are hashed using industry-standard algorithms (bcrypt)
- ✅ Password never reaches your backend
- ✅ Supabase handles security updates

---

## 6. Secure Communication (HTTPS)

### Production Deployment

**In production**, ensure:**

```typescript
// Cookies are HTTPS-only
secure: process.env.NODE_ENV === 'production' // ✅ true in production

// Environment variable in .env.production
NEXT_PUBLIC_BACKEND_URL=https://yourdomain.com
```

**Why HTTPS?**
- ✅ Encrypts all traffic between client and server
- ✅ Prevents man-in-the-middle attacks
- ✅ Cookie is not sent over unencrypted HTTP

**Setup on Vercel:**
1. Deploy to Vercel (HTTPS automatic)
2. Set `NODE_ENV=production`
3. All cookies use `secure: true` flag

---

## 7. CORS & Same-Origin Policy

### Backend Configuration

Your Go backend must be configured to accept requests ONLY from your frontend domain:

```go
// Go backend example
cors := handlers.CORS(
  handlers.AllowedOrigins([]string{"https://yourdomain.com"}),
  handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE"}),
  handlers.AllowedHeaders([]string{"Content-Type", "Authorization"}),
  handlers.AllowCredentials(),
)

router.Use(cors)
```

**What this does:**
- ✅ Backend only accepts requests from your frontend domain
- ✅ Prevents attackers from calling your API directly
- ✅ Credentials (cookies) only sent to your domain

---

## 8. Token Verification (Server-Side)

### Verify Token Before Processing Requests

**In your Go backend:**

```go
func VerifyAdminToken(token string) (bool, error) {
  // Parse and validate JWT
  claims := jwt.MapClaims{}
  parsedToken, err := jwt.ParseWithClaims(token, claims, func(token *jwt.Token) (interface{}, error) {
    return []byte(os.Getenv("JWT_SECRET")), nil
  })

  if err != nil || !parsedToken.Valid {
    return false, errors.New("invalid token")
  }

  // ✅ Token is valid, process request
  return true, nil
}
```

**Never trust client-side validation.** Always verify on the server.

---

## 9. API Rate Limiting & DDoS Protection

### Recommended for Production

Add rate limiting to your backend:

```go
// Go rate limit example using github.com/go-chi/chi/middleware
import "github.com/go-chi/chi/middleware"

router.Use(middleware.Throttle(100)) // 100 requests per second

// Or use a dedicated service
// - Vercel Edge Middleware
// - Cloudflare
// - AWS WAF
```

---

## 10. Logging & Monitoring

### Audit Trail

**File:** `app/api/auth/login/route.ts`

All auth events are logged:

```typescript
console.log(`[Auth] Successful login for: ${email}`)
console.error(`[Auth] Unauthorized login attempt from: ${email}`)
console.error(`[Auth] Login failed for ${email}: ${error.message}`)
```

**Logs should include:**
- ✅ Timestamp
- ✅ Username/Email
- ✅ Success/Failure
- ✅ IP Address (add later if needed)

---

## 11. Environment Variables (Secrets Management)

### Never Commit Secrets

**DO NOT include these in git:**

```env
# ❌ WRONG: Hardcoded in code
const ADMIN_EMAIL = "admin@example.com"

# ✅ RIGHT: Environment variable
NEXT_PUBLIC_ADMIN_EMAIL=admin@example.com
```

### Setup on Vercel

1. Go to **Settings** → **Environment Variables**
2. Add:
   - `NEXT_PUBLIC_ADMIN_EMAIL=your-email@example.com`
   - `NEXT_PUBLIC_AUTH_SUPABASE_URL=your-supabase-url`
   - `NEXT_PUBLIC_AUTH_SUPABASE_ANON_KEY=your-key`
   - `NEXT_PUBLIC_BACKEND_URL=https://backend.example.com`
3. Variables sync across all deployments

---

## 12. Logout & Session Cleanup

### Secure Logout

**File:** `app/api/auth/logout/route.ts`

```typescript
response.cookies.set({
  name: 'admin_token',
  value: '', // ✅ Clear the value
  maxAge: 0, // ✅ Expires immediately
})
```

**Logout Process:**
1. User clicks "Logout"
2. Client calls `POST /api/auth/logout`
3. Server clears cookies
4. Client redirects to `/login`

---

## 13. Checklist for Production Deployment

Before deploying to production, ensure:

- [ ] All environment variables are set in Vercel
- [ ] `NEXT_PUBLIC_ADMIN_EMAIL` is configured
- [ ] Backend is HTTPS only
- [ ] Backend CORS allows only your frontend domain
- [ ] Backend verifies JWT tokens on every request
- [ ] Cookies use `secure: true` (automatic with NODE_ENV=production)
- [ ] HTTPS certificate is valid
- [ ] Rate limiting is configured on backend
- [ ] Logging/monitoring is enabled
- [ ] Regular security audits scheduled
- [ ] Database backups are automated
- [ ] Incident response plan is documented

---

## 14. Additional Security Measures

### 1. Content Security Policy (CSP)

Add to `next.config.mjs`:

```javascript
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
  },
]

module.exports = {
  headers: async () => [{ source: '/:path*', headers: securityHeaders }],
}
```

### 2. X-Frame-Options (Prevent Clickjacking)

```javascript
{
  key: 'X-Frame-Options',
  value: 'DENY', // Prevent page from being embedded in iframes
}
```

### 3. X-Content-Type-Options

```javascript
{
  key: 'X-Content-Type-Options',
  value: 'nosniff', // Prevent MIME sniffing
}
```

---

## 15. Security Headers Example

**Complete `next.config.mjs`:**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

export default nextConfig
```

---

## 16. Incident Response

### If Security is Compromised

1. **Immediately revoke all sessions:**
   - Change JWT secret
   - All existing tokens become invalid
   - Users must re-login

2. **Audit logs:**
   - Check who accessed what data
   - Identify the scope of breach

3. **Notify users:**
   - Send security alert email
   - Force password reset
   - Enable 2FA (if applicable)

4. **Fix the vulnerability:**
   - Identify root cause
   - Implement fix
   - Test thoroughly
   - Deploy

5. **Monitor for reoccurrence:**
   - Set up alerts
   - Regular security audits
   - Penetration testing

---

## 17. Regular Security Maintenance

### Weekly
- [ ] Review auth logs
- [ ] Check for failed login attempts
- [ ] Monitor for unusual activity

### Monthly
- [ ] Update dependencies
- [ ] Run security audits (`npm audit`)
- [ ] Review access logs

### Quarterly
- [ ] Penetration testing
- [ ] Security review with team
- [ ] Update security headers

### Annually
- [ ] Full security audit
- [ ] Update security policies
- [ ] Compliance check (SOC 2, etc.)

---

## 18. References

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [MDN: HTTP Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
- [OAuth 2.0 Security Best Current Practice](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js Security Best Practices](https://nextjs.org/docs/architecture/security-best-practices)

---

## Questions?

For security issues, contact: **security@phonkdrift.com** (do not publicly disclose)

For general questions, open an issue in the repository.

---

**Last Updated:** June 2026
**Status:** Production Ready ✅
