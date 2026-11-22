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
  const [showDesktopGuide, setShowDesktopGuide] = useState(false);
  const [whatsAppChatUrl, setWhatsAppChatUrl] = useState('');

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

  const inviteUrl = typeof window !== 'undefined' && guest?.id
    ? `${window.location.origin}/invite/${guest.id}`
    : '';

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

  // Share Card on WhatsApp
  const handleWhatsAppShare = async () => {
    if (!selectedEvent || !guest) return;
    setSharing(true);
    setStatusNotice(null);

    try {
      const result = await shareInviteCardOnWhatsApp({
        guest,
        event: selectedEvent,
        hostName,
        inviteUrl,
      });

      if (result.cancelled) {
        setSharing(false);
        return;
      }

      await markGuestAsInvited();

      if (result.method === 'native-share') {
        setStatusNotice({
          type: 'success',
          text: 'Invitation card shared successfully!',
        });
      } else {
        // Desktop WhatsApp Web workflow
        if (result.waUrl) {
          setWhatsAppChatUrl(result.waUrl);
        }
        setShowDesktopGuide(true);
      }
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
                onChange={setSelectedEventId}
                options={eventOptions}
              />
            </div>

            {selectedEvent && (
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
                  statusNotice.type === 'error'
                    ? 'ui-alert-error'
                    : statusNotice.type === 'info'
                    ? 'ui-alert-success'
                    : 'ui-alert-success'
                }`}
                role="status"
              >
                <span>{statusNotice.text}</span>
              </div>
            )}

            {/* Desktop Step-by-Step Guide Overlay when WhatsApp Web is opened */}
            {showDesktopGuide && (
              <div className="guests-guide-card">
                <div className="guests-guide-header">
                  <Icon name="whatsapp" size={22} />
                  <div>
                    <h4>Card Image Ready to Send in WhatsApp!</h4>
                    <p>WhatsApp Web opened in your browser. Send the card in 2 simple steps:</p>
                  </div>
                </div>

                <div className="guests-guide-steps">
                  <div className="guests-guide-step">
                    <span className="step-badge">1</span>
                    <div>
                      <strong>Card image is copied to your clipboard</strong>
                      <p>And also downloaded to your computer.</p>
                    </div>
                  </div>
                  <div className="guests-guide-step highlight">
                    <span className="step-badge">2</span>
                    <div>
                      <strong>Click the WhatsApp chat and press <kbd>Ctrl</kbd> + <kbd>V</kbd></strong>
                      <p>The card image will instantly appear in WhatsApp ready to send! (Or drag the downloaded image into the chat).</p>
                    </div>
                  </div>
                </div>

                <div className="guests-guide-actions">
                  {whatsAppChatUrl && (
                    <button
                      type="button"
                      className="btn btn-whatsapp btn-sm"
                      onClick={() => window.open(whatsAppChatUrl, '_blank', 'noopener')}
                    >
                      <Icon name="whatsapp" size={14} />
                      Open WhatsApp Again
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={handleDownloadCard}
                  >
                    <Icon name="download" size={14} />
                    Download PNG
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setShowDesktopGuide(false)}
                  >
                    Got it!
                  </button>
                </div>
              </div>
            )}

            <div className="guests-invite-tip">
              <Icon name="sparkles" size={14} />
              <span>
                Sends the card image to WhatsApp. On desktop, click <strong>Share Card</strong>, then press <strong>Ctrl+V</strong> in WhatsApp to send the card image!
              </span>
            </div>
          </>
        )}

        <div className="ui-modal-actions guests-invite-modal-actions">
          {events.length > 0 && selectedEvent && (
            <>
              <button
                type="button"
                className="btn btn-whatsapp"
                onClick={handleWhatsAppShare}
                disabled={sharing}
                title="Send the invitation card directly on WhatsApp"
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
