import { Link } from 'react-router-dom'
import StatusChip from './StatusChip'


export default function TaskItem({ task, leavesShare = false, parentTitle = null, onDelete }) {

  const cardClass = task.status === 'Cancelled'
    ? 'task-card task-card-cancelled'
    : 'task-card'

  return (
    <div className={cardClass}>

      <div className="task-card-head">
        <h3 className="task-card-title">
          <Link to={`/tasks/${task.task_id}`}>{task.task_title}</Link>
        </h3>
        <div className="task-card-actions">
          <Link className="btn" to={`/tasks/${task.task_id}/edit`}>Edit</Link>
          <button className="btn-danger" onClick={() => onDelete(task.task_id)}>
            {leavesShare ? 'Leave shared task' : 'Delete'}
          </button>
        </div>
      </div>

      {/* Only filled in when the list is showing matches flat: a subtask on its
          own says nothing about where it came from, so it carries its parent. */}
      {parentTitle && (
        <p className="note-small">
          Subtask of <Link to={`/tasks/${task.parent_task_id}`}>{parentTitle}</Link>
        </p>
      )}

      <div className="chip-row">
        <StatusChip status={task.status} blocked={task.is_blocked} />
        {task.labels.map((label) => (
          <span className="chip" key={label.label_id}>
            <span style={{ color: label.label_color }}>■</span>
            {label.label_name}
          </span>
        ))}
      </div>

      {task.task_info && <p className="task-card-info">{task.task_info}</p>}

      <p className="note-small">
        Created {task.created_at}
        {task.done_date && ` · Done ${task.done_date}`}
      </p>
    </div>
  )
}
