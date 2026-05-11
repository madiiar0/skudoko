import { useState } from 'react'
import { CheckCircle2, Eraser, Undo2, Lightbulb, RefreshCw } from 'lucide-react'

function IconBtn({ icon: Icon, label, onClick, disabled, badge }) {
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
        position: 'relative',
      }}
    >
      {badge ? (
        <span
          className="tip-badge"
          style={{
            position: 'absolute',
            top: -7,
            right: -7,
            minWidth: 18,
            height: 18,
            padding: '0 5px',
            borderRadius: 999,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: disabled ? '#172236' : '#FF7A1A',
            color: disabled ? '#4A5568' : '#fff',
            fontSize: 10,
            fontWeight: 800,
            lineHeight: 1,
            boxShadow: '0 2px 8px rgba(2, 7, 16, 0.38)',
            zIndex: 2,
          }}
        >
          {badge}
        </span>
      ) : null}
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

function WideActionButton({ icon: Icon, label, onClick, disabled = false, variant = 'primary' }) {
  const [hov, setHov] = useState(false)
  const primary = variant === 'primary'

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: '13px',
        borderRadius: 7,
        background: disabled
          ? '#111E2E'
          : primary
            ? hov
              ? 'linear-gradient(135deg, #FF8A2A 0%, #FF5C00 100%)'
              : 'linear-gradient(135deg, #FF7A1A 0%, #FF3D00 100%)'
            : hov
              ? '#25384F'
              : '#1A2840',
        border: primary
          ? '1px solid transparent'
          : `1px solid ${disabled ? '#172236' : hov ? '#35506A' : '#243450'}`,
        color: disabled ? '#2A3D52' : primary ? '#fff' : '#C8D4E8',
        fontSize: 14,
        fontWeight: 700,
        letterSpacing: '0.2px',
        boxShadow: primary && !disabled
          ? hov
            ? '0 4px 18px rgba(255,122,26,0.45)'
            : '0 4px 18px rgba(255,122,26,0.28)'
          : 'none',
        transition: 'background 0.15s, box-shadow 0.15s, color 0.15s, border-color 0.15s',
        width: '100%',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      <Icon size={15} strokeWidth={2.5} />
      {label}
    </button>
  )
}

export default function NumberPanel({
  onNumber,
  onRemove,
  onTip,
  onUndo,
  onNewGame,
  onCheckAnswer,
  canUndo,
  hasSelection,
  tipBadge,
  disabled = false,
  checking = false,
}) {
  return (
    <div className="controls-panel">
      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 7 }}>
        <IconBtn icon={Eraser} label="Remove" onClick={onRemove} disabled={disabled || !hasSelection} />
        <IconBtn icon={Undo2} label="Back" onClick={onUndo} disabled={disabled || !canUndo} />
        <IconBtn icon={Lightbulb} label="Tip" onClick={onTip} disabled={disabled} badge={tipBadge} />
      </div>

      {/* Number pad — layout controlled by .num-grid CSS (responsive) */}
      <div className="num-grid">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
          <NumBtn key={n} num={n} onClick={onNumber} disabled={disabled} />
        ))}
      </div>

      <WideActionButton
        icon={CheckCircle2}
        label={checking ? 'Checking...' : 'Check the Answer'}
        onClick={onCheckAnswer}
        disabled={disabled || checking}
        variant="secondary"
      />

      <WideActionButton
        icon={RefreshCw}
        label="New Game"
        onClick={onNewGame}
      />
    </div>
  )
}
