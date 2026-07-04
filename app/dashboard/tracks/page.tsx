'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Header } from '@/components/header'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { trackDB } from '@/lib/supabase/clients'
import { Track, getTrackStatus } from '@/lib/types'
import { seedTrack, approveTrack, rejectTrack, featureTrack, deleteTrack } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Plus, Check, X, Star, Trash2, Loader2 } from 'lucide-react'

const EMPTY_FORM = { youtubeUrl: '', title: '', artist: '', genre: '', thumbnailUrl: '' }

export default function TracksPage() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [rowLoading, setRowLoading] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [modalLoading, setModalLoading] = useState(false)
  const [modalError, setModalError] = useState('')
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [deleteTarget, setDeleteTarget] = useState<Track | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    fetchTracks()
  }, [])

  const fetchTracks = async () => {
    try {
      const { data, error } = await trackDB
        .from('tracks')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTracks(data || [])
    } catch (error) {
      console.error('Failed to fetch tracks:', error)
      toast.error('Failed to load tracks. Please refresh the page.')
    } finally {
      setIsLoading(false)
    }
  }

  const closeModal = () => {
    if (modalLoading) return
    setShowModal(false)
    setModalError('')
    setFormData(EMPTY_FORM)
  }

  const handleAddTrack = async (e: React.FormEvent) => {
    e.preventDefault()

    setModalError('')
    setModalLoading(true)

    try {
      await seedTrack(
        formData.youtubeUrl,
        formData.title,
        formData.artist,
        formData.genre,
        formData.thumbnailUrl
      )

      setShowModal(false)
      setFormData(EMPTY_FORM)
      toast.success(`"${formData.title}" was added and is pending approval`)
      await fetchTracks()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add track. Please try again.'
      setModalError(message)
      console.error(error)
    } finally {
      setModalLoading(false)
    }
  }

  const handleApprove = async (track: Track) => {
    setRowLoading(track.id)
    try {
      await approveTrack(track.id)
      toast.success(`"${track.title}" approved`)
      await fetchTracks()
    } catch (error) {
      console.error('Failed to approve track:', error)
      toast.error(`Failed to approve "${track.title}"`)
    } finally {
      setRowLoading(null)
    }
  }

  const handleReject = async (track: Track) => {
    setRowLoading(track.id)
    try {
      await rejectTrack(track.id)
      toast.success(`"${track.title}" rejected`)
      await fetchTracks()
    } catch (error) {
      console.error('Failed to reject track:', error)
      toast.error(`Failed to reject "${track.title}"`)
    } finally {
      setRowLoading(null)
    }
  }

  const handleFeature = async (track: Track) => {
    setRowLoading(track.id)
    try {
      await featureTrack(track.id)
      toast.success(track.is_featured ? `"${track.title}" unfeatured` : `"${track.title}" is now featured`)
      await fetchTracks()
    } catch (error) {
      console.error('Failed to feature track:', error)
      toast.error(`Failed to update "${track.title}"`)
    } finally {
      setRowLoading(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await deleteTrack(deleteTarget.id)
      toast.success(`"${deleteTarget.title}" deleted`)
      setDeleteTarget(null)
      await fetchTracks()
    } catch (error) {
      console.error('Failed to delete track:', error)
      toast.error(`Failed to delete "${deleteTarget.title}"`)
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div>
      <Header title="Tracks" subtitle="Manage tracks and approve uploads" />

      <div className="p-6">
        {/* Action bar */}
        <div className="mb-6 flex justify-end">
          <Button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-phonk-red hover:bg-phonk-red-dark text-text-primary rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Track by YouTube URL
          </Button>
        </div>

        {/* Tracks table */}
        <div className="bg-bg-card border border-border-subtle rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 border-4 border-border-subtle border-t-phonk-red rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-text-secondary">Loading tracks...</p>
            </div>
          ) : tracks.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-text-muted">No tracks found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-bg-surface border-b border-border-subtle">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-text-primary">Thumbnail</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-text-primary">Title</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-text-primary">Artist</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-text-primary">Genre</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-text-primary">Plays</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-text-primary">Likes</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-text-primary">Status</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-text-primary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tracks.map((track) => {
                    const status = getTrackStatus(track)
                    const isRowBusy = rowLoading === track.id
                    return (
                      <tr key={track.id} className="border-b border-border-subtle hover:bg-bg-surface/50 transition-colors">
                        <td className="px-6 py-4">
                          {track.thumbnail_url && (
                            <img
                              src={track.thumbnail_url}
                              alt={track.title}
                              className="w-10 h-10 rounded-md object-cover"
                            />
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-text-primary max-w-xs truncate">{track.title}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-text-secondary text-sm">{track.artist_name}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-text-secondary text-sm">{track.genre}</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <p className="font-semibold text-text-primary">{track.play_count.toLocaleString()}</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <p className="font-semibold text-phonk-red">{track.likes_count.toLocaleString()}</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            status === 'live'
                              ? 'bg-success/20 text-success'
                              : status === 'rejected'
                              ? 'bg-error/20 text-error'
                              : 'bg-warning/20 text-warning'
                          }`}>
                            {status === 'live' ? 'Live' : status === 'rejected' ? 'Rejected' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2 justify-center">
                            {isRowBusy ? (
                              <Loader2 className="w-4 h-4 text-text-secondary animate-spin" />
                            ) : (
                              <>
                                {status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => handleApprove(track)}
                                      disabled={isRowBusy}
                                      className="p-2 hover:bg-success/20 rounded transition-colors text-success disabled:opacity-50"
                                      title="Approve"
                                    >
                                      <Check className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleReject(track)}
                                      disabled={isRowBusy}
                                      className="p-2 hover:bg-error/20 rounded transition-colors text-error disabled:opacity-50"
                                      title="Reject"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                                {status === 'live' && (
                                  <button
                                    onClick={() => handleFeature(track)}
                                    disabled={isRowBusy}
                                    className={`p-2 rounded transition-colors disabled:opacity-50 ${
                                      track.is_featured
                                        ? 'bg-phonk-red/20 text-phonk-red'
                                        : 'hover:bg-phonk-red/20 text-text-secondary'
                                    }`}
                                    title="Toggle Featured"
                                  >
                                    <Star className={`w-4 h-4 ${track.is_featured ? 'fill-current' : ''}`} />
                                  </button>
                                )}
                                <button
                                  onClick={() => setDeleteTarget(track)}
                                  disabled={isRowBusy}
                                  className="p-2 hover:bg-error/20 rounded transition-colors text-error disabled:opacity-50"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* YouTube URL Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-bg-card border border-border-subtle rounded-lg p-6 w-full max-w-md shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-text-primary mb-4">Add Track by YouTube URL</h2>

            {modalError && (
              <div className="mb-4 p-3 bg-error/10 border border-error rounded-md">
                <p className="text-error text-sm">{modalError}</p>
              </div>
            )}

            <form onSubmit={handleAddTrack} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">YouTube URL</label>
                <input
                  type="url"
                  value={formData.youtubeUrl}
                  onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-md text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-phonk-red disabled:opacity-50"
                  required
                  disabled={modalLoading}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Track title"
                  className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-md text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-phonk-red disabled:opacity-50"
                  required
                  disabled={modalLoading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Artist</label>
                  <input
                    type="text"
                    value={formData.artist}
                    onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                    placeholder="Artist name"
                    className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-md text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-phonk-red disabled:opacity-50"
                    required
                    disabled={modalLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Genre</label>
                  <input
                    type="text"
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                    placeholder="Genre"
                    className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-md text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-phonk-red disabled:opacity-50"
                    required
                    disabled={modalLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Thumbnail URL</label>
                <input
                  type="url"
                  value={formData.thumbnailUrl}
                  onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-md text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-phonk-red disabled:opacity-50"
                  required
                  disabled={modalLoading}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={closeModal}
                  disabled={modalLoading}
                  className="flex-1 px-4 py-2 bg-bg-surface hover:bg-bg-elevated text-text-primary rounded-lg transition-colors"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={modalLoading}
                  className="flex-1 px-4 py-2 bg-phonk-red hover:bg-phonk-red-dark text-text-primary rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {modalLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {modalLoading ? 'Adding track...' : 'Add Track'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete this track?"
        description={`"${deleteTarget?.title}" will be permanently removed. This cannot be undone.`}
        confirmLabel="Delete Track"
        isLoading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
