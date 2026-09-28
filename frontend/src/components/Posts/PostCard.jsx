import { useEffect, useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deletePost } from '../../api/posts'
import Badge from '../UI/Badge'

const NETWORK_ICONS = {
  instagram: '📷',
  facebook: '👤',
}

const UNDO_WINDOW_MS = 5000

export default function PostCard({ post }) {
  const queryClient = useQueryClient()
  const [confirmDelete, setConfirmDelete] = useState(false)
  // Optimistic soft-delete: "Confirmar" hides the card and starts a grace
  // window before the DELETE request actually fires, so "Deshacer" can
  // cancel it — no backend/restore endpoint needed for this.
  const [pendingDelete, setPendingDelete] = useState(false)
  const undoTimerRef = useRef(null)

  const deleteMutation = useMutation({
    mutationFn: () => deletePost(post.id || post._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
    onError: () => {
      setConfirmDelete(false)
      setPendingDelete(false)
    },
  })

  const commitDelete = () => {
    undoTimerRef.current = null
    deleteMutation.mutate()
  }

  const startPendingDelete = () => {
    setConfirmDelete(false)
    setPendingDelete(true)
    undoTimerRef.current = setTimeout(commitDelete, UNDO_WINDOW_MS)
  }

  const undoDelete = () => {
    clearTimeout(undoTimerRef.current)
    undoTimerRef.current = null
    setPendingDelete(false)
  }

  useEffect(
    () => () => {
      // Leaving the page mid-countdown shouldn't silently cancel a delete
      // the user already confirmed — honor it immediately instead.
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current)
        deletePost(post.id || post._id).then(() =>
          queryClient.invalidateQueries({ queryKey: ['posts'] })
        )
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const formattedDate =
    post.publishedAt || post.scheduledAt
      ? new Date(post.publishedAt || post.scheduledAt).toLocaleString('es-AR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '—'

  if (pendingDelete) {
    return (
      <div className="rounded-3xl bg-red-500/10 border border-red-500/30 p-4 flex items-center justify-between animate-fade-in-fast">
        <p className="text-sm text-slate-300">Post eliminado</p>
        <button
          onClick={undoDelete}
          className="text-xs font-semibold text-brand-green hover:text-white transition-colors underline underline-offset-2"
        >
          Deshacer
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-3xl bg-white/5 border border-white/10 p-1.5 hover:border-white/20 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group">
      <div className="flex gap-0 rounded-[1.35rem] overflow-hidden bg-brand-surface/80 backdrop-blur-xl">
        {/* Thumbnail */}
        <div className="w-24 h-24 flex-shrink-0 bg-black/20 relative overflow-hidden">
          {post.thumbnailUrl ? (
            <img
              src={post.thumbnailUrl}
              alt="Post thumbnail"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl mb-1">{post.templateType === 'story' ? '▯' : '□'}</div>
                <p className="text-xs text-slate-600 capitalize">{post.templateName || 'post'}</p>
              </div>
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-brand-green/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Info */}
        <div className="flex-1 p-4 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <Badge status={post.status}>
                  {post.status === 'published'
                    ? 'Publicado'
                    : post.status === 'scheduled'
                      ? 'Programado'
                      : post.status === 'failed'
                        ? 'Fallido'
                        : 'Borrador'}
                </Badge>
                <span className="text-xs text-slate-400 capitalize">
                  {post.templateType} · {post.templateName}
                </span>
              </div>

              {/* Caption preview */}
              {post.caption && <p className="text-sm text-slate-300 truncate">{post.caption}</p>}

              {/* Meta */}
              <div className="flex items-center gap-3 mt-2">
                {/* Networks */}
                {post.networks?.length > 0 && (
                  <div className="flex items-center gap-1">
                    {post.networks.map((n) => (
                      <span key={n} title={n} className="text-sm">
                        {NETWORK_ICONS[n] || n}
                      </span>
                    ))}
                  </div>
                )}
                <span className="text-xs text-slate-400">{formattedDate}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="p-1.5 text-slate-600 hover:text-red-400 transition-colors duration-300 rounded-full hover:bg-white/5"
                  title="Eliminar"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              ) : (
                <div className="flex items-center gap-1">
                  <button
                    onClick={startPendingDelete}
                    className="px-2.5 py-1 text-xs bg-red-500/20 text-red-400 border border-red-500/30 rounded-full hover:bg-red-500/30 transition-colors duration-300"
                  >
                    Confirmar
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="px-2 py-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
