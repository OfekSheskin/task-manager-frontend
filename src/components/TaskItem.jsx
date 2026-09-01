import { Link } from 'react-router-dom'

export default function TaskItem({ task, leavesShare = false, parentTitle = null, onDelete }) {

  return (
    <div>
      <h3>
        <Link to={`/tasks/${task.task_id}`}>{task.task_title}</Link>
      </h3>
      {/* Only filled in when the list is showing matches flat: a subtask on its
          own says nothing about where it came from, so it carries its parent. */}
      {parentTitle && (
        <p>
          Subtask of <Link to={`/tasks/${task.parent_task_id}`}>{parentTitle}</Link>
        </p>
      )}
      {/* is_blocked is derived by the backend on every response, so the flag is
          only rendered here -- never computed or stored on the client. */}
      <p>Status: {task.status}{task.is_blocked && ' — Blocked'}</p>
      {task.labels.length > 0 && (
        <p>
          {task.labels.map((label) => (
            <span key={label.label_id}>
              <span style={{ color: label.label_color }}>■</span>
              {' '}
              {label.label_name}
              {'  '}
            </span>
          ))}
        </p>
      )}
      {task.task_info && <p>{task.task_info}</p>}
      <p>Created: {task.created_at}</p>
      {task.done_date && <p>Done: {task.done_date}</p>}
      <Link to={`/tasks/${task.task_id}/edit`}>Edit</Link>
      {' '}
      <button onClick={() => onDelete(task.task_id)}>
        {leavesShare ? 'Leave shared task' : 'Delete'}
      </button>
    </div>
  )
}
