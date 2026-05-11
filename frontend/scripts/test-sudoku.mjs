import assert from 'node:assert/strict'

import {
  generatePuzzle,
  isSudokuAnswerCorrect,
  parseSudokuString,
  validateMove,
} from '../src/utils/sudoku.js'
import { getSudokuGenDifficulty, normalizeDifficulty } from '../src/utils/difficulty.js'
import { createGameSession, normalizeSession, toSessionPayload } from '../src/utils/gameSessionStorage.js'
import { addTipCell, getTipBadge, isTipCell, normalizeTipCells, sanitizeTipsRemaining } from '../src/utils/tips.js'
import {
  clearCellCandidates,
  createEmptyCandidates,
  getCellCandidates,
  hasCandidateNotes,
  normalizeCandidates,
  toggleCandidate,
} from '../src/utils/candidates.js'

function flatten(board) {
  return board.flat()
}

function cloneBoard(board) {
  return board.map(row => [...row])
}

function nextDifferentDigit(value) {
  return value === 9 ? 1 : value + 1
}

const parsedPuzzle = parseSudokuString('-'.repeat(81), { allowEmpty: true, emptyValue: 0 })
assert.equal(flatten(parsedPuzzle).length, 81)
assert.equal(flatten(parsedPuzzle).every(value => value === 0), true)
assert.throws(() => parseSudokuString('-'.repeat(81), { allowEmpty: false }))
assert.equal(getSudokuGenDifficulty('easy'), 'easy')
assert.equal(getSudokuGenDifficulty('medium'), 'medium')
assert.equal(getSudokuGenDifficulty('hard'), 'hard')
assert.equal(getSudokuGenDifficulty('extreme'), 'expert')
assert.equal(normalizeDifficulty('invalid'), 'medium')
assert.deepEqual(normalizeTipCells([{ row: '0', col: '3' }, { row: 0, col: 3 }, { row: 10, col: 1 }]), [{ row: 0, col: 3 }])
assert.equal(isTipCell(addTipCell([], 4, 8), 4, 8), true)
assert.equal(sanitizeTipsRemaining(undefined), 3)
assert.equal(getTipBadge(0), 'Ad')
assert.equal(getTipBadge(2), '2')

const emptyCandidates = createEmptyCandidates()
assert.equal(emptyCandidates.length, 9)
assert.equal(emptyCandidates.every(row => row.length === 9), true)
assert.deepEqual(getCellCandidates(toggleCandidate(emptyCandidates, 0, 0, 5), 0, 0), [5])
assert.deepEqual(getCellCandidates(toggleCandidate(toggleCandidate(emptyCandidates, 0, 0, 5), 0, 0, 5), 0, 0), [])
assert.deepEqual(normalizeCandidates([[['7', 2, 2, 10, 'x']]])[0][0], [2, 7])
assert.deepEqual(normalizeCandidates([[['2']]], [[1]])[0][0], [])
assert.equal(hasCandidateNotes(emptyCandidates), false)
assert.equal(hasCandidateNotes(toggleCandidate(emptyCandidates, 1, 1, 3)), true)
assert.deepEqual(getCellCandidates(clearCellCandidates(toggleCandidate(emptyCandidates, 1, 1, 3), 1, 1), 1, 1), [])

const generated = generatePuzzle('easy')
assert.equal(generated.puzzle.length, 9)
assert.equal(generated.solution.length, 9)
assert.equal(flatten(generated.puzzle).length, 81)
assert.equal(flatten(generated.solution).length, 81)
assert.equal(flatten(generated.puzzle).some(value => value === 0), true)
assert.equal(flatten(generated.solution).every(value => value >= 1 && value <= 9), true)

const gameSession = createGameSession({ puzzle: generated.puzzle, solution: generated.solution, difficulty: 'easy' })
assert.equal(gameSession.tipsUsed, 0)
assert.equal(normalizeSession({ ...gameSession, tipsUsed: undefined })?.tipsUsed, 0)
assert.equal(toSessionPayload({ ...gameSession, tipsUsed: 3 }).tipsUsed, 3)

const solution = cloneBoard(generated.solution)
const wrongCellValue = nextDifferentDigit(solution[0][0])
assert.equal(validateMove(solution, 0, 0, solution[0][0]), true)
assert.equal(validateMove(solution, 0, 0, wrongCellValue), false)

const solvedBoard = cloneBoard(solution)
assert.equal(isSudokuAnswerCorrect({ board: solvedBoard, solution }), true)

const almostSolvedBoard = cloneBoard(solution)
almostSolvedBoard[0][0] = wrongCellValue
assert.equal(isSudokuAnswerCorrect({ board: almostSolvedBoard, solution }), false)

const incompleteBoard = cloneBoard(solution)
incompleteBoard[0][0] = 0
assert.equal(isSudokuAnswerCorrect({ board: incompleteBoard, solution }), false)

console.log('Sudoku utility tests passed.')
