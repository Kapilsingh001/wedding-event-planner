import { Link } from 'react-router-dom'
import Icon from '../Icons.jsx'

const features = [
  {
    icon: 'store',
    title: 'Vendors',
    tagline: 'Find and manage wedding vendors',
    points: ['Search vendors', 'Filter by category', 'Compare options', 'Save favorites'],
    action: 'View Vendors',
    to: '/vendors',
  },
  {
    icon: 'calendar',
    title: 'Events',
    tagline: 'Build your wedding schedule',
    points: ['Create events', 'Set dates', 'Assign vendors', 'Track status'],
    action: 'Plan Events',
    to: '/events',
  },
  {
    icon: 'wallet',
    title: 'Budget',
    tagline: 'Keep your wedding expenses under control',
    points: ['Set budget', 'Track expenses', 'Categorize spending', 'View remaining balance'],
    action: 'Manage Budget',
    to: '/events',
  },
  {
    icon: 'users',
    title: 'Guests',
    tagline: 'Manage your guest list',
    points: ['Add guests', 'Track RSVPs', 'Record preferences', 'Manage guest information'],
    action: 'Manage Guests',
    to: '/guests',
  },
]

function Features() {
  return (
    <section className="section" aria-labelledby="features-title">
      <div className="container">
        <header className="section-head">
          <p className="eyebrow">Core Features</p>
          <h2 id="features-title">Everything you need to plan, in one place</h2>
        </header>

        <div className="feature-grid">
          {features.map((feature) => (
            <article key={feature.title} className="feature-card">
              <span className="feature-icon"><Icon name={feature.icon} size={24} /></span>
              <h3>{feature.title}</h3>
              <p>{feature.tagline}</p>
              <ul>
                {feature.points.map((point) => (
                  <li key={point}>
                    <Icon name="check" size={14} />
                    {point}
                  </li>
                ))}
              </ul>
              <Link to={feature.to} className="feature-link">
                {feature.action} <Icon name="arrow" size={16} />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features
