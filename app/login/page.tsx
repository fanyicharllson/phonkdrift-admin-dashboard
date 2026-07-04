'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Call the secure login API route
      // This will set HttpOnly cookies automatically
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // ✅ Include cookies in request
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Login failed. Please try again.')
        return
      }

      // ✅ Login successful, cookies are set automatically
      // Use a full navigation so the auth provider re-runs with the new cookie
      window.location.assign('/dashboard')
    } catch (err) {
      console.error('[Login] Error:', err)
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-bg-deep via-bg-deep to-bg-elevated flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-text-primary mb-2">PhonkDrift</h1>
          <p className="text-text-secondary text-sm">Admin Dashboard</p>
        </div>

        {/* Login Card */}
        <div className="bg-bg-card border border-border-subtle rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-text-primary mb-6">Admin Login</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-error rounded-md">
              <p className="text-error text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@phonkdrift.com"
                className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-md text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-phonk-red"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-md text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-phonk-red"
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full bg-phonk-red hover:bg-phonk-red-dark text-text-primary font-medium py-2 rounded-md transition-colors"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <p className="text-center text-text-muted text-xs mt-4">
            Only authorized admin accounts can access this dashboard
          </p>
        </div>
      </div>
    </div>
  )
}
