import { Link } from 'react-router-dom'
import './Navbar.css'


function Navbar(){
    return (
        <nav className='navbar'>
            <Link to="/" className='logo'>💍 Wedding</Link>
            <div className='nav-links'>
                <Link to="/">Home</Link>
                <Link to="/vendors">Vendors</Link>
                <Link to="/events">Events</Link>
                <Link to="/register">Register</Link>
            </div>
            <Link to="/login" className='btn'>Login</Link>
        </nav>
    );
}

export default Navbar;