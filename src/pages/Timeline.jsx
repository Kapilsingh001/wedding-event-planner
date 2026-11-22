import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { getUser } from '../features/auth/auth'
import Icon from '../components/Icons.jsx'
import { buildTimeline, groupByMonth, getTimelineSummary, getDayLabel } from './timelineUtils'
import './Timeline.css'

const FILTERS = ['all', 'upcoming', 'past']

function formatMoney(value) {
  return '₹' + Number(value).toLocaleString('en-IN')
}

function Timeline() {
  const user = getUser()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    // the ceremonies and their expenses, loaded together
    Promise.all([api.get('/events'), api.get('/expenses')])
      .then(([events, expenses]) => {
        setData({
          events: events.data.filter((event) => String(event.userId) === String(user.id)),
          expenses: expenses.data,
        })
      })
      .catch(() => setError('Could not load your timeline. Is JSON Server running on port 3001?'))
  }, [user.id])

  if (error) {
    return (
      <div className="container ui-page ui-page-narrow">
        <div className="ui-alert ui-alert-error" role="alert">{error}</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="container ui-page ui-page-narrow">
        <p className="ui-muted">Loading your timeline…</p>
      </div>
    )
  }

  // en-CA gives YYYY-MM-DD in local time, the same format as our event dates
  const today = new Date().toLocaleDateString('en-CA')
  const items = buildTimeline(data.events, data.expenses, today)
  const summary = getTimelineSummary(items)
  const counts = { all: summary.total, upcoming: summary.upcoming, past: summary.past }

  const visible = items.filter((item) => {
    if (filter === 'upcoming') return item.status !== 'past'
    if (filter === 'past') return item.status === 'past'
    return true
  })
  const groups = groupByMonth(visible)

  return (
    <div className="container ui-page ui-page-narrow">
      <header className="ui-page-header">
        <div>
          <p className="ui-eyebrow">Planning</p>
          <h1>Wedding Timeline</h1>
          <p>Every ceremony in date order, from the first function to the last.</p>
        </div>
        <Link to="/events" className="btn">
          <Icon name="plus" size={18} /> Plan a Ceremony
        </Link>
      </header>

      {items.length === 0 ? (
        <section className="empty-state">
          <span className="empty-state-icon"><Icon name="calendar" size={28} /></span>
          <h2>No ceremonies yet</h2>
          <p>Add your Haldi, Mehendi, Sangeet and Wedding as events, and they will appear here in order.</p>
          <div className="empty-state-actions">
            <Link to="/events" className="btn">Plan a Ceremony</Link>
          </div>
        </section>
      ) : (
        <>
          <section className="tl-summary" aria-label="Summary">
            <div>
              <strong>{summary.total}</strong>
              <span>{summary.total === 1 ? 'ceremony' : 'ceremonies'}</span>
            </div>
            <div>
              <strong>{summary.upcoming}</strong>
              <span>upcoming</span>
            </div>
            <div>
              <strong>{summary.past}</strong>
              <span>completed</span>
            </div>
            <div className="tl-summary-next">
              <span>Next</span>
              <strong>{summary.next ? `${summary.next.title} · ${getDayLabel(summary.next.daysLeft)}` : 'All done'}</strong>
            </div>
          </section>

          <div className="ui-segment" role="group" aria-label="Filter ceremonies">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                className={filter === f ? 'active' : ''}
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
              >
                {f} <span>{counts[f]}</span>
              </button>
            ))}
          </div>

          {visible.length === 0 && <p className="ui-muted tl-none">No {filter} ceremonies.</p>}

          <ol className="tl">
            {groups.map((group) => (
              <li key={group.month} className="tl-group">
                <h2 className="tl-month">{group.month}</h2>
                <ol>
                  {group.items.map((item) => {
                    const date = new Date(item.date + 'T00:00')
                    const over = item.percent > 100
                    return (
                      <li key={item.id} className={`tl-item tl-${item.status}`}>
                        <div className="tl-date">
                          <strong>{date.getDate()}</strong>
                          <span>{date.toLocaleDateString('en-IN', { weekday: 'short' })}</span>
                        </div>
                        <span className="tl-dot" aria-hidden="true" />
                        <article className="tl-card">
                          <div className="tl-card-top">
                            <span className={`tl-type tl-type-${String(item.type || 'other').toLowerCase()}`}>
                              {item.type}
                            </span>
                            <span className="tl-when">{getDayLabel(item.daysLeft)}</span>
                          </div>
                          <h3>{item.title}</h3>
                          {item.venue && (
                            <p className="tl-venue">
                              <Icon name="landmark" size={15} /> {item.venue}
                            </p>
                          )}
                          <div className="tl-budget">
                            <div className="tl-bar">
                              <div className={over ? 'tl-bar-fill over' : 'tl-bar-fill'} style={{ width: `${Math.min(item.percent, 100)}%` }} />
                            </div>
                            <span className={over ? 'ui-bad' : ''}>
                              {formatMoney(item.spent)} of {formatMoney(item.budget)}
                              {over ? ' · over budget' : ''}
                            </span>
                          </div>
                        </article>
                      </li>
                    )
                  })}
                </ol>
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  )
}

export default Timeline
