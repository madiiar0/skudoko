import { usePlayGameActions } from './usePlayGameActions'
import { usePlaySessionPersistence } from './usePlaySessionPersistence'

export function usePlayPageController() {
  const {
    session,
    setSession,
    isLoading,
    loadError,
    routeSessionId,
    userId,
    saveCompletedSession,
    saveCurrentSessionBeforeNewGame,
    startNewSession,
  } = usePlaySessionPersistence()

  const viewOnly = session?.status === 'completed'
  const gameActions = usePlayGameActions({
    session,
    setSession,
    userId,
    routeSessionId,
    viewOnly,
    saveCompletedSession,
    saveCurrentSessionBeforeNewGame,
    startNewSession,
  })

  return {
    session,
    isLoading,
    loadError,
    viewOnly,
    ...gameActions,
  }
}
