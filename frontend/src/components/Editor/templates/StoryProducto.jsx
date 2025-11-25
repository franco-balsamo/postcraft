import useEditorStore from '../../../store/editorStore'

export default function StoryProducto({ fields: propFields }) {
  const storeFields = useEditorStore((s) => s.fields)
  const fields = propFields || storeFields

  const { nombre, precio, specs = [], badge } = fields

  return (
    <div
      style={{
        width: '1080px',
        height: '1920px',
        background: '#0a0e1a',
        position: 'relative',
        fontFamily: "'Inter', system-ui, sans-serif",
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Background glow top */}
      <div
        style={{
          position: 'absolute',
          top: '-5%',
          right: '-10%',
          width: '700px',
          height: '700px',
          background: 'radial-gradient(circle, rgba(0,255,136,0.15) 0%, transparent 70%)',
          borderRadius: '50%',
        }}
      />
      {/* Background glow bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: '5%',
          left: '-10%',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(0,212,255,0.12) 0%, transparent 70%)',
          borderRadius: '50%',
        }}
      />

      {/* Grid lines */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      {/* Left accent bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '6px',
          height: '100%',
          background: 'linear-gradient(180deg, #00ff88, #00d4ff, transparent)',
        }}
      />

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          padding: '100px 80px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #00ff88, #00d4ff)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ color: '#0a0e1a', fontWeight: 900, fontSize: '18px' }}>FT</span>
            </div>
            <div>
              <p style={{ color: '#ffffff', fontSize: '26px', fontWeight: 700 }}>FEB TECH STORE</p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '20px' }}>@febtechstore</p>
            </div>
          </div>

          <div
            style={{
              padding: '10px 24px',
              background: 'linear-gradient(135deg, #00ff88, #00d4ff)',
              borderRadius: '100px',
            }}
          >
            <span style={{ color: '#0a0e1a', fontWeight: 900, fontSize: '22px', letterSpacing: '2px' }}>
              {badge || 'NUEVO'}
            </span>
          </div>
        </div>

        {/* Center content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '48px', padding: '60px 0' }}>
          {/* Label */}
          <p
            style={{
              color: 'rgba(255,255,255,0.4)',
              fontSize: '24px',
              fontWeight: 500,
              letterSpacing: '5px',
              textTransform: 'uppercase',
            }}
          >
            Producto destacado
          </p>

          {/* Product name */}
          <h1
            style={{
              color: '#ffffff',
              fontSize: nombre && nombre.length > 15 ? '90px' : '110px',
              fontWeight: 900,
              lineHeight: 1.0,
              letterSpacing: '-3px',
            }}
          >
            {nombre || 'Nombre del Producto'}
          </h1>

          {/* Divider */}
          <div
            style={{
              width: '160px',
              height: '4px',
              background: 'linear-gradient(90deg, #00ff88, #00d4ff)',
              borderRadius: '2px',
            }}
          />

          {/* Price */}
          <div>
            <p
              style={{
                color: 'rgba(255,255,255,0.4)',
                fontSize: '22px',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}
            >
              Precio especial
            </p>
            <p
              style={{
                fontSize: '140px',
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

          {/* Specs */}
          {specs.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {specs.map((spec, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px 24px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(0,255,136,0.15)',
                  }}
                >
                  <div
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #00ff88, #00d4ff)',
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ color: '#e2e8f0', fontSize: '28px', fontWeight: 500 }}>{spec}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CTA Footer */}
        <div
          style={{
            padding: '40px 48px',
            background: 'rgba(0,255,136,0.06)',
            border: '1px solid rgba(0,255,136,0.2)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '22px', marginBottom: '6px' }}>
              Disponible ahora
            </p>
            <p style={{ color: '#ffffff', fontSize: '32px', fontWeight: 700 }}>
              Desliza para ver
            </p>
          </div>
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #00ff88, #00d4ff)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ color: '#0a0e1a', fontSize: '32px' }}>→</span>
          </div>
        </div>
      </div>
    </div>
  )
}
