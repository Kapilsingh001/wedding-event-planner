import { useEffect, useState } from 'react'
import { API_URL, getUser } from '../features/auth/auth'
import Icon from '../components/Icons.jsx'
import './Tasks.css'

const CATEGORIES = ['Venue', 'Catering', 'Decor', 'Attire', 'Guests', 'Other']

// A ready-made starter list, added with one click when the checklist is empty
const SUGGESTED_TASKS = [
  { title: 'Book the wedding venue', category: 'Venue' },
  { title: 'Finalise the catering menu', category: 'Catering' },
  { title: 'Choose the decoration theme', category: 'Decor' },
  { title: 'Buy wedding outfits', category: 'Attire' },
  { title: 'Send invitations to guests', category: 'Guests' },
  { title: 'Book a photographer', category: 'Other' },
]

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function Tasks() {
  const user = getUser()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Venue')
  const [dueDate, setDueDate] = useState('')

  useEffect(() => {
    fetch(`${API_URL}/tasks`)
      .then((res) => {
        if (!res.ok) throw new Error('Request failed')
        return res.json()
      })
      // JSON Server turns ?userId=1 into the number 1, so we filter here instead
      .then((data) => setTasks(data.filter((task) => task.userId === user.id)))
      .catch(() => setError('Could not load tasks. Is JSON Server running on port 3001?'))
      .finally(() => setLoading(false))
  }, [user.id])

  async function createTask(task) {
    const res = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...task, userId: user.id, done: false }),
    })
    if (!res.ok) throw new Error('Request failed')
    return res.json()
  }

  async function handleAdd(e) {
    e.preventDefault()
    if (!title.trim()) {
      setError('Please write a task first.')
      return
    }
    setError('')
    try {
      const saved = await createTask({ title: title.trim(), category, dueDate })
      setTasks((prev) => [...prev, saved])
      setTitle('')
      setDueDate('')
    } catch {
      setError('Could not save the task. Please try again.')
    }
  }

  async function addSuggested() {
    setError('')
    try {
      // one POST per task; Promise.all waits until all of them are saved
      const saved = await Promise.all(SUGGESTED_TASKS.map((task) => createTask({ ...task, dueDate: '' })))
      setTasks((prev) => [...prev, ...saved])
    } catch {
      setError('Could not add the suggested tasks.')
    }
  }

  async function toggleDone(task) {
    try {
      // PATCH changes only the fields we send; the rest of the task stays the same
      const res = await fetch(`${API_URL}/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ done: !task.done }),
      })
      if (!res.ok) throw new Error('Request failed')
      const updated = await res.json()
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)))
    } catch {
      setError('Could not update the task.')
    }
  }

  async function deleteTask(task) {
    if (!window.confirm(`Delete "${task.title}"?`)) return
    try {
      const res = await fetch(`${API_URL}/tasks/${task.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Request failed')
      setTasks((prev) => prev.filter((t) => t.id !== task.id))
    } catch {
      setError('Could not delete the task.')
    }
  }

  const doneCount = tasks.filter((task) => task.done).length
  const percent = tasks.length === 0 ? 0 : Math.round((doneCount / tasks.length) * 100)
  // en-CA gives YYYY-MM-DD in local time, the same format the date input uses
  const today = new Date().toLocaleDateString('en-CA')

  const visibleTasks = tasks
    .filter((task) => filter === 'all' || (filter === 'done' ? task.done : !task.done))
    // pending first, then by due date (tasks without a date go last)
    .sort((a, b) => a.done - b.done || (a.dueDate || '9999').localeCompare(b.dueDate || '9999'))

  return (
    <div className="container tasks-page">
      <div className="tasks-header">
        <div>
          <h1>Wedding Checklist</h1>
          <p>Keep track of everything that still needs to be done.</p>
        </div>
        <div className="tasks-progress">
          <div className="tasks-progress-label">
            <span><strong>{doneCount}</strong> of {tasks.length} done</span>
            <span>{percent}%</span>
          </div>
          <div className="tasks-bar" role="progressbar" aria-valuenow={percent} aria-valuemin="0" aria-valuemax="100">
            <div className="tasks-bar-fill" style={{ width: `${percent}%` }} />
          </div>
        </div>
      </div>

      <form className="tasks-form" onSubmit={handleAdd}>
        <input
          type="text"
          aria-label="Task"
          placeholder="e.g. Book the mehendi artist"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <select aria-label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <input type="date" aria-label="Due date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        <button type="submit" className="btn">
          <Icon name="plus" size={18} /> Add Task
        </button>
      </form>

      {error && <p className="tasks-error" role="alert">{error}</p>}

      {tasks.length > 0 && (
        <div className="tasks-filters" role="group" aria-label="Filter tasks">
          {['all', 'pending', 'done'].map((f) => (
            <button
              key={f}
              type="button"
              className={filter === f ? 'active' : ''}
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
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
        <p className="tasks-muted">No {filter} tasks.</p>
      )}

      {visibleTasks.length > 0 && (
        <ul className="tasks-list">
          {visibleTasks.map((task) => {
            const overdue = !task.done && task.dueDate && task.dueDate < today
            return (
              <li key={task.id} className={task.done ? 'task done' : 'task'}>
                <label className="task-check">
                  <input type="checkbox" checked={task.done} onChange={() => toggleDone(task)} />
                  <span>{task.title}</span>
                </label>
                <span className="task-tag">{task.category}</span>
                {task.dueDate && (
                  <span className={overdue ? 'task-date overdue' : 'task-date'}>
                    <Icon name="calendar" size={14} />
                    {overdue ? 'Overdue · ' : ''}{formatDate(task.dueDate)}
                  </span>
                )}
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
