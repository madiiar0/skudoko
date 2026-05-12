import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Clock3, Pencil, Trash2 } from 'lucide-react'

import PageTopbar from '../components/PageTopbar'
import { deleteGameSession, renameGameSession } from '../api/sessions'
import { useAuth } from '../hooks/useAuth'
import { loadBackendSessions, syncPendingSessions } from '../services/sessionSync'
import {
  getUserStorageId,
  listLocalSessions,
  normalizeSession,
  removeLocalSession,
  saveLocalSession,
} from '../utils/gameSessionStorage'
import { getDifficultyLabel } from '../utils/difficulty'

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
  const [renameTarget, setRenameTarget] = useState(null)
  const [renameValue, setRenameValue] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [modalError, setModalError] = useState('')
  const [submitting, setSubmitting] = useState(false)

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

  function openRename(session) {
    setRenameTarget(session)
    setRenameValue(session.name || 'Untitled')
    setModalError('')
  }

  function closeRename() {
    if (submitting) return
    setRenameTarget(null)
    setRenameValue('')
    setModalError('')
  }

  function openDelete(session) {
    setDeleteTarget(session)
    setModalError('')
  }

  function closeDelete() {
    if (submitting) return
    setDeleteTarget(null)
    setModalError('')
  }

  async function handleRename(event) {
    event.preventDefault()
    if (!renameTarget) return

    setSubmitting(true)
    setModalError('')

    try {
      const response = await renameGameSession(renameTarget.sessionId, renameValue)
      const updatedSession = normalizeSession(response?.session, { pendingSync: false, syncError: '' })

      if (!updatedSession) {
        throw new Error('Rename response was invalid.')
      }

      saveLocalSession(userId, updatedSession, { pendingSync: false, syncError: '' })
      setSessions(prev => prev.map(session => (
        session.sessionId === updatedSession.sessionId ? updatedSession : session
      )))
      setRenameTarget(null)
      setRenameValue('')
      setModalError('')
    } catch (renameError) {
      setModalError(renameError.message || 'Unable to rename this session.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return

    setSubmitting(true)
    setModalError('')

    try {
      await deleteGameSession(deleteTarget.sessionId)
      removeLocalSession(userId, deleteTarget.sessionId)
      setSessions(prev => prev.filter(session => session.sessionId !== deleteTarget.sessionId))
      setDeleteTarget(null)
      setModalError('')
    } catch (deleteError) {
      setModalError(deleteError.message || 'Unable to delete this session.')
    } finally {
      setSubmitting(false)
    }
  }

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
            const sessionName = session.name || 'Untitled'
            const difficultyLabel = getDifficultyLabel(session.difficulty)

            return (
              <article key={session.sessionId} className="history-item">
                <div className="history-status-icon">
                  <Icon size={20} strokeWidth={2.2} />
                </div>

                <div className="history-main">
                  <div className="history-row">
                    <h2>{sessionName}</h2>
                    <span className={`history-badge ${completed ? 'history-badge-completed' : 'history-badge-active'}`}>
                      {completed ? 'Completed' : 'In Progress'}
                    </span>
                    <span className="history-badge history-badge-difficulty">
                      {difficultyLabel}
                    </span>
                  </div>

                  <div className="history-meta">
                    <span>Moves: {session.history.length}</span>
                    <span>Mistakes: {session.mistakeCount || 0}</span>
                    <span>Tips used: {session.tipsUsed || 0}</span>
                    <span>Elapsed: {formatDuration(session.elapsedSeconds)}</span>
                    {/*<span>Updated: {formatDateTime(session.updatedAt || session.clientUpdatedAt)}</span>*/}
                    {completed ? <span>Completed: {formatDateTime(session.completedAt)}</span> : null}
                    {/*{session.pendingSync ? (*/}
                    {/*  <span className="history-sync">*/}
                    {/*    <RefreshCw size={13} />*/}
                    {/*    Pending sync*/}
                    {/*  </span>*/}
                    {/*) : null}*/}
                  </div>
                </div>

                <div className="history-actions">
                  <button
                    className="history-icon-action"
                    type="button"
                    title="Rename session"
                    aria-label={`Rename ${sessionName}`}
                    onClick={() => openRename(session)}
                  >
                    <Pencil size={15} />
                  </button>
                  <Link className="history-action" to={`/play/${session.sessionId}`}>
                    {completed ? 'Open' : 'Resume'}
                  </Link>
                  <button
                    className="history-icon-action history-icon-action-danger"
                    type="button"
                    title="Delete session"
                    aria-label={`Delete ${sessionName}`}
                    onClick={() => openDelete(session)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      ) : null}

      {renameTarget ? (
        <div className="modal-backdrop" role="presentation">
          <form className="history-modal" onSubmit={handleRename}>
            <h2>Rename saved game</h2>
            <p>Update the display name shown in History. This does not change the session ID or saved board.</p>

            <label className="auth-field">
              <span className="auth-label">Session name</span>
              <input
                className="auth-input"
                value={renameValue}
                maxLength={80}
                onChange={event => setRenameValue(event.target.value)}
                autoFocus
              />
            </label>

            {modalError ? <p className="auth-feedback auth-feedback-error">{modalError}</p> : null}

            <div className="history-modal-actions">
              <button className="history-modal-secondary" type="button" onClick={closeRename} disabled={submitting}>
                Cancel
              </button>
              <button className="history-action" type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {deleteTarget ? (
        <div className="modal-backdrop" role="presentation">
          <div className="history-modal" role="dialog" aria-modal="true">
            <h2>Delete saved game</h2>
            <p>
              Delete "{deleteTarget.name || 'Untitled'}" from your saved games. This cannot be undone.
            </p>

            {modalError ? <p className="auth-feedback auth-feedback-error">{modalError}</p> : null}

            <div className="history-modal-actions">
              <button className="history-modal-secondary" type="button" onClick={closeDelete} disabled={submitting}>
                Cancel
              </button>
              <button className="history-modal-danger" type="button" onClick={handleDelete} disabled={submitting}>
                {submitting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
