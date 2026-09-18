import { Link } from 'react-router-dom'
import Icon from '../Icons.jsx'

const services = [
  { icon: 'landmark', name: 'Venue', text: 'Banquet halls, lawns and destination venues.' },
  { icon: 'utensils', name: 'Catering', text: 'Menus and caterers for every function.' },
  { icon: 'camera', name: 'Photography', text: 'Photographers and videographers.' },
  { icon: 'flower', name: 'Decoration', text: 'Stage, floral and theme decorators.' },
  { icon: 'sparkles', name: 'Makeup', text: 'Bridal makeup and styling artists.' },
  { icon: 'music', name: 'Music', text: 'DJs, bands and sangeet performers.' },
]

function Services() {
  return (
    <section className="section section-tint" aria-labelledby="services-title">
      <div className="container">
        <header className="section-head section-head-row">
          <div>
            <p className="eyebrow">Popular Wedding Services</p>
            <h2 id="services-title">Find the right vendor for every need</h2>
          </div>
          <Link to="/vendors" className="btn btn-ghost">
            Browse all vendors <Icon name="arrow" size={16} />
          </Link>
        </header>

        <ul className="service-grid">
          {services.map((service) => (
            <li key={service.name}>
              <Link to="/vendors" className="service-card" aria-label={`${service.name} vendors`}>
                <span className="service-icon"><Icon name={service.icon} size={24} /></span>
                <span className="service-name">{service.name}</span>
                <span className="service-text">{service.text}</span>
                <span className="service-cta">View vendors <Icon name="arrow" size={14} /></span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default Services
