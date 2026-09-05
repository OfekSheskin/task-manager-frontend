import { useState } from 'react'


export default function LabelItem({ label, onUpdate, onDelete }) {

  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(label.label_name)
  const [color, setColor] = useState(label.label_color)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  // The form starts from the label as it is now, so opening it after a failed
  // save does not leave the old attempt sitting in the inputs.
  function startEditing() {
    setName(label.label_name)
    setColor(label.label_color)
    setError(null)
    setEditing(true)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!name.trim()) return

    // Only what actually changed goes in the PATCH body -- sending the name
    // unchanged would still be checked against the other labels and answer 409.
    const changes = {}
    if (name.trim() !== label.label_name) changes.label_name = name.trim()
    if (color !== label.label_color) changes.label_color = color

    if (Object.keys(changes).length === 0) {
      setEditing(false)
      return
    }

    setSaving(true)
    try {
      await onUpdate(label.label_id, changes)
      setEditing(false)
      setError(null)
    }
    catch (err) {
      setError(err.message)
    }
    finally {
      setSaving(false)
    }
  }

  // Editing happens in place: the row keeps its shape and swaps the name and
  // the swatch for the two inputs that change them.
  if (editing) {
    return (
      <form className="item-card" onSubmit={handleSubmit}>
        <div className="item-main">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={50}
          />
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            aria-label="Label color"
          />
        </div>
        <div className="item-actions">
          <button type="submit" className="btn-primary" disabled={saving || !name.trim()}>
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button type="button" className="btn" onClick={() => setEditing(false)} disabled={saving}>
            Cancel
          </button>
        </div>

        {error && <p className="form-error">Error: {error}</p>}
      </form>
    )
  }

  return (
    <div className="item-card">
      <div className="item-main">
        <span style={{ color: label.label_color }}>■</span>
        <span className="item-name">{label.label_name}</span>
      </div>
      <div className="item-actions">
        <button className="btn" onClick={startEditing}>Edit</button>
        <button className="btn-danger" onClick={() => onDelete(label)}>Delete</button>
      </div>
    </div>
  )
}
