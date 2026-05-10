import { apiRequest } from './client'

export function listGameSessions() {
  return apiRequest('/sessions')
}

export function getGameSession(sessionId) {
  return apiRequest(`/sessions/${sessionId}`)
}

export function createGameSession(payload) {
  return apiRequest('/sessions', {
    method: 'POST',
    body: payload,
  })
}

export function saveGameSession(sessionId, payload) {
  return apiRequest(`/sessions/${sessionId}`, {
    method: 'PUT',
    body: payload,
  })
}

export function completeGameSession(sessionId, payload) {
  return apiRequest(`/sessions/${sessionId}/complete`, {
    method: 'PATCH',
    body: payload,
  })
}

export function renameGameSession(sessionId, name) {
  return apiRequest(`/sessions/${sessionId}/name`, {
    method: 'PATCH',
    body: { name },
  })
}

export function deleteGameSession(sessionId) {
  return apiRequest(`/sessions/${sessionId}`, {
    method: 'DELETE',
  })
}
