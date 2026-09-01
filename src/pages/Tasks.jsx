import { useState, useEffect } from 'react'
import { listTasks, createTask, deleteTask } from '../api/tasks'
import { listLabels } from '../api/labels'
import { useTokenContext } from '../context/AuthContext'
import TaskItem from '../components/TaskItem'
import TaskFilters from '../components/TaskFilters'
import NewTaskForm from '../components/NewTaskForm'


// The state every filter starts from, and the baseline "is anything active?"
// is measured against. Selects and text inputs sit at '' for "no filter"; a
// <select> value is always a string, so ids kept here are strings too and get
// compared as strings further down.
const NO_FILTERS = {
  search: '',
  status: '',
  label: '',
  owner: '',
  createdFrom: '',
  createdTo: '',
  doneFrom: '',
  doneTo: '',
  hideBlocked: false,
}


export default function Tasks() {

  const [tasks, setTasks] = useState([])
  const [labels, setLabels] = useState([])
  // One object rather than one useState per filter: the empty-state check and
  // the reset button both need to talk about "the filters" as a whole, and
  // adding a filter should not mean touching three more places.
  const [filters, setFilters] = useState(NO_FILTERS)
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

  function setFilter(name, value) {
    setFilters((current) => ({ ...current, [name]: value }))
  }

  async function handleCreate(newTask) {
    const created = await createTask(token, newTask)
    setTasks((current) => [...current, created])
  }

  // Deleting means two different things depending on who is asking. Only a
  // non-owner on a *root* task is leaving a share; a non-owner deleting a
  // subtask really does delete it for everyone, so the subtask warning would
  // be the honest one there.
  function leavesShareOnDelete(task) {
    return task.owner_id !== user.user_id && task.parent_task_id === null
  }

  async function handleDelete(taskId) {
    const target = tasks.find((task) => task.task_id === taskId)

    const message = target && leavesShareOnDelete(target)
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

  const hasActiveFilters = Object.keys(NO_FILTERS).some(
    (field) => filters[field] !== NO_FILTERS[field]
  )

  // With no filter on, the page shows roots only -- subtasks belong inside
  // their parent's page. But a filter has to be able to reach a subtask: a
  // labelled or blocked subtask that is never listed can never be filtered
  // for. So an active filter searches every task the user can see and shows
  // the matches flat, each one captioned with the parent it came from.
  const visibleTasks = hasActiveFilters
    ? tasks.filter((task) => matchesFilters(task, filters, user.user_id))
    : tasks.filter((task) => task.parent_task_id === null)

  // GET /tasks already returns every task the user can see, so the parent of a
  // matched subtask is looked up here rather than asked for again.
  const titlesById = new Map(tasks.map((task) => [task.task_id, task.task_title]))

  return (
    <div>
      <h1>Tasks</h1>

      <NewTaskForm onCreate={handleCreate} />

      <TaskFilters
        filters={filters}
        labels={labels}
        onChange={setFilter}
        onClear={() => setFilters(NO_FILTERS)}
        hasActiveFilters={hasActiveFilters}
      />

      {loading && <p>Loading tasks...</p>}
      {error && <p>Error: {error}</p>}
      {!loading && visibleTasks.length === 0 && (
        <p>
          {hasActiveFilters
            ? 'No tasks match the current filters'
            : 'You have no tasks to show'}
        </p>
      )}

      {!loading && !error &&
        visibleTasks.map((task) => (
          <TaskItem
            key={task.task_id}
            task={task}
            leavesShare={leavesShareOnDelete(task)}
            parentTitle={titlesById.get(task.parent_task_id) ?? null}
            onDelete={handleDelete}
          />
        ))
      }
    </div>
  )
}


// One task against the whole filter set. Every filter is an AND: a task has to
// clear all of them, and an unset filter ('' or false) never rejects anything.
// TaskResponse already carries its labels and its derived is_blocked, so none
// of these need an extra request.
function matchesFilters(task, filters, currentUserId) {

  const search = filters.search.trim().toLowerCase()
  if (search) {
    const haystack = `${task.task_title} ${task.task_info ?? ''}`.toLowerCase()
    if (!haystack.includes(search)) return false
  }

  if (filters.status && task.status !== filters.status) return false

  if (
    filters.label &&
    !task.labels.some((label) => String(label.label_id) === filters.label)
  ) return false

  if (filters.owner === 'mine' && task.owner_id !== currentUserId) return false
  if (filters.owner === 'shared' && task.owner_id === currentUserId) return false

  // Both an <input type="date"> and the API hand dates over as YYYY-MM-DD, and
  // that format sorts the same lexically as it does chronologically -- so the
  // range compares as plain strings, with no Date parsing or timezone to get
  // wrong on the way.
  if (filters.createdFrom && task.created_at < filters.createdFrom) return false
  if (filters.createdTo && task.created_at > filters.createdTo) return false

  // An unfinished task has no done_date at all, so it falls outside any
  // completed-between range rather than counting as "before" it.
  if (filters.doneFrom && (!task.done_date || task.done_date < filters.doneFrom)) return false
  if (filters.doneTo && (!task.done_date || task.done_date > filters.doneTo)) return false

  if (filters.hideBlocked && task.is_blocked) return false

  return true
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
