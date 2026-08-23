import { createContext, useContext, useEffect, useState } from 'react'
import { getMe } from '../api/auth'

const AuthContext = createContext(undefined)

export function TokenProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null)
  const [user, setUser] = useState(null)

  // Derived, never stored: a stored flag would still read "not loading" on the
  // render where login() has just set the token, letting a page render with a
  // token but no user yet. Computing it keeps the two values in step.
  const userLoading = token !== null && user === null

  useEffect(() => {
    if (!token) {
      setUser(null)
      return
    }

    // Guards against an older in-flight request resolving after a newer one
    // and overwriting the current user with a stale value.
    let cancelled = false

    getMe(token)
      .then((me) => {
        if (!cancelled) setUser(me)
      })
      .catch(() => {
        if (cancelled) return
        // The token is expired or invalid. Drop it; ProtectedRoute then sends
        // the user to /login. Inlined rather than calling logout() so the
        // effect keeps depending on the token alone.
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
      })

    return () => {
      cancelled = true
    }
  }, [token])

  function login(newToken) {
    localStorage.setItem('token', newToken)
    setToken(newToken)
    // user is filled in by the effect above, which reruns on the new token.
  }

  function logout() {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ token, user, userLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useTokenContext() {
  const tokenContext = useContext(AuthContext)

  if (tokenContext === undefined) {
    throw new Error('useTokenContext must be used within a TokenProvider')
  }

  return tokenContext
}
