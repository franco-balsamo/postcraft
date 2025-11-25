import useEditorStore from '../../../store/editorStore'

export default function PostProducto({ fields: propFields, preview = false }) {
  const storeFields = useEditorStore((s) => s.fields)
  const fields = propFields || storeFields

  const { nombre, precio, specs = [], badge } = fields

  return (
    <div
      style={{
        width: '1080px',
        height: '1080px',
        background: '#0a0e1a',
        position: 'relative',
        fontFamily: "'Inter', system-ui, sans-serif",
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Background glow effects */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(0,255,136,0.12) 0%, transparent 70%)',
          borderRadius: '50%',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-20%',
          left: '-10%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(0,212,255,0.10) 0%, transparent 70%)',
          borderRadius: '50%',
        }}
      />

      {/* Top accent line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #00ff88, #00d4ff)',
        }}
      />

      {/* Grid lines decoration */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      {/* Main content */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          padding: '80px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {/* Header: badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 20px',
              background: 'linear-gradient(135deg, #00ff88, #00d4ff)',
              borderRadius: '100px',
            }}
          >
            <span
              style={{
                color: '#0a0e1a',
                fontSize: '24px',
                fontWeight: 900,
                letterSpacing: '2px',
                textTransform: 'uppercase',
              }}
            >
              {badge || 'NUEVO'}
            </span>
          </div>

          {/* Tech circuit decoration */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', opacity: 0.3 }}>
            {[60, 40, 80].map((w, i) => (
              <div
                key={i}
                style={{
                  height: '2px',
                  width: `${w}px`,
                  background: 'linear-gradient(90deg, #00ff88, transparent)',
                  borderRadius: '1px',
                }}
              />
            ))}
          </div>
        </div>

        {/* Center: product name + price */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '32px' }}>
          {/* Product name */}
          <div>
            <p
              style={{
                color: 'rgba(255,255,255,0.4)',
                fontSize: '22px',
                fontWeight: 500,
                letterSpacing: '4px',
                textTransform: 'uppercase',
                marginBottom: '16px',
              }}
            >
              Producto destacado
            </p>
            <h1
              style={{
                color: '#ffffff',
                fontSize: nombre && nombre.length > 20 ? '72px' : '88px',
                fontWeight: 900,
                lineHeight: 1.05,
                letterSpacing: '-2px',
              }}
            >
              {nombre || 'Nombre del Producto'}
            </h1>
          </div>

          {/* Divider with gradient */}
          <div
            style={{
              width: '120px',
              height: '3px',
              background: 'linear-gradient(90deg, #00ff88, #00d4ff)',
              borderRadius: '2px',
            }}
          />

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div>
              <p
                style={{
                  color: 'rgba(255,255,255,0.4)',
                  fontSize: '18px',
                  fontWeight: 400,
                  marginBottom: '4px',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                }}
              >
                Precio
              </p>
              <p
                style={{
                  fontSize: '96px',
                  fontWeight: 900,
                  lineHeight: 1,
                  background: 'linear-gradient(135deg, #00ff88, #00d4ff)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {precio || '$0'}
              </p>
            </div>
          </div>

          {/* Specs */}
          {specs.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {specs.map((spec, i) => (
                <div
                  key={i}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(0,255,136,0.2)',
                    color: '#e2e8f0',
                    fontSize: '20px',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span style={{ color: '#00ff88', fontWeight: 700 }}>✓</span>
                  {spec}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer: brand */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '32px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #00ff88, #00d4ff)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ color: '#0a0e1a', fontWeight: 900, fontSize: '16px' }}>FT</span>
            </div>
            <div>
              <p style={{ color: '#ffffff', fontSize: '22px', fontWeight: 700, lineHeight: 1.2 }}>
                FEB TECH STORE
              </p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '16px', fontWeight: 400 }}>
                Tecnología de calidad
              </p>
            </div>
          </div>

          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '16px' }}>@febtechstore</p>
        </div>
      </div>
    </div>
  )
}
