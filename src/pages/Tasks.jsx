import { useEffect, useState } from 'react'
import api from '../services/api'
import { getUser } from '../features/auth/auth'
import Icon from '../components/Icons.jsx'
import { isPastDate, addDays, getDueInfo, countTasks } from './tasksUtils'
import './Tasks.css'

const CATEGORIES = ['Venue', 'Catering', 'Decor', 'Attire', 'Guests', 'Other']

// A ready-made starter list, added with one click when the checklist is empty.
// inDays is turned into a real due date counted from today.
const SUGGESTED_TASKS = [
  { title: 'Book the wedding venue', category: 'Venue', inDays: 7 },
  { title: 'Finalise the catering menu', category: 'Catering', inDays: 14 },
  { title: 'Choose the decoration theme', category: 'Decor', inDays: 21 },
  { title: 'Buy wedding outfits', category: 'Attire', inDays: 30 },
  { title: 'Send invitations to guests', category: 'Guests', inDays: 35 },
  { title: 'Book a photographer', category: 'Other', inDays: 10 },
]

const FILTERS = ['all', 'pending', 'done']

// circumference of the progress ring (radius 26)
const RING = 2 * Math.PI * 26

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function Tasks() {
  const user = getUser()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [filter, setFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Venue')
  const [dueDate, setDueDate] = useState('')

  // en-CA gives YYYY-MM-DD in local time, the same format the date input uses
  const today = new Date().toLocaleDateString('en-CA')

  useEffect(() => {
    api.get('/tasks')
      // JSON Server turns ?userId=1 into the number 1, so we filter here instead
      .then(({ data }) => setTasks(data.filter((task) => String(task.userId) === String(user.id))))
      .catch(() => setError('Could not load tasks. Is JSON Server running on port 3001?'))
      .finally(() => setLoading(false))
  }, [user.id])

  async function createTask(task) {
    const { data } = await api.post('/tasks', { ...task, userId: user.id, done: false })
    return data
  }

  async function handleAdd(e) {
    e.preventDefault()
    if (!title.trim()) {
      setFormError('Please write a task first.')
      return
    }
    // min={today} greys out old dates in the picker, but a date can still be typed in
    if (isPastDate(dueDate, today)) {
      setFormError('The due date cannot be in the past. Choose today or a later date.')
      return
    }
    setFormError('')
    try {
      const saved = await createTask({ title: title.trim(), category, dueDate })
      setTasks((prev) => [...prev, saved])
      setTitle('')
      setDueDate('')
    } catch {
      setFormError('Could not save the task. Please try again.')
    }
  }

  async function addSuggested() {
    setError('')
    try {
      // one POST per task; Promise.all waits until all of them are saved
      const saved = await Promise.all(
        SUGGESTED_TASKS.map(({ inDays, ...task }) => createTask({ ...task, dueDate: addDays(today, inDays) }))
      )
      setTasks((prev) => [...prev, ...saved])
    } catch {
      setError('Could not add the suggested tasks.')
    }
  }

  async function toggleDone(task) {
    try {
      // PATCH changes only the fields we send; the rest of the task stays the same
      const { data } = await api.patch(`/tasks/${task.id}`, { done: !task.done })
      setTasks((prev) => prev.map((t) => (t.id === task.id ? data : t)))
    } catch {
      setError('Could not update the task.')
    }
  }

  async function deleteTask(task) {
    if (!window.confirm(`Delete "${task.title}"?`)) return
    try {
      await api.delete(`/tasks/${task.id}`)
      setTasks((prev) => prev.filter((t) => t.id !== task.id))
    } catch {
      setError('Could not delete the task.')
    }
  }

  const counts = countTasks(tasks, today)
  const percent = counts.total === 0 ? 0 : Math.round((counts.done / counts.total) * 100)
  const filterCounts = { all: counts.total, pending: counts.pending, done: counts.done }

  const visibleTasks = tasks
    .filter((task) => filter === 'all' || (filter === 'done' ? task.done : !task.done))
    .filter((task) => categoryFilter === 'All' || task.category === categoryFilter)
    // pending first, then by due date (tasks without a date go last)
    .sort((a, b) => a.done - b.done || (a.dueDate || '9999').localeCompare(b.dueDate || '9999'))

  return (
    <div className="container tasks-page">
      <header className="tasks-header">
        <div>
          <p className="tasks-eyebrow">Planning</p>
          <h1>Wedding Checklist</h1>
          <p>Keep track of everything that still needs to be done before the big day.</p>
        </div>

        <div className="tasks-summary">
          <div className="tasks-ring">
            <svg viewBox="0 0 64 64" aria-hidden="true">
              <circle className="tasks-ring-track" cx="32" cy="32" r="26" />
              <circle
                className="tasks-ring-fill"
                cx="32"
                cy="32"
                r="26"
                strokeDasharray={RING}
                strokeDashoffset={RING - (RING * percent) / 100}
              />
            </svg>
            <span>{percent}%</span>
          </div>
          <div className="tasks-summary-text">
            <strong>{counts.done} of {counts.total} done</strong>
            <span>{counts.pending} pending</span>
            <span className={counts.overdue > 0 ? 'tasks-summary-overdue' : ''}>{counts.overdue} overdue</span>
          </div>
        </div>
      </header>

      <form className="tasks-form" onSubmit={handleAdd} noValidate>
        <div className="tasks-field tasks-field-title">
          <label htmlFor="task-title">Task</label>
          <input
            id="task-title"
            type="text"
            placeholder="e.g. Book the mehendi artist"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="tasks-field">
          <label htmlFor="task-category">Category</label>
          <select id="task-category" value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="tasks-field">
          <label htmlFor="task-date">Due date</label>
          <input id="task-date" type="date" min={today} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
        <button type="submit" className="btn tasks-add">
          <Icon name="plus" size={18} /> Add Task
        </button>
        {formError && <p className="tasks-form-error" role="alert">{formError}</p>}
      </form>

      {error && <p className="tasks-error" role="alert">{error}</p>}

      {tasks.length > 0 && (
        <div className="tasks-toolbar">
          <div className="tasks-filters" role="group" aria-label="Filter by status">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                className={filter === f ? 'active' : ''}
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
              >
                {f} <span>{filterCounts[f]}</span>
              </button>
            ))}
          </div>
          <select
            className="tasks-category-filter"
            aria-label="Filter by category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="All">All categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      )}

      {loading && <p className="tasks-muted">Loading tasks…</p>}

      {!loading && !error && tasks.length === 0 && (
        <section className="empty-state">
          <span className="empty-state-icon"><Icon name="list" size={28} /></span>
          <h2>No tasks yet</h2>
          <p>Add your first task above, or start with a ready-made wedding checklist.</p>
          <button type="button" className="btn" onClick={addSuggested}>Add Suggested Tasks</button>
        </section>
      )}

      {!loading && tasks.length > 0 && visibleTasks.length === 0 && (
        <p className="tasks-muted">No tasks match these filters.</p>
      )}

      {visibleTasks.length > 0 && (
        <ul className="tasks-list">
          {visibleTasks.map((task) => {
            const due = getDueInfo(task.dueDate, today, task.done)
            return (
              <li key={task.id} className={`task${task.done ? ' done' : ''}${due.status === 'overdue' ? ' overdue' : ''}`}>
                <button
                  type="button"
                  className="task-check"
                  aria-pressed={task.done}
                  aria-label={task.done ? `Mark "${task.title}" as not done` : `Mark "${task.title}" as done`}
                  onClick={() => toggleDone(task)}
                >
                  {task.done && <Icon name="check" size={16} />}
                </button>

                <div className="task-body">
                  <p className="task-title">{task.title}</p>
                  <div className="task-meta">
                    <span className={`task-tag cat-${(task.category || 'other').toLowerCase()}`}>{task.category}</span>
                    <span className={`task-due due-${due.status}`}>
                      <Icon name="calendar" size={14} />
                      {due.label}
                      {task.dueDate && <small>{formatDate(task.dueDate)}</small>}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="task-delete"
                  aria-label={`Delete ${task.title}`}
                  onClick={() => deleteTask(task)}
                >
                  <Icon name="close" size={16} />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default Tasks
