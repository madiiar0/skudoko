import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

import PageTopbar from '../components/PageTopbar'
import { useAuth } from '../hooks/useAuth'

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

function CancelProModal({ isSubmitting, onCancel, onConfirm }) {
  return (
    <div className="modal-backdrop">
      <div className="history-modal">
        <h2>Unsubscribe from Pro</h2>
        <p>
          Stripe subscription management is coming soon. For now, confirming will remove Pro from your account.
        </p>
        <div className="history-modal-actions">
          <button type="button" className="history-modal-secondary" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="button" className="history-modal-danger" onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? 'Cancelling...' : 'Confirm cancellation'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, logout, cancelPro } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [proSubmitting, setProSubmitting] = useState(false)
  const [showCancelPro, setShowCancelPro] = useState(false)
  const [error, setError] = useState('')

  const profileFields = useMemo(
    () => [
      { label: 'Name', value: user?.name || 'Not available' },
      { label: 'Email', value: user?.email || 'Not available' },
      { label: 'Plan', value: user?.isPro ? 'Pro' : 'Free' },
      { label: 'Last login', value: formatDateTime(user?.lastLogin) },
      { label: 'Member since', value: formatDateTime(user?.createdAt) },
    ],
    [user],
  )

  async function handleLogout() {
    setSubmitting(true)
    setError('')

    try {
      await logout()
      navigate('/login', { replace: true })
    } catch (logoutError) {
      setError(logoutError.message || 'Unable to log out.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleCancelPro() {
    if (proSubmitting) {
      return
    }

    setProSubmitting(true)
    setError('')

    try {
      await cancelPro()
      setShowCancelPro(false)
      toast.success('Pro removed from your account.')
    } catch (cancelError) {
      setError(cancelError.message || 'Unable to cancel Pro.')
      toast.error(cancelError.message || 'Unable to cancel Pro.')
    } finally {
      setProSubmitting(false)
    }
  }

  return (
    <div className="profile-page">
      <PageTopbar
        title="Profile"
        subtitle="View the account data currently returned by the auth backend and end your session when needed."
      />

      <section>
        <div className="profile-grid">
          {profileFields.map(field => (
            <div key={field.label} className="profile-field">
              <span className="profile-field-label">{field.label}</span>
              <strong className="profile-field-value">{field.value}</strong>
            </div>
          ))}
        </div>

        {error ? <p className="auth-feedback auth-feedback-error profile-feedback">{error}</p> : null}

        <div className="profile-actions">
          {user?.isPro ? (
            <button
              className="profile-secondary-action"
              type="button"
              onClick={() => setShowCancelPro(true)}
              disabled={proSubmitting || submitting}
            >
              Unsubscribe from Pro
            </button>
          ) : null}

          <button className="profile-secondary-action" type="button" onClick={handleLogout} disabled={submitting}>
            {submitting ? 'Logging out...' : 'Log Out'}
          </button>
        </div>
      </section>

      {showCancelPro ? (
        <CancelProModal
          isSubmitting={proSubmitting}
          onCancel={() => setShowCancelPro(false)}
          onConfirm={handleCancelPro}
        />
      ) : null}
    </div>
  )
}
