import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import api from '../services/api'
import { getUser, saveUser } from '../features/auth/auth'
import { loginSuccess } from '../features/auth/authSlice'
import { getDayLabel } from '../pages/timelineUtils'
import Icon from './Icons.jsx'
import { profileSchema, getInitials, checkPhotoFile, resizePhoto, getProfileStats } from './profileUtils'
import './ProfileCard.css'

const SERVER_DOWN = 'Could not save. Is JSON Server running on port 3001?'

// The round picture of the user: their photo, or their initials when there is none
function Avatar({ user, size }) {
  if (user.photo) {
    return <img className={`profile-avatar profile-avatar-${size}`} src={user.photo} alt="" />
  }
  return (
    <span className={`profile-avatar profile-avatar-initials profile-avatar-${size}`} aria-hidden="true">
      {getInitials(user.name)}
    </span>
  )
}

// The "Hi, Name" button in the navbar. A click opens a card with the user's
// photo and details, a few numbers about their planning, and an edit form.
function ProfileCard({ user }) {
  const dispatch = useDispatch()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [stats, setStats] = useState(null)
  const [statsError, setStatsError] = useState(false)
  const [notice, setNotice] = useState(null) // { type: 'success' or 'error', text }
  const [busy, setBusy] = useState(false) // true while something is being saved
  const wrapRef = useRef(null)
  const fileRef = useRef(null)
  const firstName = (user.name || 'there').split(' ')[0]

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(profileSchema) })

  // Load the numbers every time the card opens, so they are always up to date
  useEffect(() => {
    if (!open) return
    let active = true
    Promise.all([api.get('/events'), api.get('/guests'), api.get('/tasks'), api.get('/bookings')])
      .then(([events, guests, tasks, bookings]) => {
        if (!active) return
        // en-CA gives YYYY-MM-DD in local time, the same format as our event dates
        const today = new Date().toLocaleDateString('en-CA')
        const lists = { events: events.data, guests: guests.data, tasks: tasks.data, bookings: bookings.data }
        setStats(getProfileStats(lists, user.id, today))
      })
      .catch(() => {
        if (active) setStatsError(true)
      })
    return () => {
      active = false
    }
  }, [open, user.id])

  // Close the card on a click outside it, or on the Escape key
  useEffect(() => {
    if (!open) return
    function onMouseDown(event) {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) closeCard()
    }
    function onKeyDown(event) {
      if (event.key === 'Escape') closeCard()
    }
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  function closeCard() {
    setOpen(false)
    setEditing(false)
    setNotice(null)
  }

  function toggleCard() {
    if (open) {
      closeCard()
    } else {
      setStatsError(false) // forget an old loading problem before trying again
      setOpen(true)
    }
  }

  // The navbar closes its phone menu on any click inside it. A click in the
  // profile must not do that, except on a link, which goes to another page.
  function keepMenuOpen(event) {
    if (!event.target.closest('a')) event.stopPropagation()
  }

  // Saves changes in three places: the database, localStorage and the Redux
  // store. So the navbar and every page show the new details at once.
  async function saveChanges(changes) {
    const { data } = await api.patch(`/users/${user.id}`, changes)
    saveUser(data) // saveUser leaves the password out
    dispatch(loginSuccess(getUser()))
  }

  async function handlePhotoChosen(event) {
    const file = event.target.files[0]
    event.target.value = '' // so the same file can be chosen again later
    if (!file) return

    const problem = checkPhotoFile(file)
    if (problem) {
      setNotice({ type: 'error', text: problem })
      return
    }

    setBusy(true)
    setNotice(null)
    try {
      const photo = await resizePhoto(file)
      await saveChanges({ photo })
      setNotice({ type: 'success', text: 'Photo updated.' })
    } catch (error) {
      // an Axios error means the server did not answer; anything else is the picture itself
      setNotice({ type: 'error', text: error.isAxiosError ? SERVER_DOWN : error.message })
    } finally {
      setBusy(false)
    }
  }

  async function handleRemovePhoto() {
    setBusy(true)
    setNotice(null)
    try {
      await saveChanges({ photo: '' })
      setNotice({ type: 'success', text: 'Photo removed.' })
    } catch {
      setNotice({ type: 'error', text: SERVER_DOWN })
    } finally {
      setBusy(false)
    }
  }

  function startEditing() {
    // fill the form with the details as they are now
    reset({ name: user.name || '', phone: user.phone || '', city: user.city || '' })
    setNotice(null)
    setEditing(true)
  }

  // values are already checked and trimmed by profileSchema
  async function onSave(values) {
    setBusy(true)
    setNotice(null)
    try {
      await saveChanges(values)
      setEditing(false)
      setNotice({ type: 'success', text: 'Profile updated.' })
    } catch {
      setNotice({ type: 'error', text: SERVER_DOWN })
    } finally {
      setBusy(false)
    }
  }

  // a number for a tile: a dash while loading
  const show = (value) => (stats ? value : '–')

  return (
    <div className="profile" ref={wrapRef} onClick={keepMenuOpen}>
      <button
        type="button"
        className="navbar-user profile-button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={toggleCard}
      >
        <Avatar user={user} size="sm" />
        Hi, {firstName}
        <span className={open ? 'profile-chevron open' : 'profile-chevron'}>
          <Icon name="chevronDown" size={14} />
        </span>
      </button>

      {open && (
        <div className="profile-card" role="dialog" aria-label="Your profile">
          <div className="profile-head">
            <div className="profile-photo">
              <Avatar user={user} size="lg" />
              <button
                type="button"
                className="profile-photo-button"
                onClick={() => fileRef.current.click()}
                disabled={busy}
                aria-label={user.photo ? 'Change photo' : 'Add a photo'}
                title={user.photo ? 'Change photo' : 'Add a photo'}
              >
                <Icon name="camera" size={15} />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handlePhotoChosen}
                aria-label="Choose a profile photo"
              />
            </div>

            <div className="profile-id">
              <strong>{user.name}</strong>
              <span>{user.email}</span>
              {(user.phone || user.city) && (
                <span>{[user.phone, user.city].filter(Boolean).join(' · ')}</span>
              )}
            </div>
          </div>

          <div className="profile-body">
            {notice && (
              <p className={`ui-alert ui-alert-${notice.type} profile-notice`} role="status">
                {notice.text}
              </p>
            )}

            {editing ? (
              <form className="profile-form" onSubmit={handleSubmit(onSave)} noValidate>
                <div className="profile-photo-links">
                  <button type="button" className="profile-link" onClick={() => fileRef.current.click()} disabled={busy}>
                    {user.photo ? 'Change photo' : 'Add a photo'}
                  </button>
                  {user.photo && (
                    <button type="button" className="profile-link" onClick={handleRemovePhoto} disabled={busy}>
                      Remove photo
                    </button>
                  )}
                </div>

                <div className="ui-field">
                  <label htmlFor="profile-name">Full name</label>
                  <input id="profile-name" className="ui-input" autoComplete="name" {...register('name')} />
                  {errors.name && <span className="ui-field-error">{errors.name.message}</span>}
                </div>

                <div className="ui-field">
                  <label htmlFor="profile-phone">Phone (optional)</label>
                  <input
                    id="profile-phone"
                    className="ui-input"
                    inputMode="numeric"
                    placeholder="10 digits"
                    autoComplete="tel"
                    {...register('phone')}
                  />
                  {errors.phone && <span className="ui-field-error">{errors.phone.message}</span>}
                </div>

                <div className="ui-field">
                  <label htmlFor="profile-city">City (optional)</label>
                  <input id="profile-city" className="ui-input" placeholder="e.g. Mathura" {...register('city')} />
                  {errors.city && <span className="ui-field-error">{errors.city.message}</span>}
                </div>

                <div className="ui-field">
                  <label htmlFor="profile-email">Email</label>
                  <input id="profile-email" className="ui-input" value={user.email || ''} disabled readOnly />
                  <span className="profile-hint">The email is used to log in, so it cannot be changed here.</span>
                </div>

                <div className="profile-actions">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-sm" disabled={busy}>
                    {busy ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="profile-stats" aria-label="Your planning in numbers">
                  <Link to="/events" className="profile-stat" onClick={closeCard}>
                    <strong>{show(stats?.events)}</strong>
                    <span>Events</span>
                  </Link>
                  <Link to="/guests" className="profile-stat" onClick={closeCard}>
                    <strong>{show(stats?.guests)}</strong>
                    <span>Guests</span>
                  </Link>
                  <Link to="/tasks" className="profile-stat" onClick={closeCard}>
                    {/* done / all, for example 2/3 */}
                    <strong>{show(`${stats?.tasksDone}/${stats?.tasksTotal}`)}</strong>
                    <span>Tasks</span>
                  </Link>
                  <Link to="/vendors" className="profile-stat" onClick={closeCard}>
                    <strong>{show(stats?.bookings)}</strong>
                    <span>Bookings</span>
                  </Link>
                </div>

                {statsError && <p className="profile-hint">Could not load your numbers. Is JSON Server running?</p>}

                {stats?.nextEvent && (
                  <p className="profile-next">
                    <Icon name="calendar" size={15} />
                    <span>
                      Next: <strong>{stats.nextEvent.title}</strong> · {getDayLabel(stats.nextEvent.daysLeft)}
                    </span>
                  </p>
                )}

                <div className="profile-actions">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={startEditing}>
                    Edit profile
                  </button>
                  <Link to="/" className="btn btn-sm" onClick={closeCard}>
                    Dashboard
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfileCard
