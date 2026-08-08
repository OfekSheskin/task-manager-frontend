import { useState, useEffect } from 'react'
import { listTasks, createTask, deleteTask } from '../api/tasks'
import { useTokenContext } from '../context/AuthContext'
import TaskItem from '../components/TaskItem'
import NewTaskForm from '../components/NewTaskForm'


export default function Tasks() {

  const [tasks, setTasks] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const { token } = useTokenContext()

  useEffect(() => {
    async function fetchTasks() {
      try {
        const data = await listTasks(token)
        setTasks(data)
        setError(null)
      }
      catch (error) {
        console.error('Failed to load tasks:', error)
        setError(error.message)
      }
      finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [token])

  async function handleCreate(newTask) {
    const created = await createTask(token, newTask)
    setTasks((current) => [...current, created])
  }

  async function handleDelete(taskId) {
    if (!window.confirm('Delete this task and all of its subtasks?')) return

    try {
      await deleteTask(token, taskId)
      // The backend cascades the delete to descendants, so drop them here too
      // instead of refetching the whole list.
      setTasks((current) => removeWithDescendants(current, taskId))
    }
    catch (error) {
      setError(error.message)
    }
  }

  // GET /tasks returns every task the user owns, subtasks included. The list
  // page only shows roots — subtasks are shown inside their parent's page.
  const rootTasks = tasks.filter((task) => task.parent_task_id === null)

  return (
    <div>
      <h1>Tasks</h1>

      <NewTaskForm onCreate={handleCreate} />

      {loading && <p>Loading tasks...</p>}
      {error && <p>Error: {error}</p>}
      {!loading && rootTasks.length === 0 && <p>You have no tasks to show</p>}

      {!loading && !error &&
        rootTasks.map((task) => (
          <TaskItem key={task.task_id} task={task} onDelete={handleDelete} />
        ))
      }
    </div>
  )
}


function removeWithDescendants(tasks, taskId) {
  const doomed = new Set([taskId])
  let changed = true

  while (changed) {
    changed = false
    for (const task of tasks) {
      if (!doomed.has(task.task_id) && doomed.has(task.parent_task_id)) {
        doomed.add(task.task_id)
        changed = true
      }
    }
  }

  return tasks.filter((task) => !doomed.has(task.task_id))
}
