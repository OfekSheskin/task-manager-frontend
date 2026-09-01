import { apiFetch } from './client'

export function listTasks(token) {
  return apiFetch('/tasks', { token })
}

export function getTask(token, taskId) {
  return apiFetch(`/tasks/${taskId}`, { token })
}

export function createTask(token, task) {
  return apiFetch('/tasks', { method: 'POST', body: task, token })
}

export function updateTask(token, taskId, changes) {
  return apiFetch(`/tasks/${taskId}`, { method: 'PATCH', body: changes, token })
}

export function deleteTask(token, taskId) {
  return apiFetch(`/tasks/${taskId}`, { method: 'DELETE', token })
}

// Shares live under /tasks/{id}/shares, so they belong with the task calls.

export function listShares(token, taskId) {
  return apiFetch(`/tasks/${taskId}/shares`, { token })
}

export function shareTask(token, taskId, sharedUsername) {
  return apiFetch(`/tasks/${taskId}/shares`, {
    method: 'POST',
    body: { shared_username: sharedUsername },
    token,
  })
}

export function unshareTask(token, taskId, sharedUserId) {
  return apiFetch(`/tasks/${taskId}/shares/${sharedUserId}`, { method: 'DELETE', token })
}

// Blocking dependencies live under /tasks/{id}/blockers, same as shares.
// Add and remove answer with the whole updated task; the list answers with the
// blocking tasks themselves.

export function listBlockers(token, taskId) {
  return apiFetch(`/tasks/${taskId}/blockers`, { token })
}

export function addBlocker(token, taskId, blockerId) {
  return apiFetch(`/tasks/${taskId}/blockers/${blockerId}`, { method: 'POST', token })
}

export function removeBlocker(token, taskId, blockerId) {
  return apiFetch(`/tasks/${taskId}/blockers/${blockerId}`, { method: 'DELETE', token })
}
