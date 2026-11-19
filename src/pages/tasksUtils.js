// Small helpers for the Tasks page. Dates are 'YYYY-MM-DD' strings (the format
// of <input type="date">), and today is passed in so the tests always get the same answer.

const ONE_DAY = 1000 * 60 * 60 * 24

export function isPastDate(date, today) {
  return Boolean(date) && date < today
}

export function addDays(date, days) {
  const result = new Date(new Date(date).getTime() + days * ONE_DAY)
  return result.toISOString().slice(0, 10)
}

// A friendly label for the due date, plus a status used for the colour
export function getDueInfo(dueDate, today, done = false) {
  if (done) return { label: 'Completed', status: 'done' }
  if (!dueDate) return { label: 'No due date', status: 'none' }

  const days = Math.round((new Date(dueDate) - new Date(today)) / ONE_DAY)
  if (days < 0) return { label: `Overdue by ${-days} ${days === -1 ? 'day' : 'days'}`, status: 'overdue' }
  if (days === 0) return { label: 'Due today', status: 'soon' }
  if (days === 1) return { label: 'Due tomorrow', status: 'soon' }
  if (days <= 7) return { label: `Due in ${days} days`, status: 'soon' }
  return { label: `Due in ${days} days`, status: 'later' }
}

export function countTasks(tasks, today) {
  const done = tasks.filter((task) => task.done).length
  const overdue = tasks.filter((task) => !task.done && isPastDate(task.dueDate, today)).length
  return { total: tasks.length, done, pending: tasks.length - done, overdue }
}
