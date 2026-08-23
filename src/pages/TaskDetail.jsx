import { useState, useEffect, useCallback } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { getTask, listTasks, createTask, updateTask, deleteTask, listShares, shareTask, unshareTask } from '../api/tasks'
import {listFriends} from '../api/friends'
import { useTokenContext } from '../context/AuthContext'

import NewTaskForm from '../components/NewTaskForm'


export default function TaskDetail() {

  const { taskId } = useParams()
  const navigate = useNavigate()
  const { token, user } = useTokenContext()

  const [task, setTask] = useState(null)
  const [subtasks, setSubtasks] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [friends, setFriends] = useState([])
  const [shares, setShares] = useState([])
  const [selectedFriend, setSelectedFriend] = useState('')
  const [shareError, setShareError] = useState(null)
  const [sharing, setSharing] = useState(false)

  const load = useCallback(async () => {

    const [current, all, taskShares, myFriends] = await Promise.all([
      getTask(token, taskId),
      listTasks(token),
      listShares(token,taskId),
      listFriends(token)
    ])
    setTask(current)
    setSubtasks(all.filter((t) => t.parent_task_id === current.task_id))
    setShares(taskShares)
    setFriends(myFriends)
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

  // Derived, not state: friends who do not already have this task. Sharing
  // with an existing share is a 409, so those names never reach the dropdown.
  const availableFriends = friends.filter(
    (friend) => !shares.some((share) => share.user_id === friend.user_id)
  )

  async function handleShare(event) {
    event.preventDefault()
    if (!selectedFriend) return

    setSharing(true)
    try {
      // The POST answers with { user_id, username }, which is exactly a row of
      // the list above -- so the response goes straight into state, no refetch.
      const newShare = await shareTask(token, task.task_id, selectedFriend)
      setShares((current) => [...current, newShare])
      setSelectedFriend('')
      setShareError(null)
    }
    catch (error) {
      setShareError(error.message)
    }
    finally {
      setSharing(false)
    }
  }

  async function handleUnshare(sharedUserId, username) {
    if (!window.confirm(`Stop sharing this task with ${username}?`)) return

    try {
      await unshareTask(token, task.task_id, sharedUserId)
      setShares((current) => current.filter((share) => share.user_id !== sharedUserId))
      setShareError(null)
    }
    catch (error) {
      setShareError(error.message)
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

      {task.owner_id === user.user_id && task.parent_task_id === null && (
        <div>
          <hr />

          <h3>Shared with</h3>

          {shares.length === 0 && <p>Not shared with anyone yet</p>}

          {shares.map((share) => (
            <div key={share.user_id}>
              {share.username}
              {' '}
              <button onClick={() => handleUnshare(share.user_id, share.username)}>
                Remove
              </button>
            </div>
          ))}

          <h4>Share with a friend</h4>

          {friends.length === 0 && (
            <p>
              You have no friends yet — add some on the <Link to="/friends">Friends page</Link>.
            </p>
          )}

          {friends.length > 0 && availableFriends.length === 0 && (
            <p>All of your friends already have this task.</p>
          )}

          {availableFriends.length > 0 && (
            <form onSubmit={handleShare}>
              <select value={selectedFriend} onChange={(e) => setSelectedFriend(e.target.value)}>
                <option value="">Choose a friend...</option>
                {availableFriends.map((friend) => (
                  <option key={friend.user_id} value={friend.username}>
                    {friend.username}
                  </option>
                ))}
              </select>
              {' '}
              <button type="submit" disabled={sharing || !selectedFriend}>
                {sharing ? 'Sharing...' : 'Share'}
              </button>
            </form>
          )}

          {shareError && <p>Error: {shareError}</p>}
        </div>
      )}
    </div>
  )
}
