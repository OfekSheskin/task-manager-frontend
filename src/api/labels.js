import { apiFetch } from './client'

export function listLabels(token) {
  return apiFetch('/labels', { token })
}

export function createLabel(token, label) {
  return apiFetch('/labels', { method: 'POST', body: label, token })
}

export function updateLabel(token, labelId, changes) {
  return apiFetch(`/labels/${labelId}`, { method: 'PATCH', body: changes, token })
}

export function deleteLabel(token, labelId) {
  return apiFetch(`/labels/${labelId}`, { method: 'DELETE', token })
}


export function attachLabel(token, taskId, labelId) {
  return apiFetch(`/tasks/${taskId}/labels/${labelId}`, { method: 'POST', token })
}

export function detachLabel(token, taskId, labelId) {
  return apiFetch(`/tasks/${taskId}/labels/${labelId}`, { method: 'DELETE', token })
}
