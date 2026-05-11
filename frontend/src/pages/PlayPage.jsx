import { Link } from 'react-router-dom'

import SudokuGrid from '../components/SudokuGrid'
import NumberPanel from '../components/NumberPanel'
import PageTopbar from '../components/PageTopbar'
import CompletionConfetti from './play/CompletionConfetti'
import NewGameConfirmModal from './play/NewGameConfirmModal'
import TipAdModal from './play/TipAdModal'
import { usePlayPageController } from './play/usePlayPageController'

export default function PlayPage() {
  const {
    session,
    selected,
    errorCell,
    isLoading,
    loadError,
    isCheckingAnswer,
    showNewGameConfirm,
    showTipAd,
    isStartingNewGame,
    isExploding,
    selectedDifficulty,
    inputMode,
    tipBadge,
    viewOnly,
    hasEditableSelection,
    handleSelect,
    handleNumber,
    handleRemove,
    handleTip,
    handleUndo,
    handleCheckAnswer,
    handleNewGame,
    handleConfirmNewGame,
    handleCancelNewGame,
    handleCloseTipAd,
    handleDifficultyChange,
    handleInputModeChange,
    stopConfetti,
  } = usePlayPageController()

  if (isLoading && !session) {
    return (
      <div className="play-page">
        <PageTopbar title="Loading game" subtitle="Restoring your latest saved Sudoku session." />
        <div className="history-empty">Loading saved game...</div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="play-page">
        <PageTopbar title="Game unavailable" subtitle="That saved game could not be loaded for this account." />
        <div className="history-empty">
          <h2>Unable to open session</h2>
          <p>{loadError}</p>
          <Link className="history-action" to="/history">
            Back to History
          </Link>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="play-page">
      <PageTopbar
        title="Play the Sudoku"
        subtitle={
          viewOnly
            ? 'This completed game is open in view-only mode.'
            : 'Select a cell and fill it with a number. Use Remove to clear, Back to undo, and Tip for a hint.'
        }
      />

      <div className="game-area">
        {isExploding ? <CompletionConfetti onComplete={stopConfetti} /> : null}

        <SudokuGrid
          board={session.board}
          locked={session.locked}
          candidates={session.candidates}
          tipCells={session.tipCells}
          selected={selected}
          onSelect={handleSelect}
          error={errorCell}
        />
        <div className="play-controls-stack">
          <p className="mistake-count">Mistakes: {session.mistakeCount || 0} | Tips used: {session.tipsUsed || 0}</p>
          <NumberPanel
            onNumber={handleNumber}
            onRemove={handleRemove}
            onTip={handleTip}
            onUndo={handleUndo}
            onNewGame={handleNewGame}
            onCheckAnswer={handleCheckAnswer}
            canUndo={!viewOnly && session.history.length > 0}
            hasSelection={hasEditableSelection}
            tipBadge={tipBadge}
            inputMode={inputMode}
            onInputModeChange={handleInputModeChange}
            disabled={viewOnly}
            checking={isCheckingAnswer}
          />
        </div>
      </div>

      {session.status === 'completed' ? (
        <div className="completion-banner">
          Puzzle solved! Start a New Game to play again.
        </div>
      ) : null}

      {showNewGameConfirm ? (
        <NewGameConfirmModal
          isStarting={isStartingNewGame}
          difficulty={selectedDifficulty}
          onDifficultyChange={handleDifficultyChange}
          onCancel={handleCancelNewGame}
          onConfirm={handleConfirmNewGame}
        />
      ) : null}

      {showTipAd ? <TipAdModal onClose={handleCloseTipAd} /> : null}
    </div>
  )
}
