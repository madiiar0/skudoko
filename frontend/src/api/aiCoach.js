import { apiRequest } from './client'

export function askAICoach(payload) {
  return apiRequest('/ai-coach/ask', {
    method: 'POST',
    body: payload,
  })
}
