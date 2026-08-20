


export default function FriendItem({ friend, onRemove }) {
      return (
        <div>
          <h3>
            {friend.username}
          </h3>
          <button onClick={() => onRemove(friend)}>Remove</button>
        </div>
      )

}
