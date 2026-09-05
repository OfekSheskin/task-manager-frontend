import { useState, useEffect, useCallback } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  getTask, listTasks, createTask, updateTask, deleteTask,
  listShares, shareTask, unshareTask,
  listBlockers, addBlocker, removeBlocker,
} from '../api/tasks'
import {listFriends} from '../api/friends'
import { listLabels, attachLabel, detachLabel } from '../api/labels'
import { useTokenContext } from '../context/AuthContext'

import NewTaskForm from '../components/NewTaskForm'
import StatusChip from '../components/StatusChip'


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
  const [labels, setLabels] = useState([])
  const [selectedLabel, setSelectedLabel] = useState('')
  const [labelError, setLabelError] = useState(null)
  const [labeling, setLabeling] = useState(false)
  // Every task the user can see, kept so the blocker picker has something to
  // offer -- the same request that already feeds the subtask list.
  const [allTasks, setAllTasks] = useState([])
  const [blockers, setBlockers] = useState([])
  const [selectedBlocker, setSelectedBlocker] = useState('')
  const [blockerError, setBlockerError] = useState(null)
  const [blocking, setBlocking] = useState(false)

  const load = useCallback(async () => {

    const [current, all, taskShares, myFriends, myLabels, myBlockers] = await Promise.all([
      getTask(token, taskId),
      listTasks(token),
      listShares(token,taskId),
      listFriends(token),
      listLabels(token),
      listBlockers(token, taskId)
    ])
    setTask(current)
    setAllTasks(all)
    setSubtasks(all.filter((t) => t.parent_task_id === current.task_id))
    setShares(taskShares)
    setFriends(myFriends)
    setLabels(myLabels)
    setBlockers(myBlockers)
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

  // A shared (non-owner) user deleting a root task only drops their own share --
  // the task itself stays for everyone else. Owners, and anyone deleting a
  // subtask, really do remove the task and its whole subtree.
  const leavesShareOnDelete = task
    && task.owner_id !== user.user_id
    && task.parent_task_id === null

  async function handleDeleteTask() {
    const message = leavesShareOnDelete
      ? 'Remove this task from your list? It stays with the owner and everyone else it is shared with.'
      : 'Delete this task and all of its subtasks?'

    if (!window.confirm(message)) return

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
      try {
        await load()
        setSelectedFriend('')
      }
      catch {
        // Keep the share error on screen; the refresh is best effort.
      }
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

  const availableLabels = labels.filter(
    (label) => !task?.labels.some((attached) => attached.label_id === label.label_id)
  )

  async function handleAttachLabel(event) {
    event.preventDefault()
    if (!selectedLabel) return

    setLabeling(true)
    try {
      // Attaching answers with the whole updated task, so the response replaces
      // the task in state and the chip list below re-renders from it.
      const updated = await attachLabel(token, task.task_id, Number(selectedLabel))
      setTask(updated)
      setSelectedLabel('')
      setLabelError(null)
    }
    catch (error) {
      setLabelError(error.message)
    }
    finally {
      setLabeling(false)
    }
  }

  async function handleDetachLabel(labelId) {
    try {
      // Detaching answers 204 -- no body to put in state, so drop the label here.
      await detachLabel(token, task.task_id, labelId)
      setTask((current) => ({
        ...current,
        labels: current.labels.filter((label) => label.label_id !== labelId),
      }))
      setLabelError(null)
    }
    catch (error) {
      setLabelError(error.message)
    }
  }

  // Derived, not state: anything that could be picked as a blocker. Self and
  // the current blockers are dropped here because both answer 400. Cycles and
  // ancestor-blocks-descendant are left to the backend rather than reimplemented
  // -- there is one copy of that rule, and it lives in the service layer.
  const availableBlockers = allTasks.filter(
    (candidate) =>
      candidate.task_id !== task?.task_id &&
      !blockers.some((blocker) => blocker.task_id === candidate.task_id)
  )

  // Both handlers reload instead of patching state from the response: adding or
  // removing a blocker changes is_blocked for this task *and* for every subtask
  // under it (blocked propagates down), and the response only carries this task.
  async function handleAddBlocker(event) {
    event.preventDefault()
    if (!selectedBlocker) return

    setBlocking(true)
    try {
      await addBlocker(token, task.task_id, Number(selectedBlocker))
      await load()
      setSelectedBlocker('')
      setBlockerError(null)
    }
    catch (error) {
      setBlockerError(error.message)
    }
    finally {
      setBlocking(false)
    }
  }

  async function handleRemoveBlocker(blockerId) {
    try {
      await removeBlocker(token, task.task_id, blockerId)
      await load()
      setBlockerError(null)
    }
    catch (error) {
      setBlockerError(error.message)
    }
  }

  if (loading) return <p className="note">Loading task...</p>
  if (error && !task) return <p className="form-error">Error: {error}</p>
  if (!task) return null

  return (
    <div>
      <Link className="page-back" to="/tasks">Back to all tasks</Link>

      <div className="panel">
        <h1>{task.task_title}</h1>

        <div className="chip-row">
          <StatusChip status={task.status} blocked={task.is_blocked} />
        </div>

        {task.task_info && <p className="task-card-info">{task.task_info}</p>}

        <p className="note-small">
          Created {task.created_at}
          {task.done_date && ` · Done ${task.done_date}`}
        </p>

        {task.cancel_reason && (
          <p className="note-small">Cancel reason: {task.cancel_reason}</p>
        )}

        {task.parent_task_id && (
          <p className="note-small">
            Parent: <Link to={`/tasks/${task.parent_task_id}`}>#{task.parent_task_id}</Link>
          </p>
        )}

        <div className="form-actions">
          {/* The backend refuses Done on a blocked task with a 400 anyway; the
              button is disabled so the reason is visible before the click. */}
          <button
            className="btn-primary"
            onClick={handleMarkDone}
            disabled={saving || task.status === 'Done' || task.is_blocked}
          >
            {saving ? 'Saving...' : 'Mark as Done'}
          </button>
          <Link className="btn" to={`/tasks/${task.task_id}/edit`}>Edit</Link>
          <button className="btn-danger" onClick={handleDeleteTask}>
            {leavesShareOnDelete ? 'Leave shared task' : 'Delete'}
          </button>
        </div>

        {task.is_blocked && (
          <p className="note-small">
            Blocked by a dependency that is still To Do — see “Depends on” below.
          </p>
        )}

        {error && <p className="form-error">Error: {error}</p>}
      </div>

      <div className="panel">
        <h2 className="panel-title">Labels</h2>

        {task.labels.length === 0 && <p className="note">No labels on this task</p>}

        {task.labels.length > 0 && (
          <div className="chip-row">
            {task.labels.map((label) => (
              <span className="chip" key={label.label_id}>
                <span style={{ color: label.label_color }}>■</span>
                {label.label_name}
                <button
                  className="chip-remove"
                  aria-label={`Remove ${label.label_name}`}
                  onClick={() => handleDetachLabel(label.label_id)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {labels.length === 0 && (
          <p className="note-small">
            You have no labels yet — create some on the <Link to="/labels">Labels page</Link>.
          </p>
        )}

        {labels.length > 0 && availableLabels.length === 0 && (
          <p className="note-small">All of your labels are already on this task.</p>
        )}

        {availableLabels.length > 0 && (
          <form className="inline-form" onSubmit={handleAttachLabel}>
            <select value={selectedLabel} onChange={(e) => setSelectedLabel(e.target.value)}>
              <option value="">Choose a label...</option>
              {availableLabels.map((label) => (
                <option key={label.label_id} value={label.label_id}>
                  {label.label_name}
                </option>
              ))}
            </select>
            <button type="submit" className="btn" disabled={labeling || !selectedLabel}>
              {labeling ? 'Adding...' : 'Add label'}
            </button>

            {labelError && <p className="form-error">Error: {labelError}</p>}
          </form>
        )}
      </div>

      <div className="panel">
        <h2 className="panel-title">Depends on</h2>

        {blockers.length === 0 && <p className="note">This task does not depend on anything</p>}

        {blockers.length > 0 && (
          <div className="item-list">
            {blockers.map((blocker) => (
              <div className="item-card" key={blocker.task_id}>
                <div className="item-main">
                  <Link to={`/tasks/${blocker.task_id}`}>{blocker.task_title}</Link>
                  <StatusChip status={blocker.status} />
                </div>
                <div className="item-actions">
                  <button className="btn-danger" onClick={() => handleRemoveBlocker(blocker.task_id)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {availableBlockers.length === 0 && (
          <p className="note-small">No other task is available to depend on.</p>
        )}

        {availableBlockers.length > 0 && (
          <form className="inline-form" onSubmit={handleAddBlocker}>
            <select
              value={selectedBlocker}
              onChange={(e) => setSelectedBlocker(e.target.value)}
            >
              <option value="">Choose a task...</option>
              {availableBlockers.map((candidate) => (
                <option key={candidate.task_id} value={candidate.task_id}>
                  {candidate.task_title}
                </option>
              ))}
            </select>
            <button type="submit" className="btn" disabled={blocking || !selectedBlocker}>
              {blocking ? 'Adding...' : 'Add dependency'}
            </button>

            {blockerError && <p className="form-error">Error: {blockerError}</p>}
          </form>
        )}
      </div>

      <div className="panel">
        <h2 className="panel-title">Subtasks</h2>

        <NewTaskForm parentTaskId={task.task_id} onCreate={handleAddSubtask} />

        {subtasks.length === 0 && <p className="note">No subtasks yet</p>}

        {subtasks.length > 0 && (
          <div className="item-list">
            {subtasks.map((subtask) => (
              <div className="item-card" key={subtask.task_id}>
                <div className="item-main">
                  <Link to={`/tasks/${subtask.task_id}`}>{subtask.task_title}</Link>
                  <StatusChip status={subtask.status} blocked={subtask.is_blocked} />
                </div>
                <div className="item-actions">
                  <Link className="btn" to={`/tasks/${subtask.task_id}/edit`}>Edit</Link>
                  <button className="btn-danger" onClick={() => handleDeleteSubtask(subtask.task_id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {task.owner_id === user.user_id && task.parent_task_id === null && (
        <div className="panel">
          <h2 className="panel-title">Shared with</h2>

          {shares.length === 0 && <p className="note">Not shared with anyone yet</p>}

          {shares.length > 0 && (
            <div className="item-list">
              {shares.map((share) => (
                <div className="item-card" key={share.user_id}>
                  <span className="item-name">{share.username}</span>
                  <div className="item-actions">
                    <button
                      className="btn-danger"
                      onClick={() => handleUnshare(share.user_id, share.username)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {friends.length === 0 && (
            <p className="note-small">
              You have no friends yet — add some on the <Link to="/friends">Friends page</Link>.
            </p>
          )}

          {friends.length > 0 && availableFriends.length === 0 && (
            <p className="note-small">All of your friends already have this task.</p>
          )}

          {availableFriends.length > 0 && (
            <form className="inline-form" onSubmit={handleShare}>
              <select value={selectedFriend} onChange={(e) => setSelectedFriend(e.target.value)}>
                <option value="">Choose a friend...</option>
                {availableFriends.map((friend) => (
                  <option key={friend.user_id} value={friend.username}>
                    {friend.username}
                  </option>
                ))}
              </select>
              <button type="submit" className="btn" disabled={sharing || !selectedFriend}>
                {sharing ? 'Sharing...' : 'Share'}
              </button>

              {shareError && <p className="form-error">Error: {shareError}</p>}
            </form>
          )}
        </div>
      )}
    </div>
  )
}
