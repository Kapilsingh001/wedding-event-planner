import { formatInviteDate, buildInviteMessage, buildWhatsAppLink } from './inviteUtils.js';

/**
 * Fallback-safe rounded rectangle helper
 */
function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, width, height, radius);
  } else {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}

/**
 * Draw Calendar Icon (vector)
 */
function drawCalendarIcon(ctx, x, y, size = 18, color = '#C93F59') {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.8;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const bx = x;
  const by = y + 2;
  const bw = size;
  const bh = size - 2;

  drawRoundedRect(ctx, bx, by, bw, bh, 3);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(bx + bw * 0.28, y);
  ctx.lineTo(bx + bw * 0.28, y + 4);
  ctx.moveTo(bx + bw * 0.72, y);
  ctx.lineTo(bx + bw * 0.72, y + 4);

  ctx.moveTo(bx, by + bh * 0.35);
  ctx.lineTo(bx + bw, by + bh * 0.35);
  ctx.stroke();

  ctx.restore();
}

/**
 * Draw Landmark/Venue Icon (vector)
 */
function drawLandmarkIcon(ctx, x, y, size = 18, color = '#C93F59') {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.8;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(x + size / 2, y + 1);
  ctx.lineTo(x + size, y + size * 0.36);
  ctx.lineTo(x, y + size * 0.36);
  ctx.closePath();
  ctx.stroke();

  const pillarTop = y + size * 0.46;
  const pillarBottom = y + size * 0.86;
  const steps = [0.18, 0.39, 0.61, 0.82];
  steps.forEach((pct) => {
    ctx.beginPath();
    ctx.moveTo(x + size * pct, pillarTop);
    ctx.lineTo(x + size * pct, pillarBottom);
    ctx.stroke();
  });

  ctx.beginPath();
  ctx.moveTo(x, y + size);
  ctx.lineTo(x + size, y + size);
  ctx.stroke();

  ctx.restore();
}

/**
 * Wrap text into lines based on maxWidth
 */
