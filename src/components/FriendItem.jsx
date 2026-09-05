

export default function FriendItem({ friend, onRemove }) {
      return (
        <div className="item-card">
          <span className="item-name">
            {friend.username}
          </span>
          <div className="item-actions">
            <button className="btn-danger" onClick={() => onRemove(friend)}>Remove</button>
          </div>
        </div>
      )

}
