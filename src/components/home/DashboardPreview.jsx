import Icon from '../Icons.jsx'

const budget = { total: 1000000, spent: 640000 }

const categories = [
  { name: 'Venue', amount: 250000 },
  { name: 'Catering', amount: 180000 },
  { name: 'Photography', amount: 90000 },
  { name: 'Decoration', amount: 80000 },
  { name: 'Transportation', amount: 40000 },
]

const stats = [
  { icon: 'calendar', label: 'Events', value: 12 },
  { icon: 'store', label: 'Vendors', value: 8 },
  { icon: 'users', label: 'Guests', value: 143 },
]

const planningProgress = 72

const upcoming = [
  { name: 'Mehendi', when: '21 Sept, 5:00 PM', vendor: 'Decorator', status: 'Confirmed' },
  { name: 'Sangeet', when: '22 Sept, 7:00 PM', vendor: 'Music', status: 'Confirmed' },
  { name: 'Haldi', when: '23 Sept, 10:00 AM', vendor: 'Catering', status: 'Planning' },
  { name: 'Wedding', when: '23 Sept, 6:00 PM', vendor: 'Venue', status: 'Planning' },
]

const formatINR = (amount) => '₹' + amount.toLocaleString('en-IN')

function DashboardPreview() {
  const remaining = budget.total - budget.spent
  const spentPercent = Math.round((budget.spent / budget.total) * 100)
  const largest = Math.max(...categories.map((c) => c.amount))

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
            <span className="badge">Demo data</span>
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

            <div className="panel">
              <h3>Budget</h3>
              <dl className="budget-figures">
                <div><dt>Total Budget</dt><dd>{formatINR(budget.total)}</dd></div>
                <div><dt>Spent</dt><dd>{formatINR(budget.spent)}</dd></div>
                <div><dt>Remaining</dt><dd className="positive">{formatINR(remaining)}</dd></div>
              </dl>

              <div className="meter-row">
                <span>Budget used</span>
                <span>{spentPercent}%</span>
              </div>
              <div
                className="meter"
                role="progressbar"
                aria-label="Budget used"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={spentPercent}
              >
                <span style={{ width: `${spentPercent}%` }} />
              </div>

              <h4>Spending by category</h4>
              <ul className="category-list">
                {categories.map((category) => (
                  <li key={category.name}>
                    <div className="meter-row">
                      <span>{category.name}</span>
                      <span>{formatINR(category.amount)}</span>
                    </div>
                    <div className="meter meter-soft" aria-hidden="true">
                      <span style={{ width: `${Math.round((category.amount / largest) * 100)}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="preview-side">
              <ul className="stat-row">
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
                <p className="panel-sub">September 2026</p>
                <ul className="event-list">
                  {upcoming.map((event) => (
                    <li key={event.name}>
                      <div>
                        <p className="event-name">{event.name}</p>
                        <p className="event-meta">{event.when} &middot; {event.vendor}</p>
                      </div>
                      <span className={`chip chip-${event.status.toLowerCase()}`}>
                        <Icon name={event.status === 'Confirmed' ? 'check' : 'clock'} size={13} />
                        {event.status}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}

export default DashboardPreview
