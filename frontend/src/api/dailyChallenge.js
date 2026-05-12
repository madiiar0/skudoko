import { apiRequest } from './client'

export function getCurrentDailyChallenge() {
  return apiRequest('/daily-challenge/current')
}

export function startDailyChallenge() {
  return apiRequest('/daily-challenge/current/start', {
    method: 'POST',
  })
}

export function saveDailyChallengeAttempt(payload) {
  return apiRequest('/daily-challenge/current/attempt', {
    method: 'PUT',
    body: payload,
  })
}

export function completeDailyChallengeAttempt(payload) {
  return apiRequest('/daily-challenge/current/complete', {
    method: 'PATCH',
    body: payload,
  })
}

export function getDailyChallengeLeaderboard() {
  return apiRequest('/daily-challenge/current/leaderboard')
}
