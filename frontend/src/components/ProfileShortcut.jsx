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
        color: isActive ? '#FF7A1A' : hovered ? '#D5DEEC' : '#7A8699',
        background: isActive ? '#1E1508' : hovered ? '#1E2D40' : '#162236',
        border: `1px solid ${isActive ? '#5A330E' : hovered ? '#35506A' : '#243450'}`,
        boxShadow: hovered || isActive ? '0 10px 28px rgba(0, 0, 0, 0.2)' : 'none',
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
