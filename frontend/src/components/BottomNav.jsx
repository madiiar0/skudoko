import { NavLink } from 'react-router-dom'
import { Gamepad2, CalendarDays, Trophy, History, BookOpen } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/play', icon: Gamepad2, label: 'Play' },
  { to: '/daily-challenge', icon: CalendarDays, label: 'Daily' },
  { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { to: '/history', icon: History, label: 'History' },
  { to: '/blogs', icon: BookOpen, label: 'Blogs' },
]

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          title={label}
          style={({ isActive }) => ({
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isActive ? 'var(--nav-active)' : 'var(--nav-inactive)',
            borderTop: isActive ? '2px solid var(--nav-active)' : '2px solid transparent',
            background: isActive ? 'var(--nav-active-bg)' : 'transparent',
            transition: 'color 0.15s, background 0.15s',
            textDecoration: 'none',
          })}
        >
          {({ isActive }) => <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />}
        </NavLink>
      ))}
    </nav>
  )
}
