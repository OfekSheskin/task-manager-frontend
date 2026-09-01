const BASE_URL = import.meta.env.VITE_API_BASE_URL

export async function apiFetch(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(readDetail(body.detail) || `Request failed: ${res.status}`)
  }
  return res.status === 204 ? null : res.json()
}


// FastAPI answers a rejected body (422) with an array of field errors rather
// than the plain string every other error carries, so both shapes get turned
// into one readable line here instead of at each call site.
function readDetail(detail) {
  if (!detail) return null
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        const field = item.loc?.[item.loc.length - 1]
        return field ? `${field}: ${item.msg}` : item.msg
      })
      .join(', ')
  }
  return null
}
