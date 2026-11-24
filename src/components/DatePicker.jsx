import { useEffect, useRef, useState } from 'react'
import Icon from './Icons.jsx'
import './DatePicker.css'

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

const pad = (n) => String(n).padStart(2, '0')

// dates are 'YYYY-MM-DD' strings, the same format as <input type="date">
function toISO(year, month, day) {
  return `${year}-${pad(month + 1)}-${pad(day)}`
}

function formatLong(iso) {
  return new Date(iso + 'T00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

// A styled calendar instead of the browser's own date popup.
// Days before `min` cannot be picked.
function DatePicker({ id, value, onChange, min, placeholder = 'Pick a date' }) {
  const today = new Date().toLocaleDateString('en-CA')
  const start = new Date((value || min || today) + 'T00:00')
  const [open, setOpen] = useState(false)
  const [viewYear, setViewYear] = useState(start.getFullYear())
  const [viewMonth, setViewMonth] = useState(start.getMonth())
  const rootRef = useRef(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e) {
      if (!rootRef.current.contains(e.target)) setOpen(false)
    }
    function handleKey(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  function changeMonth(step) {
    const next = new Date(viewYear, viewMonth + step, 1)
    setViewYear(next.getFullYear())
    setViewMonth(next.getMonth())
  }

  function pick(iso) {
    onChange(iso)
    setOpen(false)
  }

  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const monthName = new Date(viewYear, viewMonth, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
  // the "previous month" arrow is off when that whole month is before min
  const prevDisabled = Boolean(min) && toISO(viewYear, viewMonth, 1) <= min.slice(0, 8) + '01'

  const cells = []
  for (let i = 0; i < firstWeekday; i++) cells.push(null)
  for (let day = 1; day <= daysInMonth; day++) cells.push(toISO(viewYear, viewMonth, day))

  return (
    <div className="datepicker" ref={rootRef}>
      <button
        id={id}
        type="button"
        className={open ? 'datepicker-button open' : 'datepicker-button'}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <span className={value ? '' : 'datepicker-placeholder'}>{value ? formatLong(value) : placeholder}</span>
        <Icon name="calendar" size={18} />
      </button>

      {open && (
        <div className="datepicker-popup" role="dialog" aria-label="Choose a date">
          <div className="datepicker-head">
            <button type="button" aria-label="Previous month" disabled={prevDisabled} onClick={() => changeMonth(-1)}>
              <Icon name="chevronLeft" size={18} />
            </button>
            <strong>{monthName}</strong>
            <button type="button" aria-label="Next month" onClick={() => changeMonth(1)}>
              <Icon name="chevronRight" size={18} />
            </button>
          </div>

          <div className="datepicker-grid">
            {WEEKDAYS.map((day) => (
              <span key={day} className="datepicker-weekday">{day}</span>
            ))}
            {cells.map((iso, index) =>
              iso ? (
                <button
                  key={iso}
                  type="button"
                  disabled={Boolean(min) && iso < min}
                  className={[
                    'datepicker-day',
                    iso === value ? 'selected' : '',
                    iso === today ? 'today' : '',
                  ].join(' ')}
                  aria-label={formatLong(iso)}
                  aria-pressed={iso === value}
                  onClick={() => pick(iso)}
                >
                  {Number(iso.slice(8))}
                </button>
              ) : (
                <span key={`blank-${index}`} />
              )
            )}
          </div>

          <div className="datepicker-foot">
            <button type="button" onClick={() => pick('')}>Clear</button>
            <button type="button" disabled={Boolean(min) && today < min} onClick={() => pick(today)}>Today</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DatePicker
