import Icon from '../Icons.jsx'

const steps = [
  { icon: 'plus', title: 'Create Your Wedding', text: 'Create your wedding profile and set the date.' },
  { icon: 'list', title: 'Plan', text: 'Add events, vendors, guests and expenses.' },
  { icon: 'trending', title: 'Track', text: 'Monitor your budget, events and planning progress.' },
  { icon: 'heart', title: 'Celebrate', text: 'Keep everything organized in one place.' },
]

function HowItWorks() {
  return (
    <section className="section section-tint" aria-labelledby="how-title">
      <div className="container">
        <header className="section-head">
          <p className="eyebrow">How It Works</p>
          <h2 id="how-title">From first idea to the big day</h2>
        </header>

        <ol className="steps">
          {steps.map((step, index) => (
            <li key={step.title} className="step">
              <span className="step-number">{String(index + 1).padStart(2, '0')}</span>
              <span className="step-icon"><Icon name={step.icon} size={22} /></span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export default HowItWorks
