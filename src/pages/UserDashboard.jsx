import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { getUser } from '../features/auth/auth'
import { getShortlist } from '../features/vendors/shortlist'
import Icon from '../components/Icons.jsx'
import {
  summarizeBudget, summarizeGuests, summarizeTasks, getNextEvent, daysUntil, getUpcomingEvents, getSetupSteps, getNextStep,
} from './dashboardUtils'
import { getDayLabel } from './timelineUtils'
import { getDueInfo } from './tasksUtils'
import './UserDashboard.css'

// short names for the setup steps, shown as small pills
const STEP_LABELS = { event: 'Event', guests: 'Guests', tasks: 'Checklist', vendors: 'Vendors' }

function formatMoney(value) {
  return '₹' + Number(value).toLocaleString('en-IN')
}

// 'T00:00' makes the browser read the date in local time, not in UTC
function toDate(dateStr) {
  return new Date(dateStr + 'T00:00')
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
  const nextStep = getNextStep(steps)

  const upcomingTasks = data.tasks
    .filter((task) => !task.done)
    .sort((a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999'))
    .slice(0, 4)

  // money spent on one event, for the small bars in "Upcoming ceremonies"
  const spentOn = (eventId) =>
    data.expenses.filter((expense) => expense.eventId === eventId).reduce((sum, expense) => sum + Number(expense.amount), 0)

  return (
    <div className="container dash">
      {/* ---------- 1. welcome banner: the next ceremony and the countdown ---------- */}
      <header className="dash-hero">
        <div className="dash-hero-photo" aria-hidden="true" />
        <div className="dash-hero-text">
          {/* the name of the site, then what this page is */}
          <p className="dash-brand">
            <span className="brand-script">Kalyanam</span>
            <span className="dash-eyebrow">Your wedding dashboard</span>
          </p>
          <h1>Welcome back, {firstName}</h1>
          {nextEvent ? (
            <ul className="dash-facts" aria-label="Your next ceremony">
              <li><Icon name="sparkles" size={16} /> Next: <strong>{nextEvent.title}</strong></li>
              <li>
                <Icon name="calendar" size={16} />
                {toDate(nextEvent.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
              </li>
              {nextEvent.venue && <li><Icon name="landmark" size={16} /> {nextEvent.venue}</li>}
            </ul>
          ) : (
            <p className="dash-sub">Plan your first ceremony to see your progress here.</p>
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
          <div className="dash-countdown" aria-label={`${getDayLabel(daysLeft)}: ${nextEvent.title}`}>
            {daysLeft === 0 ? (
              <>
                <strong className="dash-countdown-word">Today</strong>
                <span>is the day</span>
              </>
            ) : (
              <>
                <strong>{daysLeft}</strong>
                <span>{daysLeft === 1 ? 'day to go' : 'days to go'}</span>
              </>
            )}
          </div>
        )}
      </header>

      {/* ---------- 2. setup progress: one slim line, gone once all four are done ---------- */}
      {nextStep && (
        <section className="dash-setup" aria-label="Setup progress">
          <div className="dash-setup-text">
            <strong>Finish setting up</strong>
            <span>{stepsDone} of {steps.length} steps done</span>
          </div>
          <ol className="dash-setup-steps">
            {steps.map((step) => (
              <li key={step.key} className={step.done ? 'done' : ''} title={step.title}>
                {step.done && <Icon name="check" size={13} />}
                {STEP_LABELS[step.key]}
              </li>
            ))}
          </ol>
          <Link to={nextStep.to} className="btn btn-sm">
            {nextStep.title} <Icon name="arrow" size={16} />
          </Link>
        </section>
      )}

      {/* ---------- 3. the four numbers, in one card. Each one opens its page ---------- */}
      <section className="dash-stats" aria-label="At a glance">
        <Link to="/events" className="dash-stat">
          <span className="dash-stat-label"><Icon name="wallet" size={16} /> Budget</span>
          <span className="dash-stat-number">{formatMoney(budget.totalSpent)}</span>
          {budget.totalBudget === 0 ? (
            <span className="dash-stat-note">No budget set yet</span>
          ) : (
            <>
              <span className="dash-stat-note">spent of {formatMoney(budget.totalBudget)}</span>
              <span className="dash-bar" role="progressbar" aria-valuenow={budget.percent} aria-valuemin="0" aria-valuemax="100">
                <span className={overBudget ? 'dash-bar-fill over' : 'dash-bar-fill'} style={{ width: `${Math.min(budget.percent, 100)}%` }} />
              </span>
              <span className={overBudget ? 'dash-stat-note dash-over' : 'dash-stat-note'}>
                {overBudget ? `Over by ${formatMoney(-budget.remaining)}` : `${formatMoney(budget.remaining)} left`}
              </span>
            </>
          )}
        </Link>

        <Link to="/guests" className="dash-stat">
          <span className="dash-stat-label"><Icon name="users" size={16} /> Guests</span>
          {guests.total === 0 ? (
            <>
              <span className="dash-stat-number">0</span>
              <span className="dash-stat-note">No guests added yet</span>
            </>
          ) : (
            <>
              <span className="dash-stat-number">{guests.attending}<span>/{guests.total}</span></span>
              <span className="dash-stat-note">attending</span>
              <span className="dash-stat-note">
                {guests.pending} pending{guests.declined > 0 ? ` · ${guests.declined} declined` : ''}
              </span>
            </>
          )}
        </Link>

        <Link to="/tasks" className="dash-stat">
          <span className="dash-stat-label"><Icon name="list" size={16} /> Tasks</span>
          {tasks.total === 0 ? (
            <>
              <span className="dash-stat-number">0</span>
              <span className="dash-stat-note">No tasks yet</span>
            </>
          ) : (
            <>
              <span className="dash-stat-number">{tasks.done}<span>/{tasks.total}</span></span>
              <span className="dash-stat-note">done</span>
              <span className="dash-bar" role="progressbar" aria-valuenow={tasks.percent} aria-valuemin="0" aria-valuemax="100">
                <span className="dash-bar-fill" style={{ width: `${tasks.percent}%` }} />
              </span>
              <span className="dash-stat-note">{tasks.percent}% of the checklist</span>
            </>
          )}
        </Link>

        <Link to="/timeline" className="dash-stat">
          <span className="dash-stat-label"><Icon name="calendar" size={16} /> Events</span>
          <span className="dash-stat-number">{data.events.length}</span>
          {data.events.length === 0 ? (
            <span className="dash-stat-note">No ceremony planned yet</span>
          ) : (
            <>
              <span className="dash-stat-note">{data.events.length === 1 ? 'ceremony planned' : 'ceremonies planned'}</span>
              <span className="dash-stat-note">
                {nextEvent ? <>Next: <strong>{nextEvent.title}</strong></> : 'None upcoming'}
              </span>
            </>
          )}
        </Link>
      </section>

      {/* ---------- 4. what is coming: ceremonies on the left, tasks and vendors on the right ---------- */}
      <div className="dash-grid">
        <section className="dash-panel" aria-labelledby="dash-events-title">
          <div className="dash-panel-head">
            <h2 id="dash-events-title">Upcoming ceremonies</h2>
            <Link to="/timeline">Timeline <Icon name="arrow" size={15} /></Link>
          </div>
          {upcomingEvents.length === 0 ? (
            <p className="dash-empty">Nothing planned yet. <Link to="/events">Plan a ceremony</Link></p>
          ) : (
            <ul className="dash-events">
              {upcomingEvents.map((event) => {
                const date = toDate(event.date)
                const spent = spentOn(event.id)
                const percent = Number(event.budget) > 0 ? Math.round((spent / Number(event.budget)) * 100) : 0
                return (
                  <li key={event.id}>
                    <div className="dash-date" aria-hidden="true">
                      <strong>{date.getDate()}</strong>
                      <span>{date.toLocaleDateString('en-IN', { month: 'short' })}</span>
                    </div>
                    <div className="dash-event-body">
                      <div className="dash-event-top">
                        <strong>{event.title}</strong>
                        <span className="dash-chip">{getDayLabel(daysUntil(event.date, today))}</span>
                      </div>
                      <span className="dash-event-place">{event.venue || event.type}</span>
                      <div className="dash-event-money">
                        <span className="dash-bar">
                          <span className={percent > 100 ? 'dash-bar-fill over' : 'dash-bar-fill'} style={{ width: `${Math.min(percent, 100)}%` }} />
                        </span>
                        <small className={percent > 100 ? 'dash-over' : ''}>{formatMoney(spent)} of {formatMoney(event.budget)}</small>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <div className="dash-side">
          <section className="dash-panel" aria-labelledby="dash-tasks-title">
            <div className="dash-panel-head">
              <h2 id="dash-tasks-title">Next tasks</h2>
              <Link to="/tasks">Checklist <Icon name="arrow" size={15} /></Link>
            </div>
            {upcomingTasks.length === 0 ? (
              <p className="dash-empty">Nothing pending. <Link to="/tasks">Add a task</Link></p>
            ) : (
              <ul className="dash-rows">
                {upcomingTasks.map((task) => {
                  const due = getDueInfo(task.dueDate, today)
                  return (
                    <li key={task.id}>
                      <span className="dash-dot" aria-hidden="true" />
                      <span className="dash-row-title">{task.title}</span>
                      <small className={`dash-due dash-due-${due.status}`}>{due.label}</small>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

          <section className="dash-panel" aria-labelledby="dash-vendors-title">
            <div className="dash-panel-head">
              <h2 id="dash-vendors-title">Shortlisted vendors</h2>
              <Link to="/vendors">Browse <Icon name="arrow" size={15} /></Link>
            </div>
            {data.shortlisted.length === 0 ? (
              <p className="dash-empty">None saved yet. <Link to="/vendors">Find vendors</Link></p>
            ) : (
              <>
                <ul className="dash-rows">
                  {data.shortlisted.slice(0, 3).map((vendor) => (
                    <li key={vendor.id}>
                      <Link to={`/vendors/${vendor.id}`} className="dash-row-title">
                        <strong>{vendor.name}</strong>
                        <small>{vendor.category} · {vendor.city}</small>
                      </Link>
                      <span className="dash-price">{formatMoney(vendor.price)}</span>
                    </li>
                  ))}
                </ul>
                {data.shortlisted.length > 3 && (
                  <Link to="/vendors" className="dash-more">+{data.shortlisted.length - 3} more</Link>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

export default UserDashboard
