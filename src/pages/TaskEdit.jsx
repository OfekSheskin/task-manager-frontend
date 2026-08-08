import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { getTask, listTasks, updateTask } from '../api/tasks'
import { useTokenContext } from '../context/AuthContext'

const STATUSES = ['To Do', 'Done', 'Cancelled']


export default function TaskEdit() {

  const { taskId } = useParams()
  const navigate = useNavigate()
  const { token } = useTokenContext()


  const [original, setOriginal] = useState(null)
  const [allTasks, setAllTasks] = useState([])
  const [form, setForm] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function fetchAll() {
      setLoading(true)
      try {
        const [task, all] = await Promise.all([
          getTask(token, taskId),
          listTasks(token),
        ])
        if (cancelled) return
        setOriginal(task)
        setAllTasks(all)
        setForm({
          task_title: task.task_title,
          task_info: task.task_info ?? '',
          status: task.status,
          cancel_reason: task.cancel_reason ?? '',
          parent_task_id: task.parent_task_id ?? '',
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

  if (loading) return <p>Loading task...</p>
  if (error && !form) return <p>Error: {error}</p>
  if (!form) return null

  // A task cannot be its own parent; the backend also rejects descendants.
  const parentOptions = allTasks.filter((t) => t.task_id !== original.task_id)

  return (
    <div>
      <Link to={`/tasks/${taskId}`}>Back to task</Link>

      <h2>Edit task</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="task_title">Title</label>
          <input
            id="task_title"
            value={form.task_title}
            onChange={(e) => setField('task_title', e.target.value)}
            required
            maxLength={255}
          />
        </div>

        <div>
          <label htmlFor="task_info">Details</label>
          <textarea
            id="task_info"
            value={form.task_info}
            onChange={(e) => setField('task_info', e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="status">Status</label>
          <select
            id="status"
            value={form.status}
            onChange={(e) => setField('status', e.target.value)}
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        {form.status === 'Cancelled' && (
          <div>
            <label htmlFor="cancel_reason">Cancel reason</label>
            <input
              id="cancel_reason"
              value={form.cancel_reason}
              onChange={(e) => setField('cancel_reason', e.target.value)}
              maxLength={100}
            />
          </div>
        )}

        <div>
          <label htmlFor="parent_task_id">Parent task</label>
          <select
            id="parent_task_id"
            value={form.parent_task_id}
            onChange={(e) => setField('parent_task_id', e.target.value)}
          >
            <option value="">No parent (top level)</option>
            {parentOptions.map((task) => (
              <option key={task.task_id} value={task.task_id}>
                {task.task_title}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </button>
        {' '}
        <button type="button" onClick={() => navigate(`/tasks/${taskId}`)} disabled={saving}>
          Cancel
        </button>

        {error && <p>Error: {error}</p>}
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
    parent_task_id: form.parent_task_id === '' ? null : Number(form.parent_task_id),
  }

  const changes = {}
  for (const [field, value] of Object.entries(next)) {
    if (value !== (original[field] ?? null)) changes[field] = value
  }
  return changes
}
