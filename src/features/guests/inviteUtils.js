export function formatInviteDate(dateStr) {
  if (!dateStr) return '';
  // Avoid timezone shift for YYYY-MM-DD
  const date = typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)
    ? new Date(`${dateStr}T00:00:00`)
    : new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function buildInviteMessage(guest, event, hostName) {
  const guestName = guest?.name || 'Guest';
  const eventTitle = event?.title || 'Our Event';
  const eventType = event?.type ? ` (${event.type})` : '';
  const formattedDate = formatInviteDate(event?.date);
  const venue = event?.venue ? `\nVenue: ${event.venue}` : '';
  const sender = hostName || 'The Host';

  return `Dear ${guestName},

You are warmly invited to ${eventTitle}${eventType}.
Date: ${formattedDate}${venue}

Please let us know if you can come.

With love,
${sender}`;
}

export function buildWhatsAppLink(phone, message = '') {
  const trimmed = typeof phone === 'string' ? phone.trim() : (phone != null ? String(phone) : '');
  const encodedMsg = encodeURIComponent(message);
  if (/^\d{10}$/.test(trimmed)) {
    return `https://wa.me/91${trimmed}?text=${encodedMsg}`;
  }
  return `https://wa.me/?text=${encodedMsg}`;
}
