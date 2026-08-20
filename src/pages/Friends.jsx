import { useState, useEffect } from 'react'
import { useTokenContext } from '../context/AuthContext'
import {listFriends, listPendingRequests, sendFriendRequest, answerFriendRequest, removeFriend} from '../api/friends'
import FriendItem from '../components/FriendItem'
import PendingItem from '../components/PendingItem'
import AddFriendForm from '../components/AddFriendForm'




export default function Friends() {
  const [friends, setFriends] = useState([])
  const [pending, setPending] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
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


  return (
    <div>
      <h1>Friends</h1>

      <AddFriendForm onSend={handleSendRequest} />

      {loading && <p>Loading friends...</p>}
      {error && <p>Error: {error}</p>}

      {!loading && !error && (
        <>
          <h2>Pending requests</h2>
          {pending.length === 0 && <p>You have no pending requests</p>}
          {pending.map((request) => (
            <PendingItem key={request.requester_id} pending={request} />
          ))}

          <h2>Your friends</h2>
          {friends.length === 0 && <p>You have no friends to show</p>}
          {friends.map((friend) => (
            <FriendItem key={friend.user_id} friend={friend} />
          ))}
        </>
      )}
    </div>
  )
}
