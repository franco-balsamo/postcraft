import { useState, useRef } from 'react'
import useEditorStore from '../../store/editorStore'
import { publishPost, schedulePost } from '../../api/posts'
import Button from '../UI/Button'
import { Textarea } from '../UI/Input'

const NETWORKS = [
  {
    id: 'instagram',
    label: 'Instagram',
    color: '#E1306C',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    id: 'facebook',
    label: 'Facebook',
    color: '#1877F2',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
]

export default function PublishPanel({ canvasRef }) {
  const { selectedNetworks, caption, scheduledAt, toggleNetwork, setCaption, setScheduledAt } =
    useEditorStore()

  const [scheduleMode, setScheduleMode] = useState(false)
  const [status, setStatus] = useState(null) // null | 'loading' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('')

  const getCanvasBase64 = async () => {
    if (!canvasRef?.current) return null
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(canvasRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#0a0e1a',
        logging: false,
      })
      return canvas.toDataURL('image/png').split(',')[1]
    } catch {
      return null
    }
  }

  const handlePublish = async () => {
    if (selectedNetworks.length === 0) {
      setErrorMsg('Selecciona al menos una red social.')
      setStatus('error')
      return
    }

    setStatus('loading')
    setErrorMsg('')

    try {
      const imageBase64 = await getCanvasBase64()
      const payload = {
        networks: selectedNetworks,
        caption,
        imageBase64,
      }

      if (scheduleMode && scheduledAt) {
        await schedulePost({ ...payload, scheduledAt })
        setStatus('success')
      } else {
        await publishPost(payload)
        setStatus('success')
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Error al publicar. Verifica que tus cuentas estén conectadas.'
      setErrorMsg(msg)
      setStatus('error')
    }
  }

  const resetStatus = () => {
    setStatus(null)
    setErrorMsg('')
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
          Publicar
        </p>
      </div>

      {/* Network selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">Redes sociales</label>
        <div className="space-y-2">
          {NETWORKS.map((network) => {
            const active = selectedNetworks.includes(network.id)
            return (
              <button
                key={network.id}
                onClick={() => toggleNetwork(network.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border text-sm font-medium transition-all ${
                  active
                    ? 'border-brand-green bg-brand-green/10 text-white'
                    : 'border-brand-border bg-brand-surface text-slate-400 hover:border-slate-500'
                }`}
              >
                <div style={{ color: active ? network.color : undefined }}>
                  {network.icon}
                </div>
                <span>{network.label}</span>
                <div className={`ml-auto w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                  active ? 'border-brand-green bg-brand-green' : 'border-slate-600'
                }`}>
                  {active && (
                    <svg className="w-2.5 h-2.5 text-brand-dark" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Caption */}
      <Textarea
        label="Caption"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="Escribe el texto para acompañar tu post... #hashtags"
        rows={4}
        hint={`${caption.length} caracteres`}
      />

      {/* Schedule toggle */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-brand-surface border border-brand-border">
        <div>
          <p className="text-sm font-medium text-slate-200">Programar publicación</p>
          <p className="text-xs text-slate-500">Elige cuándo se publicará</p>
        </div>
        <button
          onClick={() => {
            setScheduleMode(!scheduleMode)
            if (!scheduleMode) setScheduledAt(null)
          }}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            scheduleMode ? 'bg-brand-green' : 'bg-slate-700'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              scheduleMode ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {scheduleMode && (
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-300">Fecha y hora</label>
          <input
            type="datetime-local"
            value={scheduledAt || ''}
            onChange={(e) => setScheduledAt(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
            className="w-full bg-brand-navy border border-brand-border rounded-lg px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-green/40 focus:border-brand-green"
          />
        </div>
      )}

      {/* Status feedback */}
      {status === 'success' && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-brand-green/10 border border-brand-green/30">
          <div className="w-8 h-8 rounded-full bg-brand-green/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-brand-green">
              {scheduleMode ? '¡Publicación programada!' : '¡Publicado con éxito!'}
            </p>
            <p className="text-xs text-slate-400">El post fue enviado correctamente.</p>
          </div>
          <button onClick={resetStatus} className="text-slate-500 hover:text-slate-300">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {status === 'error' && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
          <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-400">Error</p>
            <p className="text-xs text-slate-400">{errorMsg}</p>
          </div>
          <button onClick={resetStatus} className="text-slate-500 hover:text-slate-300">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Publish button */}
      <Button
        onClick={handlePublish}
        loading={status === 'loading'}
        fullWidth
        size="lg"
        disabled={selectedNetworks.length === 0}
      >
        {scheduleMode ? (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Programar publicación
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            Publicar ahora
          </>
        )}
      </Button>

      {selectedNetworks.length === 0 && (
        <p className="text-xs text-center text-slate-600">
          Selecciona al menos una red social
        </p>
      )}
    </div>
  )
}
