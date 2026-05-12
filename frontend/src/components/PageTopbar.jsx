import { Link } from 'react-router-dom'

import { useAuth } from '../hooks/useAuth'
import ProfileShortcut from './ProfileShortcut'

export default function PageTopbar({ title, subtitle }) {
  const { user } = useAuth()

  return (
    <div className="page-topbar">
      <div className="page-topbar-copy">
        {title ? <h1 className="play-title">{title}</h1> : null}
        {subtitle ? <p className="play-subtitle">{subtitle}</p> : null}
      </div>
      <div className="page-topbar-actions">
        {!user?.isPro ? (
          <Link className="upgrade-topbar-cta" to="/upgrade">
            Upgrade to Pro
          </Link>
        ) : null}
        <ProfileShortcut />
      </div>
    </div>
  )
}
