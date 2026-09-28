import clsx from 'clsx'
import useEditorStore from '../../store/editorStore'
import PostProducto from './templates/PostProducto'
import PostOferta from './templates/PostOferta'

const types = [
  { value: 'post', label: 'Post', icon: '□', desc: '1080×1080' },
  { value: 'story', label: 'Story', icon: '▯', desc: '1080×1920' },
]

const templates = [
  { value: 'producto', label: 'Producto', desc: 'Ficha de producto' },
  { value: 'oferta', label: 'Oferta', desc: 'Descuento / promo' },
]

// Example content for the type-picker thumbnails only — never the live
// editor state. A real scaled-down render of the template beats an emoji:
// it's always accurate, and needs no separate image asset to keep in sync.
const THUMBNAIL_COMPONENTS = { producto: PostProducto, oferta: PostOferta }
const THUMBNAIL_FIELDS = {
  producto: { nombre: 'iPhone 15 Pro', precio: '$999', specs: ['128GB', 'Titanio', 'USB-C'], badge: 'NUEVO' },
  oferta: { nombre: 'iPhone 15 Pro', descuento: '20%', codigo: 'FEB20', vigencia: 'Hasta el 31/03' },
}
const THUMBNAIL_SIZE = 56
const THUMBNAIL_SCALE = THUMBNAIL_SIZE / 1080

function TemplateThumbnail({ name }) {
  const Component = THUMBNAIL_COMPONENTS[name]
  return (
    <div
      className="rounded-lg overflow-hidden flex-shrink-0 border border-white/10"
      style={{ width: THUMBNAIL_SIZE, height: THUMBNAIL_SIZE }}
    >
      <div
        style={{
          transform: `scale(${THUMBNAIL_SCALE})`,
          transformOrigin: 'top left',
          width: 1080,
          height: 1080,
        }}
      >
        <Component fields={THUMBNAIL_FIELDS[name]} />
      </div>
    </div>
  )
}

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
                'flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
                templateType === t.value
                  ? 'border-brand-green bg-brand-green/10 text-brand-green'
                  : 'border-white/10 bg-white/5 text-slate-400 hover:border-slate-500 hover:text-slate-200'
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
                'w-full flex items-center gap-3 p-3 rounded-2xl border text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
                templateName === t.value
                  ? 'border-brand-green bg-brand-green/10 text-brand-green'
                  : 'border-white/10 bg-white/5 text-slate-400 hover:border-slate-500 hover:text-slate-200'
              )}
            >
              <TemplateThumbnail name={t.value} />
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
      <div className="pt-2 border-t border-white/5">
        <p className="text-xs text-slate-400">
          Plantilla activa:{' '}
          <span className="text-brand-green font-medium capitalize">
            {templateType} {templateName}
          </span>
        </p>
      </div>
    </div>
  )
}
