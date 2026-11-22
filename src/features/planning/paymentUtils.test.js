import { describe, it, expect } from 'vitest';
import { isPaid, isOverdue, getPaymentSummary } from './budgetUtils';
import { expenseSchema } from './schemas';

const TODAY = '2026-11-22';

describe('isPaid', () => {
  it('is true for an old expense without the paid field', () => {
    expect(isPaid({ amount: 100 })).toBe(true);
  });

  it('is true when paid is true', () => {
    expect(isPaid({ amount: 100, paid: true })).toBe(true);
  });

  it('is false when paid is false', () => {
    expect(isPaid({ amount: 100, paid: false })).toBe(false);
  });
});

describe('isOverdue', () => {
  it('is true for an unpaid expense with a due date before today', () => {
    expect(isOverdue({ paid: false, dueDate: '2026-11-21' }, TODAY)).toBe(true);
  });

  it('is false when the due date is today', () => {
    expect(isOverdue({ paid: false, dueDate: '2026-11-22' }, TODAY)).toBe(false);
  });

  it('is false when the due date is in the future', () => {
    expect(isOverdue({ paid: false, dueDate: '2026-12-01' }, TODAY)).toBe(false);
  });

  it('is false when the expense is paid, even with an old due date', () => {
    expect(isOverdue({ paid: true, dueDate: '2026-11-01' }, TODAY)).toBe(false);
  });
});

describe('getPaymentSummary', () => {
  it('adds up paid, pending, pending count and overdue count', () => {
    const expenses = [
      { amount: 100, paid: true },
      { amount: 200, paid: false, dueDate: '2026-12-01' },
      { amount: 300, paid: false, dueDate: '2026-11-01' },
    ];

    expect(getPaymentSummary(expenses, TODAY)).toEqual({
      paidTotal: 100,
      pendingTotal: 500,
      pendingCount: 2,
      overdueCount: 1,
    });
  });
});

describe('expenseSchema', () => {
  const base = { category: 'Catering', amount: 25000, date: '2026-11-01' };

  it('fails for a Pending expense without a due date', () => {
    const result = expenseSchema.safeParse({ ...base, status: 'Pending', dueDate: '' });
    expect(result.success).toBe(false);
    expect(result.error.issues[0].path).toContain('dueDate');
  });

  it('passes for a Pending expense with a due date', () => {
    const result = expenseSchema.safeParse({ ...base, status: 'Pending', dueDate: '2026-12-01' });
    expect(result.success).toBe(true);
  });

  it('passes for a Paid expense without a due date', () => {
    const result = expenseSchema.safeParse({ ...base, status: 'Paid' });
    expect(result.success).toBe(true);
  });
});