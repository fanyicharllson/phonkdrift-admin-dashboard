'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Header } from '@/components/header'
import { authDB } from '@/lib/supabase/clients'
import { NotificationLog } from '@/lib/types'
import { sendNotification } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Send, Loader2 } from 'lucide-react'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [sendError, setSendError] = useState('')
  const [users, setUsers] = useState<any[]>([])
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    target: 'all', // 'all' or specific user ID
    userId: '',
  })

  useEffect(() => {
    fetchNotifications()
    fetchUsers()
  }, [])

  const fetchNotifications = async () => {
    try {
      const { data, error } = await authDB
        .from('notifications_log')
        .select('*')
        .order('sent_at', { ascending: false })

      if (error) throw error
      setNotifications(data || [])
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      toast.error('Failed to load notification history')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const { data, error } = await authDB
        .from('users')
        .select('id, username, email')
        .limit(100)

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault()

    setSendError('')
    setIsSending(true)

    try {
      const targetUserId = formData.target === 'all' ? null : formData.userId
      await sendNotification(formData.title, formData.body, targetUserId)

      setFormData({ title: '', body: '', target: 'all', userId: '' })
      toast.success('Notification sent')
      await fetchNotifications()
    } catch (error) {
      setSendError('Failed to send notification. Please try again.')
      toast.error('Failed to send notification')
      console.error(error)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div>
      <Header title="Notifications" subtitle="Send push notifications to users" />

      <div className="p-6 space-y-6">
        {/* Send notification form */}
        <div className="bg-bg-card border border-border-subtle rounded-lg p-6">
          <h2 className="text-lg font-bold text-text-primary mb-4">Send Notification</h2>

          {sendError && (
            <div className="mb-4 p-3 bg-error/10 border border-error rounded-md">
              <p className="text-error text-sm">{sendError}</p>
            </div>
          )}

          <form onSubmit={handleSendNotification} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Notification title"
                className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-md text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-phonk-red"
                required
                disabled={isSending}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Message</label>
              <textarea
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                placeholder="Notification message"
                rows={4}
                className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-md text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-phonk-red"
                required
                disabled={isSending}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Send to</label>
                <select
                  value={formData.target}
                  onChange={(e) => setFormData({ ...formData, target: e.target.value, userId: '' })}
                  className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-phonk-red"
                  disabled={isSending}
                >
                  <option value="all">All Users</option>
                  <option value="specific">Specific User</option>
                </select>
              </div>

              {formData.target === 'specific' && (
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Select User</label>
                  <select
                    value={formData.userId}
                    onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                    className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-phonk-red"
                    required={formData.target === 'specific'}
                    disabled={isSending}
                  >
                    <option value="">Select a user...</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.username} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSending || !formData.title || !formData.body || (formData.target === 'specific' && !formData.userId)}
              className="flex items-center gap-2 px-4 py-2 bg-phonk-red hover:bg-phonk-red-dark text-text-primary rounded-lg transition-colors disabled:opacity-50"
            >
              {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {isSending ? 'Sending...' : 'Send Notification'}
            </Button>
          </form>
        </div>

        {/* Notifications history */}
        <div className="bg-bg-card border border-border-subtle rounded-lg p-6">
          <h2 className="text-lg font-bold text-text-primary mb-4">Notification History</h2>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-4 border-border-subtle border-t-phonk-red rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-text-secondary">Loading history...</p>
            </div>
          ) : notifications.length === 0 ? (
            <p className="text-text-muted text-center py-8">No notifications sent yet</p>
          ) : (
            <div className="space-y-3">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="p-4 bg-bg-surface border border-border-subtle rounded-lg hover:border-phonk-red transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-text-primary">{notif.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      notif.target === 'all'
                        ? 'bg-phonk-red/20 text-phonk-red'
                        : 'bg-text-secondary/20 text-text-secondary'
                    }`}>
                      {notif.target === 'all' ? 'All Users' : `User: ${notif.target}`}
                    </span>
                  </div>
                  <p className="text-text-secondary text-sm mb-2">{notif.body}</p>
                  <p className="text-text-muted text-xs">
                    {new Date(notif.sent_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
