import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  generateInviteCardCanvas,
  generateInviteCardBlob,
  downloadInviteCard,
  copyInviteCardToClipboard,
  shareInviteCardOnWhatsApp,
} from './cardGenerator.js';

describe('cardGenerator', () => {
  const mockGuest = { id: 1, name: 'Kanishk Chahar', phone: '9876543210' };
  const mockEvent = {
    id: 101,
    title: 'Our Wedding',
    type: 'Engagement',
    date: '2026-11-26',
    venue: 'Mughal Garden Banquets',
  };
  const mockHost = 'Kanishk';

  let mockCtx;

  beforeEach(() => {
    mockCtx = {
      scale: vi.fn(),
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      fillText: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      quadraticCurveTo: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      setLineDash: vi.fn(),
      createLinearGradient: vi.fn(() => ({
        addColorStop: vi.fn(),
      })),
      measureText: vi.fn((text) => ({ width: text.length * 8 })),
      fillStyle: '#000',
      strokeStyle: '#000',
      lineWidth: 1,
      font: '',
      textAlign: '',
    };

    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(mockCtx);
    HTMLCanvasElement.prototype.toDataURL = vi.fn().mockReturnValue('data:image/png;base64,mock');
    HTMLCanvasElement.prototype.toBlob = vi.fn((cb) => {
      cb(new Blob(['mock-image-data'], { type: 'image/png' }));
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('generateInviteCardCanvas creates a canvas with 2x resolution and renders guest and event details', () => {
    const canvas = generateInviteCardCanvas({
      guest: mockGuest,
      event: mockEvent,
      hostName: mockHost,
    });

    expect(canvas).toBeDefined();
    expect(canvas.width).toBe(1120); // 560 * 2
    expect(canvas.height).toBe(1160); // 580 * 2
    expect(mockCtx.scale).toHaveBeenCalledWith(2, 2);

    // Verify text drawing calls
    const fillTextCalls = mockCtx.fillText.mock.calls.map((call) => call[0]);
    expect(fillTextCalls).toContain('YOU ARE INVITED');
    expect(fillTextCalls).toContain('Our Wedding');
    expect(fillTextCalls).toContain('Engagement');
    expect(fillTextCalls).toContain('Dear Kanishk Chahar,');
    expect(fillTextCalls).toContain('With love,');
    expect(fillTextCalls).toContain('Kanishk');
  });

  it('generateInviteCardCanvas handles missing venue and event type gracefully', () => {
    const canvas = generateInviteCardCanvas({
      guest: { name: 'Priya' },
      event: { title: 'Dinner', date: '2026-12-01' },
      hostName: 'Host',
    });

    expect(canvas).toBeDefined();
    const fillTextCalls = mockCtx.fillText.mock.calls.map((call) => call[0]);
    expect(fillTextCalls).toContain('Dear Priya,');
    expect(fillTextCalls).toContain('Dinner');
  });

  it('generateInviteCardBlob returns a png Blob', async () => {
    const blob = await generateInviteCardBlob({
      guest: mockGuest,
      event: mockEvent,
      hostName: mockHost,
    });

    expect(blob).toBeDefined();
    expect(blob.type).toBe('image/png');
  });

  it('downloadInviteCard triggers an anchor click to download the image', async () => {
    const clickSpy = vi.fn();
    const origCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      const el = origCreateElement(tag);
      if (tag === 'a') {
        el.click = clickSpy;
      }
      return el;
    });

    const success = await downloadInviteCard({
      guest: mockGuest,
      event: mockEvent,
      hostName: mockHost,
    });

    expect(success).toBe(true);
    expect(clickSpy).toHaveBeenCalled();
  });

  it('copyInviteCardToClipboard copies the png image item to the clipboard', async () => {
    const writeSpy = vi.fn().mockResolvedValue(undefined);
    global.navigator.clipboard = { write: writeSpy };
    global.window.ClipboardItem = function (items) {
      return items;
    };

    const res = await copyInviteCardToClipboard({
      guest: mockGuest,
      event: mockEvent,
      hostName: mockHost,
    });

    expect(res.success).toBe(true);
    expect(res.method).toBe('clipboard');
    expect(writeSpy).toHaveBeenCalled();
  });

  it('shareInviteCardOnWhatsApp uses native navigator.share if file sharing is supported', async () => {
    const shareSpy = vi.fn().mockResolvedValue(undefined);
    const canShareSpy = vi.fn().mockReturnValue(true);

    global.navigator.share = shareSpy;
    global.navigator.canShare = canShareSpy;

    const res = await shareInviteCardOnWhatsApp({
      guest: mockGuest,
      event: mockEvent,
      hostName: mockHost,
    });

    expect(res.shared).toBe(true);
    expect(res.method).toBe('native-share');
    expect(shareSpy).toHaveBeenCalled();
  });

  it('shareInviteCardOnWhatsApp falls back to clipboard + WhatsApp window when native share unavailable', async () => {
    delete global.navigator.share;
    delete global.navigator.canShare;

    const openSpy = vi.fn();
    window.open = openSpy;
    const writeSpy = vi.fn().mockResolvedValue(undefined);
    global.navigator.clipboard = { write: writeSpy };
    global.window.ClipboardItem = function (items) {
      return items;
    };

    const res = await shareInviteCardOnWhatsApp({
      guest: mockGuest,
      event: mockEvent,
      hostName: mockHost,
    });

    expect(res.shared).toBe(true);
    expect(res.method).toBe('whatsapp-web');
    expect(res.copiedToClipboard).toBe(true);
    expect(openSpy).toHaveBeenCalledWith(
      expect.stringContaining('https://wa.me/919876543210'),
      '_blank',
      'noopener'
    );
  });
});