function wrapText(ctx, text, maxWidth) {
  if (!text) return [];
  const words = text.split(/\s+/);
  const lines = [];
  let currentLine = words[0] || '';

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const testLine = `${currentLine} ${word}`;
    const metrics = ctx.measureText ? ctx.measureText(testLine) : { width: 0 };
    if (metrics.width < maxWidth) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

/**
 * Truncate single line text with ellipsis if too long
 */
function truncateText(ctx, text, maxWidth) {
  if (!text) return '';
  if (!ctx.measureText) return text;
  if (ctx.measureText(text).width <= maxWidth) return text;

  let truncated = text;
  while (truncated.length > 0 && ctx.measureText(`${truncated}...`).width > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return `${truncated}...`;
}

// Colours and fonts of the wedding card
const CARD = {
  gold: '#C29A45',
  goldSoft: '#E2C98F',
  maroon: '#8E2440',
  rose: '#C93F59',
  ink: '#3A2A2E',
  muted: '#7A6A6E',
  serif: '"Playfair Display", Georgia, "Times New Roman", serif',
  sans: 'Poppins, "Segoe UI", Roboto, Arial, sans-serif',
};

/**
 * Small diamond shape, used in the ornaments
 */
function drawDiamond(ctx, cx, cy, size, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx, cy - size);
  ctx.lineTo(cx + size, cy);
  ctx.lineTo(cx, cy + size);
  ctx.lineTo(cx - size, cy);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/**
 * Ornament: line - diamond - line, centred on cx
 */
function drawOrnament(ctx, cx, cy, halfWidth) {
  ctx.save();
  ctx.strokeStyle = CARD.gold;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - halfWidth, cy);
  ctx.lineTo(cx - 14, cy);
  ctx.moveTo(cx + 14, cy);
  ctx.lineTo(cx + halfWidth, cy);
  ctx.stroke();
  ctx.restore();

  drawDiamond(ctx, cx, cy, 5, CARD.gold);
  drawDiamond(ctx, cx - halfWidth - 6, cy, 2.5, CARD.goldSoft);
  drawDiamond(ctx, cx + halfWidth + 6, cy, 2.5, CARD.goldSoft);
}

/**
 * Curved flourish in one corner. dx and dy are 1 or -1 and choose the corner.
 */
function drawCornerFlourish(ctx, x, y, dx, dy) {
  ctx.save();
  ctx.strokeStyle = CARD.gold;
  ctx.lineWidth = 1.4;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(x, y + dy * 58);
  ctx.quadraticCurveTo(x, y, x + dx * 58, y);
  ctx.stroke();

  ctx.lineWidth = 1;
  ctx.strokeStyle = CARD.goldSoft;
  ctx.beginPath();
  ctx.moveTo(x + dx * 6, y + dy * 36);
  ctx.quadraticCurveTo(x + dx * 6, y + dy * 6, x + dx * 36, y + dy * 6);
  ctx.stroke();
  ctx.restore();

  drawDiamond(ctx, x + dx * 17, y + dy * 17, 3.5, CARD.gold);
}

/**
 * Generate a high-resolution Canvas of the Digital Invitation Card.
 * Wedding style: cream paper, gold double border, corner flourishes.
 */
export function generateInviteCardCanvas({ guest, event, hostName }) {
  if (typeof document === 'undefined') {
    throw new Error('Canvas rendering requires a document environment');
  }

  const canvas = document.createElement('canvas');
  const hasVenue = Boolean(event?.venue);
  const width = 560;
  const height = hasVenue ? 580 : 520;
  const dpr = 2; // 2x sharpness

  canvas.width = width * dpr;
  canvas.height = height * dpr;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return canvas;
  }

  ctx.scale(dpr, dpr);

  const centerX = width / 2;

  // 1. Paper background: warm cream fading to soft rose
  const paper = ctx.createLinearGradient(0, 0, 0, height);
  paper.addColorStop(0, '#FFF9F2');
  paper.addColorStop(0.6, '#FFF3EE');
  paper.addColorStop(1, '#FBE6E8');
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, width, height);

  // 2. Gold double border
  ctx.save();
  ctx.strokeStyle = CARD.gold;
  ctx.lineWidth = 2;
  drawRoundedRect(ctx, 14, 14, width - 28, height - 28, 8);
  ctx.stroke();

  ctx.strokeStyle = CARD.goldSoft;
  ctx.lineWidth = 1;
  drawRoundedRect(ctx, 21, 21, width - 42, height - 42, 5);
  ctx.stroke();
  ctx.restore();

  // 3. A flourish in each corner
  drawCornerFlourish(ctx, 30, 30, 1, 1);
  drawCornerFlourish(ctx, width - 30, 30, -1, 1);
  drawCornerFlourish(ctx, 30, height - 30, 1, -1);
  drawCornerFlourish(ctx, width - 30, height - 30, -1, -1);

  // The title decides how much room is left, so measure it first
  const titleText = event?.title || 'Our Celebration';
  ctx.save();
  ctx.font = `bold 36px ${CARD.serif}`;
  const titleLines = wrapText(ctx, titleText, width - 150).slice(0, 2);
  ctx.restore();

  // a one-line title leaves spare room, which is shared out as extra spacing
  const gap = titleLines.length > 1 ? 0 : 8;
  let curY = 62 + gap;

  // 4. Top ornament
  drawOrnament(ctx, centerX, curY, 60);

  curY += 34;

  // 5. Eyebrow: YOU ARE INVITED
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = CARD.gold;
  ctx.font = `600 12px ${CARD.sans}`;
  if ('letterSpacing' in ctx) {
    ctx.letterSpacing = '4px';
  }
  ctx.fillText('YOU ARE INVITED', centerX, curY);
  ctx.restore();

  curY += 48;

  // 6. Event title
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = CARD.maroon;
  ctx.font = `bold 36px ${CARD.serif}`;
  titleLines.forEach((line, index) => {
    if (index > 0) curY += 42;
    ctx.fillText(line, centerX, curY);
  });
  ctx.restore();

  curY += 20;

  // 7. Event type pill (if provided)
  if (event?.type) {
    ctx.save();
    ctx.font = `600 12px ${CARD.sans}`;
    const textWidth = ctx.measureText ? ctx.measureText(event.type).width : 60;
    const pillW = textWidth + 30;
    const pillH = 24;
    const pillX = centerX - pillW / 2;

    ctx.fillStyle = CARD.rose;
    drawRoundedRect(ctx, pillX, curY, pillW, pillH, 12);
    ctx.fill();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(event.type, centerX, curY + 16);
    ctx.restore();

    curY += pillH;
  }

  curY += 26 + gap;

  // 8. Greeting: Dear <name>,
  const guestName = guest?.name || 'Guest';
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = CARD.ink;
  ctx.font = `italic 600 20px ${CARD.serif}`;
  ctx.fillText(truncateText(ctx, `Dear ${guestName},`, width - 120), centerX, curY);
  ctx.restore();

  curY += 26;

  // 9. Warm invitation note
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = CARD.muted;
  ctx.font = `13px ${CARD.sans}`;
  ctx.fillText('You are warmly invited to celebrate with us', centerX, curY);
  curY += 19;
  ctx.fillText('on this special day.', centerX, curY);
  ctx.restore();

  curY += 26 + gap;

  // 10. Date and venue, between two ornaments
  drawOrnament(ctx, centerX, curY, 110);

  curY += 32;

  const dateFormatted = formatInviteDate(event?.date) || 'Date to be announced';
  ctx.save();
  ctx.fillStyle = CARD.ink;
  ctx.textAlign = 'left';

  // the icon and the text are centred together as one group
  ctx.font = `600 15px ${CARD.sans}`;
  const dateWidth = ctx.measureText ? ctx.measureText(dateFormatted).width : 200;
  const dateX = centerX - (dateWidth + 26) / 2;
  drawCalendarIcon(ctx, dateX, curY - 14, 16, CARD.rose);
  ctx.fillText(dateFormatted, dateX + 26, curY);

  if (hasVenue) {
    curY += 30;
    ctx.font = `14px ${CARD.sans}`;
    const venueText = truncateText(ctx, event.venue, width - 170);
    const venueWidth = ctx.measureText ? ctx.measureText(venueText).width : 200;
    const venueX = centerX - (venueWidth + 26) / 2;
    drawLandmarkIcon(ctx, venueX, curY - 14, 16, CARD.rose);
    ctx.fillText(venueText, venueX + 26, curY);
  }
  ctx.restore();

  curY += 24;

  drawOrnament(ctx, centerX, curY, 110);

  curY += 38 + gap;

  // 11. Sign-off and host name
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = CARD.muted;
  ctx.font = `italic 14px ${CARD.serif}`;
  ctx.fillText('With love,', centerX, curY);

  curY += 28;
  ctx.fillStyle = CARD.maroon;
  ctx.font = `bold 22px ${CARD.serif}`;
  ctx.fillText(truncateText(ctx, hostName || 'The Host', width - 140), centerX, curY);
  ctx.restore();

  return canvas;
}

