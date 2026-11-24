import { describe, it, expect } from 'vitest'
import { getMyExpenses, getTopCategories, getRsvpShares, getMyBookings } from './dashboardUtils'

describe('getMyExpenses', () => {
  it('keeps only the expenses of my events', () => {
    const events = [{ id: 'e1' }, { id: 'e2' }]
    const expenses = [{ eventId: 'e1', amount: 10 }, { eventId: 'x', amount: 99 }, { eventId: 'e2', amount: 5 }]
    expect(getMyExpenses(events, expenses)).toHaveLength(2)
  })
})

describe('getTopCategories', () => {
  const expenses = [
    { category: 'Catering', amount: 300000 },
    { category: 'Venue', amount: 100000 },
    { category: 'Catering', amount: 100000 },
    { category: 'Music', amount: 50000 },
    { category: 'Gifts', amount: 50000 },
  ]

  it('adds up each category and puts the biggest first', () => {
    const top = getTopCategories(expenses)
    expect(top[0]).toEqual({ category: 'Catering', amount: 400000, share: 67 })
    expect(top[1].category).toBe('Venue')
  })

  it('shows only as many categories as the limit', () => {
    expect(getTopCategories(expenses, 2)).toHaveLength(2)
  })

  it('gives an empty list when there are no expenses', () => {
    expect(getTopCategories([])).toEqual([])
  })
})

describe('getRsvpShares', () => {
  it('turns the counts into parts of 100', () => {
    expect(getRsvpShares({ total: 4, attending: 2, pending: 1, declined: 1 })).toEqual({ attending: 50, pending: 25, declined: 25 })
  })

  it('gives zeros when there are no guests', () => {
    expect(getRsvpShares({ total: 0, attending: 0, pending: 0, declined: 0 })).toEqual({ attending: 0, pending: 0, declined: 0 })
  })
})

describe('getMyBookings', () => {
  it('keeps only my bookings, soonest event first, whether the id is text or a number', () => {
    const bookings = [
      { id: 'b1', userId: 1, eventDate: '2026-12-20' },
      { id: 'b2', userId: '2', eventDate: '2026-12-01' },
      { id: 'b3', userId: '1', eventDate: '2026-12-05' },
    ]
    expect(getMyBookings(bookings, '1').map((b) => b.id)).toEqual(['b3', 'b1'])
  })
})
