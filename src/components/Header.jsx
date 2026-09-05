import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useTokenContext } from '../context/AuthContext'

export default function Header() {

  const { logout } = useTokenContext()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  // NavLink knows which route is open, so the current page's link is the one
  // that comes back with isActive true and gets the bold class.
  function linkClass({ isActive }) {
    return isActive ? 'nav-link nav-link-active' : 'nav-link'
  }

  return (
    <div>
      <nav className="nav">
        <div className="nav-inner">
          <div className="nav-links">
            <NavLink className={linkClass} to="/tasks">Tasks</NavLink>
            <NavLink className={linkClass} to="/friends">Friends</NavLink>
            <NavLink className={linkClass} to="/labels">Labels</NavLink>
          </div>
          <button className="btn nav-logout" onClick={handleLogout}>Log out</button>
        </div>
      </nav>
      <main className="page">
        <Outlet />
      </main>
    </div>
  )
}
