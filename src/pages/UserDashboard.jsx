import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { getUser } from '../features/auth/auth'
import { getShortlist } from '../features/vendors/shortlist'
import Icon from '../components/Icons.jsx'
import {
  summarizeBudget, summarizeGuests, summarizeTasks, getNextEvent, daysUntil, getUpcomingEvents, getSetupSteps,
} from './dashboardUtils'
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
  const daysLeft = nextEvent ? daysUntil(nextEvent.date, today) : null
  const overBudget = budget.totalSpent > budget.totalBudget
  const upcomingEvents = getUpcomingEvents(data.events, today)
  const steps = getSetupSteps(data)
  const stepsDone = steps.filter((step) => step.done).length

  const upcomingTasks = data.tasks
    .filter((task) => !task.done)
    .sort((a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999'))
    .slice(0, 4)

  // money spent on one event, for the small bars in "Upcoming events"
  const spentOn = (eventId) =>
    data.expenses.filter((expense) => expense.eventId === eventId).reduce((sum, expense) => sum + Number(expense.amount), 0)

  return (
    <div className="container dash">
      {/* ---------- welcome banner with photo and countdown ---------- */}
      <header className="dash-hero">
        <div className="dash-hero-photo" aria-hidden="true" />
        <div className="dash-hero-text">
          <p className="dash-eyebrow">Your wedding dashboard</p>
          <h1>Welcome back, {firstName}</h1>
          {nextEvent ? (
            <p className="dash-sub">
              <strong>{nextEvent.title}</strong> is on {formatDate(nextEvent.date)}
              {nextEvent.venue ? ` at ${nextEvent.venue}` : ''}. Here is where everything stands.
            </p>
          ) : (
            <p className="dash-sub">Plan your first event to see your progress here.</p>
          )}
          <div className="dash-hero-actions">
            <Link to="/events" className="btn">
              <Icon name="plus" size={18} /> Plan an Event
            </Link>
            <Link to="/vendors" className="btn btn-ghost">
              <Icon name="store" size={18} /> Find Vendors
            </Link>
          </div>
        </div>

        {nextEvent && (
          <div className="dash-countdown" aria-label={`${daysLeft} days until ${nextEvent.title}`}>
            <strong>{daysLeft}</strong>
            <span>{daysLeft === 1 ? 'day to go' : 'days to go'}</span>
          </div>
        )}
      </header>

      {/* ---------- get started steps (hidden once all four are done) ---------- */}
      {stepsDone < steps.length && (
        <section className="dash-steps" aria-labelledby="dash-steps-title">
          <div className="dash-steps-head">
            <h2 id="dash-steps-title">Get started</h2>
            <span>{stepsDone} of {steps.length} done</span>
          </div>
          <ol>
            {steps.map((step, index) => (
              <li key={step.key} className={step.done ? 'done' : ''}>
                <Link to={step.to}>
                  <span className="dash-step-mark">{step.done ? <Icon name="check" size={16} /> : index + 1}</span>
                  <span>
                    <strong>{step.title}</strong>
                    <small>{step.text}</small>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* ---------- four summary cards ---------- */}
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
          <Link to="/tasks" className="dash-link">Open checklist <Icon name="arrow" size={16} /></Link>
        </article>
      </section>

      {/* ---------- three lists ---------- */}
      <div className="dash-grid">
        <section className="dash-panel" aria-labelledby="dash-events-title">
          <h2 id="dash-events-title">Upcoming events</h2>
          {upcomingEvents.length === 0 ? (
            <div className="dash-empty">
              <span className="dash-empty-icon"><Icon name="calendar" size={22} /></span>
              <p>No upcoming events.</p>
              <Link to="/events">Plan an event</Link>
            </div>
          ) : (
            <ul className="dash-list">
              {upcomingEvents.map((event) => {
                const spent = spentOn(event.id)
                const percent = Number(event.budget) > 0 ? Math.round((spent / Number(event.budget)) * 100) : 0
                return (
                  <li key={event.id} className="dash-event">
                    <div className="dash-event-top">
                      <strong>{event.title}</strong>
                      <small>{daysUntil(event.date, today)} days</small>
                    </div>
                    <small>{formatDate(event.date)} · {formatMoney(spent)} of {formatMoney(event.budget)}</small>
                    <div className="dash-bar">
                      <div className={percent > 100 ? 'dash-bar-fill over' : 'dash-bar-fill'} style={{ width: `${Math.min(percent, 100)}%` }} />
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <section className="dash-panel" aria-labelledby="dash-tasks-title">
          <h2 id="dash-tasks-title">Next tasks</h2>
          {upcomingTasks.length === 0 ? (
            <div className="dash-empty">
              <span className="dash-empty-icon"><Icon name="list" size={22} /></span>
              <p>Nothing pending.</p>
              <Link to="/tasks">Open checklist</Link>
            </div>
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
            <div className="dash-empty">
              <span className="dash-empty-icon"><Icon name="heart" size={22} /></span>
              <p>No vendors shortlisted yet.</p>
              <Link to="/vendors">Browse vendors</Link>
            </div>
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
      </div>
    </div>
  )
}

export default UserDashboard
