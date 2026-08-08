import { useState, useEffect, useCallback } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { getTask, listTasks, createTask, updateTask, deleteTask } from '../api/tasks'
import { useTokenContext } from '../context/AuthContext'
import NewTaskForm from '../components/NewTaskForm'


export default function TaskDetail() {

  const { taskId } = useParams()
  const navigate = useNavigate()
  const { token } = useTokenContext()

  const [task, setTask] = useState(null)
  const [subtasks, setSubtasks] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    // Two calls: the task itself (so a bad id still gives a clean 404) and the
    // full list, filtered down to this task's children. There is no
    // GET /tasks/{id}/subtasks endpoint yet.
    const [current, all] = await Promise.all([
      getTask(token, taskId),
      listTasks(token),
    ])
    setTask(current)
    setSubtasks(all.filter((t) => t.parent_task_id === current.task_id))
  }, [token, taskId])

  useEffect(() => {
    let cancelled = false

    async function fetchAll() {
      setLoading(true)
      try {
        await load()
        if (cancelled) return
        setError(null)
      }
      catch (error) {
        if (cancelled) return
        console.error('Failed to load task:', error)
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
  }, [load])

  async function handleMarkDone() {
    setSaving(true)
    try {
      const updated = await updateTask(token, task.task_id, { status: 'Done' })
      setTask(updated)
      setError(null)
    }
    catch (error) {
      setError(error.message)
    }
    finally {
      setSaving(false)
    }
  }

  async function handleAddSubtask(newTask) {
    const created = await createTask(token, newTask)
    setSubtasks((current) => [...current, created])
  }

  async function handleDeleteSubtask(subtaskId) {
    if (!window.confirm('Delete this subtask and all of its subtasks?')) return

    try {
      await deleteTask(token, subtaskId)
      setSubtasks((current) => current.filter((t) => t.task_id !== subtaskId))
    }
    catch (error) {
      setError(error.message)
    }
  }

  async function handleDeleteTask() {
    if (!window.confirm('Delete this task and all of its subtasks?')) return

    try {
      await deleteTask(token, task.task_id)
      navigate('/tasks', { replace: true })
    }
    catch (error) {
      setError(error.message)
    }
  }

  if (loading) return <p>Loading task...</p>
  if (error && !task) return <p>Error: {error}</p>
  if (!task) return null

  return (
    <div>
      <Link to="/tasks">Back to all tasks</Link>

      <h2>{task.task_title}</h2>
      {task.task_info && <p>{task.task_info}</p>}
      <p>Status: {task.status}</p>
      <p>Created: {task.created_at}</p>
      {task.done_date && <p>Done: {task.done_date}</p>}
      {task.cancel_reason && <p>Cancel reason: {task.cancel_reason}</p>}

      {task.parent_task_id && (
        <p>
          Parent: <Link to={`/tasks/${task.parent_task_id}`}>#{task.parent_task_id}</Link>
        </p>
      )}

      <div>
        <button onClick={handleMarkDone} disabled={saving || task.status === 'Done'}>
          {saving ? 'Saving...' : 'Mark as Done'}
        </button>
        {' '}
        <Link to={`/tasks/${task.task_id}/edit`}>Edit</Link>
        {' '}
        <button onClick={handleDeleteTask}>Delete</button>
      </div>

      {error && <p>Error: {error}</p>}

      <hr />

      <h3>Subtasks</h3>

      <NewTaskForm parentTaskId={task.task_id} onCreate={handleAddSubtask} />

      {subtasks.length === 0 && <p>No subtasks yet</p>}

      {subtasks.map((subtask) => (
        <div key={subtask.task_id}>
          <Link to={`/tasks/${subtask.task_id}`}>{subtask.task_title}</Link>
          {' — '}
          {subtask.status}
          {' '}
          <Link to={`/tasks/${subtask.task_id}/edit`}>Edit</Link>
          {' '}
          <button onClick={() => handleDeleteSubtask(subtask.task_id)}>Delete</button>
        </div>
      ))}
    </div>
  )
}
