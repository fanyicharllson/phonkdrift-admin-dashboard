'use client'

import { ReactNode, useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  isDestructive?: boolean
  isLoading?: boolean
  confirmDisabled?: boolean
  children?: ReactNode
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = true,
  isLoading = false,
  confirmDisabled = false,
  children,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) onCancel()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, isLoading, onCancel])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={() => !isLoading && onCancel()}
    >
      <div
        className="bg-bg-card border border-border-subtle rounded-lg p-6 w-full max-w-md shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 mb-4">
          <div
            className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
              isDestructive ? 'bg-error/20 text-error' : 'bg-phonk-red/20 text-phonk-red'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-text-primary">{title}</h2>
            <p className="text-sm text-text-secondary mt-1">{description}</p>
          </div>
        </div>

        {children && <div className="mb-4">{children}</div>}

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-bg-surface hover:bg-bg-elevated text-text-primary rounded-lg transition-colors"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isLoading || confirmDisabled}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors text-text-primary flex items-center justify-center gap-2 ${
              isDestructive ? 'bg-error hover:bg-error/80' : 'bg-phonk-red hover:bg-phonk-red-dark'
            } disabled:opacity-50`}
          >
            {isLoading && (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            )}
            {isLoading ? 'Processing...' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
