// Users from authDB
export interface User {
  id: string
  username: string
  email: string
  avatar_url: string | null
  phonk_level: string
  is_verified: boolean
  is_banned: boolean
  created_at: string
  updated_at: string
}

// Tracks from trackDB
export interface Track {
  id: string
  title: string
  artist_name: string
  genre: string
  thumbnail_url: string
  storage_url: string
  youtube_id: string | null
  play_count: number
  likes_count: number
  is_featured: boolean
  is_approved: boolean
  is_rejected: boolean
  source: string
  created_at: string
}

// Track status for UI
export type TrackStatus = 'live' | 'pending' | 'rejected'

export function getTrackStatus(track: Track): TrackStatus {
  if (track.is_rejected) return 'rejected'
  if (track.is_approved) return 'live'
  return 'pending'
}

// Playback history for analytics
export interface PlaybackHistory {
  id: string
  user_id: string
  track_id: string
  played_at: string
}

// Daily plays data
export interface DailyPlays {
  day: string
  plays: number
}

// Genre distribution
export interface GenreDistribution {
  genre: string
  count: number
}

// Notification log
export interface NotificationLog {
  id: string
  title: string
  body: string
  target: string
  sent_at: string
}
