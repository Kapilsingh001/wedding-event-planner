import { Link } from 'react-router-dom'
import './Footer.css'

function Footer(){
    return (
        <footer className='footer'>

            <div className='footer-grid'>

                <div className='footer-brand'>
                    <h3>💍 Wedding</h3>
                    <p>Plan your dream wedding with vendors, events, budget and guests all in one place.</p>
                </div>

                <div className='footer-col'>
                    <h4>Explore</h4>
                    <Link to='/'>Home</Link>
                    <Link to='/vendors'>Vendors</Link>
                    <Link to='/events'>Events</Link>
                </div>

                <div className='footer-col'>
                    <h4>Account</h4>
                    <Link to='/login'>Login</Link>
                    <Link to='/register'>Register</Link>
                </div>

                <div className='footer-col'>
                    <h4>Contact</h4>
                    <span>GLA University, Mathura</span>
                    <span>B.Tech CSE, Group 7</span>
                </div>

            </div>

            <p className='footer-bottom'>© 2026 Wedding Planner. Mini Project, GLA University.</p>

        </footer>
    )
}

export default Footer
