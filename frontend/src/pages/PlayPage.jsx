import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import SudokuGrid from '../components/SudokuGrid'
import NumberPanel from '../components/NumberPanel'
import PageTopbar from '../components/PageTopbar'
import { getGameSession } from '../api/sessions'
import { useAuth } from '../hooks/useAuth'
import { syncSessionToBackend, loadBackendSessions } from '../services/sessionSync'
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
} from '../utils/gameSessionStorage'
import { generatePuzzle, validateMove, isBoardComplete } from '../utils/sudoku'

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

export default function PlayPage() {
  const { sessionId: routeSessionId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const userId = getUserStorageId(user)
  const saveTimerRef = useRef(null)

  const [session, setSession] = useState(null)
  const [selected, setSelected] = useState(null)
  const [errorCell, setErrorCell] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const viewOnly = session?.status === 'completed'

  useEffect(() => {
    let isActive = true

    async function loadRequestedSession() {
      setIsLoading(true)
      setLoadError('')
      setSelected(null)
      setErrorCell(null)

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

  useEffect(() => {
    if (errorCell) {
      const t = setTimeout(() => setErrorCell(null), 2400)
      return () => clearTimeout(t)
    }

    return undefined
  }, [errorCell])

  function handleSelect(r, c) {
    setSelected([r, c])
    if (errorCell) {
      setErrorCell(null)
    }
  }

  function handleNumber(num) {
    if (!selected || !session || viewOnly) {
      return
    }

    const [r, c] = selected
    if (session.locked[r][c]) {
      return
    }

    if (!validateMove(session.board, r, c, num)) {
      setErrorCell([r, c])
      return
    }

    setSession(prev => {
      const newBoard = prev.board.map(row => [...row])
      const historyEntry = { r, c, prev: prev.board[r][c], next: num, at: new Date().toISOString() }
      newBoard[r][c] = num
      const done = isBoardComplete(newBoard, prev.solution)

      return touchSession(prev, {
        board: newBoard,
        history: [...prev.history, historyEntry],
        status: done ? 'completed' : 'unfinished',
        completedAt: done ? new Date().toISOString() : null,
      })
    })
    setErrorCell(null)
  }

  function handleRemove() {
    if (!selected || !session || viewOnly) return
    const [r, c] = selected

    if (session.locked[r][c]) {
      return
    }

    if (session.board[r][c] === 0) return

    setSession(prev => {
      const newBoard = prev.board.map(row => [...row])
      newBoard[r][c] = 0

      return touchSession(prev, {
        board: newBoard,
        history: [...prev.history, { r, c, prev: prev.board[r][c], next: 0, at: new Date().toISOString() }],
      })
    })
    setErrorCell(null)
  }

  function handleUndo() {
    if (!session || viewOnly) return

    setSession(prev => {
      if (prev.history.length === 0) return prev

      const history = [...prev.history]
      const last = history.pop()
      const newBoard = prev.board.map(row => [...row])
      newBoard[last.r][last.c] = last.prev

      return touchSession(prev, {
        board: newBoard,
        history,
      })
    })
    setErrorCell(null)
  }

  function handleNewGame() {
    const newSession = createNewGameSession()
    saveLocalSession(userId, newSession, { pendingSync: true })
    setActiveSessionId(userId, newSession.sessionId)
    setSession(newSession)
    setSelected(null)
    setErrorCell(null)
    navigate(`/play/${newSession.sessionId}`)
  }

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

  const hasEditableSelection = !!selected && !session.locked[selected[0]][selected[1]] && !viewOnly

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
        <SudokuGrid
          board={session.board}
          locked={session.locked}
          selected={selected}
          onSelect={handleSelect}
          error={errorCell}
        />
        <NumberPanel
          onNumber={handleNumber}
          onRemove={handleRemove}
          onUndo={handleUndo}
          onNewGame={handleNewGame}
          canUndo={!viewOnly && session.history.length > 0}
          hasSelection={hasEditableSelection}
          disabled={viewOnly}
        />
      </div>

      {session.status === 'completed' ? (
        <div className="completion-banner">
          Puzzle solved! Start a New Game to play again.
        </div>
      ) : null}
    </div>
  )
}
