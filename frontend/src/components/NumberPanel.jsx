import { useState } from 'react'
import { Eraser, Undo2, Lightbulb, RefreshCw } from 'lucide-react'

function IconBtn({ icon: Icon, label, onClick, disabled }) {
  const [hov, setHov] = useState(false)

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      title={label}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        padding: '10px 6px',
        borderRadius: 7,
        background: disabled ? '#111E2E' : hov ? '#25384F' : '#1A2840',
        border: `1px solid ${disabled ? '#172236' : hov ? '#35506A' : '#243450'}`,
        color: disabled ? '#2A3D52' : hov ? '#C8D0DC' : '#7A8699',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.2px',
        flex: 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background 0.15s, color 0.15s, border-color 0.15s',
        minHeight: 54,
      }}
    >
      <Icon size={16} strokeWidth={2} />
      <span>{label}</span>
    </button>
  )
}

function NumBtn({ num, onClick, disabled }) {
  const [hov, setHov] = useState(false)

  return (
    <button
      className="num-btn"
      onClick={() => onClick(num)}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 6,
        background: disabled ? '#111E2E' : hov ? '#2D1E08' : '#1A2840',
        border: `1px solid ${disabled ? '#172236' : hov ? '#FF7A1A' : '#243450'}`,
        color: disabled ? '#2A3D52' : hov ? '#FF7A1A' : '#C8D4E0',
        fontSize: 19,
        fontWeight: 700,
        aspectRatio: '1',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background 0.12s, color 0.12s, border-color 0.12s',
        width: '100%',
      }}
    >
      {num}
    </button>
  )
}

export default function NumberPanel({ onNumber, onRemove, onUndo, onNewGame, canUndo, hasSelection, disabled = false }) {
  const [newHov, setNewHov] = useState(false)

  return (
    <div className="controls-panel">
      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 7 }}>
        <IconBtn icon={Eraser} label="Remove" onClick={onRemove} disabled={disabled || !hasSelection} />
        <IconBtn icon={Undo2} label="Back" onClick={onUndo} disabled={disabled || !canUndo} />
        <IconBtn icon={Lightbulb} label="Tip" onClick={() => {}} disabled={disabled} />
      </div>

      {/* Number pad — layout controlled by .num-grid CSS (responsive) */}
      <div className="num-grid">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
          <NumBtn key={n} num={n} onClick={onNumber} disabled={disabled} />
        ))}
      </div>

      {/* New Game */}
      <button
        onClick={onNewGame}
        onMouseEnter={() => setNewHov(true)}
        onMouseLeave={() => setNewHov(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          padding: '13px',
          borderRadius: 7,
          background: newHov
            ? 'linear-gradient(135deg, #FF8A2A 0%, #FF5C00 100%)'
            : 'linear-gradient(135deg, #FF7A1A 0%, #FF3D00 100%)',
          color: '#fff',
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: '0.2px',
          boxShadow: newHov ? '0 4px 18px rgba(255,122,26,0.45)' : '0 4px 18px rgba(255,122,26,0.28)',
          transition: 'background 0.15s, box-shadow 0.15s',
          width: '100%',
        }}
      >
        <RefreshCw size={15} strokeWidth={2.5} />
        New Game
      </button>
    </div>
  )
}
