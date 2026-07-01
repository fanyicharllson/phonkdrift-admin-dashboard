import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase Auth client
const supabase = createClient(
  process.env.NEXT_PUBLIC_AUTH_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_AUTH_SUPABASE_ANON_KEY || ''
)

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Verify admin email matches configured admin email
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL
    if (email !== adminEmail) {
      // Log failed attempt (don't reveal if email exists)
      console.error(`[Auth] Unauthorized login attempt from: ${email}`)
      return NextResponse.json(
        { error: 'Access denied - invalid credentials' },
        { status: 403 }
      )
    }

    // Authenticate with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error(`[Auth] Login failed for ${email}:`, error.message)
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    if (!data.session) {
      return NextResponse.json(
        { error: 'No session created' },
        { status: 401 }
      )
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    })

    // Set HttpOnly, Secure cookie with JWT token
    // This cookie is automatically sent by the browser on all subsequent requests
    response.cookies.set({
      name: 'admin_token',
      value: data.session.access_token,
      httpOnly: true, // ✅ JS cannot access this via document.cookie
      secure: process.env.NODE_ENV === 'production', // ✅ Only sent over HTTPS in production
      sameSite: 'strict', // ✅ Prevents CSRF attacks
      maxAge: 60 * 60 * 24, // ✅ 24 hours
      path: '/', // ✅ Available to all routes
    })

    // Also set a refresh token cookie if available
    if (data.session.refresh_token) {
      response.cookies.set({
        name: 'refresh_token',
        value: data.session.refresh_token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // ✅ 7 days
        path: '/',
      })
    }

    console.log(`[Auth] Successful login for: ${email}`)
    return response
  } catch (error) {
    console.error('[Auth] Login route error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
