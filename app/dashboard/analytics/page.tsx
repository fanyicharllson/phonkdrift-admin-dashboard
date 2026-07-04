'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Header } from '@/components/header'
import { trackDB } from '@/lib/supabase/clients'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { DailyPlays, GenreDistribution, Track } from '@/lib/types'

export default function AnalyticsPage() {
  const [dailyPlays, setDailyPlays] = useState<DailyPlays[]>([])
  const [topTracks, setTopTracks] = useState<any[]>([])
  const [genreDistribution, setGenreDistribution] = useState<GenreDistribution[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const COLORS = ['#ff0055', '#ffa500', '#1db954', '#8888aa', '#6b6b80', '#222230']

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      // Fetch all tracks for analysis
      const { data: tracksData, error: tracksError } = await trackDB
        .from('tracks')
        .select('*')
        .order('created_at', { ascending: true })

      if (tracksError) throw tracksError

      if (tracksData) {
        // Calculate daily plays (simulate with created_at dates)
        const dailyMap = new Map<string, number>()
        tracksData.forEach((track) => {
          const date = new Date(track.created_at).toISOString().split('T')[0]
          const current = dailyMap.get(date) || 0
          dailyMap.set(date, current + track.play_count)
        })

        const dailyArray = Array.from(dailyMap.entries())
          .map(([day, plays]) => ({ day, plays }))
          .slice(-30) // Last 30 days

        setDailyPlays(dailyArray)

        // Get top 10 tracks
        const top10 = tracksData
          .sort((a, b) => b.play_count - a.play_count)
          .slice(0, 10)
          .map((track) => ({
            name: track.title,
            plays: track.play_count,
            artist: track.artist_name,
          }))

        setTopTracks(top10)

        // Calculate genre distribution
        const genreMap = new Map<string, number>()
        tracksData.forEach((track) => {
          const current = genreMap.get(track.genre) || 0
          genreMap.set(track.genre, current + 1)
        })

        const genres = Array.from(genreMap.entries())
          .map(([genre, count]) => ({ genre, count }))
          .sort((a, b) => b.count - a.count)

        setGenreDistribution(genres)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
      toast.error('Failed to load analytics data')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div>
        <Header title="Analytics" subtitle="Platform performance metrics" />
        <div className="p-6 flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-border-subtle border-t-phonk-red rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading analytics...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header title="Analytics" subtitle="Platform performance metrics" />

      <div className="p-6 space-y-6">
        {/* Daily Plays Chart */}
        <div className="bg-bg-card border border-border-subtle rounded-lg p-6">
          <h2 className="text-lg font-bold text-text-primary mb-4">Daily Plays (Last 30 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyPlays}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222230" />
              <XAxis dataKey="day" stroke="#8888aa" />
              <YAxis stroke="#8888aa" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111116',
                  border: '1px solid #222230',
                  borderRadius: '8px',
                  color: '#f0f0f5',
                }}
              />
              <Line
                type="monotone"
                dataKey="plays"
                stroke="#ff0055"
                dot={{ fill: '#ff0055', r: 4 }}
                activeDot={{ r: 6 }}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Tracks Chart */}
        <div className="bg-bg-card border border-border-subtle rounded-lg p-6">
          <h2 className="text-lg font-bold text-text-primary mb-4">Top 10 Tracks by Plays</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topTracks}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222230" />
              <XAxis dataKey="name" stroke="#8888aa" angle={-45} textAnchor="end" height={100} />
              <YAxis stroke="#8888aa" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111116',
                  border: '1px solid #222230',
                  borderRadius: '8px',
                  color: '#f0f0f5',
                }}
              />
              <Bar dataKey="plays" fill="#ff0055" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Genre Distribution Chart */}
        <div className="bg-bg-card border border-border-subtle rounded-lg p-6">
          <h2 className="text-lg font-bold text-text-primary mb-4">Genre Distribution</h2>
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <div className="flex-1">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={genreDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ genre, count }) => `${genre} (${count})`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {genreDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111116',
                      border: '1px solid #222230',
                      borderRadius: '8px',
                      color: '#f0f0f5',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1">
              <div className="space-y-2">
                {genreDistribution.map((genre, index) => (
                  <div key={genre.genre} className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-text-primary">{genre.genre}</span>
                    <span className="text-text-secondary text-sm ml-auto">{genre.count} tracks</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-bg-card border border-border-subtle rounded-lg p-6">
            <p className="text-text-secondary text-sm font-medium mb-2">Total Plays</p>
            <p className="text-3xl font-bold text-phonk-red">
              {dailyPlays.reduce((sum, day) => sum + day.plays, 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-bg-card border border-border-subtle rounded-lg p-6">
            <p className="text-text-secondary text-sm font-medium mb-2">Top Genre</p>
            <p className="text-3xl font-bold text-phonk-red">
              {genreDistribution[0]?.genre || 'N/A'}
            </p>
          </div>
          <div className="bg-bg-card border border-border-subtle rounded-lg p-6">
            <p className="text-text-secondary text-sm font-medium mb-2">Total Genres</p>
            <p className="text-3xl font-bold text-phonk-red">
              {genreDistribution.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
