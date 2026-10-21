import type { MonthlyBudget, MonthlySummary, Transaction, CategoryBreakdown, DailySpending } from '../types';

const STORAGE_KEY = 'kharcha_explicit_budgets_v1';

export const getExplicitBudgetMonths = (): Set<string> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
};

export const markMonthBudgetExplicit = (monthKey: string): void => {
  try {
    const set = getExplicitBudgetMonths();
    set.add(monthKey);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
  } catch (err) {
    console.warn('Failed to save explicit budget key', err);
  }
};

export const unmarkMonthBudgetExplicit = (monthKey: string): void => {
  try {
    const set = getExplicitBudgetMonths();
    set.delete(monthKey);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
  } catch (err) {
    console.warn('Failed to unmark explicit budget key', err);
  }
};

export const isMonthBudgetExplicit = (monthKey: string, bgt?: MonthlyBudget | null): boolean => {
  // If explicitly set by user clicking "Set Budget" (stored in localStorage)
  if (getExplicitBudgetMonths().has(monthKey)) {
    return true;
  }
  // If backend has a custom non-default amount (> 0 and not the legacy 10000 default)
  if (bgt && typeof bgt.id === 'number' && bgt.id > 0 && Number(bgt.amount) > 0 && Number(bgt.amount) !== 10000) {
    return true;
  }
  return false;
};

export const isAutoBudgetTransaction = (tx: Transaction): boolean => {
  const isIncome = tx.type?.toLowerCase() === 'income';
  const note = (tx.note || '').trim();
  return (
    isIncome &&
    (note === 'Monthly Budget' ||
      note === 'Monthly Budget Allocation' ||
      note === 'Opening Budget')
  );
};

export const computeMonthlySummary = (
  monthYear: string,
  txs: Transaction[],
  budget?: MonthlyBudget | null
): MonthlySummary => {
  const isExplicit = isMonthBudgetExplicit(monthYear, budget);

  // Filter out any ghost budget transaction if user never explicitly clicked "Set Budget"
  const cleanTxs = txs.filter((t) => {
    if (!isExplicit && isAutoBudgetTransaction(t)) {
      return false;
    }
    return true;
  });

  const totalIncome = cleanTxs
    .filter((t) => t.type?.toLowerCase() === 'income')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const totalExpense = cleanTxs
    .filter((t) => t.type?.toLowerCase() === 'expense')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const netBalance = totalIncome - totalExpense;

  const budgetLimit = isExplicit ? Number(budget?.amount) || 0 : 0;
  const budgetLeft = budgetLimit > 0 ? budgetLimit - totalExpense : 0;
  const budgetUsedPercentage = budgetLimit > 0 ? (totalExpense / budgetLimit) * 100 : 0;

  // Category breakdown for expenses
  const expenseTxs = cleanTxs.filter((t) => t.type?.toLowerCase() === 'expense');
  const catMap = new Map<string, number>();
  for (const t of expenseTxs) {
    const catName =
      (typeof t.category === 'object' && t.category?.name)
        ? t.category.name
        : (typeof t.category === 'string' && t.category)
        ? t.category
        : 'Other';
    catMap.set(catName, (catMap.get(catName) || 0) + (Number(t.amount) || 0));
  }

  const categoryBreakdown: CategoryBreakdown[] = Array.from(catMap.entries())
    .map(([cat, amount]) => ({
      category: cat,
      amount,
      percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  // Daily spending trend
  const [yStr, mStr] = monthYear.split('-');
  const y = parseInt(yStr, 10) || new Date().getFullYear();
  const m = parseInt(mStr, 10) || new Date().getMonth() + 1;
  const daysInMonth = new Date(y, m, 0).getDate();

  const dailyMap: { [day: number]: number } = {};
  for (let d = 1; d <= daysInMonth; d++) {
    dailyMap[d] = 0;
  }
  for (const t of expenseTxs) {
    if (t.date) {
      const parts = t.date.split('-');
      if (parts.length >= 3) {
        const d = parseInt(parts[2], 10);
        if (d && dailyMap[d] !== undefined) {
          dailyMap[d] += Number(t.amount) || 0;
        }
      }
    }
  }

  const dailySpending: DailySpending[] = Object.entries(dailyMap).map(([dayStr, amount]) => ({
    day: parseInt(dayStr, 10),
    amount,
  }));

  // Insight message
  let insightMessage = '';
  if (categoryBreakdown.length > 0) {
    const top = categoryBreakdown[0];
    insightMessage = `${top.category} is your largest expense (${Math.round(top.percentage)}% of total).`;
  } else {
    insightMessage = 'No expenses recorded yet for this month. Start logging transactions to unlock insights!';
  }

  return {
    monthYear,
    totalIncome,
    totalExpense,
    netBalance,
    budgetLimit,
    budgetLeft,
    budgetUsedPercentage,
    totalTransactions: cleanTxs.length,
    insightMessage,
    categoryBreakdown,
    dailySpending,
  };
};
