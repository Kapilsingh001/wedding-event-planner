import { describe, it, expect } from 'vitest';
import { countByRsvp } from './guestUtils';
import { guestSchema } from './guestSchema';

describe('guestUtils and guestSchema', () => {
  it('countByRsvp counts 2 Attending, 1 Declined, 1 Pending and total 4', () => {
    const guests = [
      { id: '1', name: 'A', rsvp: 'Attending' },
      { id: '2', name: 'B', rsvp: 'Attending' },
      { id: '3', name: 'C', rsvp: 'Declined' },
      { id: '4', name: 'D', rsvp: 'Pending' },
    ];
    const counts = countByRsvp(guests);
    expect(counts).toEqual({
      total: 4,
      Attending: 2,
      Declined: 1,
      Pending: 1,
    });
  });

  it('guestSchema rejects phone "12345" and accepts an empty phone', () => {
    // Rejects phone "12345"
    const invalidResult = guestSchema.safeParse({
      name: 'Rahul',
      phone: '12345',
      side: 'Bride',
    });
    expect(invalidResult.success).toBe(false);

    // Accepts an empty phone
    const emptyPhoneResult = guestSchema.safeParse({
      name: 'Rahul',
      phone: '',
      side: 'Bride',
    });
    expect(emptyPhoneResult.success).toBe(true);
  });
});
