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

