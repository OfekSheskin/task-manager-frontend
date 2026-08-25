import { useState } from 'react'

// The backend validates the color against ^#[0-9A-Fa-f]{6}$, which is exactly
// what <input type="color"> produces -- so the format can never be wrong here.
const DEFAULT_COLOR = '#3B82F6'


export default function LabelForm({ onCreate }) {

  const [name, setName] = useState('')
  const [color, setColor] = useState(DEFAULT_COLOR)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(event) {
    event.preventDefault()
    if (!name.trim()) return

    setSaving(true)
    try {
      await onCreate({ label_name: name.trim(), label_color: color })
      setName('')
      setColor(DEFAULT_COLOR)
      setError(null)
    }
    catch (err) {
      setError(err.message)
    }
    finally {
      setSaving(false)
    }
  }

  function handleNameChange(event) {
    setName(event.target.value)
    setError(null)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={name}
        onChange={handleNameChange}
        maxLength={50}
        placeholder="New label name..."
      />
      {' '}
      <input
        type="color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
      />
      {' '}
      <button type="submit" disabled={saving || !name.trim()}>
        {saving ? 'Creating...' : 'Create label'}
      </button>

      {error && <p>Error: {error}</p>}
    </form>
  )
}
