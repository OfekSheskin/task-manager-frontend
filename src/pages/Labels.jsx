import { useState, useEffect } from 'react'
import { listLabels, createLabel, updateLabel, deleteLabel } from '../api/labels'
import { useTokenContext } from '../context/AuthContext'
import LabelForm from '../components/LabelForm'
import LabelItem from '../components/LabelItem'


export default function Labels() {

  const [labels, setLabels] = useState([])
  const [error, setError] = useState(null)
  const [actionError, setActionError] = useState(null)
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

  // The PATCH answers with the whole updated label, so the response replaces the
  // row in state instead of refetching the list. The error is rethrown because
  // the row keeps its own form open and shows it next to the inputs.
  async function handleUpdate(labelId, changes) {
    try {
      const updated = await updateLabel(token, labelId, changes)
      setLabels((current) =>
        current.map((label) => (label.label_id === labelId ? updated : label))
      )
      setActionError(null)
    }
    catch (err) {
      setActionError(null)
      throw err
    }
  }

  // Deleting a label detaches it from every task it was on -- the FK on
  // task_labels cascades -- so the confirm has to say that, not just "delete".
  async function handleDelete(label) {
    const message =
      `Delete the label "${label.label_name}"?` +
      ' It will also be removed from every task it is on.'

    if (!window.confirm(message)) return

    try {
      await deleteLabel(token, label.label_id)
      setLabels((current) =>
        current.filter((row) => row.label_id !== label.label_id)
      )
      setActionError(null)
    }
    catch (err) {
      setActionError(err.message)
    }
  }

  return (
    <div>
      <h1>Labels</h1>

      <LabelForm onCreate={handleCreate} />

      {loading && <p className="note">Loading labels...</p>}
      {error && <p className="form-error">Error: {error}</p>}
      {actionError && <p className="form-error">Error: {actionError}</p>}
      {!loading && !error && (
        <div className="panel">
          <h2 className="panel-title">Your labels</h2>

          {labels.length === 0 && <p className="note">You have no labels yet</p>}

          {labels.length > 0 && (
            <div className="item-list">
              {labels.map((label) => (
                <LabelItem
                  key={label.label_id}
                  label={label}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
