import Hero from '../components/home/Hero.jsx'
import Features from '../components/home/Features.jsx'
import HowItWorks from '../components/home/HowItWorks.jsx'
import DashboardPreview from '../components/home/DashboardPreview.jsx'
import Services from '../components/home/Services.jsx'
import CallToAction from '../components/home/CallToAction.jsx'
import UserDashboard from './UserDashboard.jsx'
import { getUser } from '../features/auth/auth'
import './Dashboard.css'

function Dashboard() {
  // logged-in users get their own dashboard, visitors see the homepage
  if (getUser()) {
    return <UserDashboard />
  }

  return (
    <div className="home">
      <Hero />
      <Features />
      <HowItWorks />
      <DashboardPreview />
      <Services />
      <CallToAction />
    </div>
  )
}

export default Dashboard
