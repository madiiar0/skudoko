import { NavLink } from 'react-router-dom'
import { Gamepad2, CalendarDays, Palette, Trophy, History } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/play', icon: Gamepad2, label: 'Play' },
  { to: '/history', icon: History, label: 'History' },
  { to: '/daily-challenge', icon: CalendarDays, label: 'Daily' },
  { to: '/skins', icon: Palette, label: 'Skins' },
  { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
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
            color: isActive ? '#FF7A1A' : '#5A6478',
            borderTop: isActive ? '2px solid #FF7A1A' : '2px solid transparent',
            background: isActive ? '#110E06' : 'transparent',
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
