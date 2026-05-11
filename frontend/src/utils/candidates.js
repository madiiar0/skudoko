export const CANDIDATE_VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9]

function normalizeCandidateValue(value) {
  const number = Number(value)
  return Number.isInteger(number) && number >= 1 && number <= 9 ? number : null
}

function normalizeCandidateCell(cell) {
  if (!Array.isArray(cell)) {
    return []
  }

  return [...new Set(cell.map(normalizeCandidateValue).filter(value => value !== null))]
    .sort((a, b) => a - b)
}

export function createEmptyCandidates() {
  return Array.from({ length: 9 }, () => (
    Array.from({ length: 9 }, () => [])
  ))
}

export function normalizeCandidates(candidates, board = null) {
  const normalizedBoard = Array.isArray(board) ? board : null

  return Array.from({ length: 9 }, (_, row) => (
    Array.from({ length: 9 }, (_, col) => {
      if (normalizedBoard && normalizedBoard[row]?.[col] !== 0) {
        return []
      }

      return normalizeCandidateCell(candidates?.[row]?.[col])
    })
  ))
}

export function getCellCandidates(candidates, row, col) {
  return normalizeCandidateCell(candidates?.[row]?.[col])
}

export function hasCandidateNotes(candidates) {
  return normalizeCandidates(candidates).some(row => row.some(cell => cell.length > 0))
}

export function toggleCandidate(candidates, row, col, value) {
  const number = normalizeCandidateValue(value)
  const nextCandidates = normalizeCandidates(candidates)

  if (number === null || row < 0 || row > 8 || col < 0 || col > 8) {
    return nextCandidates
  }

  const cellCandidates = new Set(nextCandidates[row][col])
  if (cellCandidates.has(number)) {
    cellCandidates.delete(number)
  } else {
    cellCandidates.add(number)
  }

  nextCandidates[row][col] = [...cellCandidates].sort((a, b) => a - b)
  return nextCandidates
}

export function clearCellCandidates(candidates, row, col) {
  const nextCandidates = normalizeCandidates(candidates)

  if (row >= 0 && row < 9 && col >= 0 && col < 9) {
    nextCandidates[row][col] = []
  }

  return nextCandidates
}
