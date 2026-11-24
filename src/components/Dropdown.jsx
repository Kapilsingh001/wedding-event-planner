import { useEffect, useRef, useState } from 'react'
import Icon from './Icons.jsx'
import './Dropdown.css'

// A styled replacement for <select>. The browser draws the open list of a real
// <select> itself, so CSS cannot match it to our theme; this one is drawn by us.
// options: [{ value, label }]
function Dropdown({ id, value, options, onChange, label, className = '' }) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const rootRef = useRef(null)

  const selected = options.find((option) => option.value === value) || options[0]

  // close when the user clicks anywhere outside the dropdown
  useEffect(() => {
    if (!open) return
    function handleClick(e) {
      if (!rootRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  function openList() {
    setActive(Math.max(0, options.findIndex((option) => option.value === value)))
    setOpen(true)
  }

  function choose(option) {
    onChange(option.value)
    setOpen(false)
  }

  // keyboard: arrows move, Enter/Space choose, Escape/Tab close
  function handleKeyDown(e) {
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault()
        openList()
      }
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => Math.min(i + 1, options.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      choose(options[active])
    } else if (e.key === 'Escape' || e.key === 'Tab') {
      setOpen(false)
    }
  }

  return (
    <div className={`dropdown ${className}`} ref={rootRef}>
      <button
        id={id}
        type="button"
        className={open ? 'dropdown-button open' : 'dropdown-button'}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={handleKeyDown}
      >
        <span>{selected.label}</span>
        <Icon name="chevronDown" size={18} />
      </button>

      {open && (
        <ul className="dropdown-list" role="listbox" aria-label={label}>
          {options.map((option, index) => (
            <li
              key={option.value}
              role="option"
              aria-selected={option.value === value}
              className={index === active ? 'active' : ''}
              onMouseEnter={() => setActive(index)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(option)}
            >
              {option.label}
              {option.value === value && <Icon name="check" size={16} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default Dropdown
