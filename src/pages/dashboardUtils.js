// Small helpers for the user dashboard. They only do maths on data that is
// already loaded, so they are easy to test (see dashboardUtils.test.js).

export function summarizeBudget(events, expenses) {
  const eventIds = events.map((event) => event.id)
  const totalBudget = events.reduce((sum, event) => sum + Number(event.budget || 0), 0)
  // only count expenses that belong to this user's events
  const totalSpent = expenses
    .filter((expense) => eventIds.includes(expense.eventId))
    .reduce((sum, expense) => sum + Number(expense.amount || 0), 0)
  const percent = totalBudget === 0 ? 0 : Math.round((totalSpent / totalBudget) * 100)
  return { totalBudget, totalSpent, remaining: totalBudget - totalSpent, percent }
}

export function summarizeGuests(guests) {
  const count = (status) => guests.filter((guest) => guest.rsvp === status).length
  return {
    total: guests.length,
    attending: count('Attending'),
    declined: count('Declined'),
    pending: count('Pending'),
  }
}

export function summarizeTasks(tasks) {
  const done = tasks.filter((task) => task.done).length
  const percent = tasks.length === 0 ? 0 : Math.round((done / tasks.length) * 100)
  return { total: tasks.length, done, percent }
}

// today is passed in as 'YYYY-MM-DD' so the tests always get the same answer
export function getNextEvent(events, today) {
  const upcoming = events
    .filter((event) => event.date && event.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
  return upcoming[0] || null
}

export function daysUntil(date, today) {
  const oneDay = 1000 * 60 * 60 * 24
  return Math.round((new Date(date) - new Date(today)) / oneDay)
}

// The next few events that have not happened yet, soonest first
export function getUpcomingEvents(events, today, limit = 3) {
  return events
    .filter((event) => event.date && event.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, limit)
}

// The "get started" checklist: each step is done once the user has that kind of data
export function getSetupSteps({ events, guests, tasks, shortlisted }) {
  return [
    { key: 'event', title: 'Create your first event', text: 'Set the date, venue and budget.', to: '/events', done: events.length > 0 },
    { key: 'guests', title: 'Add your guests', text: 'Track who is attending.', to: '/guests', done: guests.length > 0 },
    { key: 'tasks', title: 'Build your checklist', text: 'Plan what needs to be done.', to: '/tasks', done: tasks.length > 0 },
    { key: 'vendors', title: 'Shortlist vendors', text: 'Save the ones you like.', to: '/vendors', done: shortlisted.length > 0 },
  ]
}

// The first setup step that is not done yet, or null when all of them are done.
// The dashboard shows it as the one thing to do next.
export function getNextStep(steps) {
  return steps.find((step) => !step.done) || null
}

// Only the expenses that belong to these events (the user's own events)
export function getMyExpenses(events, expenses) {
  const eventIds = events.map((event) => event.id)
  return expenses.filter((expense) => eventIds.includes(expense.eventId))
}

// "Where the money goes": the categories with the most spending, biggest first.
// share = this category's part of all spending, in percent (for the bar width).
export function getTopCategories(expenses, limit = 4) {
  const totals = {}
  expenses.forEach((expense) => {
    const category = expense.category || 'Others'
    totals[category] = (totals[category] || 0) + Number(expense.amount || 0)
  })
  const all = Object.values(totals).reduce((sum, amount) => sum + amount, 0)
  return Object.entries(totals)
    .map(([category, amount]) => ({ category, amount, share: all === 0 ? 0 : Math.round((amount / all) * 100) }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit)
}

// The guests' answers as parts of 100, for the coloured bar on the Guests card
export function getRsvpShares({ total, attending, pending, declined }) {
  if (total === 0) return { attending: 0, pending: 0, declined: 0 }
  const part = (count) => Math.round((count / total) * 100)
  return { attending: part(attending), pending: part(pending), declined: part(declined) }
}

// The user's booking requests, the soonest event date first
export function getMyBookings(bookings, userId) {
  return bookings
    .filter((booking) => String(booking.userId) === String(userId))
    .sort((a, b) => (a.eventDate || '').localeCompare(b.eventDate || ''))
}
