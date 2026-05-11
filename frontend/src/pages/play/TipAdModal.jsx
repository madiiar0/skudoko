export default function TipAdModal({ onClose }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <div className="history-modal" role="dialog" aria-modal="true">
        <h2>Watch an ad for more tips</h2>
        <p>
          A rewarded ad would be shown here to unlock more tips. Closing this popup simulates the reward and reveals one helpful cell.
        </p>

        <div className="history-modal-actions">
          <button className="history-modal-secondary" type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
