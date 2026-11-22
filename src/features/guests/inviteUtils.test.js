import { describe, it, expect } from 'vitest';
import { formatInviteDate, buildInviteMessage, buildWhatsAppLink } from './inviteUtils.js';

describe('inviteUtils', () => {
  it('buildInviteMessage contains the guest name, the event title, the venue and the host name', () => {
    const guest = { name: 'Rahul Sharma', phone: '9876543210' };
    const event = {
      title: 'Our Wedding',
      type: 'Wedding',
      date: '2026-12-12',
      venue: 'Grand Imperial Palace',
    };
    const hostName = 'Kanishk';
    const message = buildInviteMessage(guest, event, hostName);

    expect(message).toContain('Rahul Sharma');
    expect(message).toContain('Our Wedding');
    expect(message).toContain('Grand Imperial Palace');
    expect(message).toContain('Kanishk');
  });

  it('buildWhatsAppLink formats a 10-digit phone with 91 country code and encodes spaces', () => {
    const link = buildWhatsAppLink('9876543210', 'Hello World');
    expect(link.startsWith('https://wa.me/919876543210?text=')).toBe(true);
    expect(link).toContain('Hello%20World');
  });

  it('buildWhatsAppLink handles empty or short phone without country prefix', () => {
    const emptyLink = buildWhatsAppLink('', 'Hello World');
    expect(emptyLink.startsWith('https://wa.me/?text=')).toBe(true);
    expect(emptyLink).toContain('Hello%20World');

    const shortLink = buildWhatsAppLink('12345', 'Hello World');
    expect(shortLink.startsWith('https://wa.me/?text=')).toBe(true);
  });

  it('formatInviteDate parses YYYY-MM-DD and contains the day, month, and year', () => {
    const formatted = formatInviteDate('2026-12-12');
    expect(formatted).toContain('12');
    expect(formatted).toContain('December');
    expect(formatted).toContain('2026');
  });
});
