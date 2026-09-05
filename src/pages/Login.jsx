import { Link } from 'react-router-dom'
import { useState } from 'react'
import { apiFetch } from '../api/client'
import { useTokenContext } from '../context/AuthContext'
import { useNavigate, Navigate } from 'react-router-dom'


export default function Login() {

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const { token, login } = useTokenContext() // Use the useTokenContext hook to access the login function
  const navigate = useNavigate()

  async function handleSubmit(event) {
        event.preventDefault()


    try{
        const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: { username, password },
      }) 
      login(data.access_token)
      navigate('/tasks') // Navigate to the tasks page after successful login

    }
      catch (err) {
        console.error('Login failed:', err)
        setError(err.message)
      }

    }

    //if already signed in redirects to tasks page
  if (token) return <Navigate to="/tasks" replace />

  return (
    <div className="auth-page">
      <div className="auth-panel">
        <h1>Login</h1>

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
          <button type="submit" className="btn-primary">Login</button>

          {error && <p className="form-error">Error: {error}</p>}
        </form>
      </div>

      <p className="auth-switch">
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  )
}
