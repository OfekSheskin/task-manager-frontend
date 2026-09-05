import { useState } from 'react'


export default function AddFriendForm({ onSend }) {

  const [username, setUsername] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [sent, setSent] = useState(null)


  async function handleSendRequest(event) {
    event.preventDefault()
    if (!username.trim()) return

    setSaving(true)
    try {
      await onSend(username.trim())
      setSent(username.trim())
      setUsername('')
      setError(null)
    }
    catch (err) {
      setError(err.message)
    }
    finally {
      setSaving(false)
    }
  }

  function handleChange(event) {
    setUsername(event.target.value)
    setSent(null)
    setError(null)
  }

  return (
    <form className="panel inline-form" onSubmit={handleSendRequest}>
      <input
        type="text"
        value={username}
        onChange={handleChange}
        placeholder="Add a friend by username..."
      />
      <button type="submit" className="btn-primary" disabled={saving || !username.trim()}>
        {saving ? 'Sending...' : 'Send request'}
      </button>

      {sent && <p className="note-small">Request sent to {sent}</p>}
      {error && <p className="form-error">Error: {error}</p>}
    </form>
  )
}
