import type { CategoryMeta } from '../types';

export const EXPENSE_CATEGORIES: CategoryMeta[] = [
  { id: 'Food', dbId: 1, label: 'Food', iconName: 'Utensils', color: '#f97316' },
  { id: 'Transport', dbId: 2, label: 'Transport', iconName: 'Car', color: '#3b82f6' },
  { id: 'Rent', dbId: 3, label: 'Rent', iconName: 'Home', color: '#8b5cf6' },
  { id: 'Bills', dbId: 4, label: 'Bills', iconName: 'Receipt', color: '#eab308' },
  { id: 'Shopping', dbId: 5, label: 'Shopping', iconName: 'ShoppingBag', color: '#ec4899' },
  { id: 'Health', dbId: 6, label: 'Health', iconName: 'HeartPulse', color: '#ef4444' },
  { id: 'Entertainment', dbId: 7, label: 'Entertainment', iconName: 'Film', color: '#06b6d4' },
  { id: 'Other', dbId: 8, label: 'Other', iconName: 'Sparkles', color: '#64748b' },
];

export const INCOME_CATEGORIES: CategoryMeta[] = [
  { id: 'Salary', dbId: 9, label: 'Salary', iconName: 'Banknote', color: '#10b981' },
  { id: 'Freelance', dbId: 10, label: 'Freelance', iconName: 'Laptop', color: '#0ea5e9' },
  { id: 'Investment', dbId: 11, label: 'Investment', iconName: 'TrendingUp', color: '#6366f1' },
  { id: 'Other', dbId: 12, label: 'Other', iconName: 'Wallet', color: '#14b8a6' },
];

let dynamicCategoriesCache: CategoryMeta[] = [];

export const setDynamicCategoriesCache = (categories: CategoryMeta[]) => {
  dynamicCategoriesCache = categories;
};

export const getDynamicCategoriesCache = (): CategoryMeta[] => {
  return dynamicCategoriesCache;
};

export const getCategoryMeta = (
  categoryId: string | number | undefined | null,
  type: 'expense' | 'income' = 'expense'
): CategoryMeta => {
  if (categoryId === undefined || categoryId === null || categoryId === '') {
    return { id: 'Other', label: 'Other', iconName: 'Sparkles', color: '#64748b' };
  }

  const cleanStr = categoryId.toString().trim().toLowerCase();
  const numId = typeof categoryId === 'number' ? categoryId : parseInt(cleanStr, 10);

  // 1. Check dynamic categories cache first by dbId or label
  const dynamicMatch = dynamicCategoriesCache.find(
    (c) =>
      (!isNaN(numId) && c.dbId === numId) ||
      c.id.toLowerCase() === cleanStr ||
      c.label.toLowerCase() === cleanStr
  );

  if (dynamicMatch) return dynamicMatch;

  // 2. Check static default list
  const list = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const match = list.find(
    (c) =>
      (!isNaN(numId) && c.dbId === numId) ||
      c.id.toLowerCase() === cleanStr ||
      c.label.toLowerCase() === cleanStr
  );
  if (match) return match;

  const fallbackList = type === 'expense' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const fallback = fallbackList.find(
    (c) =>
      (!isNaN(numId) && c.dbId === numId) ||
      c.id.toLowerCase() === cleanStr ||
      c.label.toLowerCase() === cleanStr
  );
  if (fallback) return fallback;

  return { id: cleanStr, label: categoryId.toString(), iconName: 'Sparkles', color: '#64748b' };
};
