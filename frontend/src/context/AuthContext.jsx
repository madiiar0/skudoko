import { useEffect, useState } from 'react'

import { activatePro as activateProRequest, cancelPro as cancelProRequest, checkAuth, loginUser, logoutUser, registerUser } from '../api/auth'
import { AuthContext } from './auth-context'

function isUnauthorized(error) {
  return error?.status === 401
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    let isActive = true

    async function loadUser() {
      try {
        const response = await checkAuth()
        if (isActive) {
          setUser(response?.user || null)
        }
      } catch (error) {
        if (isActive) {
          if (!isUnauthorized(error)) {
            console.error(error)
          }
          setUser(null)
        }
      } finally {
        if (isActive) {
          setIsCheckingAuth(false)
        }
      }
    }

    loadUser()

    return () => {
      isActive = false
    }
  }, [])

  async function register(payload) {
    const response = await registerUser(payload)
    setUser(response?.user || null)
    return response
  }

  async function login(payload) {
    const response = await loginUser(payload)
    setUser(response?.user || null)
    return response
  }

  async function logout() {
    const response = await logoutUser()
    setUser(null)
    return response
  }

  async function refreshUser() {
    const response = await checkAuth()
    setUser(response?.user || null)
    return response
  }

  async function activatePro() {
    const response = await activateProRequest()
    setUser(response?.user || null)
    return response
  }

  async function cancelPro() {
    const response = await cancelProRequest()
    setUser(response?.user || null)
    return response
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isCheckingAuth,
        isAuthenticated: !!user,
        register,
        login,
        logout,
        refreshUser,
        activatePro,
        cancelPro,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
