import { DIFFICULTY_OPTIONS } from '../../utils/difficulty'

export default function NewGameConfirmModal({ difficulty, isStarting, onCancel, onConfirm, onDifficultyChange }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <div className="history-modal" role="dialog" aria-modal="true">
        <h2>Start a new game?</h2>
        <p>
          Your current progress will be saved in History before a separate new Sudoku session starts.
        </p>

        <label className="auth-field">
          <span className="auth-label">Difficulty</span>
          <select
            className="auth-input"
            value={difficulty}
            onChange={event => onDifficultyChange(event.target.value)}
            disabled={isStarting}
          >
            {DIFFICULTY_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="history-modal-actions">
          <button
            className="history-modal-secondary"
            type="button"
            onClick={onCancel}
            disabled={isStarting}
          >
            Cancel
          </button>
          <button
            className="history-action"
            type="button"
            onClick={onConfirm}
            disabled={isStarting}
          >
            {isStarting ? 'Starting...' : 'Start New Game'}
          </button>
        </div>
      </div>
    </div>
  )
}
