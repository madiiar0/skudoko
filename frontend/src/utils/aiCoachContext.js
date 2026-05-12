function cloneMatrix(matrix) {
  return Array.isArray(matrix)
    ? matrix.map(row => (
        Array.isArray(row)
          ? row.map(cell => Array.isArray(cell) ? [...cell] : cell)
          : []
      ))
    : null
}

function selectedToObject(selected) {
  return Array.isArray(selected) && selected.length === 2
    ? { row: selected[0], col: selected[1] }
    : null
}

export function createAICoachGameContext({
  gameType = 'normal',
  session,
  selected,
  viewOnly = false,
}) {
  if (!session) {
    return null
  }

  return {
    gameType,
    sessionId: session.sessionId || '',
    challengeId: session.challengeId || '',
    difficulty: session.difficulty || 'medium',
    board: cloneMatrix(session.board),
    puzzle: cloneMatrix(session.puzzle),
    solution: cloneMatrix(session.solution),
    locked: cloneMatrix(session.locked),
    candidates: cloneMatrix(session.candidates),
    selectedCell: selectedToObject(selected),
    tipCells: Array.isArray(session.tipCells) ? session.tipCells.map(cell => ({ row: cell.row, col: cell.col })) : [],
    mistakeCount: session.mistakeCount || 0,
    tipsUsed: session.tipsUsed || 0,
    moveCount: Array.isArray(session.history) ? session.history.length : 0,
    status: session.status || 'unfinished',
    elapsedSeconds: session.elapsedSeconds || 0,
    viewOnly: viewOnly || session.status === 'completed',
  }
}
