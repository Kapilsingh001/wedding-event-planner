import { describe, it, expect } from 'vitest'
import {
  getInitials,
  checkPhotoFile,
  getCropBox,
  getProfileStats,
  profileSchema,
  PHOTO_MAX_BYTES,
} from './profileUtils'

describe('getInitials', () => {
  it('uses the first letter of the first and the last name', () => {
    expect(getInitials('Kapil Singh')).toBe('KS')
    expect(getInitials('hemant kumar varshney')).toBe('HV')
  })

  it('uses one letter for a single name', () => {
    expect(getInitials('kapil')).toBe('K')
  })

  it('ignores extra spaces', () => {
    expect(getInitials('  Jatin   Kumar  ')).toBe('JK')
  })

  it('gives a question mark when there is no name', () => {
    expect(getInitials('')).toBe('?')
    expect(getInitials(undefined)).toBe('?')
  })
})

describe('checkPhotoFile', () => {
  it('accepts a normal picture', () => {
    expect(checkPhotoFile({ type: 'image/jpeg', size: 200000 })).toBe('')
    expect(checkPhotoFile({ type: 'image/png', size: PHOTO_MAX_BYTES })).toBe('')
  })

  it('refuses a file that is not a picture', () => {
    expect(checkPhotoFile({ type: 'application/pdf', size: 1000 })).toContain('picture')
  })

  it('refuses a picture that is too big', () => {
    expect(checkPhotoFile({ type: 'image/png', size: PHOTO_MAX_BYTES + 1 })).toContain('too big')
  })

  it('refuses when no file was chosen', () => {
    expect(checkPhotoFile(undefined)).toBe('No file was chosen.')
  })
})

describe('getCropBox', () => {
  it('cuts the sides off a wide picture', () => {
    expect(getCropBox(1200, 630)).toEqual({ x: 285, y: 0, side: 630 })
  })

  it('cuts the top and bottom off a tall picture', () => {
    expect(getCropBox(600, 1000)).toEqual({ x: 0, y: 200, side: 600 })
  })

  it('keeps a square picture whole', () => {
    expect(getCropBox(500, 500)).toEqual({ x: 0, y: 0, side: 500 })
  })
})

describe('getProfileStats', () => {
  const data = {
    events: [
      { id: 'e1', userId: '1', title: 'Haldi', date: '2026-12-10' },
      { id: 'e2', userId: 1, title: 'Wedding', date: '2026-12-12' },
      { id: 'e3', userId: '1', title: 'Engagement', date: '2026-10-01' },
      { id: 'e4', userId: '2', title: 'Someone else', date: '2026-12-01' },
    ],
    guests: [
      { id: 'g1', userId: '1' },
      { id: 'g2', userId: '1' },
      { id: 'g3', userId: '2' },
    ],
    tasks: [
      { id: 't1', userId: '1', done: true },
      { id: 't2', userId: '1', done: false },
      { id: 't3', userId: '1', done: true },
      { id: 't4', userId: '2', done: true },
    ],
    bookings: [
      { id: 'b1', userId: '1' },
      { id: 'b2', userId: '2' },
    ],
  }

  it('counts only what belongs to the user, whether the id is text or a number', () => {
    const stats = getProfileStats(data, 1, '2026-12-01')
    expect(stats.events).toBe(3)
    expect(stats.guests).toBe(2)
    expect(stats.bookings).toBe(1)
  })

  it('counts the tasks that are done', () => {
    const stats = getProfileStats(data, '1', '2026-12-01')
    expect(stats.tasksDone).toBe(2)
    expect(stats.tasksTotal).toBe(3)
  })

  it('finds the next ceremony and the days left', () => {
    const stats = getProfileStats(data, '1', '2026-12-01')
    expect(stats.nextEvent).toEqual({ title: 'Haldi', daysLeft: 9 })
  })

  it('has no next ceremony when all of them are over', () => {
    expect(getProfileStats(data, '1', '2027-01-01').nextEvent).toBeNull()
  })

  it('gives zeros when a list is missing', () => {
    const stats = getProfileStats({}, '1', '2026-12-01')
    expect(stats).toEqual({ events: 0, guests: 0, tasksDone: 0, tasksTotal: 0, bookings: 0, nextEvent: null })
  })
})

describe('profileSchema', () => {
  it('accepts a name with an empty phone and city, and removes spaces at the ends', () => {
    const result = profileSchema.safeParse({ name: '  Kapil Singh ', phone: '', city: ' Mathura ' })
    expect(result.success).toBe(true)
    expect(result.data).toEqual({ name: 'Kapil Singh', phone: '', city: 'Mathura' })
  })

  it('refuses a name that is too short', () => {
    expect(profileSchema.safeParse({ name: 'K', phone: '', city: '' }).success).toBe(false)
  })

  it('refuses a phone number that is not 10 digits', () => {
    expect(profileSchema.safeParse({ name: 'Kapil', phone: '12345', city: '' }).success).toBe(false)
    expect(profileSchema.safeParse({ name: 'Kapil', phone: '98765abcde', city: '' }).success).toBe(false)
    expect(profileSchema.safeParse({ name: 'Kapil', phone: '9876543210', city: '' }).success).toBe(true)
  })
})
