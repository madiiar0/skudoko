import { listGameSessions, saveGameSession } from '../api/sessions'
import {
  chooseNewestSession,
  listLocalSessions,
  markLocalSessionSyncFailed,
  markLocalSessionSynced,
  mergeBackendSessions,
  normalizeSession,
  toSessionPayload,
} from '../utils/gameSessionStorage'

function isOnline() {
  return typeof navigator === 'undefined' || navigator.onLine
}

export async function syncSessionToBackend(userId, session) {
  if (!isOnline()) {
    throw new Error('Offline')
  }

  const response = await saveGameSession(session.sessionId, toSessionPayload(session))
  const remoteSession = normalizeSession(response?.session, { pendingSync: false, syncError: '' })
  const selectedSession = chooseNewestSession(session, remoteSession)

  if (selectedSession === remoteSession) {
    return markLocalSessionSynced(userId, remoteSession)
  }

  return selectedSession
}

export async function syncPendingSessions(userId) {
  if (!userId || !isOnline()) {
    return []
  }

  const pendingSessions = listLocalSessions(userId).filter(session => session.pendingSync)
  const syncedSessions = []

  for (const session of pendingSessions) {
    try {
      const syncedSession = await syncSessionToBackend(userId, session)
      if (syncedSession) {
        syncedSessions.push(syncedSession)
      }
    } catch (error) {
      markLocalSessionSyncFailed(userId, session, error.message)
    }
  }

  return syncedSessions
}

export async function loadBackendSessions(userId) {
  const response = await listGameSessions()
  return mergeBackendSessions(userId, response?.sessions || [])
}
