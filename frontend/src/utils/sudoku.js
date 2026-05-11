import { getSudoku } from 'sudoku-gen'

import { DEFAULT_DIFFICULTY, getSudokuGenDifficulty, normalizeDifficulty } from './difficulty.js'

function normalizeCell(value) {
  if (value === null || value === undefined || value === '') return 0
  if (typeof value === 'boolean') return NaN

  const number = typeof value === 'number' ? value : Number(String(value).trim())
  return Number.isInteger(number) && number >= 0 && number <= 9 ? number : NaN
}

export function normalizeBoard(board) {
  if (!Array.isArray(board) || board.length !== 9) return null

  const normalized = board.map(row => {
    if (!Array.isArray(row) || row.length !== 9) return null

    const normalizedRow = row.map(normalizeCell)
    return normalizedRow.some(Number.isNaN) ? null : normalizedRow
  })

  return normalized.some(row => row === null) ? null : normalized
}

export function parseSudokuString(value, options = {}) {
  const allowEmpty = options.allowEmpty ?? true
  const emptyValue = options.emptyValue ?? 0
  const source = String(value || '')

  if (source.length !== 81) {
    throw new Error('Sudoku grid must contain exactly 81 cells.')
  }

  return Array.from({ length: 9 }, (_, row) => (
    Array.from({ length: 9 }, (_, col) => {
      const char = source[row * 9 + col]

      if (char === '-') {
        if (!allowEmpty) {
          throw new Error('Sudoku solution cannot contain empty cells.')
        }

        return emptyValue
      }

      if (!/^[1-9]$/.test(char)) {
        throw new Error('Sudoku grid contains an invalid cell value.')
      }

      return Number(char)
    })
  ))
}

export function generatePuzzle(options = DEFAULT_DIFFICULTY) {
  const difficulty = normalizeDifficulty(
    typeof options === 'string' ? options : options?.difficulty,
  )
  const generated = getSudoku(getSudokuGenDifficulty(difficulty))

  return {
    puzzle: parseSudokuString(generated.puzzle, { allowEmpty: true, emptyValue: 0 }),
    solution: parseSudokuString(generated.solution, { allowEmpty: false }),
  }
}

export function validateMove(solution, row, col, num) {
  const normalizedSolution = normalizeBoard(solution)
  const number = normalizeCell(num)

  if (!normalizedSolution || Number.isNaN(number) || number < 1 || number > 9) {
    return false
  }

  return normalizedSolution[row]?.[col] === number
}

export function isBoardFilled(board) {
  const normalized = normalizeBoard(board)

  return !!normalized && normalized.every(row => row.every(value => value >= 1 && value <= 9))
}

export function isBoardComplete(board, solution) {
  const normalizedBoard = normalizeBoard(board)
  const normalizedSolution = normalizeBoard(solution)

  if (!normalizedBoard || !normalizedSolution || !isBoardFilled(normalizedSolution)) {
    return false
  }

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (normalizedBoard[r][c] !== normalizedSolution[r][c]) return false
    }
  }

  return true
}

export function isSudokuAnswerCorrect({ board, solution }) {
  return isBoardComplete(board, solution)
}
