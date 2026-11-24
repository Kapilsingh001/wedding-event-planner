export const EXPENSE_CATEGORIES = [
  "Catering",
  "Decoration",
  "Photography",
  "Music",
  "Venue",
  "Gifts",
  "Transport",
  "Others",
];

// { Catering: 25000, Music: 8000, ... }
export const getSpentByCategory = (expenses = []) =>
  expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount);
    return acc;
  }, {});

// Sum of all planned amounts. Missing or empty plan gives 0.
export const getTotalPlanned = (plannedBudget) => {
  if (!plannedBudget) return 0;
  return Object.values(plannedBudget).reduce((sum, value) => sum + (Number(value) || 0), 0);
};

// [{ category, planned, spent, over }] for every category that has a plan or an expense
export const buildPlannedVsActual = (plannedBudget, expenses = []) => {
  const planned = plannedBudget || {};
  const spent = getSpentByCategory(expenses);

  return EXPENSE_CATEGORIES.filter(
    (category) => (Number(planned[category]) || 0) > 0 || (spent[category] || 0) > 0
  ).map((category) => {
    const plannedAmount = Number(planned[category]) || 0;
    const spentAmount = spent[category] || 0;
    return {
      category,
      planned: plannedAmount,
      spent: spentAmount,
      over: spentAmount > plannedAmount,
    };
  });
};

// ---------- Payment tracking ----------

// Old expenses have no "paid" field, so they count as paid.
export const isPaid = (expense) => expense.paid !== false;

// today and dueDate are 'YYYY-MM-DD' strings, so normal string comparison works.
export const isOverdue = (expense, today) =>
  !isPaid(expense) && Boolean(expense.dueDate) && expense.dueDate < today;

export const getPaymentSummary = (expenses = [], today) => {
  let paidTotal = 0;
  let pendingTotal = 0;
  let pendingCount = 0;
  let overdueCount = 0;

  expenses.forEach((exp) => {
    if (isPaid(exp)) {
      paidTotal += Number(exp.amount);
    } else {
      pendingTotal += Number(exp.amount);
      pendingCount += 1;
      if (isOverdue(exp, today)) overdueCount += 1;
    }
  });

  return { paidTotal, pendingTotal, pendingCount, overdueCount };
};