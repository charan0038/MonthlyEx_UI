export type TransactionType = 'expense' | 'income';
export type PaymentMethod = 'UPI' | 'Cash' | 'Card';

export interface SubcategoryItem {
  id: number;
  name: string;
  categoryId: number;
  isDefault: boolean;
  userId?: number | null;
  createdBy: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: number;
  category?: any;
  subcategoryId?: number | null;
  subcategory?: string | null;
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
  subcategoryId?: number | null;
  subcategory?: string | null;
  date: string;
  note?: string;
  paymentMethod: PaymentMethod;
}

export interface UpdateTransactionInput {
  type: TransactionType;
  amount: number;
  categoryId: number;
  category?: string;
  subcategoryId?: number | null;
  subcategory?: string | null;
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
  userId?: number | null;
  createdBy?: number;
  subcategories?: SubcategoryItem[];
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

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordInput {
  mobileNumber: string;
  newPassword: string;
}

export interface UpdateProfileInput {
  fullName: string;
  mobileNumber: string;
}

export interface MonthBreakdownItem {
  month: number;
  monthName: string;
  monthKey: string; // "YYYY-MM"
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  budgetLimit?: number;
  transactionCount: number;
  topCategory: string;
}

export interface SubcategoryBreakdown {
  subcategory: string;
  category: string;
  amount: number;
  percentage: number;
}

export interface YearlySummary {
  year: number;
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  savingsRate: number;
  averageMonthlyExpense: number;
  averageMonthlyIncome: number;
  totalTransactions: number;
  highestExpenseMonth: string;
  highestExpenseAmount: number;
  lowestExpenseMonth: string;
  lowestExpenseAmount: number;
  topExpenseCategory: string;
  topExpenseCategoryAmount: number;
  insightMessage: string;
  monthlyBreakdown: MonthBreakdownItem[];
  categoryBreakdown: CategoryBreakdown[];
  subcategoryBreakdown: SubcategoryBreakdown[];
}


