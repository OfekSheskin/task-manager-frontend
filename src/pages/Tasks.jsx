import { useState, useEffect } from 'react'
import { listTasks, createTask, deleteTask } from '../api/tasks'
import { listLabels } from '../api/labels'
import { useTokenContext } from '../context/AuthContext'
import TaskItem from '../components/TaskItem'
import NewTaskForm from '../components/NewTaskForm'


export default function Tasks() {

  const [tasks, setTasks] = useState([])
  const [labels, setLabels] = useState([])
  // '' means "no filter". A <select> value is always a string, so the id kept
  // here is a string too and gets compared as one further down.
  const [selectedLabel, setSelectedLabel] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const { token, user } = useTokenContext()

  useEffect(() => {
    async function fetchTasks() {
      try {
        // Tasks and labels load together: the filter needs both.
        const [taskData, labelData] = await Promise.all([
          listTasks(token),
          listLabels(token),
        ])
        setTasks(taskData)
        setLabels(labelData)
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
    // The list only shows root tasks, so a task this user does not own is one
    // shared with them: deleting it drops their share, it does not delete
    // anything for the owner. Say so instead of warning about subtasks.
    const target = tasks.find((task) => task.task_id === taskId)

    const message = target && target.owner_id !== user.user_id
      ? 'Remove this task from your list? It stays with the owner and everyone else it is shared with.'
      : 'Delete this task and all of its subtasks?'

    if (!window.confirm(message)) return

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
  // The label filter is chained onto the same derivation instead of living in
  // its own state, so there is only ever one list to keep correct.
  // TaskResponse already carries its labels, so no extra request is needed.
  const visibleTasks = tasks
    .filter((task) => task.parent_task_id === null)
    .filter(
      (task) =>
        !selectedLabel ||
        task.labels.some((label) => String(label.label_id) === selectedLabel)
    )

  return (
    <div>
      <h1>Tasks</h1>

      <NewTaskForm onCreate={handleCreate} />

      {labels.length > 0 && (
        <div>
          <label htmlFor="label-filter">Filter by label: </label>
          <select
            id="label-filter"
            value={selectedLabel}
            onChange={(e) => setSelectedLabel(e.target.value)}
          >
            <option value="">All labels</option>
            {labels.map((label) => (
              <option key={label.label_id} value={label.label_id}>
                {label.label_name}
              </option>
            ))}
          </select>
        </div>
      )}

      {loading && <p>Loading tasks...</p>}
      {error && <p>Error: {error}</p>}
      {!loading && visibleTasks.length === 0 && (
        <p>{selectedLabel ? 'No tasks with that label' : 'You have no tasks to show'}</p>
      )}

      {!loading && !error &&
        visibleTasks.map((task) => (
          <TaskItem
            key={task.task_id}
            task={task}
            leavesShare={task.owner_id !== user.user_id}
            onDelete={handleDelete}
          />
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
