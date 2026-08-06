import { useState, useEffect } from 'react'
import { getTask } from '../api/tasks'
import { useTokenContext } from '../context/AuthContext'


export default function TaskDetail({ taskId }) {

  const [task, setTask] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const { token } = useTokenContext()

  useEffect(() => {
    // Flipped by the cleanup below when taskId changes mid-request, so a slow
    // response for an old task can never overwrite the one now selected.
    let cancelled = false

    async function fetchTask() {
      setLoading(true)
      try {
        const data = await getTask(token, taskId)
        if (cancelled) return
        setTask(data)
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

    fetchTask()

    return () => {
      cancelled = true
    }
  }, [token, taskId])

  if (loading) return <p>Loading task...</p>
  if (error) return <p>Error: {error}</p>
  if (!task) return null

  return (
    <div>
      <h2>{task.task_title}</h2>
      <p>{task.task_info}</p>
      <p>Status: {task.status}</p>
      <p>Created: {task.created_at}</p>
      {task.done_date && <p>Done: {task.done_date}</p>}
      {task.cancel_reason && <p>Cancel reason: {task.cancel_reason}</p>}
    </div>
  )
}
