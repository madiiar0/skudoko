const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')

export async function apiRequest(path, options = {}) {
  const { method = 'GET', body, headers, ...restOptions } = options

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    credentials: 'include',
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    ...restOptions,
  })

  const rawResponse = await response.text()
  let data = null

  if (rawResponse) {
    try {
      data = JSON.parse(rawResponse)
    } catch {
      data = rawResponse
    }
  }

  if (!response.ok) {
    const error = new Error(
      typeof data === 'object' && data?.message
        ? data.message
        : `Request failed with status ${response.status}`,
    )

    error.status = response.status
    error.data = data
    throw error
  }

  return data
}
