import { normalizeDifficulty } from './difficulty.js'
import { INITIAL_TIPS_REMAINING, normalizeTipCells, sanitizeTipsRemaining } from './tips.js'
import { hasCandidateNotes, normalizeCandidates } from './candidates.js'

const STORAGE_VERSION = 'v1'

function getStorage() {
  if (typeof window === 'undefined') {
    return null
  }

  return window.localStorage
}

function safeRead(key, fallback) {
  try {
    const value = getStorage()?.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

function safeWrite(key, value) {
  try {
    getStorage()?.setItem(key, JSON.stringify(value))
  } catch {
    // Local saves are best-effort; gameplay should continue if storage is unavailable.
  }
}

function userKey(userId) {
  return String(userId || 'anonymous')
}

function attemptKey(userId, challengeId) {
  return `sudoko.dailyChallenge.${userKey(userId)}.${challengeId}.${STORAGE_VERSION}`
}

function activeChallengeKey(userId) {
  return `sudoko.dailyChallenge.active.${userKey(userId)}.${STORAGE_VERSION}`
}

function normalizeNumberCell(value) {
  if (value === null || value === undefined || value === '') {
    return 0
  }

  if (typeof value === 'boolean') {
    return NaN
  }

  const number = typeof value === 'number' ? value : Number(String(value).trim())
  return Number.isInteger(number) && number >= 0 && number <= 9 ? number : NaN
}

function normalizeNumberBoard(board) {
  if (!Array.isArray(board) || board.length !== 9) {
    return null
  }

  const normalized = board.map(row => {
    if (!Array.isArray(row) || row.length !== 9) {
      return null
    }

    const normalizedRow = row.map(normalizeNumberCell)
    return normalizedRow.some(Number.isNaN) ? null : normalizedRow
  })

  return normalized.some(row => row === null) ? null : normalized
}

function normalizeBooleanCell(value) {
  if (typeof value === 'boolean') {
    return value
  }

  if (value === 1 || value === '1' || value === 'true') {
    return true
  }

  if (value === 0 || value === '0' || value === 'false') {
    return false
  }

  return null
}

function normalizeBooleanBoard(board) {
  if (!Array.isArray(board) || board.length !== 9) {
    return null
  }

  const normalized = board.map(row => {
    if (!Array.isArray(row) || row.length !== 9) {
      return null
    }

    const normalizedRow = row.map(normalizeBooleanCell)
    return normalizedRow.some(value => value === null) ? null : normalizedRow
  })

  return normalized.some(row => row === null) ? null : normalized
}

function deriveLockedBoard(puzzle) {
  return puzzle.map(row => row.map(value => value !== 0))
}

function cloneMatrix(matrix) {
  return matrix.map(row => [...row])
}

function toIsoDate(value, fallback = new Date().toISOString()) {
  if (!value) {
    return fallback
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? fallback : date.toISOString()
}

function sanitizeCount(value) {
  return Math.max(0, Math.floor(Number(value) || 0))
}

function sanitizeHistory(history = []) {
  if (!Array.isArray(history)) {
    return []
  }

  return history
    .filter(entry => (
      Number.isInteger(entry?.r)
      && Number.isInteger(entry?.c)
      && Number.isInteger(entry?.prev)
      && Number.isInteger(entry?.next)
    ))
    .map(entry => ({
      r: entry.r,
      c: entry.c,
      prev: entry.prev,
      next: entry.next,
      at: toIsoDate(entry.at),
    }))
}

export function normalizeDailyAttempt(raw, options = {}) {
  if (!raw) {
    return null
  }

  const now = new Date().toISOString()
  const challengeId = String(raw.challengeId || raw.sessionId || raw.id || raw._id || '').trim()
  const puzzle = normalizeNumberBoard(raw.puzzle)
  const board = normalizeNumberBoard(raw.board)
  const solution = normalizeNumberBoard(raw.solution)
  const locked = normalizeBooleanBoard(raw.locked) || (puzzle ? deriveLockedBoard(puzzle) : null)

  if (!challengeId || !puzzle || !board || !locked || !solution) {
    return null
  }

  const status = raw.status === 'completed' ? 'completed' : 'unfinished'
  const clientUpdatedAt = toIsoDate(raw.clientUpdatedAt || raw.updatedAt, now)

  return {
    sessionId: challengeId,
    challengeId,
    difficulty: normalizeDifficulty(raw.difficulty),
    puzzle: cloneMatrix(puzzle),
    board: cloneMatrix(board),
    locked: cloneMatrix(locked),
    solution: cloneMatrix(solution),
    candidates: normalizeCandidates(raw.candidates, board),
    history: sanitizeHistory(raw.history),
    mistakeCount: sanitizeCount(raw.mistakeCount),
    tipsUsed: sanitizeCount(raw.tipsUsed),
    tipCells: normalizeTipCells(raw.tipCells),
    tipsRemaining: sanitizeTipsRemaining(raw.tipsRemaining ?? INITIAL_TIPS_REMAINING),
    status,
    elapsedSeconds: sanitizeCount(raw.elapsedSeconds),
    finalTimeSeconds: raw.finalTimeSeconds === undefined || raw.finalTimeSeconds === null
      ? null
      : sanitizeCount(raw.finalTimeSeconds),
    startedAt: toIsoDate(raw.startedAt, now),
    createdAt: toIsoDate(raw.createdAt || raw.startedAt, now),
    updatedAt: toIsoDate(raw.updatedAt || clientUpdatedAt, clientUpdatedAt),
    clientUpdatedAt,
    lastPlayedAt: toIsoDate(raw.lastPlayedAt || clientUpdatedAt, clientUpdatedAt),
    completedAt: status === 'completed' ? toIsoDate(raw.completedAt || clientUpdatedAt, clientUpdatedAt) : null,
    pendingSync: options.pendingSync ?? !!raw.pendingSync,
    syncError: options.syncError ?? raw.syncError ?? '',
  }
}

export function touchDailyAttempt(attempt, updates = {}) {
  const now = new Date().toISOString()

  return normalizeDailyAttempt({
    ...attempt,
    ...updates,
    updatedAt: now,
    clientUpdatedAt: now,
    lastPlayedAt: now,
    pendingSync: true,
    syncError: '',
  }, { pendingSync: true })
}

export function toDailyAttemptPayload(attempt) {
  return {
    challengeId: attempt.challengeId,
    board: attempt.board,
    candidates: normalizeCandidates(attempt.candidates, attempt.board),
    history: attempt.history,
    mistakeCount: sanitizeCount(attempt.mistakeCount),
    tipsUsed: sanitizeCount(attempt.tipsUsed),
    tipCells: normalizeTipCells(attempt.tipCells),
    tipsRemaining: sanitizeTipsRemaining(attempt.tipsRemaining),
    elapsedSeconds: sanitizeCount(attempt.elapsedSeconds),
    completedAt: attempt.completedAt,
    clientUpdatedAt: attempt.clientUpdatedAt,
  }
}

export function getDailyAttemptUpdatedTime(attempt) {
  return new Date(attempt?.clientUpdatedAt || attempt?.updatedAt || attempt?.createdAt || 0).getTime() || 0
}

export function chooseNewestDailyAttempt(localAttempt, remoteAttempt) {
  if (!localAttempt) {
    return remoteAttempt
  }

  if (!remoteAttempt) {
    return localAttempt
  }

  if (localAttempt.pendingSync && hasCandidateNotes(localAttempt.candidates) && !hasCandidateNotes(remoteAttempt.candidates)) {
    return localAttempt
  }

  return getDailyAttemptUpdatedTime(localAttempt) > getDailyAttemptUpdatedTime(remoteAttempt)
    ? localAttempt
    : remoteAttempt
}

export function saveLocalDailyAttempt(userId, attempt, options = {}) {
  const normalizedAttempt = normalizeDailyAttempt({
    ...attempt,
    pendingSync: options.pendingSync ?? attempt.pendingSync,
    syncError: options.syncError ?? attempt.syncError,
  })

  if (!normalizedAttempt) {
    return null
  }

  safeWrite(attemptKey(userId, normalizedAttempt.challengeId), normalizedAttempt)
  safeWrite(activeChallengeKey(userId), normalizedAttempt.challengeId)
  return normalizedAttempt
}

export function loadLocalDailyAttempt(userId, challengeId) {
  if (!challengeId) {
    return null
  }

  return normalizeDailyAttempt(safeRead(attemptKey(userId, challengeId), null))
}

export function loadActiveLocalDailyAttempt(userId) {
  const challengeId = safeRead(activeChallengeKey(userId), null)
  return challengeId ? loadLocalDailyAttempt(userId, challengeId) : null
}

export function markLocalDailyAttemptSynced(userId, attempt) {
  return saveLocalDailyAttempt(userId, attempt, { pendingSync: false, syncError: '' })
}

export function markLocalDailyAttemptSyncFailed(userId, attempt, message) {
  return saveLocalDailyAttempt(userId, attempt, { pendingSync: true, syncError: message || 'Sync failed' })
}
