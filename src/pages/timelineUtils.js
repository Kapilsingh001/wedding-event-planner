// Helpers for the Wedding Timeline page. Dates are 'YYYY-MM-DD' strings, and today
// is passed in so the tests always get the same answer.

const ONE_DAY = 1000 * 60 * 60 * 24

function daysBetween(date, today) {
  return Math.round((new Date(date) - new Date(today)) / ONE_DAY)
}

// "In 18 days", "Tomorrow", "Today", "5 days ago"
export function getDayLabel(daysLeft) {
  if (daysLeft === 0) return 'Today'
  if (daysLeft === 1) return 'Tomorrow'
  if (daysLeft === -1) return 'Yesterday'
  if (daysLeft > 0) return `In ${daysLeft} days`
  return `${-daysLeft} days ago`
}

// One timeline entry per event: adds what was spent, the days left and a status
export function buildTimeline(events, expenses, today) {
  return events
    .filter((event) => event.date)
    .map((event) => {
      const spent = expenses
        .filter((expense) => expense.eventId === event.id)
        .reduce((sum, expense) => sum + Number(expense.amount || 0), 0)
      const budget = Number(event.budget || 0)
      const daysLeft = daysBetween(event.date, today)
      return {
        ...event,
        spent,
        percent: budget === 0 ? 0 : Math.round((spent / budget) * 100),
        daysLeft,
        status: daysLeft < 0 ? 'past' : daysLeft === 0 ? 'today' : 'upcoming',
      }
    })
    .sort((a, b) => a.date.localeCompare(b.date))
}

// Groups the entries under month headings: [{ month: 'December 2026', items: [...] }]
export function groupByMonth(items) {
  const groups = []
  items.forEach((item) => {
    const month = new Date(item.date + 'T00:00').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    const last = groups[groups.length - 1]
    if (last && last.month === month) {
      last.items.push(item)
    } else {
      groups.push({ month, items: [item] })
    }
  })
  return groups
}

export function getTimelineSummary(items) {
  const upcoming = items.filter((item) => item.status !== 'past')
  return {
    total: items.length,
    upcoming: upcoming.length,
    past: items.length - upcoming.length,
    next: upcoming[0] || null,
  }
}
