import { Navigate } from 'react-router-dom'
import { useTokenContext } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { token, userLoading } = useTokenContext()

  if (!token) return <Navigate to="/login" replace />

  if (userLoading) return <p>Loading...</p>

  return children
}
