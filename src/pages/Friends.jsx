import { useState, useEffect } from 'react'
import { useTokenContext } from '../context/AuthContext'
import {listFriends, listPendingRequests, sendFriendRequest, answerFriendRequest, removeFriend} from '../api/friends'
import FriendItem from '../components/FriendItem'
import PendingItem from '../components/PendingItem'
import AddFriendForm from '../components/AddFriendForm'

// The backend validates these against a Literal, so the casing matters.
const APPROVED = 'Approved'
const DENIED = 'Denied'




export default function Friends() {
  const [friends, setFriends] = useState([])
  const [pending, setPending] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  // Kept apart from `error`: a failed action shouldn't hide lists that
  // are still valid on screen.
  const [actionError, setActionError] = useState(null)
  const { token } = useTokenContext()

    useEffect(() => {
      async function fetchFriends() {
        try {
          // Both lists load together 
          const [friendsData, pendingData] = await Promise.all([
            listFriends(token),
            listPendingRequests(token),
          ])
          setFriends(friendsData)
          setPending(pendingData)
          setError(null)
        }
        catch (error) {
          console.error('Failed to load friends:', error)
          setError(error.message)
        }
        finally {
          setLoading(false)
        }
      }

      fetchFriends()
    }, [token])


  // No state to update: the request shows up in the addressee's pending
  // list, not ours. Errors bubble up so the form can display them.
  async function handleSendRequest(username) {
    await sendFriendRequest(token, username)
  }

  // Approving and denying hit the same endpoint, so one handler covers
  // both. The whole row is passed in because the PATCH response has no
  // username and an approved request has to become a friend right here.
  async function handleAnswer(request, status) {
    try {
      await answerFriendRequest(token, request.requester_id, status)
      setPending((current) =>
        current.filter((row) => row.requester_id !== request.requester_id)
      )
      if (status === APPROVED) {
        setFriends((current) => [
          ...current,
          { user_id: request.requester_id, username: request.requester_username },
        ])
      }
      setActionError(null)
    }
    catch (err) {
      setActionError(err.message)
    }
  }

  // The backend refuses with a 409 while the two of you still share a
  // task, so the message matters more here than the removal itself.
  async function handleRemoveFriend(friend) {
    if (!window.confirm(`Remove ${friend.username} from your friends?`)) return

    try {
      await removeFriend(token, friend.user_id)
      setFriends((current) =>
        current.filter((row) => row.user_id !== friend.user_id)
      )
      setActionError(null)
    }
    catch (err) {
      setActionError(err.message)
    }
  }


  return (
    <div>
      <h1>Friends</h1>

      <AddFriendForm onSend={handleSendRequest} />

      {loading && <p>Loading friends...</p>}
      {error && <p>Error: {error}</p>}
      {actionError && <p>Error: {actionError}</p>}

      {!loading && !error && (
        <>
          <h2>Pending requests</h2>
          {pending.length === 0 && <p>You have no pending requests</p>}
          {pending.map((request) => (
            <PendingItem
              key={request.requester_id}
              pending={request}
              onApprove={(row) => handleAnswer(row, APPROVED)}
              onDeny={(row) => handleAnswer(row, DENIED)}
            />
          ))}

          <h2>Your friends</h2>
          {friends.length === 0 && <p>You have no friends to show</p>}
          {friends.map((friend) => (
            <FriendItem
              key={friend.user_id}
              friend={friend}
              onRemove={handleRemoveFriend}
            />
          ))}
        </>
      )}
    </div>
  )
}
