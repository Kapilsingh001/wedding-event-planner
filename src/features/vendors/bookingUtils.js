// Pure functions (no React) for the vendor booking request feature.

const MAX_MESSAGE_LENGTH = 200;

// Checks the booking form. Returns an object of errors, or {} when everything is valid.
// eventDate and today are 'YYYY-MM-DD' strings, so they can be compared as text.
export function validateBooking({ eventDate, message }, today) {
  const errors = {};

  if (!eventDate) {
    errors.eventDate = 'Please choose an event date.';
  } else if (eventDate < today) {
    errors.eventDate = 'Event date cannot be before today.';
  }

  if (message && message.length > MAX_MESSAGE_LENGTH) {
    errors.message = `Message must be ${MAX_MESSAGE_LENGTH} characters or less.`;
  }

  return errors;
}

// True if this list already has a "Requested" booking for the given vendor.
export function hasActiveBooking(bookings, vendorId) {
  return bookings.some(
    (booking) => String(booking.vendorId) === String(vendorId) && booking.status === 'Requested'
  );
}

// Returns a new array with the soonest event date first. The original array is not changed.
export function sortBookings(bookings) {
  return [...bookings].sort((a, b) => (a.eventDate || '').localeCompare(b.eventDate || ''));
}