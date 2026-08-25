import { Link } from 'react-router-dom'

export default function TaskItem({ task, onDelete }) {

  return (
    <div>
      <h3>
        <Link to={`/tasks/${task.task_id}`}>{task.task_title}</Link>
      </h3>
      <p>Status: {task.status}</p>
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
      <Link to={`/tasks/${task.task_id}/edit`}>Edit</Link>
      {' '}
      <button onClick={() => onDelete(task.task_id)}>Delete</button>
    </div>
  )
}
