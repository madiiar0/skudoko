import { useState } from 'react'
import { CheckCircle2, Eraser, Undo2, Lightbulb, RefreshCw, InfinityIcon } from 'lucide-react'

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
        background: disabled ? 'var(--btn-disabled-bg)' : hov ? 'var(--btn-bg-hover)' : 'var(--btn-bg)',
        border: `1px solid ${disabled ? 'var(--btn-disabled-border)' : hov ? 'var(--border-strong)' : 'var(--btn-border)'}`,
        color: disabled ? 'var(--btn-disabled-text)' : hov ? 'var(--nav-hover-text)' : 'var(--text-secondary)',
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
            background: disabled ? 'var(--btn-disabled-border)' : 'var(--accent)',
            color: disabled ? 'var(--text-muted)' : 'var(--text-inverse)',
            fontSize: 10,
            fontWeight: 800,
            lineHeight: 1,
            boxShadow: '0 2px 8px var(--btn-shadow)',
            zIndex: 2,
          }}
        >
          {badge === 'infinity' ? <InfinityIcon size={12} strokeWidth={2.6} /> : badge}
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
        background: disabled ? 'var(--btn-disabled-bg)' : hov ? 'var(--btn-warning-hover)' : 'var(--btn-bg)',
        border: `1px solid ${disabled ? 'var(--btn-disabled-border)' : hov ? 'var(--accent)' : 'var(--btn-border)'}`,
        color: disabled ? 'var(--btn-disabled-text)' : hov ? 'var(--accent)' : 'var(--btn-secondary-text)',
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

function ModeSwitcher({ inputMode, onInputModeChange, disabled }) {
  const modes = [
    { value: 'normal', label: 'Normal' },
    { value: 'candidate', label: 'Candidate' },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 7 }}>
      {modes.map(mode => {
        const active = inputMode === mode.value

        return (
          <button
            key={mode.value}
            type="button"
            disabled={disabled}
            onClick={() => onInputModeChange(mode.value)}
            style={{
              minHeight: 32,
              borderRadius: 7,
              border: `1px solid ${active ? 'var(--accent)' : 'var(--btn-border)'}`,
              background: active
                ? 'linear-gradient(135deg, var(--accent-soft) 0%, rgba(255,61,0,0.12) 100%)'
                : 'var(--btn-bg)',
              color: disabled ? 'var(--btn-disabled-text)' : active ? 'var(--accent-text)' : 'var(--text-secondary)',
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: '0.2px',
              cursor: disabled ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s, color 0.15s, border-color 0.15s',
            }}
          >
            {mode.label}
          </button>
        )
      })}
    </div>
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
          ? 'var(--btn-disabled-bg)'
          : primary
            ? hov
              ? 'linear-gradient(135deg, var(--accent-hover) 0%, var(--accent-strong) 100%)'
              : 'linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%)'
            : hov
              ? 'var(--btn-bg-hover)'
              : 'var(--btn-bg)',
        border: primary
          ? '1px solid transparent'
          : `1px solid ${disabled ? 'var(--btn-disabled-border)' : hov ? 'var(--border-strong)' : 'var(--btn-border)'}`,
        color: disabled ? 'var(--btn-disabled-text)' : primary ? 'var(--text-inverse)' : 'var(--btn-secondary-text)',
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
  inputMode = 'normal',
  onInputModeChange,
  showNewGame = true,
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

      <ModeSwitcher
        inputMode={inputMode}
        onInputModeChange={onInputModeChange}
        disabled={disabled}
      />

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

      {showNewGame ? (
        <WideActionButton
          icon={RefreshCw}
          label="New Game"
          onClick={onNewGame}
        />
      ) : null}
    </div>
  )
}
