import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Login from './features/auth/Login.jsx'
import Register from './features/auth/Register.jsx'
import Vendors from './features/vendors/Vendors.jsx'
import Events from './features/planning/Events.jsx'

function App(){
  return(
    <BrowserRouter>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/vendors" element={<Vendors />} />
          <Route path="/events" element={<Events />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  )
}

export default App
