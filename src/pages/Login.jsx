import { Link } from 'react-router-dom'
import { useState } from 'react'
import { apiFetch } from '../api/client'

export default function Login() {

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [result, setResult] = useState(null)

  async function handleSubmit(event) {
        event.preventDefault()


    try{
        const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: { username, password },
      }) 
      setResult(data)

    }
      catch (error) {
        console.error('Login failed:', error)
        setResult({ error: error.message })
      }

    }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username</label>
          <input type="text" id="username" name="username" value = {username}
            onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div>
          <label>Password</label>
          <input type="password" id="password" name="password" value = {password}
            onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button type="submit">Login</button>
      </form>
      <h1>Login</h1>
      <p>
        Don't have an account? <Link to="/register">Register</Link>
      </p>
      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}

    </div>
  )
}
