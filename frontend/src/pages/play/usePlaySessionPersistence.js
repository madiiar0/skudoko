import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { completeGameSession, getGameSession } from '../../api/sessions'
import { useAuth } from '../../hooks/useAuth'
import { loadBackendSessions, syncSessionToBackend } from '../../services/sessionSync'
import {
  chooseNewestSession,
  createGameSession,
  getLatestUnfinishedSession,
  getUserStorageId,
  loadActiveSession,
  loadLocalSession,
  markLocalSessionSyncFailed,
  normalizeSession,
  saveLocalSession,
  setActiveSessionId,
  touchSession,
  toSessionPayload,
} from '../../utils/gameSessionStorage'
import { generatePuzzle } from '../../utils/sudoku'

function createNewGameSession() {
  const { puzzle, solution } = generatePuzzle(40)
  return createGameSession({ puzzle, solution })
}

function getDefaultLocalSession(userId) {
  const activeSession = loadActiveSession(userId)

  if (activeSession?.status !== 'completed') {
    return activeSession
  }

  return getLatestUnfinishedSession(userId)
}

export function usePlaySessionPersistence() {
  const { sessionId: routeSessionId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const userId = getUserStorageId(user)
  const saveTimerRef = useRef(null)

  const [session, setSession] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let isActive = true

    async function loadRequestedSession() {
      setIsLoading(true)
      setLoadError('')

      if (routeSessionId) {
        const localSession = loadLocalSession(userId, routeSessionId)

        if (localSession && isActive) {
          setSession(localSession)
          setIsLoading(false)
        }

        try {
          const response = await getGameSession(routeSessionId)
          const remoteSession = normalizeSession(response?.session, { pendingSync: false, syncError: '' })
          const selectedSession = chooseNewestSession(localSession, remoteSession)

          if (!selectedSession) {
            throw new Error('Session not found')
          }

          saveLocalSession(userId, selectedSession, {
            pendingSync: !!selectedSession.pendingSync,
            syncError: selectedSession.syncError,
          })

          if (selectedSession.status !== 'completed') {
            setActiveSessionId(userId, selectedSession.sessionId)
          }

          if (isActive) {
            setSession(selectedSession)
            setIsLoading(false)
          }
        } catch (error) {
          if (isActive) {
            if (localSession) {
              setSession(localSession)
            } else {
              setSession(null)
              setLoadError(error.message || 'Unable to load that game session.')
            }
            setIsLoading(false)
          }
        }

        return
      }

      const localSession = getDefaultLocalSession(userId)

      if (localSession && isActive) {
        setSession(localSession)
        setIsLoading(false)
      }

      try {
        await loadBackendSessions(userId)
        const selectedSession = getDefaultLocalSession(userId) || createNewGameSession()

        saveLocalSession(userId, selectedSession, {
          pendingSync: !!selectedSession.pendingSync,
          syncError: selectedSession.syncError,
        })
        setActiveSessionId(userId, selectedSession.sessionId)

        if (isActive) {
          setSession(selectedSession)
          setIsLoading(false)
        }
      } catch {
        const selectedSession = localSession || createNewGameSession()

        saveLocalSession(userId, selectedSession, {
          pendingSync: !!selectedSession.pendingSync,
          syncError: selectedSession.syncError,
        })
        setActiveSessionId(userId, selectedSession.sessionId)

        if (isActive) {
          setSession(selectedSession)
          setIsLoading(false)
        }
      }
    }

    loadRequestedSession()

    return () => {
      isActive = false
    }
  }, [routeSessionId, userId])

  useEffect(() => {
    if (!session || isLoading) {
      return undefined
    }

    saveLocalSession(userId, session, {
      pendingSync: !!session.pendingSync,
      syncError: session.syncError,
    })

    if (session.status !== 'completed') {
      setActiveSessionId(userId, session.sessionId)
    }

    if (!session.pendingSync) {
      return undefined
    }

    window.clearTimeout(saveTimerRef.current)
    saveTimerRef.current = window.setTimeout(() => {
      syncSessionToBackend(userId, session).catch(error => {
        markLocalSessionSyncFailed(userId, session, error.message)
      })
    }, 900)

    return () => {
      window.clearTimeout(saveTimerRef.current)
    }
  }, [session, userId, isLoading])

  useEffect(() => {
    if (!session) {
      return undefined
    }

    function saveBeforeLeave() {
      saveLocalSession(userId, session, {
        pendingSync: !!session.pendingSync,
        syncError: session.syncError,
      })
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        saveBeforeLeave()
      }
    }

    window.addEventListener('pagehide', saveBeforeLeave)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('pagehide', saveBeforeLeave)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [session, userId])

  async function saveCompletedSession(completedSession, onSyncError) {
    try {
      const response = await completeGameSession(completedSession.sessionId, toSessionPayload(completedSession))
      const remoteSession = normalizeSession(response?.session, { pendingSync: false, syncError: '' })

      if (remoteSession) {
        saveLocalSession(userId, remoteSession, { pendingSync: false, syncError: '' })
        setSession(current => (
          current?.sessionId === remoteSession.sessionId ? remoteSession : current
        ))
      }
    } catch (error) {
      const failedSession = markLocalSessionSyncFailed(userId, completedSession, error.message)
      setSession(current => (
        failedSession && current?.sessionId === failedSession.sessionId ? failedSession : current
      ))
      onSyncError?.()
    }
  }

  async function saveCurrentSessionBeforeNewGame(currentSession) {
    if (!currentSession) {
      return
    }

    const sessionToSave = touchSession(currentSession)
    saveLocalSession(userId, sessionToSave, { pendingSync: true })

    try {
      await syncSessionToBackend(userId, sessionToSave)
    } catch (error) {
      markLocalSessionSyncFailed(userId, sessionToSave, error.message)
    }
  }

  function startNewSession() {
    const newSession = createNewGameSession()
    saveLocalSession(userId, newSession, { pendingSync: true })
    setActiveSessionId(userId, newSession.sessionId)
    setSession(newSession)
    navigate(`/play/${newSession.sessionId}`)
  }

  return {
    session,
    setSession,
    isLoading,
    loadError,
    routeSessionId,
    userId,
    saveCompletedSession,
    saveCurrentSessionBeforeNewGame,
    startNewSession,
  }
}
