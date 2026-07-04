const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL

interface ApiOptions {
  body?: any
}

export async function callApi(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  options: ApiOptions = {}
) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  const url = `${BACKEND_URL}${endpoint}`

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      credentials: 'include', // ✅ Include HttpOnly cookies automatically
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`API call failed to ${url}:`, error)
    throw error
  }
}

// Track API calls
export async function seedTrack(
  youtubeUrl: string,
  title: string,
  artistName: string,
  genre: string,
  thumbnailUrl: string
) {
  return callApi('/api/v1/admin/tracks/seed', 'POST', {
    body: { youtube_url: youtubeUrl, title, artist_name: artistName, genre, thumbnail_url: thumbnailUrl },
  })
}

export async function approveTrack(trackId: string) {
  return callApi(`/api/v1/admin/tracks/${trackId}/approve`, 'PUT')
}

export async function rejectTrack(trackId: string) {
  return callApi(`/api/v1/admin/tracks/${trackId}/reject`, 'PUT')
}

export async function featureTrack(trackId: string) {
  return callApi(`/api/v1/admin/tracks/${trackId}/feature`, 'PUT')
}

export async function deleteTrack(trackId: string) {
  return callApi(`/api/v1/admin/tracks/${trackId}`, 'DELETE')
}

// User API calls
export async function banUser(userId: string, reason?: string) {
  return callApi(`/api/v1/admin/users/${userId}/ban`, 'POST', {
    body: reason ? { reason } : undefined,
  })
}

export async function unbanUser(userId: string) {
  return callApi(`/api/v1/admin/users/${userId}/unban`, 'POST')
}

// Notification API calls
export async function sendNotification(
  title: string,
  body: string,
  targetUserId: string | null
) {
  return callApi('/api/v1/admin/notifications/send', 'POST', {
    body: {
      title,
      body,
      target_user_id: targetUserId,
    },
  })
}
