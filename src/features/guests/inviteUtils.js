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

export function buildInviteMessage(guest, event, hostName, inviteUrl = '') {
  const guestName = guest?.name || 'Guest';
  const eventTitle = event?.title || 'Our Event';
  const eventType = event?.type ? ` (${event.type})` : '';
  const formattedDate = formatInviteDate(event?.date) || 'Date to be announced';
  const venue = event?.venue ? `\nVenue: ${event.venue}` : '';
  const sender = hostName || 'The Host';
  const linkSection = inviteUrl ? `\n\nView Digital Card & RSVP:\n${inviteUrl}` : '';

  return `*YOU ARE INVITED*

Dear ${guestName},

You are warmly invited to celebrate with us:
*${eventTitle}*${eventType}

Date: ${formattedDate}${venue}${linkSection}

Please let us know if you can make it!

With love,
${sender}`;
}

// The phone number as 10 digits, or '' when it is not a 10-digit number
function getTenDigitPhone(phone) {
  const trimmed = typeof phone === 'string' ? phone.trim() : (phone != null ? String(phone) : '');
  return /^\d{10}$/.test(trimmed) ? trimmed : '';
}

// Link for a phone: opens the WhatsApp app with the message typed in
export function buildWhatsAppLink(phone, message = '') {
  const digits = getTenDigitPhone(phone);
  const encodedMsg = encodeURIComponent(message);
  if (digits) {
    return `https://wa.me/91${digits}?text=${encodedMsg}`;
  }
  return `https://wa.me/?text=${encodedMsg}`;
}

// Link for a laptop: opens WhatsApp Web straight in the guest's chat, with the
// message typed in. A link can carry only text. WhatsApp never takes an image
// from a link, which is why the card image is pasted into the chat instead.
export function buildWhatsAppWebLink(phone, message = '') {
  const digits = getTenDigitPhone(phone);
  const encodedMsg = encodeURIComponent(message);
  if (digits) {
    return `https://web.whatsapp.com/send?phone=91${digits}&text=${encodedMsg}`;
  }
  return `https://web.whatsapp.com/send?text=${encodedMsg}`;
}
