import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useEditorStore from '../../store/editorStore'
import useAuthStore from '../../store/authStore'
import { publishPost, schedulePost } from '../../api/posts'
import Button from '../UI/Button'
import { Textarea } from '../UI/Input'

const NETWORKS = [
  {
    id: 'instagram',
    label: 'Instagram',
    connectedKey: 'instagramConnected',
    captionLimit: 2200,
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
    connectedKey: 'facebookConnected',
    captionLimit: 63206,
    color: '#1877F2',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
]

// The exact identity of the connected account — shown before publishing so
// the user knows precisely where content is about to go out, and again in
// the success message so it's provably true, not a generic "it worked".
function networkHandle(user, id) {
  if (id === 'instagram') return `@${user?.instagramUsername || 'conectado'}`
  if (id === 'facebook') return user?.facebookPageName || 'conectado'
  return ''
}

function networkListLabel(ids) {
  const labels = ids.map((id) => NETWORKS.find((n) => n.id === id)?.label).filter(Boolean)
  if (labels.length <= 1) return labels[0] || ''
  return `${labels.slice(0, -1).join(', ')} y ${labels[labels.length - 1]}`
}

function localTimezoneLabel() {
  const offsetMinutes = -new Date().getTimezoneOffset()
  const sign = offsetMinutes >= 0 ? '+' : '-'
  const hours = String(Math.floor(Math.abs(offsetMinutes) / 60)).padStart(2, '0')
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone
  return `${zone}, UTC${sign}${hours}`
}

function formatScheduledAt(value) {
  if (!value) return ''
  return new Date(value).toLocaleString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function PublishPanel({ canvasRef }) {
  const { selectedNetworks, caption, scheduledAt, fields, toggleNetwork, setCaption, setScheduledAt } =
    useEditorStore()
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const [scheduleMode, setScheduleMode] = useState(false)
  const [status, setStatus] = useState(null) // null | 'loading' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('')
  // Only true for an actual publish/schedule API failure — not for local
  // validation errors — so the "Reconectar cuenta" shortcut only shows when
  // it's plausibly relevant.
  const [errorFromPublish, setErrorFromPublish] = useState(false)
  const [reviewing, setReviewing] = useState(false)
  // What was actually submitted — captured at send time so the success
  // message stays accurate even if the user tweaks fields afterward.
  const [lastPublish, setLastPublish] = useState(null)
  // A short cooldown after success blocks an accidental second submit of
  // the same post — the fields aren't touched, only the trigger is locked.
  const [cooldown, setCooldown] = useState(false)

  useEffect(() => {
    if (!cooldown) return
    const timer = setTimeout(() => setCooldown(false), 5000)
    return () => clearTimeout(timer)
  }, [cooldown])

  // Only networks the user actually connected count as selectable — a
  // stale/default entry in `selectedNetworks` for an unconnected network
  // must never reach the publish request.
  const connectedSelectedNetworks = selectedNetworks.filter((id) =>
    Boolean(user?.[NETWORKS.find((n) => n.id === id)?.connectedKey])
  )

  // The binding limit is the smallest one among the selected networks —
  // Instagram's 2200 chars caps a post that also goes to Facebook.
  const captionLimit = connectedSelectedNetworks.length
    ? Math.min(
        ...connectedSelectedNetworks.map(
          (id) => NETWORKS.find((n) => n.id === id)?.captionLimit ?? Infinity
        )
      )
    : null
  const captionOverLimit = captionLimit !== null && caption.length > captionLimit
  // Publishing with every field still blank would go out as an empty,
  // unfinished-looking post — require the user to have added something.
  const hasContent =
    caption.trim().length > 0 ||
    Object.entries(fields).some(([key, value]) =>
      key === 'specs' ? value?.length > 0 : Boolean(value)
    )
  // The button shows its own confirmation for exactly the cooldown window,
  // then reverts to normal — no separate success toast to dismiss.
  const showSuccessState = status === 'success' && cooldown

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

  const handlePrimaryClick = () => {
    if (connectedSelectedNetworks.length === 0) {
      setErrorMsg('Selecciona al menos una red social conectada.')
      setErrorFromPublish(false)
      setStatus('error')
      return
    }
    if (scheduleMode && !scheduledAt) {
      setErrorMsg('Elegí una fecha y hora para programar la publicación.')
      setErrorFromPublish(false)
      setStatus('error')
      return
    }
    if (captionOverLimit) {
      setErrorMsg(`El caption supera el límite de ${networkListLabel(connectedSelectedNetworks)}.`)
      setErrorFromPublish(false)
      setStatus('error')
      return
    }
    if (!hasContent) {
      setErrorMsg('Agregá un caption o completá algún campo del post antes de publicar.')
      setErrorFromPublish(false)
      setStatus('error')
      return
    }
    if (!reviewing) {
      setReviewing(true)
      return
    }
    handlePublish()
  }

  const handlePublish = async () => {
    const isScheduled = scheduleMode && Boolean(scheduledAt)
    const submitted = { networks: connectedSelectedNetworks, isScheduled, scheduledAt }

    setStatus('loading')
    setErrorMsg('')

    try {
      const imageBase64 = await getCanvasBase64()
      const payload = {
        networks: connectedSelectedNetworks,
        caption,
        imageBase64,
      }

      if (isScheduled) {
        await schedulePost({ ...payload, scheduledAt })
      } else {
        await publishPost(payload)
      }
      setLastPublish(submitted)
      setStatus('success')
      setReviewing(false)
      setCooldown(true)
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Error al publicar. Verifica que tus cuentas estén conectadas.'
      setErrorMsg(msg)
      setErrorFromPublish(true)
      setStatus('error')
      setReviewing(false)
    }
  }

  const resetStatus = () => {
    setStatus(null)
    setErrorMsg('')
    setErrorFromPublish(false)
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
            const connected = Boolean(user?.[network.connectedKey])
            const active = connected && connectedSelectedNetworks.includes(network.id)

            if (!connected) {
              return (
                <button
                  key={network.id}
                  type="button"
                  onClick={() => navigate('/settings')}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] text-sm font-medium text-slate-400 hover:border-white/20 hover:text-slate-300 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
                >
                  <div className="opacity-40">{network.icon}</div>
                  <div className="text-left">
                    <span className="block">{network.label}</span>
                    <span className="block text-xs text-slate-600">No conectada</span>
                  </div>
                  <span className="ml-auto text-xs text-brand-green">Conectar →</span>
                </button>
              )
            }

            return (
              <button
                key={network.id}
                onClick={() => toggleNetwork(network.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl border text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                  active
                    ? 'border-brand-green bg-brand-green/10 text-white'
                    : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20'
                }`}
              >
                <div style={{ color: active ? network.color : undefined }}>{network.icon}</div>
                <span>{network.label}</span>
                <div
                  className={`ml-auto w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                    active ? 'border-brand-green bg-brand-green' : 'border-slate-600'
                  }`}
                >
                  {active && (
                    <svg
                      className="w-2.5 h-2.5 text-brand-dark"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
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
        hint={
          captionLimit !== null
            ? `${caption.length}/${captionLimit} caracteres`
            : `${caption.length} caracteres`
        }
        error={
          captionOverLimit
            ? `Te pasaste por ${caption.length - captionLimit} caracteres del límite de ${networkListLabel(connectedSelectedNetworks)}`
            : undefined
        }
      />

      {/* Schedule toggle */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
        <div>
          <p className="text-sm font-medium text-slate-200">Programar publicación</p>
          <p className="text-xs text-slate-400">Elige cuándo se publicará</p>
        </div>
        <button
          onClick={() => {
            setScheduleMode(!scheduleMode)
            if (!scheduleMode) setScheduledAt(null)
            setReviewing(false)
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
        <div className="space-y-1.5 animate-fade-in-fast">
          <label className="text-sm font-medium text-slate-300">Fecha y hora</label>
          <input
            type="datetime-local"
            value={scheduledAt || ''}
            onChange={(e) => setScheduledAt(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
            className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-100 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] focus:outline-none focus:ring-2 focus:ring-brand-green/40 focus:border-brand-green"
          />
          <p className="text-xs text-slate-400">Hora de tu navegador ({localTimezoneLabel()})</p>
        </div>
      )}

      {/* Review card — the user confirms exactly what's about to go out,
          to a real account, before an irreversible public action. */}
      {reviewing && status !== 'success' && (
        <div className="p-3 rounded-2xl bg-white/5 border border-brand-green/30 space-y-2.5 animate-fade-in-fast">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            Revisá antes de enviar
          </p>
          <ul className="space-y-1.5">
            {connectedSelectedNetworks.map((id) => {
              const network = NETWORKS.find((n) => n.id === id)
              return (
                <li key={id} className="flex items-center gap-2 text-sm text-slate-200">
                  <div style={{ color: network.color }}>{network.icon}</div>
                  <span className="font-medium">{network.label}</span>
                  <span className="text-slate-400">{networkHandle(user, id)}</span>
                </li>
              )
            })}
          </ul>
          <p className="text-xs text-slate-400">
            {scheduleMode && scheduledAt
              ? `Se publicará el ${formatScheduledAt(scheduledAt)}`
              : 'Se publicará ahora, de inmediato'}
          </p>
          {caption && <p className="text-xs text-slate-400 truncate">&ldquo;{caption}&rdquo;</p>}
          {status !== 'loading' && (
            <button
              type="button"
              onClick={() => setReviewing(false)}
              className="text-xs text-slate-400 hover:text-slate-300 underline underline-offset-2"
            >
              Volver a editar
            </button>
          )}
        </div>
      )}

      {status === 'error' && (
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-red-500/10 border border-red-500/30">
          <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-4 h-4 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-400">Error</p>
            <p className="text-xs text-slate-400">{errorMsg}</p>
            {errorFromPublish && (
              <button
                type="button"
                onClick={() => navigate('/settings')}
                className="text-xs text-red-400 hover:text-red-300 underline underline-offset-2 mt-1"
              >
                Reconectar cuenta
              </button>
            )}
          </div>
          <button onClick={resetStatus} className="text-slate-400 hover:text-slate-300">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Publish button — its own success state IS the confirmation
          (the signature moment), instead of a separate toast elsewhere. */}
      <Button
        onClick={handlePrimaryClick}
        loading={status === 'loading'}
        fullWidth
        size="lg"
        disabled={connectedSelectedNetworks.length === 0 || cooldown}
        className={showSuccessState ? 'animate-success-pop' : ''}
      >
        {showSuccessState ? (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {lastPublish?.isScheduled ? '¡Programado!' : '¡Publicado!'}
          </>
        ) : scheduleMode ? (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {status === 'loading'
              ? 'Programando…'
              : reviewing
                ? 'Confirmar programación'
                : 'Programar publicación'}
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 12 3.269 3.126A59.77 59.77 0 0 1 21.485 12 59.77 59.77 0 0 1 3.27 20.876L5.999 12Zm0 0h7.5"
              />
            </svg>
            {status === 'loading'
              ? 'Publicando…'
              : reviewing
                ? 'Confirmar publicación'
                : 'Publicar ahora'}
          </>
        )}
      </Button>

      {showSuccessState && lastPublish && (
        <p className="text-xs text-center text-slate-400 animate-fade-in-fast">
          {lastPublish.isScheduled
            ? `Se publicará el ${formatScheduledAt(lastPublish.scheduledAt)} en ${networkListLabel(lastPublish.networks)}.`
            : `Se publicó en ${networkListLabel(lastPublish.networks)}.`}
        </p>
      )}

      {!showSuccessState && connectedSelectedNetworks.length === 0 && (
        <p className="text-xs text-center text-slate-600">
          Selecciona al menos una red social conectada
        </p>
      )}

      {!showSuccessState && cooldown && connectedSelectedNetworks.length > 0 && (
        <p className="text-xs text-center text-slate-600">
          Listo por ahora — esperá unos segundos antes de volver a publicar
        </p>
      )}
    </div>
  )
}
