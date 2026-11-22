import { describe, it, expect } from 'vitest'
import { getDayLabel, buildTimeline, groupByMonth, getTimelineSummary } from './timelineUtils'

const today = '2026-11-22'
const events = [
  { id: 'e1', title: 'Wedding', type: 'Wedding', date: '2026-12-12', budget: 800000 },
  { id: 'e2', title: 'Haldi', type: 'Haldi', date: '2026-12-10', budget: 100000 },
  { id: 'e3', title: 'Engagement', type: 'Engagement', date: '2026-11-02', budget: 200000 },
  { id: 'e4', title: 'Mehendi', type: 'Mehendi', date: '2026-11-22', budget: 0 },
]
const expenses = [
  { eventId: 'e1', amount: 200000 },
  { eventId: 'e1', amount: 200000 },
  { eventId: 'e2', amount: 150000 },
  { eventId: 'other', amount: 999 },
]

describe('getDayLabel', () => {
  it('gives a friendly label', () => {
    expect(getDayLabel(0)).toBe('Today')
    expect(getDayLabel(1)).toBe('Tomorrow')
    expect(getDayLabel(18)).toBe('In 18 days')
    expect(getDayLabel(-1)).toBe('Yesterday')
    expect(getDayLabel(-20)).toBe('20 days ago')
  })
})

describe('buildTimeline', () => {
  const items = buildTimeline(events, expenses, today)

  it('sorts the ceremonies by date', () => {
    expect(items.map((item) => item.title)).toEqual(['Engagement', 'Mehendi', 'Haldi', 'Wedding'])
  })

  it('marks each one as past, today or upcoming', () => {
    expect(items.map((item) => item.status)).toEqual(['past', 'today', 'upcoming', 'upcoming'])
  })

  it('adds up only the expenses of that event', () => {
    const wedding = items.find((item) => item.id === 'e1')
    expect(wedding.spent).toBe(400000)
    expect(wedding.percent).toBe(50)
    expect(wedding.daysLeft).toBe(20)
  })

  it('handles over budget and a zero budget', () => {
    expect(items.find((item) => item.id === 'e2').percent).toBe(150)
    expect(items.find((item) => item.id === 'e4').percent).toBe(0)
  })
})

describe('groupByMonth', () => {
  it('puts the ceremonies under month headings in order', () => {
    const groups = groupByMonth(buildTimeline(events, expenses, today))
    expect(groups.map((group) => group.month)).toEqual(['November 2026', 'December 2026'])
    expect(groups[0].items).toHaveLength(2)
  })
})

describe('getTimelineSummary', () => {
  it('counts upcoming and past, and finds the next ceremony', () => {
    const summary = getTimelineSummary(buildTimeline(events, expenses, today))
    expect(summary).toMatchObject({ total: 4, upcoming: 3, past: 1 })
    expect(summary.next.title).toBe('Mehendi')
  })
})
