export function countByRsvp(guests = []) {
  const list = Array.isArray(guests) ? guests : [];
  return {
    total: list.length,
    Attending: list.filter((g) => g.rsvp === 'Attending').length,
    Declined: list.filter((g) => g.rsvp === 'Declined').length,
    Pending: list.filter((g) => g.rsvp === 'Pending').length,
  };
}

// The longest message a guest can write when they cannot attend
export const RSVP_NOTE_MAX = 200;

// Cleans the message a guest writes when they cannot attend: line breaks and
// extra spaces become one space, and the message is cut at 200 letters.
export function cleanRsvpNote(text) {
  if (typeof text !== 'string') return '';
  return text.replace(/\s+/g, ' ').trim().slice(0, RSVP_NOTE_MAX);
}
