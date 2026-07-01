'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Check if user is authenticated on mount
  // Since we're using HttpOnly cookies, we can't directly read the token
  // Instead, we assume the middleware and API routes protect auth
  // The presence of the cookie is verified server-side
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Make a simple API call to verify the token exists
        // If middleware blocks it, we're not authenticated
        const res = await fetch('/api/auth/verify', {
          credentials: 'include', // ✅ Include HttpOnly cookies
        })

        if (res.ok) {
          setIsAuthenticated(true)
        } else {
          setIsAuthenticated(false)
        }
      } catch (error) {
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include', // ✅ Include HttpOnly cookies
      })
      setIsAuthenticated(false)
    } catch (error) {
      console.error('[Auth] Logout error:', error)
    }
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
