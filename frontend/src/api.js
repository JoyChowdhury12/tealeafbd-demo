// API client. The base URL is configurable (VITE_API_URL); by default requests
// go to /api, which Vite proxies to FastAPI in development.
const BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')

export class ApiError extends Error {}

async function request(path, options) {
  let res
  try {
    res = await fetch(`${BASE}${path}`, options)
  } catch {
    throw new ApiError('Cannot reach the TeaLeafBD server. Please make sure the backend is running.')
  }
  if (!res.ok) {
    let msg = 'Something went wrong. Please try again.'
    try {
      const body = await res.json()
      if (typeof body.detail === 'string') msg = body.detail
    } catch { /* keep default */ }
    throw new ApiError(msg)
  }
  return res.json()
}

export function predict(file) {
  const form = new FormData()
  form.append('file', file)
  return request('/predict', { method: 'POST', body: form })
}

export function health() {
  return request('/health')
}
