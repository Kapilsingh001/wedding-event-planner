import { useState } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { getUser, logout } from '../features/auth/auth'
import Icon from './Icons.jsx'
import './Navbar.css'

function Navbar() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  useLocation()
  const user = getUser()
  const firstName = user ? (user.name || 'there').split(' ')[0] : ''

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo" onClick={() => setOpen(false)}>
          <Icon name="gem" size={22} />
          <span>Wedding Planner</span>
        </Link>

        <button
          type="button"
          className="navbar-toggle"
          aria-expanded={open}
          aria-controls="navbar-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen(!open)}
        >
          <Icon name={open ? 'close' : 'menu'} size={24} />
        </button>

        <div
          id="navbar-menu"
          className={open ? 'navbar-menu open' : 'navbar-menu'}
          onClick={() => setOpen(false)}
        >
          <nav className="navbar-links" aria-label="Main">
            <NavLink to="/" end>{user ? 'Dashboard' : 'Home'}</NavLink>
            <NavLink to="/vendors">Vendors</NavLink>
            <NavLink to="/events">Events</NavLink>
          
            <NavLink to="/guests">Guests</NavLink>
          </nav>

          <div className="navbar-actions">
            {user ? (
              <>
                <span className="navbar-user">
                  <Icon name="user" size={16} />
                  Hi, {firstName}
                </span>
                <button type="button" className="btn btn-ghost" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="navbar-login">Login</Link>
                <Link to="/register" className="btn">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar
