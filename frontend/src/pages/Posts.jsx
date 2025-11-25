import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getPosts } from '../api/posts'
import PostCard from '../components/Posts/PostCard'
import Button from '../components/UI/Button'
import { useNavigate } from 'react-router-dom'

const STATUS_FILTERS = [
  { value: 'all', label: 'Todos' },
  { value: 'published', label: 'Publicados' },
  { value: 'scheduled', label: 'Programados' },
  { value: 'failed', label: 'Fallidos' },
]

export default function Posts() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ['posts', { page, status }],
    queryFn: () => getPosts({ page, status }),
    keepPreviousData: true,
  })

  const posts = data?.posts || []
  const total = data?.total || 0
  const totalPages = data?.totalPages || 1

  const handleStatusChange = (s) => {
    setStatus(s)
    setPage(1)
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Historial de Posts</h2>
          <p className="text-slate-500 text-sm mt-0.5">
            {total > 0 ? `${total} post${total !== 1 ? 's' : ''} en total` : 'Sin posts aún'}
          </p>
        </div>
        <Button onClick={() => navigate('/editor')} className="self-start sm:self-auto">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo post
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => handleStatusChange(f.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
              status === f.value
                ? 'border-brand-green bg-brand-green/10 text-brand-green'
                : 'border-brand-border text-slate-400 hover:border-slate-500 hover:text-slate-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Posts list */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-24 bg-brand-surface border border-brand-border rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">⚠️</p>
          <p className="text-slate-400 font-medium">Error al cargar los posts</p>
          <p className="text-slate-600 text-sm mt-1">
            {error?.response?.data?.message || error?.message || 'Por favor, intentá de nuevo.'}
          </p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-brand-surface border border-brand-border mb-4">
            <span className="text-4xl">📭</span>
          </div>
          <p className="text-slate-400 font-semibold text-lg mb-1">No hay posts</p>
          <p className="text-slate-600 text-sm mb-5">
            {status !== 'all'
              ? `No tenés posts con estado "${STATUS_FILTERS.find(f => f.value === status)?.label.toLowerCase()}"`
              : 'Creá tu primer post ahora'}
          </p>
          <Button onClick={() => navigate('/editor')}>Ir al editor</Button>
        </div>
      ) : (
        <>
          <div className={`space-y-3 ${isFetching ? 'opacity-70' : ''} transition-opacity`}>
            {posts.map((post) => (
              <PostCard key={post.id || post._id} post={post} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || isFetching}
              >
                ← Anterior
              </Button>

              <div className="flex items-center gap-1">
                {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                  const pageNum = i + 1
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                        page === pageNum
                          ? 'bg-brand-green text-brand-dark'
                          : 'text-slate-400 hover:text-white hover:bg-brand-surface'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || isFetching}
              >
                Siguiente →
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
