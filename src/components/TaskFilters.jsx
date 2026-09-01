// The task list filter bar. Holds no state of its own: every control reads from
// the `filters` object the page owns and reports changes back through onChange.
// Keeping the state in one place upstream is what lets the page decide, with a
// single comparison, whether any filter is active at all.

const STATUSES = ['To Do', 'Done', 'Cancelled']


export default function TaskFilters({ filters, labels, onChange, onClear, hasActiveFilters }) {

  // Every control below is a controlled input reporting through the same
  // handler, so adding a filter later means adding a field and a control -- not
  // another piece of state and another reset to remember.
  function handleChange(event) {
    const { name, type, value, checked } = event.target
    onChange(name, type === 'checkbox' ? checked : value)
  }

  return (
    <div className="task-filters">

      <div className="filter-group">
        <label htmlFor="search">Search</label>
        <input
          id="search"
          name="search"
          value={filters.search}
          onChange={handleChange}
          placeholder="Title or details..."
        />
      </div>

      <div className="filter-group">
        <label htmlFor="status">Status</label>
        <select id="status" name="status" value={filters.status} onChange={handleChange}>
          <option value="">Any status</option>
          {STATUSES.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      {/* Only rendered when the user actually has labels -- an empty dropdown
          offering nothing but "All labels" is just noise. */}
      {labels.length > 0 && (
        <div className="filter-group">
          <label htmlFor="label">Label</label>
          <select id="label" name="label" value={filters.label} onChange={handleChange}>
            <option value="">All labels</option>
            {labels.map((label) => (
              <option key={label.label_id} value={label.label_id}>
                {label.label_name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="filter-group">
        <label htmlFor="owner">Owner</label>
        <select id="owner" name="owner" value={filters.owner} onChange={handleChange}>
          <option value="">Everyone</option>
          <option value="mine">Mine</option>
          <option value="shared">Shared with me</option>
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="createdFrom">Created between</label>
        <input
          id="createdFrom"
          name="createdFrom"
          type="date"
          value={filters.createdFrom}
          onChange={handleChange}
        />
        {' and '}
        <input
          name="createdTo"
          type="date"
          value={filters.createdTo}
          onChange={handleChange}
        />
      </div>

      <div className="filter-group">
        <label htmlFor="doneFrom">Completed between</label>
        <input
          id="doneFrom"
          name="doneFrom"
          type="date"
          value={filters.doneFrom}
          onChange={handleChange}
        />
        {' and '}
        <input
          name="doneTo"
          type="date"
          value={filters.doneTo}
          onChange={handleChange}
        />
      </div>

      <div className="filter-group">
        <label htmlFor="hideBlocked">
          <input
            id="hideBlocked"
            name="hideBlocked"
            type="checkbox"
            checked={filters.hideBlocked}
            onChange={handleChange}
          />
          {' '}
          Hide blocked tasks
        </label>
      </div>

      {hasActiveFilters && (
        <button type="button" onClick={onClear}>Clear filters</button>
      )}
    </div>
  )
}
