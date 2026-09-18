import {Link} from 'react-router-dom'
import './Dashboard.css'


function Dashboard(){
    return (
        <div className='home'>
        <section className='hero'>
            <div className='hero-text'>
                <h1>
                    Let's Plan for <br />
                    Your Dream <br />
                    <span>Wedding</span> 💍
                </h1>
            

             <p>
            We will help you to plan your dream wedding. Manage vendors,
            events, budget and guests all in one place.
        </p>
       

        <Link to='/events' className='btn'> Get Started</Link>
         </div>

         <div className='hero-image'>
            <div className='hero-frame'>
                <img src='/images/hero.webp' alt='Wedding couple' />

            </div>
         </div>

         


        </section>

        <section className='features'>
            <div className='feature'>
                <img src='/images/decor.jpg' alt='Wedding decoration' />

            <div>
                <h3>Outside Pre Wedding Decoration</h3>
                <p>Beautiful outdoor decoration to make your ceremony romantic and memorable.</p>


            </div>
            </div>

            <div className='feature'>
                <img src='/images/reception.jpg' alt='Wedding reception' />

                <div>
                    <h3>Wedding Reception in the Center</h3>
                    <p>Grand reception venues with complete planning and management.</p>

                </div>
            </div>
           
        </section>

        <section className='services'>

    <h2>Make your Plan with us</h2>
    <p className='services-subtitle'>Everything you need to plan your wedding, in one place</p>

    <div className='services-grid'>

        <Link to='/vendors' className='service-card'>
            <div className='service-icon'>🏛️</div>
            <h3>Vendors</h3>
            <p>Browse caterers, photographers, venues and more</p>
            <span className='service-link'>Explore →</span>

        </Link>

        <Link to='/events' className='service-card'>
            <div className='service-icon'>📅</div>
            <h3>Events</h3>
            <p>Create and plan your wedding events</p>
            <span className='service-link'>Explore →</span>

        </Link>

        <Link to='/events' className='service-card'>
            <div className='service-icon'>💰</div>
            <h3>Budget</h3>
            <p>Track expenses and stay within budget</p>
            <span className='service-link'>Explore →</span>

        </Link>

        <Link to='/login' className='service-card'>
            <div className='service-icon'>🔐</div>
            <h3>Account</h3>
            <p>Login or register to save your plans</p>
            <span className='service-link'>Explore →</span>

        </Link>

    </div>

</section>


        </div>
      
    )
}

export default Dashboard