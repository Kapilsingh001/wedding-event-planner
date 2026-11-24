import { useState } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../features/auth/auth'
import { logoutSuccess } from '../features/auth/authSlice'
import { getTheme, applyTheme } from '../theme.js'
import Icon from './Icons.jsx'
import ProfileCard from './ProfileCard.jsx'
import './Navbar.css'

function Navbar() {
  const [open, setOpen] = useState(false)
  const [theme, setTheme] = useState(getTheme())
  const navigate = useNavigate()
  const dispatch = useDispatch()
  useLocation()
  const user = useSelector((s) => s.auth.user)

  function handleLogout() {
    logout()
    dispatch(logoutSuccess())
    navigate('/login')
  }

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    applyTheme(next)
    setTheme(next)
  }

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        {/* Only the logo here. The name "Kalyanam" is written on the homepage and the dashboard. */}
        <Link to="/" className="navbar-logo" aria-label="Kalyanam, go to the home page" onClick={() => setOpen(false)}>
          <img src="/logo-small.webp" alt="" width="144" height="131" />
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
            <NavLink to="/timeline">Timeline</NavLink>
            <NavLink to="/guests">Guests</NavLink>
            <NavLink to="/tasks">Tasks</NavLink>
          </nav>

          <div className="navbar-actions">
            <button
              type="button"
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
            </button>
            {user ? (
              <>
                {/* "Hi, Name": a click opens the profile card */}
                <ProfileCard user={user} />
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
