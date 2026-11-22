import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { getUser } from '../auth/auth.js';
import Dropdown from '../../components/Dropdown.jsx';
import Icon from '../../components/Icons.jsx';
import { formatInviteDate, buildInviteMessage, buildWhatsAppLink } from './inviteUtils.js';

export default function InviteModal({ guest, hostName, onClose, onInvited }) {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadEvents() {
      try {
        setLoadingEvents(true);
        const user = getUser();
        const { data } = await api.get('/events');
        if (isMounted) {
          const userEvents = data.filter((e) => String(e.userId) === String(user?.id));
          setEvents(userEvents);

          if (userEvents.length > 0) {
            // Find soonest upcoming event (date >= today)
            const today = new Date().toISOString().slice(0, 10);
            const upcoming = [...userEvents]
              .filter((e) => e.date >= today)
              .sort((a, b) => a.date.localeCompare(b.date));

            if (upcoming.length > 0) {
              setSelectedEventId(String(upcoming[0].id));
            } else {
              // Fallback to the latest or first event
              const sorted = [...userEvents].sort((a, b) => b.date.localeCompare(a.date));
              setSelectedEventId(String(sorted[0].id));
            }
          }
        }
      } catch (err) {
        console.error('Failed to load events for invitation modal', err);
      } finally {
        if (isMounted) {
          setLoadingEvents(false);
        }
      }
    }

    loadEvents();

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedEvent = events.find((e) => String(e.id) === String(selectedEventId)) || events[0];

  const eventOptions = events.map((e) => ({
    value: String(e.id),
    label: `${e.title} (${e.type || 'Event'}) - ${e.date}`,
  }));

  const handleWhatsAppShare = async () => {
    if (!selectedEvent || !guest) return;
    setSharing(true);
    const message = buildInviteMessage(guest, selectedEvent, hostName);
    const url = buildWhatsAppLink(guest.phone, message);

    window.open(url, '_blank', 'noopener');

    try {
      const { data: updatedGuest } = await api.patch(`/guests/${guest.id}`, { invited: true });
      if (onInvited) {
        onInvited(updatedGuest || { ...guest, invited: true });
      }
    } catch (err) {
      console.error('Failed to update invited status on guest', err);
    } finally {
      setSharing(false);
    }
  };

  const handleCopyMessage = async () => {
    if (!selectedEvent || !guest) return;
    const message = buildInviteMessage(guest, selectedEvent, hostName);
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy invitation message to clipboard', err);
    }
  };

  return (
    <div className="ui-modal-overlay" onClick={onClose}>
      <div
        className="ui-modal"
        style={{ maxWidth: 520 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ui-modal-header">
          <h2>Digital Invitation</h2>
          <button
            type="button"
            className="ui-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        {loadingEvents ? (
          <p className="ui-muted" style={{ textAlign: 'center', padding: '24px 0' }}>
            Loading events...
          </p>
        ) : events.length === 0 ? (
          <div className="ui-alert ui-alert-warning">
            Create an event first.{' '}
            <Link
              to="/events"
              style={{ fontWeight: 600, color: 'inherit', textDecoration: 'underline' }}
            >
              Go to Events
            </Link>
          </div>
        ) : (
          <>
            <div className="ui-field">
              <label htmlFor="invite-event-picker">Select Event</label>
              <Dropdown
                id="invite-event-picker"
                value={selectedEventId}
                onChange={setSelectedEventId}
                options={eventOptions}
              />
            </div>

            {selectedEvent && (
              <div className="guests-invite-card">
                <div className="guests-invite-card-inner">
                  <span className="guests-invite-eyebrow">YOU ARE INVITED</span>
                  <h3 className="guests-invite-title">{selectedEvent.title}</h3>
                  <span className="guests-invite-type">{selectedEvent.type}</span>

                  <div className="guests-invite-divider" />

                  <p className="guests-invite-guest">Dear {guest?.name},</p>
                  <p className="guests-invite-text">
                    You are warmly invited to celebrate with us on this special day.
                  </p>

                  <div className="guests-invite-details">
                    <div className="guests-invite-detail-item">
                      <Icon name="calendar" size={16} />
                      <span>{formatInviteDate(selectedEvent.date)}</span>
                    </div>
                    {selectedEvent.venue && (
                      <div className="guests-invite-detail-item">
                        <Icon name="landmark" size={16} />
                        <span>{selectedEvent.venue}</span>
                      </div>
                    )}
                  </div>

                  <p className="guests-invite-host">
                    With love,<br />
                    <span>{hostName}</span>
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        <div className="ui-modal-actions">
          {events.length > 0 && selectedEvent && (
            <>
              <button
                type="button"
                className="btn"
                onClick={handleWhatsAppShare}
                disabled={sharing}
              >
                Share on WhatsApp
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={handleCopyMessage}
              >
                {copied ? 'Copied!' : 'Copy message'}
              </button>
            </>
          )}
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
