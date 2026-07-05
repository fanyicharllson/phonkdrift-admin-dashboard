'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Header } from '@/components/header'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { authDB } from '@/lib/supabase/clients'
import { User } from '@/lib/types'
import { banUser, unbanUser } from '@/lib/api'
import { Ban, RotateCcw } from 'lucide-react'

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [pendingAction, setPendingAction] = useState<{ user: User; type: 'ban' | 'unban' } | null>(null)
  const [banReason, setBanReason] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const { data, error } = await authDB
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Failed to fetch users:', error)
      toast.error('Failed to load users. Please refresh the page.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmAction = async () => {
    if (!pendingAction) return
    const { user, type } = pendingAction

    setActionLoading(user.id)
    try {
      if (type === 'ban') {
        await banUser(user.id, banReason.trim() || undefined)
        toast.success(`${user.username} has been banned`)
      } else {
        await unbanUser(user.id)
        toast.success(`${user.username} has been unbanned`)
      }
      await fetchUsers()
      setPendingAction(null)
      setBanReason('')
    } catch (error) {
      console.error(`Failed to ${type} user:`, error)
      toast.error(`Failed to ${type} ${user.username}. Please try again.`)
    } finally {
      setActionLoading(null)
    }
  }

  const closeActionDialog = () => {
    setPendingAction(null)
    setBanReason('')
  }

  return (
    <div>
      <Header title="Users" subtitle="Manage platform users and permissions" />

      <div className="p-6">
        {/* Users table */}
        <div className="bg-bg-card border border-border-subtle rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 border-4 border-border-subtle border-t-phonk-red rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-text-secondary">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-text-muted">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-bg-surface border-b border-border-subtle">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-text-primary">Avatar</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-text-primary">Username</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-text-primary">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-text-primary">Level</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-text-primary">Verified</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-text-primary">Status</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-text-primary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-border-subtle hover:bg-bg-surface transition-colors">
                      <td className="px-6 py-4">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.username}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-phonk-red flex items-center justify-center text-text-primary font-bold">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-text-primary">{user.username}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-text-secondary text-sm">{user.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-text-secondary text-sm">{user.phonk_level}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.is_verified
                            ? 'bg-success/20 text-success'
                            : 'bg-warning/20 text-warning'
                        }`}>
                          {user.is_verified ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.is_banned
                            ? 'bg-error/20 text-error'
                            : 'bg-success/20 text-success'
                        }`}>
                          {user.is_banned ? 'Banned' : 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 justify-center">
                          {user.is_banned ? (
                            <button
                              onClick={() => setPendingAction({ user, type: 'unban' })}
                              disabled={actionLoading === user.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-success/20 hover:scale-105 rounded-md transition-all cursor-pointer text-success text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                              title="Unban User"
                            >
                              <RotateCcw className="w-4 h-4" />
                              Unban
                            </button>
                          ) : (
                            <button
                              onClick={() => setPendingAction({ user, type: 'ban' })}
                              disabled={actionLoading === user.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-error/20 hover:scale-105 rounded-md transition-all cursor-pointer text-error text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                              title="Ban User"
                            >
                              <Ban className="w-4 h-4" />
                              Ban
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={pendingAction !== null}
        title={pendingAction?.type === 'ban' ? 'Ban this user?' : 'Unban this user?'}
        description={
          pendingAction?.type === 'ban'
            ? `${pendingAction?.user.username} will lose access to the platform immediately. You can unban them later.`
            : `${pendingAction?.user.username} will regain access to the platform.`
        }
        confirmLabel={pendingAction?.type === 'ban' ? 'Ban User' : 'Unban User'}
        isDestructive={pendingAction?.type === 'ban'}
        isLoading={actionLoading === pendingAction?.user.id}
        onConfirm={handleConfirmAction}
        onCancel={closeActionDialog}
      >
        {pendingAction?.type === 'ban' && (
          <div>
            <label htmlFor="ban-reason" className="block text-sm font-medium text-text-primary mb-2">
              Reason <span className="text-text-muted font-normal">(optional, visible to the user)</span>
            </label>
            <textarea
              id="ban-reason"
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="e.g. Repeated spam or abusive behavior"
              rows={3}
              disabled={actionLoading === pendingAction?.user.id}
              className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-md text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-phonk-red disabled:opacity-50 resize-none"
            />
          </div>
        )}
      </ConfirmDialog>
    </div>
  )
}
