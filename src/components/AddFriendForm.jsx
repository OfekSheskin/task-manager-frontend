import { useState } from 'react'


export default function AddFriendForm({ onSend }) {

  const [username, setUsername] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [sent, setSent] = useState(null)

  // Sending a request changes nothing on this page — the new row lands in the
  // other user's pending list — so the confirmation is the only feedback.
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
    <form onSubmit={handleSendRequest}>
      <input
        value={username}
        onChange={handleChange}
        placeholder="Add a friend by username..."
      />
          <button type="submit" disabled={saving || !username.trim()}>
            {saving ? 'Sending...' : 'Send request'}
          </button>

      {sent && <p>Request sent to {sent}</p>}
      {error && <p>Error: {error}</p>}
    </form>
  )
}
