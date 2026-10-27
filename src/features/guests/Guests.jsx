import { useState, useEffect, useMemo } from 'react';
import { API_URL, getUser } from '../auth/auth.js';
import './Guests.css';

export default function Guests() {
  const user = getUser();
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [side, setSide] = useState('Bride');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Filter & Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [rsvpFilter, setRsvpFilter] = useState('All');

  // Load guests on mount
  useEffect(() => {
    let isMounted = true;

    async function loadGuests() {
      setLoading(true);
      setFetchError('');
      try {
        const res = await fetch(`${API_URL}/guests`);
        if (!res.ok) {
          throw new Error('Failed to fetch guests');
        }
        const data = await res.json();
        if (isMounted) {
          const userGuests = data.filter((g) => String(g.userId) === String(user?.id));
          setGuests(userGuests);
        }
      } catch {
        if (isMounted) {
          setFetchError('Could not load guests. Is JSON Server running on port 3001?');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadGuests();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  // Summary counts
  const totalCount = guests.length;
  const attendingCount = guests.filter((g) => g.rsvp === 'Attending').length;
  const declinedCount = guests.filter((g) => g.rsvp === 'Declined').length;
  const pendingCount = guests.filter((g) => g.rsvp === 'Pending').length;

  // Add guest submit handler
  const handleAddGuest = async (e) => {
    e.preventDefault();
    setFormError('');

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      setFormError('Guest name is required.');
      return;
    }

    if (trimmedPhone && !/^\d{10}$/.test(trimmedPhone)) {
      setFormError('Phone number must be exactly 10 digits.');
      return;
    }

    const newGuest = {
      userId: user?.id,
      name: trimmedName,
      phone: trimmedPhone,
      side: side,
      rsvp: 'Pending',
    };

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/guests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGuest),
      });

      if (!res.ok) {
        throw new Error('Failed to add guest');
      }

      const createdGuest = await res.json();
      setGuests((prev) => [...prev, createdGuest]);
      setName('');
      setPhone('');
      setSide('Bride');
      setFormError('');
    } catch {
      setFormError('Failed to add guest. Is JSON Server running on port 3001?');
    } finally {
      setSubmitting(false);
    }
  };

  // Immediate RSVP update handler (PATCH)
  const handleRsvpChange = async (guestId, newRsvp) => {
    try {
      const res = await fetch(`${API_URL}/guests/${guestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rsvp: newRsvp }),
      });

      if (!res.ok) {
        throw new Error('Failed to update RSVP');
      }

      setGuests((prev) =>
        prev.map((g) => (g.id === guestId ? { ...g, rsvp: newRsvp } : g))
      );
    } catch {
      alert('Could not update RSVP. Please check if JSON Server is running.');
    }
  };

  // Delete guest handler (DELETE)
  const handleDelete = async (guestId, guestName) => {
    const confirmed = window.confirm(`Are you sure you want to remove ${guestName} from the guest list?`);
    if (!confirmed) return;

    try {
      const res = await fetch(`${API_URL}/guests/${guestId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete guest');
      }

      setGuests((prev) => prev.filter((g) => g.id !== guestId));
    } catch {
      alert('Could not delete guest. Please check if JSON Server is running.');
    }
  };

  // Filtered guests list for display
  const displayedGuests = useMemo(() => {
    return guests.filter((g) => {
      const matchesSearch = g.name.toLowerCase().includes(searchTerm.toLowerCase().trim());
      const matchesRsvp = rsvpFilter === 'All' || g.rsvp === rsvpFilter;
      return matchesSearch && matchesRsvp;
    });
  }, [guests, searchTerm, rsvpFilter]);

  return (
    <div className="container guests-page">
      {/* Header */}
      <header className="guests-header">
        <h1 className="guests-title">Guest List &amp; RSVPs</h1>
        <p className="guests-subtitle">
          Manage wedding attendees, track RSVP responses, and organize seating by party side.
        </p>
      </header>

      {/* Summary Stat Cards */}
      <section className="guests-stats" aria-label="Guest list summary">
        <div className="guests-stat-card guests-stat-total">
          <span className="guests-stat-label">Total Guests</span>
          <span className="guests-stat-value">{totalCount}</span>
        </div>
        <div className="guests-stat-card guests-stat-attending">
          <span className="guests-stat-label">Attending</span>
          <span className="guests-stat-value">{attendingCount}</span>
        </div>
        <div className="guests-stat-card guests-stat-pending">
          <span className="guests-stat-label">Pending</span>
          <span className="guests-stat-value">{pendingCount}</span>
        </div>
        <div className="guests-stat-card guests-stat-declined">
          <span className="guests-stat-label">Declined</span>
          <span className="guests-stat-value">{declinedCount}</span>
        </div>
      </section>

      {/* Add Guest Form */}
      <section className="guests-form-card" aria-labelledby="add-guest-heading">
        <h2 id="add-guest-heading" className="guests-section-heading">Add a New Guest</h2>

        {formError && (
          <div className="guests-form-error" role="alert">
            {formError}
          </div>
        )}

        <form onSubmit={handleAddGuest} className="guests-form" noValidate>
          <div className="guests-form-grid">
            <div className="guests-form-group">
              <label htmlFor="guest-name" className="guests-label">
                Full Name <span className="guests-required">*</span>
              </label>
              <input
                id="guest-name"
                type="text"
                className="guests-input"
                placeholder="e.g. Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="guests-form-group">
              <label htmlFor="guest-phone" className="guests-label">
                Phone Number <span className="guests-hint">(Optional, 10 digits)</span>
              </label>
              <input
                id="guest-phone"
                type="tel"
                className="guests-input"
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="guests-form-group">
              <label htmlFor="guest-side" className="guests-label">
                Side
              </label>
              <select
                id="guest-side"
                className="guests-select"
                value={side}
                onChange={(e) => setSide(e.target.value)}
              >
                <option value="Bride">Bride</option>
                <option value="Groom">Groom</option>
              </select>
            </div>
          </div>

          <div className="guests-form-actions">
            <button type="submit" className="btn" disabled={submitting}>
              {submitting ? 'Adding...' : '+ Add Guest'}
            </button>
          </div>
        </form>
      </section>

      {/* Search and RSVP Filter Controls */}
      <section className="guests-controls-card" aria-label="Search and filter guests">
        <div className="guests-controls">
          <div className="guests-search-wrapper">
            <label htmlFor="guest-search" className="guests-sr-only">Search by name</label>
            <input
              id="guest-search"
              type="text"
              className="guests-input guests-search-input"
              placeholder="Search guests by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="guests-filter-wrapper">
            <label htmlFor="guest-filter" className="guests-filter-label">Filter RSVP:</label>
            <select
              id="guest-filter"
              className="guests-select guests-filter-select"
              value={rsvpFilter}
              onChange={(e) => setRsvpFilter(e.target.value)}
            >
              <option value="All">All RSVPs</option>
              <option value="Pending">Pending</option>
              <option value="Attending">Attending</option>
              <option value="Declined">Declined</option>
            </select>
          </div>
        </div>
      </section>

      {/* Main Guest List Section */}
      <section className="guests-list-section" aria-label="Guest list">
        {loading && (
          <div className="guests-state-msg guests-loading" role="status">
            Loading guest list...
          </div>
        )}

        {fetchError && !loading && (
          <div className="guests-state-msg guests-error" role="alert">
            {fetchError}
          </div>
        )}

        {!loading && !fetchError && guests.length === 0 && (
          <div className="guests-state-msg guests-empty">
            <h3>No guests added yet</h3>
            <p>Use the form above to add your first guest to the wedding list.</p>
          </div>
        )}

        {!loading && !fetchError && guests.length > 0 && displayedGuests.length === 0 && (
          <div className="guests-state-msg guests-empty">
            <h3>No matching guests</h3>
            <p>No guests match &ldquo;{searchTerm}&rdquo; with RSVP status &ldquo;{rsvpFilter}&rdquo;.</p>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setSearchTerm('');
                setRsvpFilter('All');
              }}
            >
              Clear Filters
            </button>
          </div>
        )}

        {!loading && !fetchError && displayedGuests.length > 0 && (
          <div className="guests-table-wrapper">
            <table className="guests-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Side</th>
                  <th>RSVP Status</th>
                  <th className="guests-actions-col">Action</th>
                </tr>
              </thead>
              <tbody>
                {displayedGuests.map((guest) => (
                  <tr key={guest.id}>
                    <td className="guests-name-cell">
                      <strong>{guest.name}</strong>
                    </td>
                    <td className="guests-phone-cell">
                      {guest.phone ? (
                        <a href={`tel:${guest.phone}`} className="guests-phone-link">
                          {guest.phone}
                        </a>
                      ) : (
                        <span className="guests-muted">&mdash;</span>
                      )}
                    </td>
                    <td>
                      <span className={`guests-side-tag guests-side-${guest.side.toLowerCase()}`}>
                        {guest.side}
                      </span>
                    </td>
                    <td>
                      <select
                        className={`guests-rsvp-select guests-rsvp-${guest.rsvp.toLowerCase()}`}
                        value={guest.rsvp}
                        aria-label={`RSVP for ${guest.name}`}
                        onChange={(e) => handleRsvpChange(guest.id, e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Attending">Attending</option>
                        <option value="Declined">Declined</option>
                      </select>
                    </td>
                    <td className="guests-actions-col">
                      <button
                        type="button"
                        className="guests-delete-btn"
                        onClick={() => handleDelete(guest.id, guest.name)}
                        title={`Delete ${guest.name}`}
                        aria-label={`Delete ${guest.name}`}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
