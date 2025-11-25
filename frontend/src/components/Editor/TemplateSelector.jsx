import clsx from 'clsx'
import useEditorStore from '../../store/editorStore'

const types = [
  { value: 'post', label: 'Post', icon: '□', desc: '1080×1080' },
  { value: 'story', label: 'Story', icon: '▯', desc: '1080×1920' },
]

const templates = [
  { value: 'producto', label: 'Producto', icon: '📦', desc: 'Ficha de producto' },
  { value: 'oferta', label: 'Oferta', icon: '🏷️', desc: 'Descuento / promo' },
]

export default function TemplateSelector() {
  const { templateType, templateName, setTemplate } = useEditorStore()

  return (
    <div className="space-y-5">
      {/* Format type */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
          Formato
        </p>
        <div className="grid grid-cols-2 gap-2">
          {types.map((t) => (
            <button
              key={t.value}
              onClick={() => setTemplate(t.value, templateName)}
              className={clsx(
                'flex flex-col items-center gap-1.5 p-3 rounded-lg border text-sm font-medium transition-all duration-200',
                templateType === t.value
                  ? 'border-brand-green bg-brand-green/10 text-brand-green'
                  : 'border-brand-border bg-brand-surface text-slate-400 hover:border-slate-500 hover:text-slate-200'
              )}
            >
              <span className="text-xl">{t.icon}</span>
              <span className="font-semibold">{t.label}</span>
              <span className="text-xs opacity-60">{t.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Template name */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
          Tipo de contenido
        </p>
        <div className="space-y-2">
          {templates.map((t) => (
            <button
              key={t.value}
              onClick={() => setTemplate(templateType, t.value)}
              className={clsx(
                'w-full flex items-center gap-3 p-3 rounded-lg border text-sm font-medium transition-all duration-200',
                templateName === t.value
                  ? 'border-brand-green bg-brand-green/10 text-brand-green'
                  : 'border-brand-border bg-brand-surface text-slate-400 hover:border-slate-500 hover:text-slate-200'
              )}
            >
              <span className="text-xl">{t.icon}</span>
              <div className="text-left">
                <p className="font-semibold">{t.label}</p>
                <p className="text-xs opacity-60">{t.desc}</p>
              </div>
              {templateName === t.value && (
                <div className="ml-auto w-2 h-2 rounded-full bg-brand-green" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Preview label */}
      <div className="pt-2 border-t border-brand-border">
        <p className="text-xs text-slate-500">
          Plantilla activa:{' '}
          <span className="text-brand-green font-medium capitalize">
            {templateType} {templateName}
          </span>
        </p>
      </div>
    </div>
  )
}
