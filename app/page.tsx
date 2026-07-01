'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

export default function Page() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/dashboard')
      } else {
        router.push('/login')
      }
    }
  }, [isAuthenticated, isLoading, router])

  return (
    <div className="min-h-screen bg-bg-deep flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-border-subtle border-t-phonk-red rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-text-secondary">Redirecting...</p>
      </div>
    </div>
  )
}
