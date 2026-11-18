import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { getUser } from '../features/auth/auth'
import { getShortlist } from '../features/vendors/shortlist'
import Icon from '../components/Icons.jsx'
import { summarizeBudget, summarizeGuests, summarizeTasks, getNextEvent, daysUntil } from './dashboardUtils'
import './UserDashboard.css'

function formatMoney(value) {
  return '₹' + Number(value).toLocaleString('en-IN')
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function UserDashboard() {
  const user = getUser()
  const firstName = (user.name || 'there').split(' ')[0]
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    // load all five collections at the same time
    Promise.all([
      api.get('/events'),
      api.get('/expenses'),
      api.get('/guests'),
      api.get('/tasks'),
      api.get('/vendors'),
    ])
      .then(([events, expenses, guests, tasks, vendors]) => {
        const isMine = (item) => String(item.userId) === String(user.id)
        const shortlist = getShortlist()
        setData({
          events: events.data.filter(isMine),
          expenses: expenses.data,
          guests: guests.data.filter(isMine),
          tasks: tasks.data.filter(isMine),
          shortlisted: vendors.data.filter((vendor) => shortlist.includes(String(vendor.id))),
        })
      })
      .catch(() => setError('Could not load your dashboard. Is JSON Server running on port 3001?'))
  }, [user.id])

  if (error) {
    return (
      <div className="container dash">
        <p className="dash-error" role="alert">{error}</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="container dash">
        <p className="dash-muted">Loading your dashboard…</p>
      </div>
    )
  }

  // en-CA gives YYYY-MM-DD in local time, the same format as our event dates
  const today = new Date().toLocaleDateString('en-CA')
  const budget = summarizeBudget(data.events, data.expenses)
  const guests = summarizeGuests(data.guests)
  const tasks = summarizeTasks(data.tasks)
  const nextEvent = getNextEvent(data.events, today)
  const overBudget = budget.totalSpent > budget.totalBudget

  const upcomingTasks = data.tasks
    .filter((task) => !task.done)
    .sort((a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999'))
    .slice(0, 4)

  return (
    <div className="container dash">
      <header className="dash-header">
        <div>
          <p className="dash-eyebrow">Your wedding dashboard</p>
          <h1>Welcome back, {firstName}</h1>
          <p className="dash-sub">
            {nextEvent
              ? `${nextEvent.title} is in ${daysUntil(nextEvent.date, today)} days. Here is where everything stands.`
              : 'Plan your first event to see your progress here.'}
          </p>
        </div>
        <Link to="/events" className="btn">
          <Icon name="plus" size={18} /> Plan an Event
        </Link>
      </header>

      <section className="dash-stats" aria-label="Summary">
        <article className="dash-card">
          <div className="dash-card-top">
            <span className="dash-icon"><Icon name="calendar" /></span>
            <h2>Events</h2>
          </div>
          <p className="dash-number">{data.events.length}</p>
          <p className="dash-detail">
            {nextEvent ? <>Next: <strong>{nextEvent.title}</strong>, {formatDate(nextEvent.date)}</> : 'No upcoming events'}
          </p>
          <Link to="/events" className="dash-link">Open events <Icon name="arrow" size={16} /></Link>
        </article>

        <article className="dash-card">
          <div className="dash-card-top">
            <span className="dash-icon"><Icon name="wallet" /></span>
            <h2>Budget</h2>
          </div>
          <p className="dash-number">{formatMoney(budget.totalSpent)}</p>
          <p className="dash-detail">spent of {formatMoney(budget.totalBudget)}</p>
          <div className="dash-bar" role="progressbar" aria-valuenow={budget.percent} aria-valuemin="0" aria-valuemax="100">
            <div className={overBudget ? 'dash-bar-fill over' : 'dash-bar-fill'} style={{ width: `${Math.min(budget.percent, 100)}%` }} />
          </div>
          <p className={overBudget ? 'dash-detail dash-over' : 'dash-detail'}>
            {overBudget ? `Over budget by ${formatMoney(-budget.remaining)}` : `${formatMoney(budget.remaining)} remaining`}
          </p>
        </article>

        <article className="dash-card">
          <div className="dash-card-top">
            <span className="dash-icon"><Icon name="users" /></span>
            <h2>Guests</h2>
          </div>
          <p className="dash-number">{guests.attending}<span>/{guests.total}</span></p>
          <p className="dash-detail">attending · {guests.pending} pending · {guests.declined} declined</p>
          <Link to="/guests" className="dash-link">Open guest list <Icon name="arrow" size={16} /></Link>
        </article>

        <article className="dash-card">
          <div className="dash-card-top">
            <span className="dash-icon"><Icon name="list" /></span>
            <h2>Tasks</h2>
          </div>
          <p className="dash-number">{tasks.done}<span>/{tasks.total}</span></p>
          <div className="dash-bar" role="progressbar" aria-valuenow={tasks.percent} aria-valuemin="0" aria-valuemax="100">
            <div className="dash-bar-fill" style={{ width: `${tasks.percent}%` }} />
          </div>
          <p className="dash-detail">{tasks.percent}% of the checklist done</p>
        </article>
      </section>

      <div className="dash-grid">
        <section className="dash-panel" aria-labelledby="dash-tasks-title">
          <h2 id="dash-tasks-title">Next tasks</h2>
          {upcomingTasks.length === 0 ? (
            <p className="dash-muted">Nothing pending. <Link to="/tasks">Open checklist</Link></p>
          ) : (
            <ul className="dash-list">
              {upcomingTasks.map((task) => (
                <li key={task.id}>
                  <span>{task.title}</span>
                  <small className={task.dueDate && task.dueDate < today ? 'dash-over' : ''}>
                    {task.dueDate ? formatDate(task.dueDate) : 'No date'}
                  </small>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="dash-panel" aria-labelledby="dash-vendors-title">
          <h2 id="dash-vendors-title">Shortlisted vendors</h2>
          {data.shortlisted.length === 0 ? (
            <p className="dash-muted">No vendors shortlisted yet. <Link to="/vendors">Browse vendors</Link></p>
          ) : (
            <ul className="dash-list">
              {data.shortlisted.map((vendor) => (
                <li key={vendor.id}>
                  <Link to={`/vendors/${vendor.id}`}>
                    <strong>{vendor.name}</strong>
                    <small>{vendor.category} · {vendor.city}</small>
                  </Link>
                  <span className="dash-price">{formatMoney(vendor.price)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="dash-panel" aria-labelledby="dash-actions-title">
          <h2 id="dash-actions-title">Quick actions</h2>
          <div className="dash-actions">
            <Link to="/events"><Icon name="calendar" size={18} /> Plan an event</Link>
            <Link to="/guests"><Icon name="users" size={18} /> Add guests</Link>
            <Link to="/tasks"><Icon name="list" size={18} /> Open checklist</Link>
            <Link to="/vendors"><Icon name="store" size={18} /> Find vendors</Link>
          </div>
        </section>
      </div>
    </div>
  )
}

export default UserDashboard
