import { Link } from 'react-router-dom'
import Icon from '../components/Icons.jsx'

// Shown for any address that does not match a route in App.jsx
function NotFound() {
  return (
    <div className="container">
      <section className="empty-state" aria-labelledby="not-found-title">
        <span className="empty-state-icon"><Icon name="help" size={28} /></span>
        <h1 id="not-found-title">Page not found</h1>
        <p>The page you are looking for does not exist or has been moved.</p>
        <div className="empty-state-actions">
          <Link to="/" className="btn">Back to Home</Link>
          <Link to="/vendors" className="btn btn-ghost">Browse Vendors</Link>
        </div>
      </section>
    </div>
  )
}

export default NotFound
