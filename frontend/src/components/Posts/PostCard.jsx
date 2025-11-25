import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deletePost } from '../../api/posts'
import Badge from '../UI/Badge'
import Button from '../UI/Button'

const NETWORK_ICONS = {
  instagram: '📷',
  facebook: '👤',
}

export default function PostCard({ post }) {
  const queryClient = useQueryClient()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const deleteMutation = useMutation({
    mutationFn: () => deletePost(post.id || post._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })

  const formattedDate = post.publishedAt || post.scheduledAt
    ? new Date(post.publishedAt || post.scheduledAt).toLocaleString('es-AR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—'

  return (
    <div className="bg-brand-surface border border-brand-border rounded-xl overflow-hidden hover:border-slate-600 transition-all duration-200 group">
      <div className="flex gap-0">
        {/* Thumbnail */}
        <div className="w-24 h-24 flex-shrink-0 bg-brand-dark relative overflow-hidden">
          {post.thumbnailUrl ? (
            <img
              src={post.thumbnailUrl}
              alt="Post thumbnail"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl mb-1">
                  {post.templateType === 'story' ? '▯' : '□'}
                </div>
                <p className="text-xs text-slate-600 capitalize">
                  {post.templateName || 'post'}
                </p>
              </div>
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-green/10 to-brand-cyan/10 opacity-0 group-hover:opacity-100 transition-opacity" />
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
                <span className="text-xs text-slate-500 capitalize">
                  {post.templateType} · {post.templateName}
                </span>
              </div>

              {/* Caption preview */}
              {post.caption && (
                <p className="text-sm text-slate-300 truncate">{post.caption}</p>
              )}

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
                <span className="text-xs text-slate-500">{formattedDate}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="p-1.5 text-slate-600 hover:text-red-400 transition-colors rounded"
                  title="Eliminar"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              ) : (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      deleteMutation.mutate()
                      setConfirmDelete(false)
                    }}
                    className="px-2 py-1 text-xs bg-red-500/20 text-red-400 border border-red-500/30 rounded hover:bg-red-500/30 transition-colors"
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
