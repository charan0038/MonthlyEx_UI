import type { WeeklySummary, DaySpendingSummary, Transaction, CategoryBreakdown } from '../types';
import { isAutoBudgetTransaction } from './budgetHelper';

/**
 * Get Monday (start of week) for a given date
 */
export function getMonday(d: Date): Date {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = date.getDay();
  // Sunday is 0; Monday is 1 ... Saturday is 6
  const diff = (day === 0 ? -6 : 1) - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Format a Date to YYYY-MM-DD
 */
export function toISODateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Calculate ISO-8601 Week Number
 */
export function getISOWeekNumber(d: Date): { year: number; week: number } {
  const date = new Date(d.getTime());
  date.setHours(0, 0, 0, 0);
  // Thursday in current week decides the year.
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  // January 4 is always in week 1.
  const week1 = new Date(date.getFullYear(), 0, 4);
  // Adjust to Thursday in week 1 and count number of weeks from date to week1.
  const weekNumber = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return { year: date.getFullYear(), week: weekNumber };
}

/**
 * Get the full 7-day week range for a given target date
 */
export function getWeekRange(d: Date) {
  const start = getMonday(d);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  const { year, week } = getISOWeekNumber(start);

  return {
    start,
    end,
    startDate: toISODateString(start),
    endDate: toISODateString(end),
    year,
    weekNumber: week,
  };
}

/**
 * Format week range for display: e.g. "19 Oct – 25 Oct 2026"
 */
export function formatWeekRangeDisplay(start: Date, end: Date): string {
  const startDay = start.getDate();
  const endDay = end.getDate();
  const startMonth = start.toLocaleDateString('en-IN', { month: 'short' });
  const endMonth = end.toLocaleDateString('en-IN', { month: 'short' });
  const startYear = start.getFullYear();
  const endYear = end.getFullYear();

  if (startYear === endYear) {
    if (startMonth === endMonth) {
      return `${startDay} – ${endDay} ${startMonth} ${startYear}`;
    }
    return `${startDay} ${startMonth} – ${endDay} ${endMonth} ${startYear}`;
  }
  return `${startDay} ${startMonth} ${startYear} – ${endDay} ${endMonth} ${endYear}`;
}

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_SHORTS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/**
 * Computes a comprehensive WeeklySummary from transactions
 */
export function computeWeeklySummary(
  allTransactions: Transaction[],
  targetDate: Date = new Date(),
  priorWeekTransactions?: Transaction[]
): WeeklySummary {
  const { start, end, startDate, endDate, year, weekNumber } = getWeekRange(targetDate);
  const formattedRange = formatWeekRangeDisplay(start, end);

  // Filter out transactions that don't belong to this week
  const weekTxs = allTransactions.filter((t) => {
    if (!t.date) return false;
    if (isAutoBudgetTransaction(t)) return false;
    return t.date >= startDate && t.date <= endDate;
  });

  // Calculate totals
  const totalIncome = weekTxs
    .filter((t) => t.type?.toLowerCase() === 'income')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const totalExpense = weekTxs
    .filter((t) => t.type?.toLowerCase() === 'expense')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const netBalance = totalIncome - totalExpense;
  const dailyAverage = Math.round(totalExpense / 7);

  // Day-by-day 7-day breakdown (Mon-Sun)
  const dailyBreakdown: DaySpendingSummary[] = [];
  for (let i = 0; i < 7; i++) {
    const curDate = new Date(start);
    curDate.setDate(start.getDate() + i);
    const dateStr = toISODateString(curDate);

    const dayTxs = weekTxs.filter((t) => t.date === dateStr);
    const dayIncome = dayTxs
      .filter((t) => t.type?.toLowerCase() === 'income')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const dayExpense = dayTxs
      .filter((t) => t.type?.toLowerCase() === 'expense')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    dailyBreakdown.push({
      date: dateStr,
      dayName: DAY_NAMES[i],
      dayShort: DAY_SHORTS[i],
      totalIncome: dayIncome,
      totalExpense: dayExpense,
      netBalance: dayIncome - dayExpense,
      transactionCount: dayTxs.length,
      transactions: dayTxs,
    });
  }

  // Peak spending day
  const sortedDays = [...dailyBreakdown].sort((a, b) => b.totalExpense - a.totalExpense);
  const highestDay = sortedDays[0];

  // Category breakdown for expenses
  const expenseTxs = weekTxs.filter((t) => t.type?.toLowerCase() === 'expense');
  const catMap = new Map<string, number>();
  for (const t of expenseTxs) {
    const catName =
      typeof t.category === 'object' && t.category?.name
        ? t.category.name
        : typeof t.category === 'string' && t.category
        ? t.category
        : 'Other';
    catMap.set(catName, (catMap.get(catName) || 0) + (Number(t.amount) || 0));
  }

  const categoryBreakdown: CategoryBreakdown[] = Array.from(catMap.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const topCategory = categoryBreakdown[0];

  // Week-over-week calculation
  let prevWeekExpense: number | undefined;
  let weekOverWeekChangePercent: number | null = null;

  if (priorWeekTransactions && priorWeekTransactions.length > 0) {
    prevWeekExpense = priorWeekTransactions
      .filter((t) => t.type?.toLowerCase() === 'expense' && !isAutoBudgetTransaction(t))
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    if (prevWeekExpense > 0) {
      weekOverWeekChangePercent = Math.round(((totalExpense - prevWeekExpense) / prevWeekExpense) * 1000) / 10;
    }
  }

  // Smart Insight message
  let insightMessage = '';
  if (totalExpense > 0) {
    const parts: string[] = [];
    if (topCategory) {
      parts.push(`${topCategory.category} was your largest weekly expense (${Math.round(topCategory.percentage)}% of total)`);
    }

    if (weekOverWeekChangePercent !== null && typeof prevWeekExpense === 'number') {
      if (weekOverWeekChangePercent > 0) {
        parts.push(`Spending is running ${weekOverWeekChangePercent}% higher than last week`);
      } else if (weekOverWeekChangePercent < 0) {
        parts.push(`Great job! Spending is ${Math.abs(weekOverWeekChangePercent)}% lower than last week`);
      }
    }

    // Weekend vs Weekday analysis
    const weekendExpense = dailyBreakdown
      .filter((d) => d.dayName === 'Saturday' || d.dayName === 'Sunday')
      .reduce((s, d) => s + d.totalExpense, 0);
    if (weekendExpense > 0 && totalExpense > 0) {
      const weekendPct = Math.round((weekendExpense / totalExpense) * 100);
      if (weekendPct >= 50) {
        parts.push(`Weekend outlays made up ${weekendPct}% of weekly expenses`);
      }
    }

    if (highestDay && highestDay.totalExpense > 0) {
      parts.push(`Peak spending occurred on ${highestDay.dayName}`);
    }

    insightMessage = parts.join('. ') + '.';
  } else {
    insightMessage = 'No transactions recorded for this week yet. Log your expenses to view insights!';
  }

  return {
    year,
    weekNumber,
    startDate,
    endDate,
    formattedRange,
    totalIncome,
    totalExpense,
    netBalance,
    dailyAverage,
    transactionCount: weekTxs.length,
    highestDayName: highestDay && highestDay.totalExpense > 0 ? highestDay.dayName : 'None',
    highestDayAmount: highestDay ? highestDay.totalExpense : 0,
    topCategory: topCategory ? topCategory.category : 'None',
    topCategoryAmount: topCategory ? topCategory.amount : 0,
    insightMessage,
    prevWeekExpense,
    weekOverWeekChangePercent,
    categoryBreakdown,
    dailyBreakdown,
    transactions: weekTxs.sort((a, b) => b.date.localeCompare(a.date)),
  };
}
