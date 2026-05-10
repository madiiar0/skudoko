import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'

import ProtectedLayout from './components/ProtectedLayout'
import { ProtectedRoute, PublicOnlyRoute } from './components/RouteGuards'
import { AuthProvider } from './context/AuthContext'
import PlayPage from './pages/PlayPage'
import PlaceholderPage from './pages/PlaceholderPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import HistoryPage from './pages/HistoryPage'
import { Trophy, Palette, CalendarDays } from 'lucide-react'
import './index.css'

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route
              element={
                <ProtectedLayout
                  sidebarOpen={sidebarOpen}
                  onToggle={() => setSidebarOpen(open => !open)}
                />
              }
            >
              <Route path="/" element={<Navigate to="/play" replace />} />
              <Route path="/play" element={<PlayPage />} />
              <Route path="/play/:sessionId" element={<PlayPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route
                path="/daily-challenge"
                element={<PlaceholderPage title="Daily Challenge" icon={<CalendarDays size={40} />} />}
              />
              <Route
                path="/skins"
                element={<PlaceholderPage title="Skins" icon={<Palette size={40} />} />}
              />
              <Route
                path="/leaderboard"
                element={<PlaceholderPage title="Leaderboard" icon={<Trophy size={40} />} />}
              />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/play" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
