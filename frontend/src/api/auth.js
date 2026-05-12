import { apiRequest } from './client'

export function registerUser(payload) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: payload,
  })
}

export function loginUser(payload) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: payload,
  })
}

export function logoutUser() {
  return apiRequest('/auth/logout', {
    method: 'POST',
  })
}

export function checkAuth() {
  return apiRequest('/auth/check-auth')
}

export function activatePro() {
  return apiRequest('/auth/pro/activate', {
    method: 'PATCH',
  })
}

export function cancelPro() {
  return apiRequest('/auth/pro/cancel', {
    method: 'PATCH',
  })
}
