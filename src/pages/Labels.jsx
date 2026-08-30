import { useState, useEffect } from 'react'
import { listLabels, createLabel } from '../api/labels'
import { useTokenContext } from '../context/AuthContext'
import LabelForm from '../components/LabelForm'


export default function Labels() {

  const [labels, setLabels] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const { token } = useTokenContext()

  useEffect(() => {
    async function fetchLabels() {
      try {
        const data = await listLabels(token)
        setLabels(data)
        setError(null)
      }
      catch (error) {
        console.error('Failed to load labels:', error)
        setError(error.message)
      }
      finally {
        setLoading(false)
      }
    }

    fetchLabels()
  }, [token])


  async function handleCreate(newLabel) {
    const created = await createLabel(token, newLabel)
    setLabels((current) => [...current, created])
  }

  return (
    <div>
      <h1>Labels</h1>

      <LabelForm onCreate={handleCreate} />

      {loading && <p>Loading labels...</p>}
      {error && <p>Error: {error}</p>}
      {!loading && !error && labels.length === 0 && <p>You have no labels yet</p>}

      {!loading && !error &&
        labels.map((label) => (
          <div key={label.label_id}>
            <span style={{ color: label.label_color }}>■</span>
            {' '}
            {label.label_name}
          </div>
        ))
      }
    </div>
  )
}
