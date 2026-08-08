import { useState } from 'react'


export default function NewTaskForm({ parentTaskId = null, onCreate }) {

  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [info, setInfo] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  function reset() {
    setTitle('')
    setInfo('')
    setOpen(false)
    setError(null)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!title.trim()) return

    setSaving(true)
    try {
      await onCreate({
        task_title: title.trim(),
        task_info: info.trim() || null,
        parent_task_id: parentTaskId,
      })
      reset()
    }
    catch (err) {
      setError(err.message)
    }
    finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onFocus={() => setOpen(true)}
        placeholder={parentTaskId ? 'Add a subtask...' : 'Add a task...'}
      />

      {open && (
        <>
          <textarea
            value={info}
            onChange={(e) => setInfo(e.target.value)}
            placeholder="Details (optional)"
          />
          <button type="submit" disabled={saving || !title.trim()}>
            {saving ? 'Adding...' : 'Add'}
          </button>
          <button type="button" onClick={reset} disabled={saving}>
            Cancel
          </button>
        </>
      )}

      {error && <p>Error: {error}</p>}
    </form>
  )
}
