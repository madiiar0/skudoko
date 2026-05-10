import { Outlet } from 'react-router-dom'

import Sidebar from './Sidebar'
import BottomNav from './BottomNav'
import { usePendingSessionSync } from '../hooks/usePendingSessionSync'

export default function ProtectedLayout({ sidebarOpen, onToggle }) {
  usePendingSessionSync()

  return (
    <div className="app-layout">
      <div className="sidebar-desktop">
        <Sidebar open={sidebarOpen} onToggle={onToggle} />
      </div>
      <main className="main-content">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
