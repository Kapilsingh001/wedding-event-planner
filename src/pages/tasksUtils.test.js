import { describe, it, expect } from 'vitest'
import { isPastDate, addDays, getDueInfo, countTasks } from './tasksUtils'

const today = '2026-11-20'

describe('isPastDate', () => {
  it('is true only for days before today', () => {
    expect(isPastDate('2026-11-19', today)).toBe(true)
    expect(isPastDate('2026-11-20', today)).toBe(false)
    expect(isPastDate('2026-12-01', today)).toBe(false)
  })

  it('is false when there is no date', () => {
    expect(isPastDate('', today)).toBe(false)
  })
})

describe('addDays', () => {
  it('moves forward across the end of a month', () => {
    expect(addDays('2026-11-28', 7)).toBe('2026-12-05')
  })
})

describe('getDueInfo', () => {
  it('gives friendly labels', () => {
    expect(getDueInfo('2026-11-20', today).label).toBe('Due today')
    expect(getDueInfo('2026-11-21', today).label).toBe('Due tomorrow')
    expect(getDueInfo('2026-11-25', today).label).toBe('Due in 5 days')
    expect(getDueInfo('2026-11-18', today)).toEqual({ label: 'Overdue by 2 days', status: 'overdue' })
  })

  it('shows Completed for done tasks and handles no date', () => {
    expect(getDueInfo('2026-11-18', today, true).status).toBe('done')
    expect(getDueInfo('', today).label).toBe('No due date')
  })
})

describe('countTasks', () => {
  it('counts done, pending and overdue tasks', () => {
    const tasks = [
      { done: true, dueDate: '2026-11-01' },
      { done: false, dueDate: '2026-11-10' },
      { done: false, dueDate: '2026-12-01' },
    ]
    expect(countTasks(tasks, today)).toEqual({ total: 3, done: 1, pending: 2, overdue: 1 })
  })
})
