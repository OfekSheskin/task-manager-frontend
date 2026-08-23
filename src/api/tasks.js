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
