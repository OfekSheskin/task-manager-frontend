import { Link } from 'react-router-dom'

// Phase 2: build the login form and call the auth API, then store the token.
export default function Login() {
  return (
    <div>
      <h1>Login</h1>
      <p>
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  )
}
