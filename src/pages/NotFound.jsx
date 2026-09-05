import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="page">
      <div className="panel">
        <h1>404 — Page not found</h1>
        <p className="note">That page does not exist.</p>
        <p><Link to="/tasks">Go to tasks</Link></p>
      </div>
    </div>
  )
}
