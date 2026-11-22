// Small helpers for the profile card in the navbar. Most of them only work on
// the data that is passed in, so they are easy to test (see profileUtils.test.js).
import { z } from 'zod'
import { getNextEvent, daysUntil } from '../pages/dashboardUtils'

// the saved photo is a square of 256 x 256 pixels
export const PHOTO_SIZE = 256
// the biggest picture file a user may choose: 5 MB
export const PHOTO_MAX_BYTES = 5 * 1024 * 1024

// Rules for the "Edit profile" form. trim() removes spaces at both ends.
export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters.')
    .max(40, 'Name can have at most 40 characters.'),
  phone: z
    .string()
    .trim()
    .refine((value) => value === '' || /^\d{10}$/.test(value), {
      message: 'Phone number must be exactly 10 digits.',
    }),
  city: z.string().trim().max(40, 'City can have at most 40 characters.'),
})

// "Kapil Singh" gives "KS", "kapil" gives "K", and no name gives "?"
export function getInitials(name) {
  const words = String(name || '').trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  const first = words[0][0]
  const last = words.length > 1 ? words[words.length - 1][0] : ''
  return (first + last).toUpperCase()
}

// Checks a chosen file before it is used as a photo.
// Returns the problem as text, or '' when the file is fine.
export function checkPhotoFile(file) {
  if (!file) return 'No file was chosen.'
  if (!String(file.type).startsWith('image/')) return 'Please choose a picture (JPG or PNG).'
  if (file.size > PHOTO_MAX_BYTES) return 'This picture is too big. Please choose one under 5 MB.'
  return ''
}

// The biggest square in the middle of a picture. The photo is cut to this
// square first, so it is never stretched inside the round avatar.
export function getCropBox(width, height) {
  const side = Math.min(width, height)
  return {
    x: Math.round((width - side) / 2),
    y: Math.round((height - side) / 2),
    side,
  }
}

// Opens a picture file, cuts the middle square and shrinks it to 256 x 256.
// It gives the picture back as text (a "data URL"). Text can be saved in
// db.json like a name, so no file upload server is needed.
export function resizePhoto(file, size = PHOTO_SIZE) {
  return new Promise((resolve, reject) => {
    const address = URL.createObjectURL(file)
    const picture = new Image()

    picture.onload = () => {
      const box = getCropBox(picture.naturalWidth, picture.naturalHeight)
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      canvas.getContext('2d').drawImage(picture, box.x, box.y, box.side, box.side, 0, 0, size, size)
      URL.revokeObjectURL(address)
      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }

    picture.onerror = () => {
      URL.revokeObjectURL(address)
      reject(new Error('This file could not be opened as a picture.'))
    }

    picture.src = address
  })
}

// Counts what belongs to one user, for the numbers on the profile card.
// today is passed in as 'YYYY-MM-DD' so the tests always get the same answer.
export function getProfileStats({ events = [], guests = [], tasks = [], bookings = [] }, userId, today) {
  const isMine = (item) => String(item.userId) === String(userId)
  const myEvents = events.filter(isMine)
  const myTasks = tasks.filter(isMine)
  const next = getNextEvent(myEvents, today)

  return {
    events: myEvents.length,
    guests: guests.filter(isMine).length,
    tasksDone: myTasks.filter((task) => task.done).length,
    tasksTotal: myTasks.length,
    bookings: bookings.filter(isMine).length,
    nextEvent: next ? { title: next.title, daysLeft: daysUntil(next.date, today) } : null,
  }
}
