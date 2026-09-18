import { Link } from 'react-router-dom'
import { isLoggedIn } from '../../features/auth/auth'
import Icon from '../Icons.jsx'

const highlights = ['Vendors', 'Events', 'Budget', 'Guests']

const sampleCards = [
  { key: 'budget', icon: 'wallet', label: 'Budget', value: '₹8,50,000' },
  { key: 'events', icon: 'calendar', label: 'Events', value: '12' },
  { key: 'vendors', icon: 'store', label: 'Vendors', value: '8' },
]

function Hero() {
  const startLink = isLoggedIn() ? '/events' : '/register'

  return (
    <section className="hero">
      <div className="container hero-inner">

        <div className="hero-text">
          <p className="eyebrow">Wedding &amp; Event Planning Platform</p>
          <h1>
            Plan Your Dream Wedding <span>Without the Planning Chaos</span>
          </h1>
          <p className="hero-lead">
            Manage vendors, events, budget and guests from one place.
          </p>

          <div className="hero-actions">
            <Link to={startLink} className="btn">
              Start Planning <Icon name="arrow" size={18} />
            </Link>
            <Link to="/vendors" className="btn btn-ghost">Browse Vendors</Link>
          </div>

          <ul className="hero-highlights" aria-label="What you can manage">
            {highlights.map((item) => (
              <li key={item}>
                <Icon name="check" size={16} />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="hero-visual">
          <p className="hero-sample">Example plan &middot; sample data</p>
          <img
            className="hero-photo"
            src="/images/hero.webp"
            alt="Bride and groom walking hand in hand under a floral arch"
          />

          {sampleCards.map((card) => (
            <div key={card.key} className={`hero-float hero-float-${card.key}`}>
              <span className="hero-float-icon"><Icon name={card.icon} size={18} /></span>
              <span>
                <span className="hero-float-label">{card.label}</span>
                <span className="hero-float-value">{card.value}</span>
              </span>
            </div>
          ))}

        </div>

      </div>
    </section>
  )
}

export default Hero
