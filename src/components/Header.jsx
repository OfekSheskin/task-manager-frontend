import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useTokenContext } from '../context/AuthContext'

export default function Header() {

  const { logout } = useTokenContext()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div>
      <nav>
        <Link to="/tasks">Tasks</Link>
        {' | '}
        <Link to="/friends">Friends</Link>
        {' | '}
        <button onClick={handleLogout}>Log out</button>
      </nav>
      <hr />
      <main>
        <Outlet />
      </main>
    </div>
  )
}
