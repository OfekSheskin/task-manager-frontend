import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { getTask, updateTask } from '../api/tasks'
import { useTokenContext } from '../context/AuthContext'

const STATUSES = ['To Do', 'Done', 'Cancelled']


export default function TaskEdit() {

  const { taskId } = useParams()
  const navigate = useNavigate()
  const { token } = useTokenContext()


  const [original, setOriginal] = useState(null)
  const [form, setForm] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function fetchAll() {
      setLoading(true)
      try {
        const task = await getTask(token, taskId)
        if (cancelled) return
        setOriginal(task)
        setForm({
          task_title: task.task_title,
          task_info: task.task_info ?? '',
          status: task.status,
          cancel_reason: task.cancel_reason ?? '',
        })
        setError(null)
      }
      catch (error) {
        if (cancelled) return
        setError(error.message)
      }
      finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchAll()

    return () => {
      cancelled = true
    }
  }, [token, taskId])

  function setField(name, value) {
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const changes = buildChanges(original, form)
    if (Object.keys(changes).length === 0) {
      navigate(`/tasks/${taskId}`)
      return
    }

    setSaving(true)
    try {
      await updateTask(token, taskId, changes)
      navigate(`/tasks/${taskId}`)
    }
    catch (error) {
      setError(error.message)
    }
    finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="note">Loading task...</p>
  if (error && !form) return <p className="form-error">Error: {error}</p>
  if (!form) return null

  return (
    <div>
      <Link className="page-back" to={`/tasks/${taskId}`}>Back to task</Link>

      <h1>Edit task</h1>

      <form className="panel" onSubmit={handleSubmit}>
        <div className="form-row">
          <label htmlFor="task_title">Title</label>
          <input
            id="task_title"
            value={form.task_title}
            onChange={(e) => setField('task_title', e.target.value)}
            required
            maxLength={255}
          />
        </div>

        <div className="form-row">
          <label htmlFor="task_info">Details</label>
          <textarea
            id="task_info"
            rows="4"
            value={form.task_info}
            onChange={(e) => setField('task_info', e.target.value)}
          />
        </div>

        <div className="form-row">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            value={form.status}
            onChange={(e) => setField('status', e.target.value)}
          >
            {STATUSES.map((status) => (
              <option
                key={status}
                value={status}
                // A blocked task cannot be completed. The backend refuses it with
                // a 400 either way; the option is off so the rule shows up here
                // the same way it does on the task page.
                disabled={status === 'Done' && original.is_blocked}
              >
                {status}
              </option>
            ))}
          </select>
          {original.is_blocked && (
            <p className="note-small">This task is blocked, so it cannot be set to Done yet.</p>
          )}
        </div>

        {form.status === 'Cancelled' && (
          <div className="form-row">
            <label htmlFor="cancel_reason">Cancel reason</label>
            <input
              id="cancel_reason"
              value={form.cancel_reason}
              onChange={(e) => setField('cancel_reason', e.target.value)}
              maxLength={100}
            />
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => navigate(`/tasks/${taskId}`)}
            disabled={saving}
          >
            Cancel
          </button>
        </div>

        {error && <p className="form-error">Error: {error}</p>}
      </form>
    </div>
  )
}


function buildChanges(original, form) {
  const next = {
    task_title: form.task_title.trim(),
    task_info: form.task_info.trim() || null,
    status: form.status,
    cancel_reason: form.status === 'Cancelled' ? (form.cancel_reason.trim() || null) : null,
  }

  const changes = {}
  for (const [field, value] of Object.entries(next)) {
    if (value !== (original[field] ?? null)) changes[field] = value
  }
  return changes
}
