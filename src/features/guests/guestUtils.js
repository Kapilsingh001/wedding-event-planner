export function countByRsvp(guests = []) {
  const list = Array.isArray(guests) ? guests : [];
  return {
    total: list.length,
    Attending: list.filter((g) => g.rsvp === 'Attending').length,
    Declined: list.filter((g) => g.rsvp === 'Declined').length,
    Pending: list.filter((g) => g.rsvp === 'Pending').length,
  };
}
