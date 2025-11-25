import useEditorStore from '../../../store/editorStore'

export default function StoryOferta({ fields: propFields }) {
  const storeFields = useEditorStore((s) => s.fields)
  const fields = propFields || storeFields

  const { descuento, codigo, vigencia, nombre } = fields

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
      {/* Glow effects */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '900px',
          height: '900px',
          background: 'radial-gradient(circle, rgba(0,255,136,0.1) 0%, transparent 65%)',
          borderRadius: '50%',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '10%',
          right: '-10%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(0,212,255,0.1) 0%, transparent 65%)',
          borderRadius: '50%',
        }}
      />

      {/* Top gradient bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '6px',
          background: 'linear-gradient(90deg, #00ff88, #00d4ff)',
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
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #00ff88, #00d4ff)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ color: '#0a0e1a', fontWeight: 900, fontSize: '16px' }}>FT</span>
            </div>
            <p style={{ color: '#ffffff', fontSize: '28px', fontWeight: 700 }}>FEB TECH STORE</p>
          </div>

          <p
            style={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: '26px',
              fontWeight: 600,
              letterSpacing: '6px',
              textTransform: 'uppercase',
            }}
          >
            OFERTA FLASH
          </p>

          {nombre && (
            <p style={{ color: '#e2e8f0', fontSize: '32px', fontWeight: 500 }}>{nombre}</p>
          )}
        </div>

        {/* Big discount */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <p
            style={{
              color: 'rgba(255,255,255,0.3)',
              fontSize: '28px',
              fontWeight: 600,
              letterSpacing: '8px',
              textTransform: 'uppercase',
            }}
          >
            AHORRÁS
          </p>
          <p
            style={{
              fontSize: '320px',
              fontWeight: 900,
              lineHeight: 0.85,
              background: 'linear-gradient(135deg, #00ff88, #00d4ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-15px',
            }}
          >
            {(descuento || '20%').replace('%', '')}%
          </p>
          <p
            style={{
              color: 'rgba(255,255,255,0.3)',
              fontSize: '28px',
              fontWeight: 600,
              letterSpacing: '6px',
              textTransform: 'uppercase',
            }}
          >
            EN TU COMPRA
          </p>
        </div>

        {/* Code block */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px', width: '100%' }}>
          {codigo && (
            <div
              style={{
                padding: '32px 80px',
                border: '2px dashed rgba(0,255,136,0.4)',
                borderRadius: '20px',
                background: 'rgba(0,255,136,0.04)',
              }}
            >
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '22px', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '12px' }}>
                Usá el código
              </p>
              <p
                style={{
                  color: '#00ff88',
                  fontSize: '80px',
                  fontWeight: 900,
                  letterSpacing: '10px',
                  fontFamily: 'monospace',
                }}
              >
                {codigo}
              </p>
            </div>
          )}

          {vigencia && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px 32px',
                borderRadius: '12px',
                background: 'rgba(255,220,0,0.06)',
                border: '1px solid rgba(255,220,0,0.2)',
              }}
            >
              <span style={{ fontSize: '28px' }}>⏰</span>
              <p style={{ color: '#fde68a', fontSize: '26px', fontWeight: 600 }}>{vigencia}</p>
            </div>
          )}

          {/* WhatsApp CTA */}
          <div
            style={{
              width: '100%',
              padding: '36px 48px',
              background: 'linear-gradient(135deg, rgba(0,255,136,0.1), rgba(0,212,255,0.1))',
              border: '1px solid rgba(0,255,136,0.25)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ textAlign: 'left' }}>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '22px', marginBottom: '8px' }}>
                Consultas por WhatsApp
              </p>
              <p style={{ color: '#ffffff', fontSize: '36px', fontWeight: 700 }}>
                Escribinos ahora
              </p>
            </div>
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: '#25D366',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '40px',
              }}
            >
              💬
            </div>
          </div>

          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '20px' }}>@febtechstore</p>
        </div>
      </div>
    </div>
  )
}
