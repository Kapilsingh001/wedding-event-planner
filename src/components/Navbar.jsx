import { Link, useNavigate, useLocation } from 'react-router-dom'
import { getUser, logout } from '../features/auth/auth'
import './Navbar.css'

function Navbar() {
  const navigate = useNavigate()
  useLocation()
  const user = getUser()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">💍 Wedding</Link>
      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/vendors">Vendors</Link>
        <Link to="/events">Events</Link>
        {!user && <Link to="/register">Register</Link>}
      </div>
      <div className="navbar-right">
        {user ? (
          <>
            <span className="navbar-greeting">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Hi, {user.name.split(' ')[0]}
            </span>
            <button className="btn" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <Link to="/login" className="btn">Login</Link>
        )}
      </div>
    </nav>
  )
}

export default Navbar