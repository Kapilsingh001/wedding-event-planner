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

/**
 * Generate a high-resolution Canvas representation of the Digital Invitation Card
 * Formatted with snug proportions matching the screenshot
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

  // 1. Overall Canvas Background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  // 2. Outer Card with Dashed Border
  const outerX = 14;
  const outerY = 14;
  const outerW = width - 28;
  const outerH = height - 28;
  const outerR = 20;

  ctx.save();
  ctx.fillStyle = '#FFF8F9';
  drawRoundedRect(ctx, outerX, outerY, outerW, outerH, outerR);
  ctx.fill();

  ctx.setLineDash([7, 6]);
  ctx.lineWidth = 1.8;
  ctx.strokeStyle = '#F3D7DC';
  ctx.stroke();
  ctx.restore();

  // 3. Inner Card with Gradient Background & Solid Border
  const innerX = 28;
  const innerY = 28;
  const innerW = width - 56;
  const innerH = height - 56;
  const innerR = 16;

  ctx.save();
  const bgGrad = ctx.createLinearGradient(innerX, innerY, innerX, innerY + innerH);
  bgGrad.addColorStop(0, '#FCEEF0');
  bgGrad.addColorStop(0.35, '#FFF7F8');
  bgGrad.addColorStop(1, '#FFFFFF');

  ctx.fillStyle = bgGrad;
  drawRoundedRect(ctx, innerX, innerY, innerW, innerH, innerR);
  ctx.fill();

  ctx.strokeStyle = '#F3D7DC';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  // 4. Content inside Inner Card (Centered)
  const centerX = width / 2;
  let curY = innerY + 36;

  // Eyebrow: YOU ARE INVITED
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#C93F59';
  ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  if ('letterSpacing' in ctx) {
    ctx.letterSpacing = '3px';
  }
  ctx.fillText('YOU ARE INVITED', centerX, curY);
  ctx.restore();

  curY += 30;

  // Event Title
  const titleText = event?.title || 'Our Celebration';
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#1E293B';
  ctx.font = 'bold 26px "Playfair Display", Georgia, serif';
  const titleLines = wrapText(ctx, titleText, innerW - 60);
  titleLines.slice(0, 2).forEach((line) => {
    ctx.fillText(line, centerX, curY);
    curY += 32;
  });
  ctx.restore();

  // Event Type Pill (if provided)
  if (event?.type) {
    ctx.save();
    ctx.font = '600 11.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const textWidth = ctx.measureText ? ctx.measureText(event.type).width : 60;
    const pillW = textWidth + 24;
    const pillH = 22;
    const pillX = centerX - pillW / 2;
    const pillY = curY - 2;

    ctx.fillStyle = '#FFFFFF';
    drawRoundedRect(ctx, pillX, pillY, pillW, pillH, 999);
    ctx.fill();
    ctx.strokeStyle = '#F3D7DC';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#C93F59';
    ctx.fillText(event.type, centerX, pillY + 15);
    ctx.restore();

    curY += 30;
  } else {
    curY += 10;
  }

  // Divider
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(centerX - 20, curY);
  ctx.lineTo(centerX + 20, curY);
  ctx.strokeStyle = '#E85D75';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.restore();

  curY += 26;

  // Guest Greeting: Dear <name>,
  const guestName = guest?.name || 'Guest';
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#1E293B';
  ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(`Dear ${guestName},`, centerX, curY);
  ctx.restore();

  curY += 22;

  // Warm invitation note
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#64748B';
  ctx.font = 'italic 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('You are warmly invited to celebrate with us on this special day.', centerX, curY);
  ctx.restore();

  curY += 24;

  // Details Box (Date & Venue)
  const detailsBoxX = innerX + 20;
  const detailsBoxW = innerW - 40;
  const detailsBoxH = hasVenue ? 78 : 46;

  ctx.save();
  ctx.fillStyle = '#FFFFFF';
  drawRoundedRect(ctx, detailsBoxX, curY, detailsBoxW, detailsBoxH, 10);
  ctx.fill();
  ctx.strokeStyle = '#F3D7DC';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Date Item
  const dateFormatted = formatInviteDate(event?.date) || 'Date to be announced';
  drawCalendarIcon(ctx, detailsBoxX + 14, curY + 13, 16, '#C93F59');
  ctx.textAlign = 'left';
  ctx.fillStyle = '#1E293B';
  ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(dateFormatted, detailsBoxX + 38, curY + 26);

  // Venue Item (if present)
  if (hasVenue) {
    drawLandmarkIcon(ctx, detailsBoxX + 14, curY + 45, 16, '#C93F59');
    ctx.textAlign = 'left';
    ctx.fillStyle = '#1E293B';
    ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const venueText = truncateText(ctx, event.venue, detailsBoxW - 50);
    ctx.fillText(venueText, detailsBoxX + 38, curY + 58);
  }
  ctx.restore();

  curY += detailsBoxH + 28;

  // Sign-off / Host
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#64748B';
  ctx.font = '13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('With love,', centerX, curY);

  curY += 18;
  ctx.fillStyle = '#1E293B';
  ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(hostName || 'The Host', centerX, curY);
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
