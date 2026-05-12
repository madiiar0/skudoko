import { Link, NavLink } from 'react-router-dom'
import { Gamepad2, CalendarDays, Trophy, ChevronLeft, ChevronRight, History, BookOpen } from 'lucide-react'
import { useState } from 'react'

const NAV_ITEMS = [
  { to: '/play', label: 'Play', icon: Gamepad2 },
  { to: '/daily-challenge', label: 'Daily Challenge', icon: CalendarDays },
  { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { to: '/history', label: 'History', icon: History },
  { to: '/blogs', label: 'Blogs', icon: BookOpen },
]

function NavItem({ to, label, icon: Icon, open }) {
  const [hov, setHov] = useState(false)

  return (
    <NavLink
      to={to}
      title={!open ? label : undefined}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: open ? '10px 14px' : '11px 0',
        justifyContent: open ? 'flex-start' : 'center',
        borderRadius: 8,
        fontWeight: isActive ? 600 : 400,
        fontSize: 14,
        color: isActive ? '#FF7A1A' : hov ? '#C8D0DC' : '#5A6478',
        background: isActive ? '#1E1508' : hov && !isActive ? '#162236' : 'transparent',
        transition: 'background 0.15s, color 0.15s',
        whiteSpace: 'nowrap',
        textDecoration: 'none',
        letterSpacing: '0.1px',
      })}
    >
      {({ isActive }) => (
        <>
          <Icon
            size={18}
            strokeWidth={isActive ? 2.2 : 1.8}
            style={{ flexShrink: 0, color: isActive ? '#FF7A1A' : 'inherit' }}
          />
          {open && <span>{label}</span>}
        </>
      )}
    </NavLink>
  )
}

export default function Sidebar({ open, onToggle }) {
  const [toggleHov, setToggleHov] = useState(false)

  return (
    <aside
      style={{
        width: open ? 216 : 60,
        minWidth: open ? 216 : 60,
        transition: 'width 0.22s ease, min-width 0.22s ease',
        background: '#0C1525',
        borderRight: '1px solid #172238',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        flexShrink: 0,
        zIndex: 10,
      }}
    >
      {/* Logo row */}
      <div
        style={{
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: open ? 'space-between' : 'center',
          padding: open ? '0 14px 0 18px' : '0',
          borderBottom: '1px solid #172238',
          flexShrink: 0,
        }}
      >
        {open && (
          <Link to="/" style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.4px', whiteSpace: 'nowrap', color: '#E8EDF5' }}>
            Sudok
            <span
              style={{
                background: 'linear-gradient(135deg, #FF7A1A, #FF3D00)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              o
            </span>
          </Link>
        )}
        <button
          onClick={onToggle}
          onMouseEnter={() => setToggleHov(true)}
          onMouseLeave={() => setToggleHov(false)}
          title={open ? 'Collapse sidebar' : 'Expand sidebar'}
          style={{
            background: toggleHov ? '#1E2D3E' : '#172236',
            border: '1px solid #243450',
            borderRadius: 6,
            width: 30,
            height: 30,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: toggleHov ? '#C8D0DC' : '#5A6478',
            flexShrink: 0,
            transition: 'background 0.15s, color 0.15s',
          }}
        >
          {open ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
        </button>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV_ITEMS.map(item => (
          <NavItem key={item.to} {...item} open={open} />
        ))}
      </nav>
    </aside>
  )
}
