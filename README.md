# PhonkDrift Admin Dashboard

A production-ready admin dashboard for the PhonkDrift music streaming platform built with Next.js 16, React 19, and Supabase.

## Overview

The PhonkDrift Admin Dashboard provides comprehensive management tools for admins to:
- Monitor platform analytics and metrics in real-time
- Manage user accounts with ban/unban capabilities
- Approve, reject, and feature music tracks
- Send push notifications to users
- View detailed charts and analytics

## Features

### Core Functionality
- **Dashboard Overview**: Real-time statistics, trending tracks, recent users, and quick navigation
- **Track Management**: Full CRUD operations with approve/reject/feature actions, YouTube URL seeding
- **User Management**: View all users, ban/unban accounts, track user activity
- **Notifications System**: Send push notifications to all users or specific user groups
- **Analytics**: Interactive charts showing daily plays, top tracks, and genre distribution
- **Authentication**: Secure JWT-based admin authentication with localStorage persistence

### Design & UX
- Dark theme with PhonkDrift branding (neon red #FF0055 accent)
- Responsive sidebar navigation (mobile-friendly)
- Sortable and filterable data tables
- Real-time status badges and action buttons
- Smooth animations and transitions
- Accessibility optimized (WCAG compliant)

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Database**: Supabase (PostgreSQL) - 3 separate instances
- **Styling**: Tailwind CSS 4
- **Charts**: Recharts
- **HTTP Client**: Fetch API with custom helpers
- **Authentication**: JWT tokens
- **Deployment**: Vercel

## Prerequisites

- Node.js 18+ or 20+
- pnpm (recommended) or npm/yarn
- Three Supabase projects (Auth DB, Track DB, Chat DB)
- Go backend server (for API calls)

## Installation

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd phonkdrift-admin-dashboard
pnpm install
# or: npm install / yarn install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Auth Database
NEXT_PUBLIC_AUTH_SUPABASE_URL=https://your-auth-db.supabase.co
NEXT_PUBLIC_AUTH_SUPABASE_ANON_KEY=your-auth-anon-key

# Supabase Track Database
NEXT_PUBLIC_TRACK_SUPABASE_URL=https://your-track-db.supabase.co
NEXT_PUBLIC_TRACK_SUPABASE_ANON_KEY=your-track-anon-key

# Supabase Chat Database
NEXT_PUBLIC_CHAT_SUPABASE_URL=https://your-chat-db.supabase.co
NEXT_PUBLIC_CHAT_SUPABASE_ANON_KEY=your-chat-anon-key

# Admin Configuration
NEXT_PUBLIC_ADMIN_EMAIL=admin@phonkdrift.com

# Backend API
NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:30080
```

### 3. Start Development Server

```bash
pnpm dev
```

The dashboard will be available at `http://localhost:3000`

## Project Structure

```
phonkdrift-admin-dashboard/
├── app/
│   ├── layout.tsx                 # Root layout with Auth provider
│   ├── page.tsx                   # Redirect to login/dashboard
│   ├── login/
│   │   └── page.tsx              # Login page with form
│   └── dashboard/
│       ├── layout.tsx            # Protected dashboard layout
│       ├── page.tsx              # Dashboard overview
│       ├── tracks/
│       │   └── page.tsx          # Tracks management
│       ├── users/
│       │   └── page.tsx          # Users management
│       ├── notifications/
│       │   └── page.tsx          # Send notifications
│       └── analytics/
│           └── page.tsx          # Analytics & charts
├── components/
│   ├── sidebar.tsx               # Navigation sidebar
│   └── header.tsx                # Top header with logout
├── lib/
│   ├── supabase/
│   │   └── clients.ts            # Supabase client configs
│   ├── auth-context.tsx          # Auth state management
│   ├── types.ts                  # TypeScript interfaces
│   └── api.ts                    # API helper functions
├── app/globals.css               # Global styles & theme
└── README.md                      # This file
```

## Authentication Flow

1. User visits `/login`
2. Enters email and password
3. Dashboard makes request to `/api/v1/admin/login` (Go backend)
4. Backend validates credentials and returns JWT token
5. Token stored in localStorage under `admin_token`
6. User redirected to `/dashboard`
7. All subsequent API requests include token in Authorization header

## Database Schema

### Auth Database (Supabase)
```sql
-- Not directly accessed; Go backend handles authentication
-- Admin credentials stored securely on backend
```

### Track Database (Supabase)
```sql
CREATE TABLE tracks (
  id UUID PRIMARY KEY,
  title VARCHAR NOT NULL,
  artist VARCHAR NOT NULL,
  genre VARCHAR,
  duration INTEGER,
  youtube_url VARCHAR,
  status VARCHAR (pending, approved, rejected, featured),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Chat Database (Supabase)
```sql
-- For future chat functionality
```

## API Endpoints

All API endpoints are called through the Go backend. The dashboard communicates via:

### Authentication
```
POST /api/v1/admin/login
Body: { email: string, password: string }
Response: { token: string, admin: object }
```

### Tracks
```
GET /api/v1/admin/tracks?status=pending&limit=50&offset=0
POST /api/v1/admin/tracks/:id/approve
POST /api/v1/admin/tracks/:id/reject
POST /api/v1/admin/tracks/:id/feature
DELETE /api/v1/admin/tracks/:id
POST /api/v1/admin/tracks/seed
Body: { youtube_url: string }
```

### Users
```
GET /api/v1/admin/users?limit=50&offset=0
POST /api/v1/admin/users/:id/ban
POST /api/v1/admin/users/:id/unban
GET /api/v1/admin/analytics/stats
```

### Notifications
```
POST /api/v1/admin/notifications/send-all
Body: { title: string, message: string, data?: object }
POST /api/v1/admin/notifications/send-user
Body: { user_id: string, title: string, message: string }
```

### Analytics
```
GET /api/v1/admin/analytics/plays?days=30
GET /api/v1/admin/analytics/top-tracks?limit=10
GET /api/v1/admin/analytics/genres
```

## Customization

### Change Theme Colors

Edit `/app/globals.css` and modify the CSS variables in the `:root` selector:

```css
:root {
  --phonk-red: #ff0055;
  --bg-deep: #0a0a0c;
  --text-primary: #f0f0f5;
  /* ... other colors */
}
```

### Add New Dashboard Pages

1. Create new folder: `app/dashboard/new-page/`
2. Create `page.tsx` with your component
3. Add navigation link in `components/sidebar.tsx`
4. Page automatically inherits protected layout and styling

### Modify Sidebar Navigation

Edit `components/sidebar.tsx` to add/remove navigation items:

```tsx
const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/dashboard/tracks', label: 'Tracks', icon: '🎵' },
  // Add your items here
];
```

### Connect to Different Backend

Update `NEXT_PUBLIC_BACKEND_URL` in `.env.local` to point to your API server.

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel Settings
4. Deploy!

```bash
# Or deploy directly with Vercel CLI
vercel deploy --prod
```

### Environment Variables for Production

Set these in your Vercel project settings (Settings → Environment Variables):

```
NEXT_PUBLIC_AUTH_SUPABASE_URL
NEXT_PUBLIC_AUTH_SUPABASE_ANON_KEY
NEXT_PUBLIC_TRACK_SUPABASE_URL
NEXT_PUBLIC_TRACK_SUPABASE_ANON_KEY
NEXT_PUBLIC_CHAT_SUPABASE_URL
NEXT_PUBLIC_CHAT_SUPABASE_ANON_KEY
NEXT_PUBLIC_ADMIN_EMAIL
NEXT_PUBLIC_BACKEND_URL
```

## Development

### Run Tests

```bash
pnpm test
```

### Build for Production

```bash
pnpm build
pnpm start
```

### Lint Code

```bash
pnpm lint
```

## Troubleshooting

### Login Not Working
- Verify Go backend is running and accessible at `NEXT_PUBLIC_BACKEND_URL`
- Check network tab in DevTools for API errors
- Confirm admin credentials are correct
- Check backend logs for authentication issues

### Tables Not Loading Data
- Verify Supabase credentials in `.env.local`
- Check that Supabase projects are accessible
- Look for CORS errors in browser console
- Verify backend API endpoints are returning data

### Styling Issues
- Clear browser cache and restart dev server
- Check that Tailwind CSS is properly configured
- Verify custom CSS variables in `globals.css`

### Performance Optimization
- Recharts loads on-demand for analytics pages
- Tables paginate data to avoid slow renders
- API calls include proper error handling
- Images are optimized with Next.js Image component

## Security Best Practices

1. **Never commit `.env.local`** - Use `.env.local.example` template
2. **Rotate JWT tokens** regularly in production
3. **Use HTTPS only** in production
4. **Implement rate limiting** on backend API
5. **Validate all user inputs** on backend
6. **Use Row-Level Security (RLS)** in Supabase
7. **Log all admin actions** for audit trails

## Contributing

1. Create a new branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

MIT License - See LICENSE file for details

## Support

For issues or questions:
- Check existing GitHub issues
- Create a new issue with detailed description
- Include environment variables (without sensitive keys)
- Share error messages and browser console logs

## Changelog

### v1.0.0 - Initial Release
- Dashboard overview with stats
- Track management system
- User management
- Notifications system
- Analytics with charts
- JWT authentication
- Multi-database Supabase setup

---

Built with ❤️ for PhonkDrift Community
