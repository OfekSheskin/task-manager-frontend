
export default function PendingItem({ pending, onApprove, onDeny }) {
      return (
        <div>
          <h3>
            {pending.requester_username}
          </h3>
          <button onClick={() => onApprove(pending)}>Approve</button>
          <button onClick={() => onDeny(pending)}>Deny</button>
        </div>
      )

}
