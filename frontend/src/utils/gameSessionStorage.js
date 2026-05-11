import { DEFAULT_DIFFICULTY, normalizeDifficulty } from './difficulty.js'
import { INITIAL_TIPS_REMAINING, normalizeTipCells, sanitizeTipsRemaining } from './tips.js'
import { createEmptyCandidates, hasCandidateNotes, normalizeCandidates } from './candidates.js'

const STORAGE_VERSION = 'v1'

function getStorage() {
  if (typeof window === 'undefined') {
    return null
  }

  return window.localStorage
}

function safeRead(key, fallback) {
  try {
    const storage = getStorage()
    const value = storage?.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

function safeWrite(key, value) {
  try {
    const storage = getStorage()
    storage?.setItem(key, JSON.stringify(value))
  } catch {
    // Local storage can fail in private browsing or quota pressure. Gameplay should continue.
  }
}

function safeRemove(key) {
  try {
    const storage = getStorage()
    storage?.removeItem(key)
  } catch {
    // Keep gameplay available even if storage cleanup fails.
  }
}

function userKey(userId) {
  return String(userId || 'anonymous')
}

function indexKey(userId) {
  return `sudoko.sessions.${userKey(userId)}.${STORAGE_VERSION}`
}

function activeKey(userId) {
  return `sudoko.activeSession.${userKey(userId)}.${STORAGE_VERSION}`
}

function sessionKey(userId, sessionId) {
  return `sudoko.session.${userKey(userId)}.${sessionId}.${STORAGE_VERSION}`
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

function toIsoDate(value, fallback = new Date().toISOString()) {
  if (!value) {
    return fallback
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? fallback : date.toISOString()
}

function sanitizeSessionName(name) {
  const trimmedName = String(name || '').trim()
  return trimmedName ? trimmedName.slice(0, 80) : 'Untitled'
}

function sanitizeMistakeCount(mistakeCount) {
  return Math.max(0, Math.floor(Number(mistakeCount) || 0))
}

function sanitizeTipsUsed(tipsUsed) {
  return Math.max(0, Math.floor(Number(tipsUsed) || 0))
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

export function getUserStorageId(user) {
  return user?._id || user?.id || 'anonymous'
}

export function createSessionId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  return `local-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function cloneMatrix(matrix) {
  return matrix.map(row => [...row])
}

export function createGameSession({ puzzle, solution, difficulty = DEFAULT_DIFFICULTY }) {
  const now = new Date().toISOString()
  const locked = puzzle.map(row => row.map(value => value !== 0))

  return {
    sessionId: createSessionId(),
    name: 'Untitled',
    difficulty: normalizeDifficulty(difficulty),
    mistakeCount: 0,
    tipsUsed: 0,
    tipCells: [],
    tipsRemaining: INITIAL_TIPS_REMAINING,
    candidates: createEmptyCandidates(),
    puzzle: cloneMatrix(puzzle),
    board: cloneMatrix(puzzle),
    locked,
    solution: cloneMatrix(solution),
    history: [],
    status: 'unfinished',
    elapsedSeconds: 0,
    createdAt: now,
    updatedAt: now,
    clientUpdatedAt: now,
    lastPlayedAt: now,
    completedAt: null,
    pendingSync: true,
    syncError: '',
  }
}

export function normalizeSession(raw, options = {}) {
  if (!raw) {
    return null
  }

  const now = new Date().toISOString()
  const sessionId = String(raw.sessionId || raw.id || raw._id || '').trim()
  const puzzle = normalizeNumberBoard(raw.puzzle)
  const board = normalizeNumberBoard(raw.board)
  const locked = normalizeBooleanBoard(raw.locked)
  const solution = normalizeNumberBoard(raw.solution)

  if (!sessionId || !puzzle || !board || !locked || !solution) {
    return null
  }

  const status = raw.status === 'completed' ? 'completed' : 'unfinished'
  const clientUpdatedAt = toIsoDate(raw.clientUpdatedAt || raw.updatedAt, now)

  return {
    sessionId,
    name: sanitizeSessionName(raw.name),
    difficulty: normalizeDifficulty(raw.difficulty),
    mistakeCount: sanitizeMistakeCount(raw.mistakeCount),
    tipsUsed: sanitizeTipsUsed(raw.tipsUsed),
    tipCells: normalizeTipCells(raw.tipCells),
    tipsRemaining: sanitizeTipsRemaining(raw.tipsRemaining),
    candidates: normalizeCandidates(raw.candidates, board),
    puzzle: cloneMatrix(puzzle),
    board: cloneMatrix(board),
    locked: cloneMatrix(locked),
    solution: cloneMatrix(solution),
    history: sanitizeHistory(raw.history),
    status,
    elapsedSeconds: Math.max(0, Number(raw.elapsedSeconds) || 0),
    createdAt: toIsoDate(raw.createdAt, now),
    updatedAt: toIsoDate(raw.updatedAt || clientUpdatedAt, clientUpdatedAt),
    clientUpdatedAt,
    lastPlayedAt: toIsoDate(raw.lastPlayedAt || clientUpdatedAt, clientUpdatedAt),
    completedAt: status === 'completed' ? toIsoDate(raw.completedAt || clientUpdatedAt, clientUpdatedAt) : null,
    pendingSync: options.pendingSync ?? !!raw.pendingSync,
    syncError: options.syncError ?? raw.syncError ?? '',
  }
}

export function touchSession(session, updates = {}) {
  const now = new Date().toISOString()
  const lastPlayedTime = new Date(session.lastPlayedAt || session.clientUpdatedAt || session.updatedAt).getTime()
  const nowTime = Date.now()
  const elapsedDelta = session.status === 'completed' || Number.isNaN(lastPlayedTime)
    ? 0
    : Math.max(0, Math.floor((nowTime - lastPlayedTime) / 1000))

  return normalizeSession({
    ...session,
    ...updates,
    elapsedSeconds: Math.max(0, Number(session.elapsedSeconds) || 0) + elapsedDelta,
    updatedAt: now,
    clientUpdatedAt: now,
    lastPlayedAt: now,
    pendingSync: true,
    syncError: '',
  }, { pendingSync: true })
}

export function toSessionPayload(session) {
  return {
    sessionId: session.sessionId,
    name: sanitizeSessionName(session.name),
    difficulty: normalizeDifficulty(session.difficulty),
    mistakeCount: sanitizeMistakeCount(session.mistakeCount),
    tipsUsed: sanitizeTipsUsed(session.tipsUsed),
    tipCells: normalizeTipCells(session.tipCells),
    tipsRemaining: sanitizeTipsRemaining(session.tipsRemaining),
    candidates: normalizeCandidates(session.candidates, session.board),
    puzzle: session.puzzle,
    board: session.board,
    locked: session.locked,
    solution: session.solution,
    history: session.history,
    status: session.status,
    elapsedSeconds: session.elapsedSeconds,
    completedAt: session.completedAt,
    clientUpdatedAt: session.clientUpdatedAt,
  }
}

export function getSessionUpdatedTime(session) {
  return new Date(session?.clientUpdatedAt || session?.updatedAt || session?.createdAt || 0).getTime() || 0
}

export function chooseNewestSession(localSession, remoteSession) {
  if (!localSession) {
    return remoteSession
  }

  if (!remoteSession) {
    return localSession
  }

  const localTime = getSessionUpdatedTime(localSession)
  const remoteTime = getSessionUpdatedTime(remoteSession)

  if (localSession.pendingSync && hasCandidateNotes(localSession.candidates) && !hasCandidateNotes(remoteSession.candidates)) {
    return localSession
  }

  if (localTime > remoteTime) {
    return localSession
  }

  return remoteSession
}

function readIndex(userId) {
  const ids = safeRead(indexKey(userId), [])
  return Array.isArray(ids) ? ids.filter(Boolean) : []
}

function writeIndex(userId, ids) {
  safeWrite(indexKey(userId), [...new Set(ids.filter(Boolean))])
}

export function saveLocalSession(userId, session, options = {}) {
  const normalizedSession = normalizeSession({
    ...session,
    pendingSync: options.pendingSync ?? session.pendingSync,
    syncError: options.syncError ?? session.syncError,
  })

  if (!normalizedSession) {
    return null
  }

  safeWrite(sessionKey(userId, normalizedSession.sessionId), normalizedSession)
  writeIndex(userId, [...readIndex(userId), normalizedSession.sessionId])
  return normalizedSession
}

export function markLocalSessionSynced(userId, session) {
  return saveLocalSession(userId, session, { pendingSync: false, syncError: '' })
}

export function markLocalSessionSyncFailed(userId, session, message) {
  return saveLocalSession(userId, session, { pendingSync: true, syncError: message || 'Sync failed' })
}

export function loadLocalSession(userId, sessionId) {
  return normalizeSession(safeRead(sessionKey(userId, sessionId), null))
}

export function removeLocalSession(userId, sessionId) {
  if (!sessionId) {
    return
  }

  safeRemove(sessionKey(userId, sessionId))
  writeIndex(userId, readIndex(userId).filter(id => id !== sessionId))

  if (getActiveSessionId(userId) === sessionId) {
    setActiveSessionId(userId, null)
  }
}

export function listLocalSessions(userId) {
  return readIndex(userId)
    .map(sessionId => loadLocalSession(userId, sessionId))
    .filter(Boolean)
    .sort((a, b) => getSessionUpdatedTime(b) - getSessionUpdatedTime(a))
}

export function setActiveSessionId(userId, sessionId) {
  if (sessionId) {
    safeWrite(activeKey(userId), sessionId)
  } else {
    safeRemove(activeKey(userId))
  }
}

export function getActiveSessionId(userId) {
  return safeRead(activeKey(userId), null)
}

export function loadActiveSession(userId) {
  const sessionId = getActiveSessionId(userId)
  return sessionId ? loadLocalSession(userId, sessionId) : null
}

export function getLatestUnfinishedSession(userId) {
  return listLocalSessions(userId).find(session => session.status !== 'completed') || null
}

export function mergeBackendSessions(userId, backendSessions = []) {
  const normalizedRemoteSessions = backendSessions
    .map(session => normalizeSession(session, { pendingSync: false, syncError: '' }))
    .filter(Boolean)

  normalizedRemoteSessions.forEach(remoteSession => {
    const localSession = loadLocalSession(userId, remoteSession.sessionId)
    const selectedSession = chooseNewestSession(localSession, remoteSession)
    const pendingSync = selectedSession === localSession ? !!localSession.pendingSync : false
    saveLocalSession(userId, selectedSession, { pendingSync, syncError: pendingSync ? localSession.syncError : '' })
  })

  return listLocalSessions(userId)
}
