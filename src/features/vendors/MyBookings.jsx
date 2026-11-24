import React from 'react';
import { Link } from 'react-router-dom';
import { sortBookings } from './bookingUtils';

function formatDate(isoDate) {
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function MyBookings({ bookings, onCancel }) {
  if (!bookings || bookings.length === 0) return null;

  const sorted = sortBookings(bookings);

  const listStyle = { listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '16px' };
  const rowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '12px',
  };
  const vendorLinkStyle = { color: 'inherit', fontWeight: 600, textDecoration: 'none' };
  const rightStyle = { display: 'flex', alignItems: 'center', gap: '10px' };

  return (
    <div className="ui-card">
      <h2 className="ui-card-title">My booking requests</h2>
      <ul style={listStyle}>
        {sorted.map((booking) => (
          <li key={booking.id} style={rowStyle}>
            <div>
              <div>
                <Link to={`/vendors/${booking.vendorId}`} style={vendorLinkStyle}>
                  {booking.vendorName}
                </Link>
                <span className="ui-muted"> | {booking.category}</span>
              </div>
              <div className="ui-muted">Event date: {formatDate(booking.eventDate)}</div>
              {booking.message && <div className="ui-muted">Message: {booking.message}</div>}
            </div>

            <div style={rightStyle}>
              <span className="ui-badge">{booking.status}</span>
              <button
                type="button"
                className="btn btn-danger btn-xs"
                onClick={() => onCancel(booking)}
              >
                Cancel
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}