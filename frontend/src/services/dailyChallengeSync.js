import {
  completeDailyChallengeAttempt,
  saveDailyChallengeAttempt,
} from '../api/dailyChallenge'
import {
  chooseNewestDailyAttempt,
  markLocalDailyAttemptSynced,
  normalizeDailyAttempt,
  toDailyAttemptPayload,
} from '../utils/dailyChallengeStorage'

function isOnline() {
  return typeof navigator === 'undefined' || navigator.onLine
}

export async function syncDailyAttemptToBackend(userId, attempt) {
  if (!isOnline()) {
    throw new Error('Offline')
  }

  const payload = toDailyAttemptPayload(attempt)
  const response = attempt.status === 'completed'
    ? await completeDailyChallengeAttempt(payload)
    : await saveDailyChallengeAttempt(payload)
  const remoteAttempt = normalizeDailyAttempt(response?.attempt, { pendingSync: false, syncError: '' })
  const selectedAttempt = chooseNewestDailyAttempt(attempt, remoteAttempt)

  if (selectedAttempt === remoteAttempt) {
    return markLocalDailyAttemptSynced(userId, remoteAttempt)
  }

  return selectedAttempt
}
