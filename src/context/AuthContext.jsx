import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(undefined)

export function TokenProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null)

  function login(newToken) {
    localStorage.setItem('token', newToken)
    setToken(newToken)
  }

  function logout() {
    localStorage.removeItem('token')
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
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
