import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Clock3, Pause, Play } from 'lucide-react'
import toast from 'react-hot-toast'

import NumberPanel from '../components/NumberPanel'
import PageTopbar from '../components/PageTopbar'
import SudokuGrid from '../components/SudokuGrid'
import {
  completeDailyChallengeAttempt,
  getCurrentDailyChallenge,
  startDailyChallenge,
} from '../api/dailyChallenge'
import { useAuth } from '../hooks/useAuth'
import { syncDailyAttemptToBackend } from '../services/dailyChallengeSync'
import { getUserStorageId } from '../utils/gameSessionStorage'
import {
  chooseNewestDailyAttempt,
  loadActiveLocalDailyAttempt,
  loadLocalDailyAttempt,
  markLocalDailyAttemptSyncFailed,
  normalizeDailyAttempt,
  saveLocalDailyAttempt,
  toDailyAttemptPayload,
  touchDailyAttempt,
} from '../utils/dailyChallengeStorage'
import CompletionConfetti from './play/CompletionConfetti'
import TipAdModal from './play/TipAdModal'
import { usePlayGameActions } from './play/usePlayGameActions'
import { formatChallengeTime } from './daily/time'

const MISTAKE_PENALTY_SECONDS = 30
const TIP_PENALTY_SECONDS = 60

function getFinalTimeSeconds(attempt) {
  return Math.max(0, Math.floor(Number(attempt?.elapsedSeconds) || 0))
    + (Math.max(0, Math.floor(Number(attempt?.mistakeCount) || 0)) * MISTAKE_PENALTY_SECONDS)
    + (Math.max(0, Math.floor(Number(attempt?.tipsUsed) || 0)) * TIP_PENALTY_SECONDS)
}

function DailyChallengeStartModal({ isStarting, onCancel, onConfirm }) {
  return (
    <div className="modal-backdrop">
      <div className="history-modal daily-modal">
        <h2>Start Daily Challenge</h2>
        <p>
          The timer starts after confirmation. Solve the puzzle and submit with Check the Answer
          to enter the leaderboard.
        </p>
        <p>
          Mistakes add 30 seconds each, tips add 60 seconds each, and this challenge allows one
          official attempt for your account.
        </p>
        <div className="history-modal-actions">
          <button type="button" className="history-modal-secondary" onClick={onCancel} disabled={isStarting}>
            Go to Play Page
          </button>
          <button type="button" className="history-action" onClick={onConfirm} disabled={isStarting}>
            {isStarting ? 'Starting...' : 'Start Challenge'}
          </button>
        </div>
      </div>
    </div>
  )
}

function PauseModal({ onResume }) {
  return (
    <div className="modal-backdrop">
      <div className="history-modal daily-modal">
        <h2>Game Paused</h2>
        <p>The timer is paused and the board is locked until you resume.</p>
        <div className="history-modal-actions">
          <button type="button" className="history-action" onClick={onResume}>
            Resume
          </button>
        </div>
      </div>
    </div>
  )
}

function DailyTimer({ elapsedSeconds, completed, paused, onPause }) {
  return (
    <div className="daily-timer-row">
      <div className="daily-timer">
        <Clock3 size={18} />
        <span>{formatChallengeTime(elapsedSeconds)}</span>
      </div>
      {!completed ? (
        <button type="button" className="daily-pause-button" onClick={onPause} disabled={paused}>
          <Pause size={15} />
          Pause
        </button>
      ) : null}
    </div>
  )
}

function ChallengeLanding({ onStart }) {
  return (
    <div className="daily-landing">
      <div className="daily-section-heading">
        <p>One medium puzzle, one official attempt, ranked by final time after penalties.</p>
      </div>
      <div className="daily-landing-actions">
        <button type="button" className="history-action" onClick={onStart}>
          <Play size={15} />
          Start Challenge
        </button>
        <Link className="history-modal-secondary daily-link-button" to="/play">
          Go to Play Page
        </Link>
      </div>
    </div>
  )
}

