import { describe, it, expect } from 'vitest';
import { countByRsvp, cleanRsvpNote, RSVP_NOTE_MAX } from './guestUtils';
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

describe('cleanRsvpNote', () => {
  it('removes spaces at the ends and turns line breaks into one space', () => {
    expect(cleanRsvpNote('  Sorry,\n\n I am   out of town.  ')).toBe('Sorry, I am out of town.');
  });

  it('cuts a long message at the limit', () => {
    const long = 'a'.repeat(RSVP_NOTE_MAX + 50);
    expect(cleanRsvpNote(long)).toHaveLength(RSVP_NOTE_MAX);
  });

  it('gives an empty text for only spaces or for something that is not text', () => {
    expect(cleanRsvpNote('    ')).toBe('');
    expect(cleanRsvpNote(undefined)).toBe('');
    expect(cleanRsvpNote(42)).toBe('');
  });
});
