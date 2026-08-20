
export default function PendingItem({pending}){
      return (
        <div>
          <h3>
            {pending.requester_username}
          </h3>
          <p>{pending.status}</p>
        </div>
      ) 

}