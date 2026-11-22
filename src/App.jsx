import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Guests from './features/guests/Guests.jsx'
import Login from './features/auth/Login.jsx'
import Register from './features/auth/Register.jsx'
import ProtectedRoute from './features/auth/ProtectedRoute.jsx'
import Vendors from './features/vendors/Vendors.jsx'
import VendorDetail from './features/vendors/VendorDetail.jsx'
import Events from './features/planning/Events.jsx'
import Tasks from './pages/Tasks.jsx'
import NotFound from './pages/NotFound.jsx'

// All the pages. Every time the address changes we scroll to the top and
// play a short fade-in, so moving between pages feels smooth.
function Pages() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    // a new key makes React treat it as a new element, which restarts the animation
    <div key={location.pathname} className="page-enter">
      <Routes location={location}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/vendors" element={<Vendors />} />
        <Route path="/vendors/:id" element={<VendorDetail />} />
        <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
        <Route path="/guests" element={<ProtectedRoute><Guests /></ProtectedRoute>} />
        <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}

function App(){
  return(
    <BrowserRouter>
      <a href="#main" className="skip-link">Skip to main content</a>
      <Navbar />
      <main id="main">
        <Pages />
      </main>
      <Footer />
    </BrowserRouter>
  )
}

export default App
