import { useRef, useState } from 'react'
import TemplateSelector from '../components/Editor/TemplateSelector'
import CanvasPreview from '../components/Editor/CanvasPreview'
import FieldsPanel from '../components/Editor/FieldsPanel'
import PublishPanel from '../components/Editor/PublishPanel'

const TABS = [
  { id: 'templates', label: 'Plantillas' },
  { id: 'canvas',    label: 'Preview' },
  { id: 'publish',   label: 'Publicar' },
]

export default function Editor() {
  const canvasRef = useRef(null)
  const [activeTab, setActiveTab] = useState('canvas')

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

      {/* ── Mobile tab bar ───────────────────────────────────────────────── */}
      <div className="lg:hidden flex border-b border-brand-border bg-brand-navy flex-shrink-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? 'text-brand-green border-b-2 border-brand-green'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Left column: Template selector ──────────────────────────────── */}
      <div className={`
        lg:w-64 lg:flex-shrink-0 lg:border-r lg:border-brand-border lg:overflow-y-auto lg:flex lg:flex-col
        ${activeTab === 'templates' ? 'flex flex-col flex-1 overflow-y-auto' : 'hidden lg:flex'}
      `}>
        <div className="p-4 lg:p-5">
          <TemplateSelector />
        </div>
      </div>

      {/* ── Center column: Canvas preview ───────────────────────────────── */}
      <div className={`
        lg:flex-1 lg:flex lg:flex-col lg:items-center lg:justify-start lg:overflow-y-auto lg:bg-brand-dark/50 lg:p-6
        ${activeTab === 'canvas' ? 'flex flex-col flex-1 overflow-y-auto items-center justify-start bg-brand-dark/50 p-4' : 'hidden lg:flex'}
      `}>
        <CanvasPreview canvasRef={canvasRef} />
      </div>

      {/* ── Right column: Fields + Publish ──────────────────────────────── */}
      <div className={`
        lg:w-72 lg:flex-shrink-0 lg:border-l lg:border-brand-border lg:overflow-y-auto lg:flex lg:flex-col
        ${activeTab === 'publish' ? 'flex flex-col flex-1 overflow-y-auto' : 'hidden lg:flex'}
      `}>
        <div className="p-4 lg:p-5 border-b border-brand-border">
          <FieldsPanel />
        </div>
        <div className="p-4 lg:p-5">
          <PublishPanel canvasRef={canvasRef} />
        </div>
      </div>

    </div>
  )
}
