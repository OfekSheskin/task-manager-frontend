import { apiFetch } from './client'

// Returns the user the token belongs to. Doubles as a token validity check:
// it throws on an expired or tampered token.
export function getMe(token) {
  return apiFetch('/auth/me', { token })
}
