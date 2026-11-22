import { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../../services/api';
import { getUser } from '../auth/auth.js';
import { guestSchema } from './guestSchema.js';
import { countByRsvp } from './guestUtils.js';
import Dropdown from '../../components/Dropdown.jsx';
import './Guests.css';

const SIDE_OPTIONS = [
  { value: 'Bride', label: 'Bride' },
  { value: 'Groom', label: 'Groom' },
];
const RSVP_OPTIONS = [
  { value: 'Pending', label: 'Pending' },
  { value: 'Attending', label: 'Attending' },
  { value: 'Declined', label: 'Declined' },
];
const FILTER_OPTIONS = [{ value: 'All', label: 'All RSVPs' }, ...RSVP_OPTIONS];

export default function Guests() {
  const reduxUser = useSelector((state) => state.auth?.user);
  const user = reduxUser || getUser();

  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Filter & Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [rsvpFilter, setRsvpFilter] = useState('All');

  // React Hook Form for adding guests
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(guestSchema),
    defaultValues: {
      name: '',
      phone: '',
      side: 'Bride',
    },
  });

  // Load guests on mount
  useEffect(() => {
    let isMounted = true;

    async function loadGuests() {
      setLoading(true);
      setFetchError('');
      try {
        const { data } = await api.get('/guests');
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

  // Summary counts using guestUtils
  const { total: totalCount, Attending: attendingCount, Declined: declinedCount, Pending: pendingCount } = countByRsvp(guests);

  // Add guest submit handler
  const onAddGuest = async (formData) => {
    setFormError('');
    setSubmitting(true);

    const newGuest = {
      userId: user?.id,
      name: formData.name.trim(),
      phone: formData.phone ? formData.phone.trim() : '',
      side: formData.side,
      rsvp: 'Pending',
    };

    try {
      const { data: createdGuest } = await api.post('/guests', newGuest);
      setGuests((prev) => [...prev, createdGuest]);
      reset({ name: '', phone: '', side: 'Bride' });
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
      await api.patch(`/guests/${guestId}`, { rsvp: newRsvp });
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
      await api.delete(`/guests/${guestId}`);
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

        <form onSubmit={handleSubmit(onAddGuest)} className="guests-form" noValidate>
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
                {...register('name')}
              />
              {errors.name && (
                <span className="guests-field-error" style={{ color: '#c93f59', fontSize: '12px', marginTop: '4px' }}>
                  {errors.name.message}
                </span>
              )}
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
                {...register('phone')}
              />
              {errors.phone && (
                <span className="guests-field-error" style={{ color: '#c93f59', fontSize: '12px', marginTop: '4px' }}>
                  {errors.phone.message}
                </span>
              )}
            </div>

            <div className="guests-form-group">
              <label htmlFor="guest-side" className="guests-label">
                Side
              </label>
              {/* Controller connects the shared Dropdown to React Hook Form */}
              <Controller
                name="side"
                control={control}
                render={({ field }) => (
                  <Dropdown id="guest-side" value={field.value} onChange={field.onChange} options={SIDE_OPTIONS} />
                )}
              />
              {errors.side && (
                <span className="guests-field-error" style={{ color: '#c93f59', fontSize: '12px', marginTop: '4px' }}>
                  {errors.side.message}
                </span>
              )}
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
            <Dropdown
              id="guest-filter"
              className="guests-filter-select"
              value={rsvpFilter}
              onChange={setRsvpFilter}
              options={FILTER_OPTIONS}
            />
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
                      <Dropdown
                        id={`rsvp-${guest.id}`}
                        className={`guests-rsvp-dd guests-rsvp-dd-${guest.rsvp.toLowerCase()}`}
                        value={guest.rsvp}
                        label={`RSVP for ${guest.name}`}
                        onChange={(value) => handleRsvpChange(guest.id, value)}
                        options={RSVP_OPTIONS}
                      />
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