/**
 * Generate a PNG Blob of the card
 */
export async function generateInviteCardBlob({ guest, event, hostName }) {
  const canvas = generateInviteCardCanvas({ guest, event, hostName });
  return new Promise((resolve, reject) => {
    if (typeof canvas.toBlob === 'function') {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to generate image blob'));
      }, 'image/png');
    } else if (typeof canvas.toDataURL === 'function') {
      try {
        const dataUrl = canvas.toDataURL('image/png');
        const byteString = atob(dataUrl.split(',')[1]);
        const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        resolve(new Blob([ab], { type: mimeString }));
      } catch (err) {
        reject(err);
      }
    } else {
      reject(new Error('Canvas blob export not supported in this environment'));
    }
  });
}

/**
 * Trigger download of the invitation card as a PNG image
 */
export async function downloadInviteCard({ guest, event, hostName }) {
  const canvas = generateInviteCardCanvas({ guest, event, hostName });
  const dataUrl = canvas.toDataURL ? canvas.toDataURL('image/png') : '';
  const safeName = (guest?.name || 'Guest').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeTitle = (event?.title || 'Wedding_Invitation').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${safeTitle}_Invite_${safeName}.png`;

  if (dataUrl && typeof document !== 'undefined') {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  }
  return false;
}

/**
 * Copy the card image directly to system clipboard
 */
export async function copyInviteCardToClipboard({ guest, event, hostName }) {
  const blob = await generateInviteCardBlob({ guest, event, hostName });
  if (typeof navigator !== 'undefined' && navigator.clipboard && typeof window !== 'undefined' && window.ClipboardItem) {
    const item = new window.ClipboardItem({ 'image/png': blob });
    await navigator.clipboard.write([item]);
    return { success: true, method: 'clipboard' };
  }
  await downloadInviteCard({ guest, event, hostName });
  return { success: true, method: 'download' };
}

/**
 * Share card on WhatsApp:
 * 1. Native file share via navigator.share (mobile / supported desktop OS)
 * 2. Fallback: Copies card image to clipboard, downloads image, and opens WhatsApp Web
 */
export async function shareInviteCardOnWhatsApp({ guest, event, hostName, inviteUrl = '' }) {
  const canvas = generateInviteCardCanvas({ guest, event, hostName });
  const message = buildInviteMessage(guest, event, hostName, inviteUrl);
  const waUrl = buildWhatsAppLink(guest?.phone, message);
  const safeName = (guest?.name || 'Guest').trim().replace(/[^a-zA-Z0-9_-]/g, '_');

  // Try Web Share API with image file first (ideal on phones and supported OS)
  if (
    typeof navigator !== 'undefined' &&
    typeof navigator.share === 'function' &&
    typeof navigator.canShare === 'function'
  ) {
    try {
      const blob = await new Promise((resolve) => {
        if (canvas.toBlob) canvas.toBlob(resolve, 'image/png');
        else resolve(null);
      });

      if (blob && typeof File !== 'undefined') {
        const file = new File([blob], `invitation-${safeName}.png`, { type: 'image/png' });

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `${event?.title || 'Wedding Invitation'} for ${guest?.name || 'Guest'}`,
            text: message,
            files: [file],
          });
          return { shared: true, method: 'native-share' };
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        return { shared: false, cancelled: true };
      }
      console.warn('Native file share failed or not accepted, falling back', err);
    }
  }

  // Fallback for desktop & browsers without direct file share to WhatsApp:
  // 1. Copy image to clipboard so user can press Ctrl+V in WhatsApp chat
  let copiedToClipboard = false;
  try {
    const blob = await new Promise((resolve) => {
      if (canvas.toBlob) canvas.toBlob(resolve, 'image/png');
      else resolve(null);
    });
    if (blob && typeof navigator !== 'undefined' && navigator.clipboard && window?.ClipboardItem) {
      await navigator.clipboard.write([new window.ClipboardItem({ 'image/png': blob })]);
      copiedToClipboard = true;
    }
  } catch (clipErr) {
    console.warn('Clipboard write failed, downloading card as fallback', clipErr);
  }

  // 2. Also trigger image download so the file is ready in user's downloads folder
  try {
    await downloadInviteCard({ guest, event, hostName });
  } catch {
    // ignore
  }

  // 3. Open WhatsApp Web
  if (typeof window !== 'undefined') {
    window.open(waUrl, '_blank', 'noopener');
  }

  return {
    shared: true,
    method: 'whatsapp-web',
    copiedToClipboard,
    waUrl,
  };
}
