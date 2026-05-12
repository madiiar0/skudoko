import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import { Toaster } from 'react-hot-toast'

import ProtectedLayout from './components/ProtectedLayout'
import { ProtectedRoute, PublicOnlyRoute } from './components/RouteGuards'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import PlayPage from './pages/PlayPage'
import BlogDetailPage from './pages/BlogDetailPage'
import BlogPage from './pages/BlogPage'
import DailyChallengePage from './pages/DailyChallengePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import HistoryPage from './pages/HistoryPage'
import LandingPage from './pages/LandingPage'
import LeaderboardPage from './pages/LeaderboardPage'
import UpgradePage from './pages/UpgradePage'
import './index.css'

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />

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
                <Route path="/play" element={<PlayPage />} />
                <Route path="/play/:sessionId" element={<PlayPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/daily-challenge" element={<DailyChallengePage />} />
                <Route path="/blogs" element={<BlogPage />} />
                <Route path="/blogs/:slug" element={<BlogDetailPage />} />
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
                background: 'var(--toast-bg)',
                border: '1px solid var(--toast-border)',
                color: 'var(--toast-text)',
                fontSize: '13px',
                fontWeight: 600,
              },
              success: {
                iconTheme: {
                  primary: 'var(--success)',
                  secondary: 'var(--success-bg)',
                },
              },
              error: {
                iconTheme: {
                  primary: 'var(--error)',
                  secondary: 'var(--error-bg)',
                },
              },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
