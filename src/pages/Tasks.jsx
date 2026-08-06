import { useState, useEffect } from 'react'
import { listTasks } from '../api/tasks'
import { useTokenContext } from '../context/AuthContext'
import TaskComponent from '../components/TaskItem'
import TaskDetail from '../components/TaskDetail'


export default function Tasks() {

  const [tasks, setTasks] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedTaskId, setSelectedTaskId] = useState(null)
  const { token } = useTokenContext() // Use the useTokenContext hook to access the users token

  useEffect(() => {
    async function fetchTasks() {
      try {
        const data = await listTasks(token)
        setTasks(data)
        setError(null)
      }
      catch (error) {
        console.error('Failed to load tasks:', error)
        setError(error.message)
      }
      finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [token])

  return (
    <div>
      <h1>Tasks</h1>
      {loading && <p>Loading tasks...</p>}
      {error && <p>Error: {error}</p>}
      {!loading && tasks.length === 0 && <p>You have no tasks to show</p>}
      {!loading && !error && 
       tasks.map((task) => (
        <TaskComponent  key={task.task_id} taskId={task.task_id} onSelect={setSelectedTaskId} taskTitle={task.task_title} taskInfo={task.task_info} createdAt={task.created_at} />
       ))

      }

      {selectedTaskId && <TaskDetail taskId={selectedTaskId} />}

      </div>
  )
}
