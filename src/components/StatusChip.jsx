// The status of a task, as a chip. Every list that shows a task -- the task
// list, the subtask rows, the dependency rows -- renders it through here, so
// the same status always looks the same.
//
// Blocked is not a status: it is derived by the backend and arrives alongside
// one, so it shows up as a second chip rather than replacing the first.

const STATUS_CLASS = {
  'To Do': 'status-todo',
  'Done': 'status-done',
  'Cancelled': 'status-cancelled',
}


export default function StatusChip({ status, blocked = false }) {
  return (
    <>
      <span className={`chip ${STATUS_CLASS[status]}`}>{status}</span>
      {blocked && <span className="chip status-blocked">Blocked</span>}
    </>
  )
}
