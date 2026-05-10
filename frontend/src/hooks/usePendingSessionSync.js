import { useEffect } from 'react'

import { syncPendingSessions } from '../services/sessionSync'
import { getUserStorageId } from '../utils/gameSessionStorage'
import { useAuth } from './useAuth'

export function usePendingSessionSync() {
  const { user } = useAuth()
  const userId = getUserStorageId(user)

  useEffect(() => {
    if (!user) {
      return undefined
    }

    function sync() {
      syncPendingSessions(userId).catch(error => {
        console.error(error)
      })
    }

    sync()
    window.addEventListener('online', sync)

    return () => {
      window.removeEventListener('online', sync)
    }
  }, [user, userId])
}
