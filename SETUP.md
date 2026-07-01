# PhonkDrift Admin Dashboard - Setup Guide

## Overview

This is a complete admin dashboard for the PhonkDrift music streaming platform, built with Next.js 16, Tailwind CSS, shadcn/ui, and Supabase. The dashboard supports managing tracks, users, notifications, and analytics across three separate Supabase database instances (multi-database architecture).

## Architecture

### Multi-Database Setup
The dashboard connects to 3 separate Supabase instances:
- **authDB**: User profiles, accounts, and bans
- **trackDB**: Tracks, playback history, and featured tracks
- **chatDB**: Chat functionality (for future use)

### Authentication
- Admin login via Supabase Auth (dashboard access control only)
- Custom JWT tokens from the Go backend for API operations
- JWT stored in localStorage for making admin API calls

## Environment Variables

Add these to your `.env.local` file:

```env
# Auth Database
NEXT_PUBLIC_AUTH_SUPABASE_URL=https://your-auth-instance.supabase.co
NEXT_PUBLIC_AUTH_SUPABASE_ANON_KEY=your-auth-anon-key

# Track Database
NEXT_PUBLIC_TRACK_SUPABASE_URL=https://your-track-instance.supabase.co
NEXT_PUBLIC_TRACK_SUPABASE_ANON_KEY=your-track-anon-key

# Chat Database
NEXT_PUBLIC_CHAT_SUPABASE_URL=https://your-chat-instance.supabase.co
NEXT_PUBLIC_CHAT_SUPABASE_ANON_KEY=your-chat-anon-key

# Admin Configuration
NEXT_PUBLIC_ADMIN_EMAIL=your@email.com
NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:30080
```

## Pages

### Dashboard (`/dashboard`)
- Overview statistics: Total Tracks, Total Users, Total Plays, Storage Used
- Recent activity feed showing trending tracks
- Recent user signups
- Quick navigation to other admin sections

### Tracks (`/dashboard/tracks`)
- Full table of all tracks with filtering and sorting
- Columns: Thumbnail, Title, Artist, Genre, Play Count, Likes, Status, Actions
- Action buttons to approve, reject, feature, and delete tracks
- "Add Track by YouTube URL" modal to seed new tracks from YouTube
- Status badges: Live (green), Pending (yellow), Rejected (red)
- Featured indicator with star icon

### Users (`/dashboard/users`)
- User management table with detailed information
- Columns: Avatar, Username, Email, Phonk Level, Verification, Status, Actions
- Ban/Unban user functionality
- Active/Banned status indicators
- Verification status display

### Notifications (`/dashboard/notifications`)
- Send push notifications to all users or specific users
- Notification history log
- Target selection (all users or specific user)
- Message preview in history

### Analytics (`/dashboard/analytics`)
- Daily Plays Line Chart (last 30 days)
- Top 10 Tracks Bar Chart
- Genre Distribution Pie Chart with legend
- Summary statistics cards
- Real-time data from Supabase

## Database Schema

### authDB - users table
- `id` (UUID)
- `username` (VARCHAR)
- `email` (VARCHAR)
- `avatar_url` (TEXT)
- `phonk_level` (VARCHAR)
- `is_verified` (BOOLEAN)
- `is_banned` (BOOLEAN)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### trackDB - tracks table
- `id` (VARCHAR)
- `title` (VARCHAR)
- `artist_name` (VARCHAR)
- `genre` (VARCHAR)
- `thumbnail_url` (VARCHAR)
- `storage_url` (VARCHAR)
- `youtube_id` (VARCHAR)
- `play_count` (INTEGER)
- `likes_count` (INTEGER)
- `is_featured` (BOOLEAN)
- `is_approved` (BOOLEAN)
- `is_rejected` (BOOLEAN)
- `source` (VARCHAR)
- `created_at` (TIMESTAMP)

### trackDB - playback_history table (for analytics)
- `id` (VARCHAR)
- `user_id` (VARCHAR)
- `track_id` (VARCHAR)
- `played_at` (TIMESTAMP)

### authDB - notifications_log table
- `id` (VARCHAR)
- `title` (VARCHAR)
- `body` (TEXT)
- `target` (VARCHAR)
- `sent_at` (TIMESTAMP)

## API Integration

### Backend Endpoints Called

All admin operations call the Go backend API at `NEXT_PUBLIC_BACKEND_URL`:

**Tracks:**
- `POST /api/v1/admin/tracks/seed` - Add new track from YouTube URL
- `PUT /api/v1/admin/tracks/:id/approve` - Approve pending track
- `PUT /api/v1/admin/tracks/:id/reject` - Reject pending track
- `PUT /api/v1/admin/tracks/:id/feature` - Toggle featured status
- `DELETE /api/v1/admin/tracks/:id` - Delete track

**Users:**
- `POST /api/v1/admin/users/:id/ban` - Ban user
- `POST /api/v1/admin/users/:id/unban` - Unban user

**Notifications:**
- `POST /api/v1/admin/notifications/send` - Send push notification

All API calls require `Authorization: Bearer [admin_token]` header.

## Color Theme

The dashboard uses the PhonkDrift color palette:
- **Primary Red**: `#FF0055` (phonk-red)
- **Dark Background**: `#0A0A0C` (bg-deep)
- **Card Background**: `#111116` (bg-card)
- **Surface**: `#18181F` (bg-surface)
- **Text Primary**: `#F0F0F5`
- **Text Secondary**: `#8888AA`
- **Success**: `#1DB954`
- **Warning**: `#FFA500`
- **Error**: `#FF0055`

All colors are defined as CSS custom properties in `app/globals.css`.

## Getting Started

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables in `.env.local`

3. Run the development server:
```bash
pnpm dev
```

4. Open http://localhost:3000 in your browser

5. You'll be redirected to `/login` if not authenticated

6. Log in with your admin email (must match `NEXT_PUBLIC_ADMIN_EMAIL`)

## Key Features

- **Multi-Database Architecture**: Connects to 3 separate Supabase instances
- **Protected Routes**: All dashboard pages require authentication
- **Real-time Data**: Uses Supabase subscriptions for live updates
- **Dark Theme**: Premium dark UI with phonk aesthetic
- **Responsive Design**: Mobile-friendly sidebar and layout
- **Track Management**: Full CRUD operations with approval workflow
- **User Management**: Ban/unban functionality
- **Analytics**: Charts and statistics with Recharts
- **Push Notifications**: Send notifications to users

## Customization

### Adding New Pages
1. Create a new folder under `app/dashboard/[page-name]`
2. Add `page.tsx` with your component
3. Update sidebar navigation in `components/sidebar.tsx`
4. The layout and authentication will be inherited automatically

### Modifying Colors
Edit the CSS custom properties in `app/globals.css` under `:root` selector.

### Adding API Calls
Add new functions to `lib/api.ts` following the existing pattern.

## Troubleshooting

- **Redirect Loop**: Check that `NEXT_PUBLIC_ADMIN_EMAIL` matches your login email
- **No Data**: Verify Supabase credentials and database tables exist with correct schema
- **API Errors**: Ensure backend URL is correct and backend is running
- **Login Issues**: Check browser localStorage hasn't been cleared

## Production Deployment

1. Deploy to Vercel:
```bash
vercel
```

2. Set environment variables in Vercel project settings

3. Ensure backend is accessible from Vercel (update `NEXT_PUBLIC_BACKEND_URL`)

## Future Enhancements

- Real-time chart updates with Supabase subscriptions
- Batch operations for tracks
- Advanced user filtering and search
- Moderation queue for content
- Dashboard customization and themes
- Export functionality for reports
