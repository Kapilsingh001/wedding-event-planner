import { Link } from 'react-router-dom'
import './Footer.css'

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">

        <div className="footer-brand">
          <p className="footer-logo">
            <img src="/logo-small.webp" alt="" width="144" height="131" />
            Kalyanam
          </p>
          <p>Plan your perfect wedding without the planning chaos.</p>
        </div>

        <nav className="footer-col" aria-label="Product">
          <h2>Product</h2>
          <Link to="/vendors">Vendors</Link>
          <Link to="/events">Events</Link>
        
          <Link to="/guests">Guests</Link>
        </nav>

        <nav className="footer-col" aria-label="Account">
          <h2>Account</h2>
          <Link to="/login">Login</Link>
          <Link to="/register">Get Started</Link>
        </nav>

      </div>

      <div className="container footer-bottom">
        <p>&copy; 2026 Kalyanam</p>
        <p>Academic Project, GLA University</p>
      </div>
    </footer>
  )
}

export default Footer
