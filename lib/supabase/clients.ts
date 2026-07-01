import { createClient } from '@supabase/supabase-js'

// Auth DB - users, profiles
export const authDB = createClient(
  process.env.NEXT_PUBLIC_AUTH_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_AUTH_SUPABASE_ANON_KEY!
)

// Track DB - tracks, playback history
export const trackDB = createClient(
  process.env.NEXT_PUBLIC_TRACK_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_TRACK_SUPABASE_ANON_KEY!
)

// Chat DB - chat rooms, messages
export const chatDB = createClient(
  process.env.NEXT_PUBLIC_CHAT_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_CHAT_SUPABASE_ANON_KEY!
)
