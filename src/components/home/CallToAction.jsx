import { Link } from 'react-router-dom'
import { isLoggedIn } from '../../features/auth/auth'
import Icon from '../Icons.jsx'

function CallToAction() {
  const loggedIn = isLoggedIn()

  return (
    <section className="section" aria-labelledby="cta-title">
      <div className="container">
        <div className="cta">
          <div className="cta-text">
            <h2 id="cta-title">Ready to plan without the chaos?</h2>
            <p>Set your budget, schedule your events and shortlist vendors in one organised place.</p>
            <div className="hero-actions">
              <Link to={loggedIn ? '/events' : '/register'} className="btn">
                {loggedIn ? 'Go to My Events' : 'Get Started'} <Icon name="arrow" size={18} />
              </Link>
              <Link to="/vendors" className="btn btn-ghost">Browse Vendors</Link>
            </div>
          </div>

          <div className="cta-photos">
            <img src="/images/decor.jpg" alt="Outdoor wedding stage decorated with peach drapes and flowers" />
            <img src="/images/reception.jpg" alt="Garden wedding reception with tables set under string lights" />
          </div>
        </div>
      </div>
    </section>
  )
}

export default CallToAction