export default function DailyChallengePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const userId = getUserStorageId(user)
  const attemptRef = useRef(null)
  const syncTimerRef = useRef(null)
  const syncInFlightRef = useRef(false)

  const [challenge, setChallenge] = useState(null)
  const [attempt, setAttempt] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [showStartModal, setShowStartModal] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    attemptRef.current = attempt
  }, [attempt])

  useEffect(() => {
    let isActive = true

    async function loadChallenge() {
      setIsLoading(true)
      setLoadError('')

      try {
        const response = await getCurrentDailyChallenge()
        const nextChallenge = response?.challenge || null
        const remoteAttempt = normalizeDailyAttempt(response?.attempt, { pendingSync: false, syncError: '' })
        const localAttempt = nextChallenge?.challengeId
          ? loadLocalDailyAttempt(userId, nextChallenge.challengeId)
          : null
        const selectedAttempt = chooseNewestDailyAttempt(localAttempt, remoteAttempt)

        if (selectedAttempt) {
          saveLocalDailyAttempt(userId, selectedAttempt, {
            pendingSync: !!selectedAttempt.pendingSync,
            syncError: selectedAttempt.syncError,
          })
        }

        if (!isActive) {
          return
        }

        setChallenge(nextChallenge)
        setAttempt(selectedAttempt)
        setShowStartModal(!selectedAttempt)
        setIsPaused(false)
        setIsLoading(false)
      } catch (error) {
        const localAttempt = loadActiveLocalDailyAttempt(userId)

        if (!isActive) {
          return
        }

        if (localAttempt) {
          setChallenge({
            challengeId: localAttempt.challengeId,
            difficulty: localAttempt.difficulty,
            puzzle: localAttempt.puzzle,
          })
          setAttempt(localAttempt)
          setShowStartModal(false)
          setIsPaused(false)
          setIsLoading(false)
          return
        }

        setLoadError(error.message || 'Unable to load the Daily Challenge.')
        setIsLoading(false)
      }
    }

    loadChallenge()

    return () => {
      isActive = false
    }
  }, [userId])

  const attemptChallengeId = attempt?.challengeId
  const attemptStatus = attempt?.status

  useEffect(() => {
    if (!attemptChallengeId || isLoading || attemptStatus === 'completed' || isPaused) {
      return undefined
    }

    const timer = window.setInterval(() => {
      setAttempt(current => {
        if (!current || current.status === 'completed') {
          return current
        }

        return touchDailyAttempt(current, {
          elapsedSeconds: (current.elapsedSeconds || 0) + 1,
        })
      })
    }, 1000)

    return () => {
      window.clearInterval(timer)
    }
  }, [attemptChallengeId, attemptStatus, isLoading, isPaused])

  useEffect(() => {
    if (!attempt || isLoading) {
      return undefined
    }

    saveLocalDailyAttempt(userId, attempt, {
      pendingSync: !!attempt.pendingSync,
      syncError: attempt.syncError,
    })

    if (!attempt.pendingSync) {
      return undefined
    }

    window.clearTimeout(syncTimerRef.current)
    syncTimerRef.current = window.setTimeout(async () => {
      const currentAttempt = attemptRef.current

      if (!currentAttempt?.pendingSync || syncInFlightRef.current) {
        return
      }

      syncInFlightRef.current = true
      try {
        const syncedAttempt = await syncDailyAttemptToBackend(userId, currentAttempt)
        if (syncedAttempt) {
          setAttempt(current => (
            current?.challengeId === syncedAttempt.challengeId
              ? chooseNewestDailyAttempt(current, syncedAttempt)
              : current
          ))
        }
      } catch (error) {
        const failedAttempt = markLocalDailyAttemptSyncFailed(userId, currentAttempt, error.message)
        setAttempt(current => (
          failedAttempt && current?.challengeId === failedAttempt.challengeId ? failedAttempt : current
        ))
      } finally {
        syncInFlightRef.current = false
      }
    }, 900)

    return () => {
      window.clearTimeout(syncTimerRef.current)
    }
  }, [attempt, userId, isLoading])

  useEffect(() => {
    function saveBeforeLeave() {
      const currentAttempt = attemptRef.current
      if (currentAttempt) {
        saveLocalDailyAttempt(userId, currentAttempt, {
          pendingSync: !!currentAttempt.pendingSync,
          syncError: currentAttempt.syncError,
        })
      }
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
  }, [userId])

  useEffect(() => {
    async function handleOnline() {
      const currentAttempt = attemptRef.current
      if (!currentAttempt?.pendingSync || syncInFlightRef.current) {
        return
      }

      syncInFlightRef.current = true
      try {
        const syncedAttempt = await syncDailyAttemptToBackend(userId, currentAttempt)
        if (syncedAttempt) {
          setAttempt(current => (
            current?.challengeId === syncedAttempt.challengeId
              ? chooseNewestDailyAttempt(current, syncedAttempt)
              : current
          ))
        }
      } catch {
        // The scheduled autosave will keep retrying while pendingSync is true.
      } finally {
        syncInFlightRef.current = false
      }
    }

    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [userId])

  async function handleStartChallenge() {
    if (isStarting) {
      return
    }

    setIsStarting(true)
    try {
      const response = await startDailyChallenge()
      const nextAttempt = normalizeDailyAttempt(response?.attempt, { pendingSync: false, syncError: '' })

      if (!nextAttempt) {
        throw new Error('Daily challenge attempt could not be started.')
      }

      saveLocalDailyAttempt(userId, nextAttempt, { pendingSync: false, syncError: '' })
      setChallenge(response?.challenge || challenge)
      setAttempt(nextAttempt)
      setShowStartModal(false)
      setIsPaused(false)
    } catch (error) {
      toast.error(error.message || 'Unable to start Daily Challenge.')
    } finally {
      setIsStarting(false)
    }
  }

  async function saveCompletedDailyAttempt(completedAttempt, onSyncError) {
    const attemptWithFinalTime = {
      ...completedAttempt,
      finalTimeSeconds: completedAttempt.finalTimeSeconds ?? getFinalTimeSeconds(completedAttempt),
    }

    try {
      const response = await completeDailyChallengeAttempt(toDailyAttemptPayload(attemptWithFinalTime))
      const remoteAttempt = normalizeDailyAttempt(response?.attempt, { pendingSync: false, syncError: '' })

      if (remoteAttempt) {
        saveLocalDailyAttempt(userId, remoteAttempt, { pendingSync: false, syncError: '' })
        setAttempt(remoteAttempt)
      }

    } catch (error) {
      const failedAttempt = markLocalDailyAttemptSyncFailed(userId, attemptWithFinalTime, error.message)
      setAttempt(current => (
        failedAttempt && current?.challengeId === failedAttempt.challengeId ? failedAttempt : current
      ))
      onSyncError?.()
    }
  }

  const viewOnly = attempt?.status === 'completed' || isPaused
  const gameActions = usePlayGameActions({
    session: attempt,
    setSession: setAttempt,
    userId,
    routeSessionId: attempt?.challengeId || challenge?.challengeId || 'daily-challenge',
    viewOnly,
    saveCompletedSession: saveCompletedDailyAttempt,
    saveCurrentSessionBeforeNewGame: async () => {},
    startNewSession: () => {},
    touchSessionState: touchDailyAttempt,
    saveSessionLocally: (updatedAttempt, options) => saveLocalDailyAttempt(userId, updatedAttempt, options),
  })

  if (isLoading && !attempt) {
    return (
      <div className="play-page">
        <PageTopbar title="Loading Daily Challenge" subtitle="Restoring your challenge attempt." />
        <div className="history-empty">Loading Daily Challenge...</div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="play-page">
        <PageTopbar title="Daily Challenge unavailable" subtitle="The challenge could not be loaded." />
        <div className="history-empty">
          <h2>Unable to open Daily Challenge</h2>
          <p>{loadError}</p>
          <Link className="history-action" to="/play">
            Back to Play
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="play-page">
      <PageTopbar
        title="Daily Challenge"
        subtitle={
          attempt?.status === 'completed'
            ? 'Challenge completed. Your board is open in view-only mode.'
            : 'Solve the official medium puzzle. Penalties are added only after completion.'
        }
      />

      {!attempt ? (
        <ChallengeLanding onStart={() => setShowStartModal(true)} />
      ) : (
        <>
          <DailyTimer
            elapsedSeconds={attempt.elapsedSeconds}
            completed={attempt.status === 'completed'}
            paused={isPaused}
            onPause={() => setIsPaused(true)}
          />

          <div className="game-area">
            {gameActions.isExploding ? <CompletionConfetti onComplete={gameActions.stopConfetti} /> : null}

            <SudokuGrid
              board={attempt.board}
              locked={attempt.locked}
              candidates={attempt.candidates}
              tipCells={attempt.tipCells}
              selected={gameActions.selected}
              onSelect={gameActions.handleSelect}
              error={gameActions.errorCell}
            />
            <div className="play-controls-stack">
              <p className="mistake-count">
                Mistakes: {attempt.mistakeCount || 0} | Tips used: {attempt.tipsUsed || 0}
              </p>
              <NumberPanel
                onNumber={gameActions.handleNumber}
                onRemove={gameActions.handleRemove}
                onTip={gameActions.handleTip}
                onUndo={gameActions.handleUndo}
                onNewGame={() => {}}
                onCheckAnswer={gameActions.handleCheckAnswer}
                canUndo={!viewOnly && attempt.history.length > 0}
                hasSelection={gameActions.hasEditableSelection}
                tipBadge={gameActions.tipBadge}
                inputMode={gameActions.inputMode}
                onInputModeChange={gameActions.handleInputModeChange}
                showNewGame={false}
                disabled={viewOnly}
                checking={gameActions.isCheckingAnswer}
              />
            </div>
          </div>

          {attempt.status === 'completed' ? (
            <div className="completion-banner">
              Daily Challenge completed. Final time: {formatChallengeTime(attempt.finalTimeSeconds ?? getFinalTimeSeconds(attempt))}.
            </div>
          ) : null}
        </>
      )}

      {showStartModal ? (
        <DailyChallengeStartModal
          isStarting={isStarting}
          onCancel={() => {
            setShowStartModal(false)
            navigate('/play')
          }}
          onConfirm={handleStartChallenge}
        />
      ) : null}

      {isPaused ? <PauseModal onResume={() => setIsPaused(false)} /> : null}
      {gameActions.showTipAd ? <TipAdModal onClose={gameActions.handleCloseTipAd} /> : null}
    </div>
  )
}
