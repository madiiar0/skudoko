import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { UserCircle2 } from 'lucide-react'

import { useAuth } from '../hooks/useAuth'

export default function ProfileShortcut() {
  const { user } = useAuth()
  const [hovered, setHovered] = useState(false)
  const isPro = !!user?.isPro

  return (
    <NavLink
      to="/profile"
      title="Profile"
      aria-label="Open profile"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={({ isActive }) => ({
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 44,
        height: 44,
        borderRadius: 12,
        color: isActive ? 'var(--nav-active)' : hovered ? 'var(--nav-hover-text)' : 'var(--text-secondary)',
        background: isActive ? 'var(--nav-active-bg)' : hovered ? 'var(--btn-bg-hover)' : 'var(--bg-surface)',
        border: `1px solid ${isActive ? 'var(--accent)' : hovered ? 'var(--border-strong)' : 'var(--btn-border)'}`,
        boxShadow: hovered || isActive ? 'var(--surface-shadow)' : 'none',
        transition: 'background 0.15s, color 0.15s, border-color 0.15s, box-shadow 0.15s',
        position: 'relative',
      })}
    >
      {({ isActive }) => (
        <>
          {isPro ? <span className="profile-pro-badge">Pro</span> : null}
          <UserCircle2 size={22} strokeWidth={isActive ? 2.3 : 2} />
        </>
      )}
    </NavLink>
  )
}
