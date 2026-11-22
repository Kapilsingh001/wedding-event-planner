import { describe, it, expect } from 'vitest';
import { validateBooking, hasActiveBooking, sortBookings } from './bookingUtils';

const today = '2026-11-22';

describe('validateBooking', () => {
  it('gives an error when the date is missing', () => {
    const errors = validateBooking({ eventDate: '', message: '' }, today);
    expect(errors.eventDate).toBeDefined();
  });

  it('gives an error for a date before today', () => {
    const errors = validateBooking({ eventDate: '2026-11-21', message: '' }, today);
    expect(errors.eventDate).toBeDefined();
  });

  it('accepts today and future dates', () => {
    expect(validateBooking({ eventDate: today, message: '' }, today)).toEqual({});
    expect(validateBooking({ eventDate: '2026-12-12', message: '' }, today)).toEqual({});
  });

  it('gives an error for a 201-character message', () => {
    const errors = validateBooking({ eventDate: '2026-12-12', message: 'a'.repeat(201) }, today);
    expect(errors.message).toBeDefined();
  });

  it('returns {} for valid input', () => {
    const errors = validateBooking({ eventDate: '2026-12-12', message: 'Need hall for 300' }, today);
    expect(errors).toEqual({});
  });
});

describe('hasActiveBooking', () => {
  const bookings = [{ id: '1', vendorId: '5', status: 'Requested' }];

  it('is true when a Requested booking exists for that vendor', () => {
    expect(hasActiveBooking(bookings, '5')).toBe(true);
  });

  it('is false for another vendor', () => {
    expect(hasActiveBooking(bookings, '7')).toBe(false);
  });

  it('is false for an empty list', () => {
    expect(hasActiveBooking([], '5')).toBe(false);
  });
});

describe('sortBookings', () => {
  const bookings = [
    { id: 'a', eventDate: '2026-12-20' },
    { id: 'b', eventDate: '2026-11-30' },
    { id: 'c', eventDate: '2026-12-05' },
  ];

  it('returns the soonest event date first', () => {
    const sorted = sortBookings(bookings);
    expect(sorted.map((booking) => booking.id)).toEqual(['b', 'c', 'a']);
  });

  it('does not change the original array', () => {
    sortBookings(bookings);
    expect(bookings.map((booking) => booking.id)).toEqual(['a', 'b', 'c']);
  });
});