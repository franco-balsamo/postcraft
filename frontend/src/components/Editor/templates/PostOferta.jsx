import useEditorStore from '../../../store/editorStore'

export default function PostOferta({ fields: propFields }) {
  const storeFields = useEditorStore((s) => s.fields)
  const fields = propFields || storeFields

  const { descuento, codigo, vigencia, nombre } = fields

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
      {/* Hot background effect */}
      <div
        style={{
          position: 'absolute',
          top: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '800px',
          height: '800px',
          background: 'radial-gradient(circle, rgba(0,255,136,0.08) 0%, transparent 60%)',
          borderRadius: '50%',
        }}
      />

      {/* Diagonal stripe accents */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '300px',
          height: '300px',
          background: 'linear-gradient(135deg, transparent 50%, rgba(0,255,136,0.05) 50%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '300px',
          height: '300px',
          background: 'linear-gradient(315deg, transparent 50%, rgba(0,212,255,0.05) 50%)',
        }}
      />

      {/* Top bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '6px',
          background: 'linear-gradient(90deg, #00ff88, #00d4ff, #00ff88)',
        }}
      />

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          padding: '80px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          textAlign: 'center',
        }}
      >
        {/* Top label */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <p
            style={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: '24px',
              fontWeight: 600,
              letterSpacing: '6px',
              textTransform: 'uppercase',
            }}
          >
            OFERTA ESPECIAL
          </p>
          {nombre && (
            <p style={{ color: '#e2e8f0', fontSize: '28px', fontWeight: 500 }}>{nombre}</p>
          )}
        </div>

        {/* Big discount number */}
        <div style={{ position: 'relative' }}>
          <p
            style={{
              fontSize: '300px',
              fontWeight: 900,
              lineHeight: 0.85,
              background: 'linear-gradient(135deg, #00ff88, #00d4ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-10px',
            }}
          >
            {(descuento || '20%').replace('%', '')}
          </p>
          <p
            style={{
              position: 'absolute',
              right: '-20px',
              top: '40px',
              fontSize: '80px',
              fontWeight: 900,
              background: 'linear-gradient(135deg, #00ff88, #00d4ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            %
          </p>
          <p
            style={{
              color: 'rgba(255,255,255,0.3)',
              fontSize: '32px',
              fontWeight: 600,
              letterSpacing: '8px',
              textTransform: 'uppercase',
              marginTop: '8px',
            }}
          >
            DE DESCUENTO
          </p>
        </div>

        {/* Code + vigencia */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', width: '100%' }}>
          {codigo && (
            <div
              style={{
                display: 'inline-flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                padding: '24px 60px',
                border: '2px solid rgba(0,255,136,0.4)',
                borderRadius: '16px',
                background: 'rgba(0,255,136,0.05)',
                position: 'relative',
              }}
            >
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '18px', letterSpacing: '4px', textTransform: 'uppercase' }}>
                Código de descuento
              </p>
              <p
                style={{
                  color: '#00ff88',
                  fontSize: '64px',
                  fontWeight: 900,
                  letterSpacing: '8px',
                  fontFamily: 'monospace',
                }}
              >
                {codigo}
              </p>
            </div>
          )}

          {vigencia && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '1px', background: 'rgba(255,255,255,0.2)' }} />
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '22px', fontWeight: 500 }}>
                {vigencia}
              </p>
              <div style={{ width: '40px', height: '1px', background: 'rgba(255,255,255,0.2)' }} />
            </div>
          )}

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              paddingTop: '24px',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              width: '100%',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #00ff88, #00d4ff)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ color: '#0a0e1a', fontWeight: 900, fontSize: '14px' }}>FT</span>
            </div>
            <p style={{ color: '#ffffff', fontSize: '22px', fontWeight: 700 }}>FEB TECH STORE</p>
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '18px' }}>•</p>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '18px' }}>@febtechstore</p>
          </div>
        </div>
      </div>
    </div>
  )
}
