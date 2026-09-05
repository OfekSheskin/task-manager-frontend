
export default function PendingItem({ pending, onApprove, onDeny }) {
      return (
        <div className="item-card">
          <span className="item-name">
            {pending.requester_username}
          </span>
          <div className="item-actions">
            <button className="btn-primary" onClick={() => onApprove(pending)}>Approve</button>
            <button className="btn" onClick={() => onDeny(pending)}>Deny</button>
          </div>
        </div>
      )

}
