import { Navigate, Outlet } from 'react-router-dom'

import { useAuth } from '../hooks/useAuth'
import ScreenLoader from './ScreenLoader'

export function ProtectedRoute() {
  const { isCheckingAuth, isAuthenticated } = useAuth()

  if (isCheckingAuth) {
    return <ScreenLoader label="Checking your session..." />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export function PublicOnlyRoute() {
  const { isCheckingAuth, isAuthenticated } = useAuth()

  if (isCheckingAuth) {
    return <ScreenLoader label="Checking your session..." />
  }

  if (isAuthenticated) {
    return <Navigate to="/play" replace />
  }

  return <Outlet />
}
