import { describe, it, expect } from 'vitest'
import {
  summarizeBudget, summarizeGuests, summarizeTasks, getNextEvent, daysUntil, getUpcomingEvents, getSetupSteps, getNextStep,
} from './dashboardUtils'

const events = [
  { id: 'e1', title: 'Wedding', date: '2026-12-12', budget: 800000 },
  { id: 'e2', title: 'Sangeet', date: '2026-12-10', budget: 200000 },
  { id: 'e3', title: 'Engagement', date: '2026-10-01', budget: 100000 },
]

describe('summarizeBudget', () => {
  it('adds up the budget and only the expenses of these events', () => {
    const expenses = [
      { eventId: 'e1', amount: 250000 },
      { eventId: 'e2', amount: 150000 },
      { eventId: 'someone-else', amount: 999999 },
    ]
    const result = summarizeBudget(events.slice(0, 2), expenses)
    expect(result.totalBudget).toBe(1000000)
    expect(result.totalSpent).toBe(400000)
    expect(result.remaining).toBe(600000)
    expect(result.percent).toBe(40)
  })

  it('shows a negative remaining when over budget', () => {
    const result = summarizeBudget([events[1]], [{ eventId: 'e2', amount: 250000 }])
    expect(result.remaining).toBe(-50000)
  })

  it('works with no events', () => {
    expect(summarizeBudget([], [])).toEqual({ totalBudget: 0, totalSpent: 0, remaining: 0, percent: 0 })
  })
})

describe('summarizeGuests', () => {
  it('counts each RSVP status', () => {
    const guests = [{ rsvp: 'Attending' }, { rsvp: 'Attending' }, { rsvp: 'Declined' }, { rsvp: 'Pending' }]
    expect(summarizeGuests(guests)).toEqual({ total: 4, attending: 2, declined: 1, pending: 1 })
  })
})

describe('summarizeTasks', () => {
  it('works out the percentage done', () => {
    const tasks = [{ done: true }, { done: false }, { done: false }, { done: false }]
    expect(summarizeTasks(tasks)).toEqual({ total: 4, done: 1, percent: 25 })
  })

  it('is 0% when there are no tasks', () => {
    expect(summarizeTasks([]).percent).toBe(0)
  })
})

describe('getNextEvent and daysUntil', () => {
  it('picks the closest event that has not happened yet', () => {
    expect(getNextEvent(events, '2026-11-18').title).toBe('Sangeet')
  })

  it('returns null when every event is in the past', () => {
    expect(getNextEvent(events, '2027-01-01')).toBeNull()
  })

  it('counts the days between two dates', () => {
    expect(daysUntil('2026-12-10', '2026-11-18')).toBe(22)
  })
})

describe('getUpcomingEvents', () => {
  it('gives the soonest future events first and skips past ones', () => {
    const titles = getUpcomingEvents(events, '2026-11-18').map((event) => event.title)
    expect(titles).toEqual(['Sangeet', 'Wedding'])
  })

  it('respects the limit', () => {
    expect(getUpcomingEvents(events, '2026-11-18', 1)).toHaveLength(1)
  })
})

describe('getSetupSteps', () => {
  it('marks a step done only when the user has that data', () => {
    const steps = getSetupSteps({ events: [{}], guests: [], tasks: [{}], shortlisted: [] })
    expect(steps.map((step) => step.done)).toEqual([true, false, true, false])
  })
})

describe('getNextStep', () => {
  it('gives the first step that is not done yet', () => {
    const steps = getSetupSteps({ events: [{}], guests: [], tasks: [{}], shortlisted: [] })
    expect(getNextStep(steps).key).toBe('guests')
  })

  it('gives the first step for a new user', () => {
    const steps = getSetupSteps({ events: [], guests: [], tasks: [], shortlisted: [] })
    expect(getNextStep(steps).key).toBe('event')
  })

  it('gives null when every step is done', () => {
    const steps = getSetupSteps({ events: [{}], guests: [{}], tasks: [{}], shortlisted: [{}] })
    expect(getNextStep(steps)).toBeNull()
  })
})
