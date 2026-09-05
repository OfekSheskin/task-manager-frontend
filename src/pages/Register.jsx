import { Link } from 'react-router-dom'
import { useState } from 'react'
import { apiFetch } from '../api/client'
import { useTokenContext } from '../context/AuthContext'
import { useNavigate, Navigate } from 'react-router-dom'



export default function Register() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const { token } = useTokenContext()
  const navigate = useNavigate()


    async function handleSubmit(event) {
          event.preventDefault()
  
  
      try{
          await apiFetch('/auth/register', {
          method: 'POST',
          body: { username, password },
        }) 
        navigate('/login')

  
      }
        catch (err) {
          console.error('Registration failed:', err)
          setError(err.message)
        }
  
      }

    //if already signed in redirects to tasks page
  if (token) return <Navigate to="/tasks" replace />

  return (
    <div className="auth-page">
      <div className="auth-panel">
        <h1>Register</h1>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label htmlFor="username">Username</label>
            <input type="text" id="username" name="username" value={username}
              onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div className="form-row">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" value={password}
              onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary">Register</button>

          {error && <p className="form-error">Error: {error}</p>}
        </form>
      </div>

      <p className="auth-switch">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  )
}
