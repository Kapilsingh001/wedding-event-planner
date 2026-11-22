import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  generateInviteCardCanvas,
  generateInviteCardBlob,
  downloadInviteCard,
  copyInviteCardToClipboard,
  shareInviteCardOnWhatsApp,
  isMobileDevice,
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

  // makes the browser look like an Android phone for one test
  function pretendPhone() {
    vi.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue(
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 Chrome/126.0 Mobile Safari/537.36'
    );
  }

  it('isMobileDevice is false on a laptop and true on a phone', () => {
    expect(isMobileDevice()).toBe(false);
    pretendPhone();
    expect(isMobileDevice()).toBe(true);
  });

  it('shareInviteCardOnWhatsApp on a phone sends the card image file through the share menu', async () => {
    pretendPhone();
    const shareSpy = vi.fn().mockResolvedValue(undefined);
    global.navigator.share = shareSpy;
    global.navigator.canShare = vi.fn().mockReturnValue(true);

    const res = await shareInviteCardOnWhatsApp({
      guest: mockGuest,
      event: mockEvent,
      hostName: mockHost,
    });

    expect(res.shared).toBe(true);
    expect(res.method).toBe('native-share');
    const shared = shareSpy.mock.calls[0][0];
    expect(shared.files).toHaveLength(1);
    expect(shared.files[0].type).toBe('image/png');
  });

  it('shareInviteCardOnWhatsApp on a laptop never uses the share box, it copies the card instead', async () => {
    // A Windows laptop also has navigator.share. Using it was the bug:
    // the Windows share box opened and the card was never copied.
    const shareSpy = vi.fn().mockResolvedValue(undefined);
    global.navigator.share = shareSpy;
    global.navigator.canShare = vi.fn().mockReturnValue(true);
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

    expect(shareSpy).not.toHaveBeenCalled();
    expect(writeSpy).toHaveBeenCalled();
    expect(res.method).toBe('whatsapp-web');
    expect(res.copiedToClipboard).toBe(true);
    expect(res.downloaded).toBe(false);
    // WhatsApp is opened later by the pop-up, after it has shown the steps
    expect(openSpy).not.toHaveBeenCalled();
    expect(res.waUrl).toContain('https://web.whatsapp.com/send?phone=919876543210&text=');
  });

  it('shareInviteCardOnWhatsApp downloads the card when the clipboard is blocked', async () => {
    delete global.navigator.share;
    delete global.navigator.canShare;
    global.navigator.clipboard = { write: vi.fn().mockRejectedValue(new Error('blocked')) };
    global.window.ClipboardItem = function (items) {
      return items;
    };
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const clickSpy = vi.fn();
    const origCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      const el = origCreateElement(tag);
      if (tag === 'a') {
        el.click = clickSpy;
      }
      return el;
    });

    const res = await shareInviteCardOnWhatsApp({
      guest: mockGuest,
      event: mockEvent,
      hostName: mockHost,
    });

    expect(res.method).toBe('whatsapp-web');
    expect(res.copiedToClipboard).toBe(false);
    expect(res.downloaded).toBe(true);
    expect(clickSpy).toHaveBeenCalled();
  });
});
