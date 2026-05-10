import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Clock3, RefreshCw } from 'lucide-react'

import PageTopbar from '../components/PageTopbar'
import { useAuth } from '../hooks/useAuth'
import { loadBackendSessions, syncPendingSessions } from '../services/sessionSync'
import { getUserStorageId, listLocalSessions } from '../utils/gameSessionStorage'

function formatDateTime(value) {
  if (!value) {
    return 'Not available'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'Not available'
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function formatDuration(seconds) {
  const safeSeconds = Math.max(0, Number(seconds) || 0)
  const minutes = Math.floor(safeSeconds / 60)
  const remainingSeconds = safeSeconds % 60

  if (minutes < 1) {
    return `${remainingSeconds}s`
  }

  return `${minutes}m ${remainingSeconds}s`
}

export default function HistoryPage() {
  const { user } = useAuth()
  const userId = getUserStorageId(user)
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isActive = true

    async function loadSessions() {
      setLoading(true)
      setError('')

      const localSessions = listLocalSessions(userId)
      if (isActive) {
        setSessions(localSessions)
      }

      try {
        await syncPendingSessions(userId)
        const mergedSessions = await loadBackendSessions(userId)
        if (isActive) {
          setSessions(mergedSessions)
        }
      } catch (loadError) {
        if (isActive) {
          setError(loadError.message || 'Unable to sync game history.')
        }
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    loadSessions()

    return () => {
      isActive = false
    }
  }, [userId])

  return (
    <div className="history-page">
      <PageTopbar
        title="History"
        subtitle="Resume unfinished games or open completed sessions in view-only mode."
      />

      {error ? <p className="auth-feedback auth-feedback-error history-feedback">{error}</p> : null}

      {loading && sessions.length === 0 ? (
        <div className="history-empty">Loading saved games...</div>
      ) : null}

      {!loading && sessions.length === 0 ? (
        <div className="history-empty">
          <h2>No saved games yet</h2>
          <p>Start a game and your progress will appear here automatically.</p>
          <Link className="history-action" to="/play">
            Start Playing
          </Link>
        </div>
      ) : null}

      {sessions.length > 0 ? (
        <div className="history-list">
          {sessions.map(session => {
            const completed = session.status === 'completed'
            const Icon = completed ? CheckCircle2 : Clock3

            return (
              <article key={session.sessionId} className="history-item">
                <div className="history-status-icon">
                  <Icon size={20} strokeWidth={2.2} />
                </div>

                <div className="history-main">
                  <div className="history-row">
                    <h2>{completed ? 'Completed Game' : 'Unfinished Game'}</h2>
                    <span className={`history-badge ${completed ? 'history-badge-completed' : 'history-badge-active'}`}>
                      {completed ? 'Completed' : 'In Progress'}
                    </span>
                  </div>

                  <div className="history-meta">
                    <span>Moves: {session.history.length}</span>
                    <span>Elapsed: {formatDuration(session.elapsedSeconds)}</span>
                    <span>Updated: {formatDateTime(session.updatedAt || session.clientUpdatedAt)}</span>
                    {completed ? <span>Completed: {formatDateTime(session.completedAt)}</span> : null}
                    {session.pendingSync ? (
                      <span className="history-sync">
                        <RefreshCw size={13} />
                        Pending sync
                      </span>
                    ) : null}
                  </div>
                </div>

                <Link className="history-action" to={`/play/${session.sessionId}`}>
                  {completed ? 'Open' : 'Resume'}
                </Link>
              </article>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
