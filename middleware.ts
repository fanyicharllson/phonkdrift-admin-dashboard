import { NextRequest, NextResponse } from 'next/server'

// Protected routes that require authentication
const protectedRoutes = ['/dashboard', '/api/admin']

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  // Check if route requires protection
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  )

  if (isProtectedRoute) {
    // Get token from HttpOnly cookie
    const token = req.cookies.get('admin_token')?.value

    // If no token, redirect to login
    if (!token) {
      console.log(`[Middleware] Access denied - no token for: ${pathname}`)
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Optional: Verify token format (basic check)
    if (typeof token !== 'string' || token.length === 0) {
      console.log(`[Middleware] Invalid token format for: ${pathname}`)
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // ✅ Token exists and valid format, allow request
    // The token will be automatically included in API calls via cookies
    return NextResponse.next()
  }

  // Allow unprotected routes
  return NextResponse.next()
}

// Apply middleware to specific routes
export const config = {
  matcher: [
    // Protect dashboard routes
    '/dashboard/:path*',
    // Protect API admin routes
    '/api/admin/:path*',
  ],
}
