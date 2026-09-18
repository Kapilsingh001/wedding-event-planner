import { Link } from 'react-router-dom'
import Icon from '../components/Icons.jsx'

function Guests() {
  return (
    <div className="container">
      <section className="empty-state" aria-labelledby="guests-title">
        <span className="empty-state-icon"><Icon name="users" size={28} /></span>
        <h1 id="guests-title">Guest list is coming soon</h1>
        <p>
          Adding guests and tracking RSVPs is part of the planning module and is still being built.
        </p>
        <div className="empty-state-actions">
          <Link to="/events" className="btn">Plan Events</Link>
          <Link to="/" className="btn btn-ghost">Back to Home</Link>
        </div>
      </section>
    </div>
  )
}

export default Guests
