import { Link } from 'react-router-dom'
import { useState } from 'react'
import { apiFetch } from '../api/client'
import { useNavigate } from 'react-router-dom'



export default function Register() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [result, setResult] = useState(null)
  const navigate = useNavigate()   


    async function handleSubmit(event) {
          event.preventDefault()
  
  
      try{
          const data = await apiFetch('/auth/register', {
          method: 'POST',
          body: { username, password },
        }) 
        setResult(data) 
        navigate('/login')

  
      }
        catch (error) {
          console.error('Registration failed:', error)
          setResult({ error: error.message })
        }
  
      }
  return (
    <div>
      <form onSubmit={handleSubmit} >
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
        <button type="submit">Register</button>
      </form>
      <h1>Register</h1>
      <p>
     Already have an account? <Link to="/login">Login</Link>
      </p>
      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}

    </div>
  )
}
