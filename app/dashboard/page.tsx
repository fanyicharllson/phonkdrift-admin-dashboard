'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/header'
import { authDB, trackDB } from '@/lib/supabase/clients'
import { User, Track } from '@/lib/types'
import { BarChart3, Music, Users as UsersIcon, HardDrive } from 'lucide-react'
import Link from 'next/link'

interface Stats {
  totalTracks: number
  totalUsers: number
  playsToday: number
  storageUsed: string
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalTracks: 0,
    totalUsers: 0,
    playsToday: 0,
    storageUsed: '0 GB',
  })
  const [recentTracks, setRecentTracks] = useState<Track[]>([])
  const [recentUsers, setRecentUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get total tracks
        const { count: trackCount } = await trackDB
          .from('tracks')
          .select('*', { count: 'exact', head: true })

        // Get total users
        const { count: userCount } = await authDB
          .from('users')
          .select('*', { count: 'exact', head: true })

        // Get total plays
        const { data: playsData } = await trackDB
          .from('tracks')
          .select('play_count')

        const totalPlays = playsData?.reduce((sum, t) => sum + (t.play_count || 0), 0) || 0

        // Get trending tracks
        const { data: trends } = await trackDB
          .from('tracks')
          .select('*')
          .order('play_count', { ascending: false })
          .limit(5)

        // Get recent users
        const { data: users } = await authDB
          .from('users')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5)

        setStats({
          totalTracks: trackCount || 0,
          totalUsers: userCount || 0,
          playsToday: totalPlays,
          storageUsed: '0 GB', // TODO: calculate from actual storage
        })

        setRecentTracks(trends || [])
        setRecentUsers(users || [])
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  const StatCard = ({ icon: Icon, label, value, color = 'bg-phonk-red' }: any) => (
    <div className="bg-bg-card border border-border-subtle rounded-lg p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-text-secondary text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-text-primary mt-2">{value}</p>
        </div>
        <div className={`${color} p-3 rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div>
        <Header title="Dashboard" subtitle="Welcome to PhonkDrift Admin" />
        <div className="p-6 flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-border-subtle border-t-phonk-red rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading statistics...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header title="Dashboard" subtitle="Welcome to PhonkDrift Admin" />

      {/* Stats Grid */}
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Music}
            label="Total Tracks"
            value={stats.totalTracks}
            color="bg-phonk-red"
          />
          <StatCard
            icon={UsersIcon}
            label="Total Users"
            value={stats.totalUsers}
            color="bg-[#ffa500]"
          />
          <StatCard
            icon={BarChart3}
            label="Plays"
            value={stats.playsToday.toLocaleString()}
            color="bg-[#1db954]"
          />
          <StatCard
            icon={HardDrive}
            label="Storage Used"
            value={stats.storageUsed}
            color="bg-text-secondary"
          />
        </div>

        {/* Trending Tracks */}
        <div className="bg-bg-card border border-border-subtle rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-text-primary">Trending Tracks</h2>
            <Link href="/tracks" className="text-phonk-red hover:underline text-sm font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {recentTracks.length > 0 ? (
              recentTracks.map((track) => (
                <div
                  key={track.id}
                  className="flex items-center gap-4 p-3 bg-bg-surface rounded-lg hover:border-phonk-red border border-transparent transition-colors"
                >
                  {track.thumbnail_url && (
                    <img
                      src={track.thumbnail_url}
                      alt={track.title}
                      className="w-12 h-12 rounded-md object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text-primary truncate">{track.title}</p>
                    <p className="text-sm text-text-secondary truncate">{track.artist_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-phonk-red">{track.play_count.toLocaleString()}</p>
                    <p className="text-xs text-text-muted">plays</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-text-muted text-sm">No tracks yet</p>
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-bg-card border border-border-subtle rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-text-primary">Recent Users</h2>
            <Link href="/users" className="text-phonk-red hover:underline text-sm font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {recentUsers.length > 0 ? (
              recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-4 p-3 bg-bg-surface rounded-lg hover:border-phonk-red border border-transparent transition-colors"
                >
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-phonk-red flex items-center justify-center text-white font-bold">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-text-primary">{user.username}</p>
                    <p className="text-sm text-text-muted">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.is_banned
                        ? 'bg-error/20 text-error'
                        : 'bg-success/20 text-success'
                    }`}>
                      {user.is_banned ? 'Banned' : 'Active'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-text-muted text-sm">No users yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
