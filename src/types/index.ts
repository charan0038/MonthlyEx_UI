export type TransactionType = 'expense' | 'income';
export type PaymentMethod = 'UPI' | 'Cash' | 'Card';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: number;
  category?: any;
  date: string; // YYYY-MM-DD
  note?: string;
  paymentMethod: PaymentMethod;
  createdAt: string;
}

export interface CreateTransactionInput {
  type: TransactionType;
  amount: number;
  categoryId: number;
  category?: string;
  date: string;
  note?: string;
  paymentMethod: PaymentMethod;
}

export interface UpdateTransactionInput {
  type: TransactionType;
  amount: number;
  categoryId: number;
  category?: string;
  date: string;
  note?: string;
  paymentMethod: PaymentMethod;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
}

export interface DailySpending {
  day: number;
  amount: number;
}

export interface MonthlySummary {
  monthYear: string;
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  budgetLimit: number;
  budgetLeft: number;
  budgetUsedPercentage: number;
  totalTransactions: number;
  insightMessage: string;
  categoryBreakdown: CategoryBreakdown[];
  dailySpending: DailySpending[];
}

export interface MonthlyBudget {
  id?: number;
  monthYear: string;
  amount: number;
  updatedAt?: string;
}

export interface CategoryMeta {
  id: string;
  dbId?: number;
  label: string;
  name?: string;
  type?: 'expense' | 'income';
  iconName: string;
  color: string;
  isDefault?: boolean;
  createdBy?: number;
}

export interface CreateCategoryInput {
  name: string;
  type: 'expense' | 'income';
  iconName: string;
  color: string;
}

export interface User {
  id: string | number;
  fullName: string;
  mobileNumber: string;
  createdDate?: string;
  createdAt?: string;
  lastLoginAt?: string;
}


export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshTokenExpiresAt: string;
  user: User;
}

export interface LoginInput {
  mobileNumber: string;
  password: string;
}

export interface RegisterInput {
  fullName: string;
  mobileNumber: string;
  password: string;
}

