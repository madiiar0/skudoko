export default function NewGameConfirmModal({ isStarting, onCancel, onConfirm }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <div className="history-modal" role="dialog" aria-modal="true">
        <h2>Start a new game?</h2>
        <p>
          Your current progress will be saved in History before a separate new Sudoku session starts.
        </p>

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
