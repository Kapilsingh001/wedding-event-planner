import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { getUser } from '../auth/auth.js';
import Dropdown from '../../components/Dropdown.jsx';
import Icon from '../../components/Icons.jsx';
import { formatInviteDate, buildInviteMessage } from './inviteUtils.js';
import {
  shareInviteCardOnWhatsApp,
  downloadInviteCard,
  copyInviteCardToClipboard,
} from './cardGenerator.js';

export default function InviteModal({ guest, hostName, onClose, onInvited }) {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [copyingImage, setCopyingImage] = useState(false);
  const [imageCopied, setImageCopied] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [statusNotice, setStatusNotice] = useState(null);
  // Laptop only: { waUrl, copied }. While it is set, the two steps to paste the
  // card into WhatsApp Web are shown instead of the card preview.
  const [desktopShare, setDesktopShare] = useState(null);

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
            const today = new Date().toISOString().slice(0, 10);
            const upcoming = [...userEvents]
              .filter((e) => e.date >= today)
              .sort((a, b) => a.date.localeCompare(b.date));

            if (upcoming.length > 0) {
              setSelectedEventId(String(upcoming[0].id));
            } else {
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

  // The link carries the chosen event, so the guest's page shows the same
  // event as the card.
  const inviteUrl = typeof window !== 'undefined' && guest?.id
    ? `${window.location.origin}/invite/${guest.id}${selectedEvent ? `?event=${selectedEvent.id}` : ''}`
    : '';

  // A different event means a different card, so a card copied earlier is wrong now
  const handleEventChange = (eventId) => {
    setSelectedEventId(eventId);
    setDesktopShare(null);
  };

  // Mark guest as invited in backend
  const markGuestAsInvited = async () => {
    if (!guest?.id) return;
    try {
      const { data: updatedGuest } = await api.patch(`/guests/${guest.id}`, { invited: true });
      if (onInvited) {
        onInvited(updatedGuest || { ...guest, invited: true });
      }
    } catch (err) {
      console.error('Failed to update invited status on guest', err);
    }
  };

  // Share Card on WhatsApp.
  // Phone:  the share menu attaches the card image itself.
  // Laptop: WhatsApp Web takes only text from a link, so the card is copied here
  //         and the steps to paste it are shown BEFORE WhatsApp opens.
  const handleWhatsAppShare = async () => {
    if (!selectedEvent || !guest) return;
    setSharing(true);
    setStatusNotice(null);
    setDesktopShare(null);

    try {
      const result = await shareInviteCardOnWhatsApp({
        guest,
        event: selectedEvent,
        hostName,
        inviteUrl,
      });

      if (result.cancelled) {
        return;
      }

      if (result.method === 'native-share') {
        await markGuestAsInvited();
        setStatusNotice({
          type: 'success',
          text: 'Invitation card shared successfully!',
        });
        return;
      }

      setDesktopShare({ waUrl: result.waUrl, copied: result.copiedToClipboard });
    } catch (err) {
      console.error('Error sharing invitation card on WhatsApp', err);
      setStatusNotice({
        type: 'error',
        text: 'Failed to share card. You can download the card image below.',
      });
    } finally {
      setSharing(false);
    }
  };

  // Laptop, step 1: open the guest's chat in WhatsApp Web.
  // It runs straight from the click, so the browser does not block the new tab.
  const handleOpenWhatsApp = () => {
    if (!desktopShare?.waUrl) return;
    window.open(desktopShare.waUrl, '_blank', 'noopener');
    markGuestAsInvited();
  };

  // Download Card as PNG
  const handleDownloadCard = async () => {
    if (!selectedEvent || !guest) return;
    setDownloading(true);
    setStatusNotice(null);

    try {
      await downloadInviteCard({
        guest,
        event: selectedEvent,
        hostName,
      });
      await markGuestAsInvited();
      setStatusNotice({
        type: 'success',
        text: 'Invitation card image downloaded! You can attach or drag it into WhatsApp.',
      });
    } catch (err) {
      console.error('Failed to download card image', err);
      setStatusNotice({
        type: 'error',
        text: 'Failed to download card image.',
      });
    } finally {
      setDownloading(false);
    }
  };

  // Copy Card Image to Clipboard
  const handleCopyCardImage = async () => {
    if (!selectedEvent || !guest) return;
    setCopyingImage(true);
    setStatusNotice(null);

    try {
      const res = await copyInviteCardToClipboard({
        guest,
        event: selectedEvent,
        hostName,
      });
      setImageCopied(true);
      setTimeout(() => setImageCopied(false), 3000);

      if (res.method === 'clipboard') {
        setStatusNotice({
          type: 'success',
          text: 'Card image copied to clipboard! Paste (Ctrl+V) directly into WhatsApp.',
        });
      } else {
        setStatusNotice({
          type: 'info',
          text: 'Card image downloaded to your device.',
        });
      }
    } catch (err) {
      console.error('Failed to copy card image to clipboard', err);
      setStatusNotice({
        type: 'error',
        text: 'Clipboard access denied. Please use the Download Card button.',
      });
    } finally {
      setCopyingImage(false);
    }
  };

  // Copy Plain Text Message
  const handleCopyMessage = async () => {
    if (!selectedEvent || !guest) return;
    const message = buildInviteMessage(guest, selectedEvent, hostName, inviteUrl);
    try {
      await navigator.clipboard.writeText(message);
      setCopiedText(true);
      // the clipboard now holds the text, so the card copied earlier is gone
      setDesktopShare(null);
      setStatusNotice({
        type: 'info',
        text: 'Invitation text message copied to clipboard.',
      });
      setTimeout(() => {
        setCopiedText(false);
      }, 2500);
    } catch (err) {
      console.error('Failed to copy invitation message to clipboard', err);
    }
  };

  return (
    <div className="ui-modal-overlay" onClick={onClose}>
      <div
        className="ui-modal guests-invite-modal"
        style={{ maxWidth: 540 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ui-modal-header">
          <div>
            <h2>Digital Invitation</h2>
            <p className="ui-modal-subtitle">
              Send this personalized card directly to <strong>{guest?.name}</strong>
            </p>
          </div>
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
                onChange={handleEventChange}
                options={eventOptions}
              />
            </div>

            {selectedEvent && !desktopShare && (
              <div className="guests-invite-card" id="guests-invite-card-preview">
                <div className="guests-invite-card-inner">
                  <span className="guests-invite-eyebrow">YOU ARE INVITED</span>
                  <h3 className="guests-invite-title">{selectedEvent.title}</h3>
                  {selectedEvent.type && (
                    <span className="guests-invite-type">{selectedEvent.type}</span>
                  )}

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

            {/* Status Feedback Notice */}
            {statusNotice && (
              <div
                className={`guests-invite-notice ui-alert ${
                  statusNotice.type === 'error' ? 'ui-alert-error' : 'ui-alert-success'
                }`}
                role="status"
              >
                <span>{statusNotice.text}</span>
              </div>
            )}

            {/* Laptop: the steps to send the card, shown BEFORE WhatsApp opens.
                A link can put only text into WhatsApp Web, never an image, so
                the card has to be pasted (or dragged) into the chat. */}
            {desktopShare && (
              <div className="guests-guide-card" role="status">
                <div className="guests-guide-header">
                  <Icon name="whatsapp" size={22} />
                  <div>
                    <h4>
                      {desktopShare.copied
                        ? 'Card image copied. Send it in 2 steps:'
                        : 'Card image downloaded. Send it in 2 steps:'}
                    </h4>
                    <p>WhatsApp Web cannot attach an image by itself, so you paste the card in the chat.</p>
                  </div>
                </div>

                <div className="guests-guide-steps">
                  <div className="guests-guide-step">
                    <span className="step-badge">1</span>
                    <div>
                      <strong>Click Open WhatsApp</strong>
                      <p>
                        The chat with {guest?.name} opens with the message already typed.
                        Do not press Enter yet.
                      </p>
                    </div>
                  </div>
                  <div className="guests-guide-step highlight">
                    <span className="step-badge">2</span>
                    <div>
                      {desktopShare.copied ? (
                        <strong>
                          Press <kbd>Ctrl</kbd> + <kbd>V</kbd> in the chat, then <kbd>Enter</kbd>
                        </strong>
                      ) : (
                        <strong>
                          Drag the downloaded image into the chat, then press <kbd>Enter</kbd>
                        </strong>
                      )}
                      <p>The card appears, with the message as its caption.</p>
                    </div>
                  </div>
                </div>

                <div className="guests-guide-actions">
                  <button
                    type="button"
                    className="btn btn-whatsapp btn-sm"
                    onClick={handleOpenWhatsApp}
                  >
                    <Icon name="whatsapp" size={14} />
                    Open WhatsApp
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setDesktopShare(null)}
                  >
                    Back to card
                  </button>
                </div>
              </div>
            )}

            {!desktopShare && (
              <div className="guests-invite-tip">
                <Icon name="sparkles" size={14} />
                <span>
                  On a phone the card image is attached automatically. On a laptop it is copied,
                  and you paste it in the WhatsApp chat with <strong>Ctrl+V</strong>.
                </span>
              </div>
            )}
          </>
        )}

        <div className="ui-modal-actions guests-invite-modal-actions">
          {events.length > 0 && selectedEvent && !desktopShare && (
            <>
              <button
                type="button"
                className="btn btn-whatsapp"
                onClick={handleWhatsAppShare}
                disabled={sharing}
                title="Send the invitation card on WhatsApp"
              >
                <Icon name="whatsapp" size={18} />
                <span>{sharing ? 'Preparing card...' : 'Share Card on WhatsApp'}</span>
              </button>

              <button
                type="button"
                className="btn btn-ghost"
                onClick={handleDownloadCard}
                disabled={downloading}
                title="Download high-resolution card PNG image"
              >
                <Icon name="download" size={16} />
                <span>{downloading ? 'Downloading...' : 'Download Card'}</span>
              </button>

              <button
                type="button"
                className="btn btn-ghost"
                onClick={handleCopyCardImage}
                disabled={copyingImage}
                title="Copy card image to clipboard to paste directly in WhatsApp"
              >
                <Icon name="image" size={16} />
                <span>{imageCopied ? 'Card Copied!' : 'Copy Card Image'}</span>
              </button>

              <button
                type="button"
                className="btn btn-ghost"
                onClick={handleCopyMessage}
                title="Copy formatted text message"
              >
                <Icon name="copy" size={16} />
                <span>{copiedText ? 'Text Copied!' : 'Copy Text'}</span>
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
