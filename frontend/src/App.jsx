import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import { Toaster } from 'react-hot-toast'

import ProtectedLayout from './components/ProtectedLayout'
import { ProtectedRoute, PublicOnlyRoute } from './components/RouteGuards'
import { AuthProvider } from './context/AuthContext'
import PlayPage from './pages/PlayPage'
import PlaceholderPage from './pages/PlaceholderPage'
import DailyChallengePage from './pages/DailyChallengePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import HistoryPage from './pages/HistoryPage'
import LeaderboardPage from './pages/LeaderboardPage'
import UpgradePage from './pages/UpgradePage'
import { Palette } from 'lucide-react'
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
              <Route path="/daily-challenge" element={<DailyChallengePage />} />
              <Route
                path="/skins"
                element={<PlaceholderPage title="Skins" icon={<Palette size={40} />} />}
              />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/upgrade" element={<UpgradePage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/play" replace />} />
        </Routes>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 2600,
            style: {
              background: '#162236',
              border: '1px solid #243450',
              color: '#E8EDF5',
              fontSize: '13px',
              fontWeight: 600,
            },
            success: {
              iconTheme: {
                primary: '#2DD4BF',
                secondary: '#0C2820',
              },
            },
            error: {
              iconTheme: {
                primary: '#FF4D6D',
                secondary: '#2B0E18',
              },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  )
}
