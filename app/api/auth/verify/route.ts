import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    // Get token from HttpOnly cookie
    const token = req.cookies.get('admin_token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // ✅ Token exists, user is authenticated
    return NextResponse.json({
      authenticated: true,
      message: 'Token is valid',
    })
  } catch (error) {
    console.error('[Auth] Verify route error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
