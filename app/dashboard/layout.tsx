'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Sidebar } from '@/components/sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { adminToken, isLoading } = useAuth()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !adminToken) {
      router.push('/login')
    }
  }, [adminToken, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-deep flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-border-subtle border-t-phonk-red rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    )
  }

  if (!adminToken) {
    return null
  }

  return (
    <div className="min-h-screen bg-bg-deep">
      <Sidebar />
      <main className="md:ml-64">
        {children}
      </main>
    </div>
  )
}
