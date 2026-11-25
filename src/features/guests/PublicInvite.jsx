import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import api from '../../services/api';
import Icon from '../../components/Icons.jsx';
import { formatInviteDate } from './inviteUtils.js';
import { downloadInviteCard } from './cardGenerator.js';
import { cleanRsvpNote, RSVP_NOTE_MAX } from './guestUtils.js';
import ConfirmDialog from '../planning/ConfirmDialog.jsx';
import './PublicInvite.css';

export default function PublicInvite() {
  const { id: guestId } = useParams();
  // the event the host chose, sent in the link as ?event=<id>
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get('event');
  const [guest, setGuest] = useState(null);
  const [event, setEvent] = useState(null);
  const [hostName, setHostName] = useState('The Host');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rsvpStatus, setRsvpStatus] = useState('');
  const [updatingRsvp, setUpdatingRsvp] = useState(false);
  const [rsvpSaved, setRsvpSaved] = useState(false);
  const [downloading, setDownloading] = useState(false);
  // the short message a guest can write when they cannot attend
  const [note, setNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);
  const [notice, setNotice] = useState(''); // error message shown in a popup

  useEffect(() => {
    let isMounted = true;

    async function loadInvitation() {
      try {
        setLoading(true);
        setError(null);

        // 1. Fetch Guest details
        const { data: guestData } = await api.get(`/guests/${guestId}`);
        if (!isMounted) return;

        if (!guestData) {
          setError('Invitation not found.');
          return;
        }

        setGuest(guestData);
        setRsvpStatus(guestData.rsvp || 'Pending');
        setNote(guestData.rsvpNote || '');

        // 2. Fetch User/Host and Events
        const userId = guestData.userId;
        const [eventsRes, usersRes] = await Promise.allSettled([
          api.get('/events'),
          api.get('/users'),
        ]);

        if (!isMounted) return;

        if (eventsRes.status === 'fulfilled' && Array.isArray(eventsRes.value.data)) {
          const userEvents = eventsRes.value.data.filter(
            (e) => String(e.userId) === String(userId)
          );
          if (userEvents.length > 0) {
            // The event named in the link. An old link has none, so then
            // the soonest upcoming event, or else the first one.
            const chosen = userEvents.find((e) => String(e.id) === String(eventId));
            const today = new Date().toISOString().slice(0, 10);
            const upcoming = [...userEvents]
              .filter((e) => e.date >= today)
              .sort((a, b) => a.date.localeCompare(b.date));
            setEvent(chosen || upcoming[0] || userEvents[0]);
          }
        }

        if (usersRes.status === 'fulfilled' && Array.isArray(usersRes.value.data)) {
          const host = usersRes.value.data.find((u) => String(u.id) === String(userId));
          if (host?.name) {
            setHostName(host.name);
          }
        }
      } catch (err) {
        console.error('Failed to load invitation', err);
        if (isMounted) {
          setError('Could not load this invitation. Please check the link or try again.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (guestId) {
      loadInvitation();
    }

    return () => {
      isMounted = false;
    };
  }, [guestId, eventId]);

  const handleRsvpChange = async (newRsvp) => {
    if (!guest || updatingRsvp) return;
    setUpdatingRsvp(true);
    try {
      // The message is a reason for not coming. So when the guest picks
      // another answer, the old message is removed.
      const changes = newRsvp === 'Declined' ? { rsvp: newRsvp } : { rsvp: newRsvp, rsvpNote: '' };
      await api.patch(`/guests/${guest.id}`, changes);
      setRsvpStatus(newRsvp);
      if (newRsvp !== 'Declined') {
        setNote('');
      }
      setNoteSaved(false);
      setRsvpSaved(true);
      setTimeout(() => setRsvpSaved(false), 3500);
    } catch (err) {
      console.error('Failed to update RSVP', err);
      setNotice('Could not update your RSVP. Please try again.');
    } finally {
      setUpdatingRsvp(false);
    }
  };

  // Save the short message of a guest who cannot attend.
  // The host sees it in the guest list, under the Declined status.
  const handleNoteSave = async (e) => {
    e.preventDefault();
    if (!guest || savingNote) return;
    setSavingNote(true);
    try {
      const cleaned = cleanRsvpNote(note);
      await api.patch(`/guests/${guest.id}`, { rsvpNote: cleaned });
      setNote(cleaned);
      setNoteSaved(true);
    } catch (err) {
      console.error('Failed to save the message', err);
      setNotice('Could not send your message. Please try again.');
    } finally {
      setSavingNote(false);
    }
  };

  const handleDownload = async () => {
    if (!guest || !event) return;
    setDownloading(true);
    try {
      await downloadInviteCard({ guest, event, hostName });
    } catch (err) {
      console.error('Failed to download card', err);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="public-invite-container">
        <div className="public-invite-card-wrapper loading-state">
          <p className="ui-muted">Opening your invitation...</p>
        </div>
      </div>
    );
  }

  if (error || !guest) {
    return (
      <div className="public-invite-container">
        <div className="public-invite-card-wrapper error-state">
          <h2>Invitation Not Found</h2>
          <p className="ui-muted">{error || 'This invitation link may have expired or is invalid.'}</p>
          <Link to="/" className="btn btn-ghost" style={{ marginTop: 16 }}>
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="public-invite-container">
      <div className="public-invite-content">
        {/* Digital Invitation Card (Matching user design) */}
        <div className="guests-invite-card public-invite-card">
          <div className="guests-invite-card-inner">
            <span className="guests-invite-eyebrow">YOU ARE INVITED</span>
            <h1 className="guests-invite-title">{event?.title || 'Our Wedding Celebration'}</h1>
            {event?.type && <span className="guests-invite-type">{event.type}</span>}

            <div className="guests-invite-divider" />

            <p className="guests-invite-guest">Dear {guest.name},</p>
            <p className="guests-invite-text">
              You are warmly invited to celebrate with us on this special day.
            </p>

            <div className="guests-invite-details">
              <div className="guests-invite-detail-item">
                <Icon name="calendar" size={18} />
                <span>{formatInviteDate(event?.date) || 'Date to be announced'}</span>
              </div>
              {event?.venue && (
                <div className="guests-invite-detail-item">
                  <Icon name="landmark" size={18} />
                  <span>{event.venue}</span>
                </div>
              )}
            </div>

            <p className="guests-invite-host">
              With love,<br />
              <span>{hostName}</span>
            </p>
          </div>
        </div>

        {/* RSVP Card Section */}
        <div className="public-rsvp-card">
          <h3>Will you be attending?</h3>
          <p className="public-rsvp-sub">Please respond to help us make arrangements.</p>

          <div className="public-rsvp-buttons">
            <button
              type="button"
              className={`btn ${rsvpStatus === 'Attending' ? 'btn-rsvp-active' : 'btn-ghost'}`}
              onClick={() => handleRsvpChange('Attending')}
              disabled={updatingRsvp}
            >
              <Icon name="check" size={16} />
              Attending
            </button>
            <button
              type="button"
              className={`btn ${rsvpStatus === 'Declined' ? 'btn-rsvp-declined' : 'btn-ghost'}`}
              onClick={() => handleRsvpChange('Declined')}
              disabled={updatingRsvp}
            >
              <Icon name="close" size={16} />
              Cannot Attend
            </button>
            <button
              type="button"
              className={`btn ${rsvpStatus === 'Tentative' ? 'btn-rsvp-tentative' : 'btn-ghost'}`}
              onClick={() => handleRsvpChange('Tentative')}
              disabled={updatingRsvp}
            >
              <Icon name="clock" size={16} />
              Maybe
            </button>
          </div>

          {rsvpSaved && (
            <div className="ui-alert ui-alert-success public-rsvp-alert">
              Thank you! Your RSVP status (<strong>{rsvpStatus}</strong>) has been recorded.
            </div>
          )}

          {/* A guest who cannot attend can tell the host why. It is optional. */}
          {rsvpStatus === 'Declined' && (
            <form className="public-rsvp-note" onSubmit={handleNoteSave}>
              <label htmlFor="rsvp-note">Would you like to tell the host why? (optional)</label>
              <textarea
                id="rsvp-note"
                className="ui-input public-rsvp-note-box"
                rows={3}
                maxLength={RSVP_NOTE_MAX}
                placeholder="Write a short message for the host"
                value={note}
                onChange={(e) => {
                  setNote(e.target.value);
                  setNoteSaved(false);
                }}
              />
              <div className="public-rsvp-note-row">
                <span className="public-rsvp-note-count">
                  {note.length}/{RSVP_NOTE_MAX}
                </span>
                <button type="submit" className="btn btn-sm" disabled={savingNote || !note.trim()}>
                  {savingNote ? 'Sending...' : 'Send Message'}
                </button>
              </div>
              {noteSaved && (
                <div className="ui-alert ui-alert-success public-rsvp-alert" role="status">
                  Your message has been sent to the host.
                </div>
              )}
            </form>
          )}

          <div className="public-invite-actions">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={handleDownload}
              disabled={downloading || !event}
            >
              <Icon name="download" size={16} />
              {downloading ? 'Downloading...' : 'Save Invitation Card'}
            </button>
          </div>
        </div>
      </div>

      {notice && (
        <ConfirmDialog
          title="Something went wrong"
          message={notice}
          confirmLabel="OK"
          cancelLabel={null}
          confirmClass=""
          onConfirm={() => setNotice('')}
          onCancel={() => setNotice('')}
        />
      )}
    </div>
  );
}
