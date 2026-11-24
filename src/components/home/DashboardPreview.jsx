import Icon from '../Icons.jsx'

const planningProgress = 72

const budget = { total: 1000000, spent: 640000 }

const stats = [
  { icon: 'calendar', label: 'Events', value: 12 },
  { icon: 'store', label: 'Vendors', value: 8 },
  { icon: 'users', label: 'Guests', value: 143 },
]

const upcoming = [
  { name: 'Mehendi', when: '21 Sept, 5:00 PM', status: 'Confirmed' },
  { name: 'Sangeet', when: '22 Sept, 7:00 PM', status: 'Confirmed' },
  { name: 'Haldi', when: '23 Sept, 10:00 AM', status: 'Planning' },
  { name: 'Wedding', when: '23 Sept, 6:00 PM', status: 'Planning' },
]

const rsvp = [
  { key: 'attending', icon: 'check', label: 'Attending', count: 96 },
  { key: 'pending', icon: 'help', label: 'Pending', count: 31 },
  { key: 'declined', icon: 'close', label: 'Declined', count: 16 },
]

const formatLakh = (amount) => `₹${amount / 100000}L`

function DashboardPreview() {
  const spentPercent = Math.round((budget.spent / budget.total) * 100)
  const totalGuests = rsvp.reduce((sum, group) => sum + group.count, 0)

  return (
    <section className="section" aria-labelledby="preview-title">
      <div className="container">
        <header className="section-head">
          <p className="eyebrow">Product Preview</p>
          <h2 id="preview-title">Your Wedding at a Glance</h2>
          <p>One dashboard for your budget, events, vendors and guests.</p>
        </header>

        <div className="preview">
          <div className="preview-bar">
            <span className="preview-dots" aria-hidden="true"><i /><i /><i /></span>
            <span className="preview-title">Wedding Overview</span>
            <span className="badge badge-demo">Demo Preview &middot; sample data</span>
          </div>

          <div className="preview-body">

            <div className="panel panel-wide">
              <div className="meter-row">
                <h3>Planning Progress</h3>
                <span>{planningProgress}%</span>
              </div>
              <div
                className="meter"
                role="progressbar"
                aria-label="Planning progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={planningProgress}
              >
                <span style={{ width: `${planningProgress}%` }} />
              </div>
            </div>

            <ul className="stat-row panel-wide">
              <li className="panel stat">
                <span className="stat-icon"><Icon name="wallet" size={18} /></span>
                <span className="stat-value">{formatLakh(budget.total)}</span>
                <span className="stat-label">
                  Budget &middot; {formatLakh(budget.spent)} spent ({spentPercent}%)
                </span>
              </li>
              {stats.map((stat) => (
                <li key={stat.label} className="panel stat">
                  <span className="stat-icon"><Icon name={stat.icon} size={18} /></span>
                  <span className="stat-value">{stat.value}</span>
                  <span className="stat-label">{stat.label}</span>
                </li>
              ))}
            </ul>

            <div className="panel">
              <h3>Upcoming Events</h3>
              <ul className="event-list">
                {upcoming.map((event) => (
                  <li key={event.name}>
                    <div>
                      <p className="event-name">{event.name}</p>
                      <p className="event-meta">{event.when}</p>
                    </div>
                    <span className={`chip chip-${event.status.toLowerCase()}`}>
                      <Icon name={event.status === 'Confirmed' ? 'check' : 'clock'} size={13} />
                      {event.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="panel">
              <h3>Guest RSVP</h3>
              <div className="rsvp-bar" aria-hidden="true">
                {rsvp.map((group) => (
                  <span
                    key={group.key}
                    className={`rsvp-${group.key}`}
                    style={{ width: `${(group.count / totalGuests) * 100}%` }}
                  />
                ))}
              </div>
              <ul className="rsvp-list">
                {rsvp.map((group) => (
                  <li key={group.key}>
                    <span className={`rsvp-icon rsvp-${group.key}`}>
                      <Icon name={group.icon} size={14} />
                    </span>
                    <span className="rsvp-label">{group.label}</span>
                    <span className="rsvp-count">{group.count}</span>
                  </li>
                ))}
              </ul>
              <p className="panel-sub">{totalGuests} guests invited</p>
            </div>

          </div>

          <p className="preview-note">
            This is a demo preview. All numbers are sample data, not real platform statistics.
          </p>
        </div>
      </div>
    </section>
  )
}

export default DashboardPreview
