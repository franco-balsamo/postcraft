import { useRef, useState, useCallback } from 'react'
import useEditorStore from '../../store/editorStore'
import PostProducto from './templates/PostProducto'
import PostOferta from './templates/PostOferta'
import StoryProducto from './templates/StoryProducto'
import StoryOferta from './templates/StoryOferta'

const TEMPLATES = {
  post: {
    producto: PostProducto,
    oferta: PostOferta,
  },
  story: {
    producto: StoryProducto,
    oferta: StoryOferta,
  },
}

const DIMENSIONS = {
  post: { w: 1080, h: 1080 },
  story: { w: 1080, h: 1920 },
}

export default function CanvasPreview() {
  const { templateType, templateName } = useEditorStore()
  const canvasRef = useRef(null)
  const [downloading, setDownloading] = useState(false)

  const TemplateComponent =
    TEMPLATES[templateType]?.[templateName] || PostProducto

  const { w, h } = DIMENSIONS[templateType] || { w: 1080, h: 1080 }

  // Scale the 1080px canvas down to fit the preview container
  // We'll use CSS transform for visual preview
  const PREVIEW_WIDTH = 420
  const scale = PREVIEW_WIDTH / w
  const previewHeight = h * scale

  const handleDownload = useCallback(async () => {
    if (!canvasRef.current) return
    setDownloading(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(canvasRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#0a0e1a',
        width: w,
        height: h,
        logging: false,
      })
      const link = document.createElement('a')
      link.download = `postcraft-${templateType}-${templateName}-${Date.now()}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (err) {
      console.error('Error al exportar:', err)
      alert('Error al exportar la imagen. Por favor intentá de nuevo.')
    } finally {
      setDownloading(false)
    }
  }, [templateType, templateName, w, h])

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Canvas info */}
      <div className="flex items-center gap-3 text-xs text-slate-500">
        <span className="capitalize font-medium text-slate-400">
          {templateType} {templateName}
        </span>
        <span>•</span>
        <span>{w}×{h}px</span>
        <span>•</span>
        <span className="text-brand-green">Vista previa</span>
      </div>

      {/* Preview container */}
      <div
        className="relative overflow-hidden rounded-xl border border-brand-border shadow-2xl"
        style={{ width: PREVIEW_WIDTH, height: previewHeight }}
      >
        {/* Checkerboard bg hint */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(45deg, #0d1117 25%, transparent 25%), linear-gradient(-45deg, #0d1117 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #0d1117 75%), linear-gradient(-45deg, transparent 75%, #0d1117 75%)',
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
            opacity: 0.3,
          }}
        />

        {/* Scaled template */}
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            width: w,
            height: h,
          }}
        >
          <div ref={canvasRef} style={{ width: w, height: h }}>
            <TemplateComponent />
          </div>
        </div>
      </div>

      {/* Download button */}
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brand-green to-brand-cyan text-brand-dark font-semibold text-sm rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-brand-green/20"
      >
        {downloading ? (
          <>
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Exportando...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Descargar PNG
          </>
        )}
      </button>

      {/* Dimensions hint */}
      <p className="text-xs text-slate-600">
        El archivo descargado será de {w * 2}×{h * 2}px (escala 2x)
      </p>
    </div>
  )
}
