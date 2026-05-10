import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

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

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const profileFields = useMemo(
    () => [
      { label: 'Name', value: user?.name || 'Not available' },
      { label: 'Email', value: user?.email || 'Not available' },
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

  return (
    <div className="profile-page">
      <PageTopbar
        title="Profile"
        subtitle="View the account data currently returned by the auth backend and end your session when needed."
      />

      <section className="profile-card">
        <div className="profile-grid">
          {profileFields.map(field => (
            <div key={field.label} className="profile-field">
              <span className="profile-field-label">{field.label}</span>
              <strong className="profile-field-value">{field.value}</strong>
            </div>
          ))}
        </div>

        {error ? <p className="auth-feedback auth-feedback-error profile-feedback">{error}</p> : null}

        <button className="profile-logout" type="button" onClick={handleLogout} disabled={submitting}>
          {submitting ? 'Logging out...' : 'Log Out'}
        </button>
      </section>
    </div>
  )
}
