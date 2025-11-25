import { useState } from 'react'
import useEditorStore from '../../store/editorStore'
import Input, { Textarea } from '../UI/Input'
import Button from '../UI/Button'

const BADGE_OPTIONS = ['NUEVO', 'REACONDICIONADO', 'OFERTA', 'DESTACADO', 'AGOTADO']

export default function FieldsPanel() {
  const { templateType, templateName, fields, setField, addSpec, removeSpec } = useEditorStore()
  const [newSpec, setNewSpec] = useState('')

  const isProducto = templateName === 'producto'
  const isOferta = templateName === 'oferta'
  const isTip = templateName === 'tip'

  const handleAddSpec = () => {
    const trimmed = newSpec.trim()
    if (!trimmed) return
    addSpec(trimmed)
    setNewSpec('')
  }

  const handleSpecKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddSpec()
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
          Contenido del diseño
        </p>
      </div>

      {/* Producto fields */}
      {isProducto && (
        <>
          <Input
            label="Nombre del producto"
            value={fields.nombre || ''}
            onChange={(e) => setField('nombre', e.target.value)}
            placeholder="iPhone 15 Pro"
          />

          <Input
            label="Precio"
            value={fields.precio || ''}
            onChange={(e) => setField('precio', e.target.value)}
            placeholder="$999"
          />

          {/* Badge selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Badge</label>
            <div className="flex flex-wrap gap-2">
              {BADGE_OPTIONS.map((b) => (
                <button
                  key={b}
                  onClick={() => setField('badge', b)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold border transition-all ${
                    fields.badge === b
                      ? 'border-brand-green bg-brand-green/10 text-brand-green'
                      : 'border-brand-border text-slate-400 hover:border-slate-500'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
            <Input
              inputClassName="text-xs"
              value={fields.badge || ''}
              onChange={(e) => setField('badge', e.target.value)}
              placeholder="O escribe uno personalizado..."
            />
          </div>

          {/* Specs */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              Especificaciones
            </label>

            {(fields.specs || []).map((spec, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 bg-brand-navy border border-brand-border rounded-lg px-3 py-2">
                  <span className="text-brand-green text-xs">✓</span>
                  <span className="text-sm text-slate-200">{spec}</span>
                </div>
                <button
                  onClick={() => removeSpec(i)}
                  className="text-slate-600 hover:text-red-400 transition-colors p-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}

            <div className="flex gap-2">
              <input
                type="text"
                value={newSpec}
                onChange={(e) => setNewSpec(e.target.value)}
                onKeyDown={handleSpecKeyDown}
                placeholder="Agregar especificación..."
                className="flex-1 bg-brand-navy border border-brand-border rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-green/40 focus:border-brand-green"
              />
              <Button
                onClick={handleAddSpec}
                variant="secondary"
                size="sm"
                className="flex-shrink-0"
              >
                +
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Oferta fields */}
      {isOferta && (
        <>
          <Input
            label="Nombre del producto (opcional)"
            value={fields.nombre || ''}
            onChange={(e) => setField('nombre', e.target.value)}
            placeholder="iPhone 15 Pro"
          />

          <Input
            label="Porcentaje de descuento"
            value={fields.descuento || ''}
            onChange={(e) => setField('descuento', e.target.value)}
            placeholder="20%"
          />

          <Input
            label="Código de descuento"
            value={fields.codigo || ''}
            onChange={(e) => setField('codigo', e.target.value)}
            placeholder="FEB20"
          />

          <Input
            label="Vigencia"
            value={fields.vigencia || ''}
            onChange={(e) => setField('vigencia', e.target.value)}
            placeholder="Hasta el 31/03"
          />
        </>
      )}

      {/* Tip fields */}
      {isTip && (
        <Textarea
          label="Tip / consejo"
          value={fields.tip || ''}
          onChange={(e) => setField('tip', e.target.value)}
          placeholder="Escribe el tip aquí..."
          rows={5}
        />
      )}

      {/* Common: if none of the above matched, show a hint */}
      {!isProducto && !isOferta && !isTip && (
        <div className="text-sm text-slate-500 text-center py-4">
          Selecciona un tipo de contenido para editar los campos.
        </div>
      )}
    </div>
  )
}
