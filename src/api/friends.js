import { apiFetch } from './client'

export function listFriends(token) {
  return apiFetch('/friendships', { token })
}

export function listPendingRequests(token) {
  return apiFetch('/friendships/pending', { token })
}

export function sendFriendRequest(token, username) {
  return apiFetch('/friendships/request', {
    method: 'POST',
    body: { addressee_username: username },
    token,
  })
}


export function answerFriendRequest(token, requesterId, status) {
  return apiFetch(`/friendships/${requesterId}`, {
    method: 'PATCH',
    body: { status },
    token,
  })
}

export function removeFriend(token, friendId) {
  return apiFetch(`/friendships/${friendId}`, { method: 'DELETE', token })
}
