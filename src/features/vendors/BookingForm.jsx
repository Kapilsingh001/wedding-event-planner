import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { getUser } from '../auth/auth';
import DatePicker from '../../components/DatePicker.jsx';
import Icon from '../../components/Icons.jsx';
import { validateBooking } from './bookingUtils';

export default function BookingForm({ vendor, onClose, onSaved }) {
  const today = new Date().toLocaleDateString('en-CA'); // 'YYYY-MM-DD'

  const [eventDate, setEventDate] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Close the pop-up with the Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    const foundErrors = validateBooking({ eventDate, message }, today);
    setErrors(foundErrors);
    if (Object.keys(foundErrors).length > 0) return;

    const user = getUser();
    if (!user) {
      setSubmitError('Please log in to request a booking.');
      return;
    }

    setSaving(true);
    try {
      const { data } = await api.post('/bookings', {
        userId: String(user.id),
        vendorId: String(vendor.id),
        vendorName: vendor.name,
        category: vendor.category,
        eventDate,
        message: message.trim(),
        status: 'Requested',
        createdAt: today,
      });
      onSaved(data);
    } catch (err) {
      setSubmitError(err.message || 'Could not send the request. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div className="ui-modal-overlay">
      <div className="ui-modal" role="dialog" aria-modal="true" aria-labelledby="booking-title">
        <div className="ui-modal-header">
          <h2 id="booking-title">Request booking</h2>
          <button type="button" className="ui-modal-close" onClick={onClose} aria-label="Close">
            <Icon name="close" size={16} />
          </button>
        </div>

        <p className="ui-muted" style={{ margin: '0 0 16px' }}>
          {vendor.name} ({vendor.category}, {vendor.city})
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="ui-field">
            <label htmlFor="booking-date">Event date</label>
            <DatePicker id="booking-date" value={eventDate} onChange={setEventDate} min={today} />
            {errors.eventDate && <p className="ui-field-error">{errors.eventDate}</p>}
          </div>

          <div className="ui-field">
            <label htmlFor="booking-message">Message (optional)</label>
            <textarea
              id="booking-message"
              className="ui-input"
              rows={3}
              style={{ height: 'auto' }}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell the vendor what you need"
            />
            <p className="ui-muted" style={{ margin: '4px 0 0' }}>{message.length}/200</p>
            {errors.message && <p className="ui-field-error">{errors.message}</p>}
          </div>

          {submitError && (
            <div className="ui-alert ui-alert-error" role="alert">
              {submitError}
            </div>
          )}

          <div className="ui-modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn" disabled={saving}>
              {saving ? 'Sending…' : 'Send request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}