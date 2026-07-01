'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { LogOut, User } from 'lucide-react'

interface HeaderProps {
  title?: string
  subtitle?: string
}

export function Header({ title = 'Dashboard', subtitle }: HeaderProps) {
  const router = useRouter()
  const { logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <header className="h-20 border-b border-border-subtle bg-bg-card flex items-center justify-between px-6 md:ml-64">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
        {subtitle && <p className="text-sm text-text-secondary mt-1">{subtitle}</p>}
      </div>

      {/* Admin menu */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-2 bg-bg-surface rounded-lg">
          <div className="w-8 h-8 bg-phonk-red rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-medium text-text-primary">Admin</span>
        </div>
        <Button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 bg-bg-surface hover:bg-phonk-red text-text-primary hover:text-text-primary rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm">Logout</span>
        </Button>
      </div>
    </header>
  )
}
