import { Navigate } from 'react-router-dom'
import { useTokenContext } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { token } = useTokenContext()
  if (!token) return <Navigate to="/login" replace />
  return children
}
