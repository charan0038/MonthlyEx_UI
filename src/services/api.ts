import type {
  Transaction,
  CreateTransactionInput,
  UpdateTransactionInput,
  MonthlySummary,
  MonthlyBudget,
  User,
  AuthResponse,
  LoginInput,
  RegisterInput,
  CategoryMeta,
  CreateCategoryInput,
} from '../types';

const API_BASE = '/api';

const TOKEN_KEY = 'kharcha_access_token';
const REFRESH_TOKEN_KEY = 'kharcha_refresh_token';
const USER_KEY = 'kharcha_user';

export interface FilterParams {
  monthYear?: string;
  category?: string;
  type?: string;
  payment?: string;
  search?: string;
  sortBy?: string;
}

// Custom error for Rate Limiting (429)
export class RateLimitError extends Error {
  statusCode: number;
  retryAfterSeconds: number;

  constructor(message: string, retryAfterSeconds: number = 60) {
    super(message);
    this.name = 'RateLimitError';
    this.statusCode = 429;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

// Token helper methods
export const tokenStorage = {
  getAccessToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  getUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  setAuth(data: AuthResponse) {
    localStorage.setItem(TOKEN_KEY, data.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    window.dispatchEvent(new CustomEvent('kharcha_auth_change', { detail: data.user }));
  },
  clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.dispatchEvent(new CustomEvent('kharcha_auth_change', { detail: null }));
  },
};

// Internal fetch wrapper with token injection, 401 auto-refresh, and 429 handling
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers || {});
  const token = tokenStorage.getAccessToken();

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let res = await fetch(url, { ...options, headers });

  // Handle Rate Limiting (429 Too Many Requests)
  if (res.status === 429) {
    const errData = await res.json().catch(() => ({}));
    const message = errData.message || 'Rate limit active: Too many requests. Please wait a moment.';
    const retrySec = errData.retryAfterSeconds || 60;
    throw new RateLimitError(message, retrySec);
  }

  // Handle Expired Access Token (401 Unauthorized) -> Attempt silent 6-month Refresh Token renewal
  if (res.status === 401 && !url.includes('/auth/login') && !url.includes('/auth/refresh') && !url.includes('/auth/register')) {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) {
      tokenStorage.clearAuth();
      return res;
    }

    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshRes.ok) {
          const authData: AuthResponse = await refreshRes.json();
          tokenStorage.setAuth(authData);
          isRefreshing = false;
          onRefreshed(authData.accessToken);

          // Retry current request with new token
          headers.set('Authorization', `Bearer ${authData.accessToken}`);
          return fetch(url, { ...options, headers });
        } else {
          isRefreshing = false;
          tokenStorage.clearAuth();
          return res;
        }
      } catch (err) {
        isRefreshing = false;
        tokenStorage.clearAuth();
        return res;
      }
    } else {
      // Wait for ongoing refresh and retry
      return new Promise<Response>((resolve) => {
        refreshSubscribers.push(async (newToken) => {
          headers.set('Authorization', `Bearer ${newToken}`);
          resolve(fetch(url, { ...options, headers }));
        });
      });
    }
  }

  return res;
}

export const api = {
  // --- Auth APIs ---
  async login(input: LoginInput): Promise<AuthResponse> {
    const res = await authFetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to login with mobile number');
    }

    const data: AuthResponse = await res.json();
    tokenStorage.setAuth(data);
    return data;
  },

  async register(input: RegisterInput): Promise<AuthResponse> {
    const res = await authFetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to create account');
    }

    const data: AuthResponse = await res.json();
    tokenStorage.setAuth(data);
    return data;
  },

  async logout(): Promise<void> {
    const refreshToken = tokenStorage.getRefreshToken();
    try {
      if (refreshToken) {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch {
      // Ignore network errors on logout
    } finally {
      tokenStorage.clearAuth();
    }
  },

  async getCurrentUser(): Promise<User | null> {
    const token = tokenStorage.getAccessToken();
    if (!token) return null;

    const res = await authFetch(`${API_BASE}/auth/me`);
    if (!res.ok) {
      return null;
    }
    return res.json();
  },

  getStoredUser(): User | null {
    return tokenStorage.getUser();
  },

  isAuthenticated(): boolean {
    return Boolean(tokenStorage.getAccessToken());
  },

  // --- Transactions CRUD ---
  async getTransactions(params: FilterParams = {}): Promise<Transaction[]> {
    const query = new URLSearchParams();
    if (params.monthYear) query.set('monthYear', params.monthYear);
    if (params.category && params.category !== 'ALL') query.set('category', params.category);
    if (params.type && params.type !== 'ALL') query.set('type', params.type);
    if (params.payment && params.payment !== 'ALL') query.set('payment', params.payment);
    if (params.search) query.set('search', params.search);
    if (params.sortBy) query.set('sortBy', params.sortBy);

    const res = await authFetch(`${API_BASE}/transactions?${query.toString()}`);
    if (!res.ok) throw new Error(`Failed to fetch transactions: ${res.statusText}`);
    return res.json();
  },

  async getTransaction(id: string): Promise<Transaction> {
    const res = await authFetch(`${API_BASE}/transactions/${id}`);
    if (!res.ok) throw new Error(`Transaction ${id} not found.`);
    return res.json();
  },

  async createTransaction(input: CreateTransactionInput): Promise<Transaction> {
    const res = await authFetch(`${API_BASE}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to create transaction');
    }
    return res.json();
  },

  async updateTransaction(id: string, input: UpdateTransactionInput): Promise<Transaction> {
    const res = await authFetch(`${API_BASE}/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to update transaction');
    }
    return res.json();
  },

  async deleteTransaction(id: string): Promise<void> {
    const res = await authFetch(`${API_BASE}/transactions/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete transaction');
  },

  // --- Summary & Analytics ---
  async getMonthlySummary(monthYear: string): Promise<MonthlySummary> {
    const res = await authFetch(`${API_BASE}/transactions/summary?monthYear=${encodeURIComponent(monthYear)}`);
    if (!res.ok) throw new Error('Failed to fetch monthly summary');
    return res.json();
  },

  // --- Budgets ---
  async getBudget(monthYear: string): Promise<MonthlyBudget> {
    const res = await authFetch(`${API_BASE}/budgets/${encodeURIComponent(monthYear)}`);
    if (!res.ok) throw new Error('Failed to fetch budget');
    return res.json();
  },

  async setBudget(monthYear: string, amount: number): Promise<MonthlyBudget> {
    const res = await authFetch(`${API_BASE}/budgets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ monthYear, amount }),
    });
    if (!res.ok) throw new Error('Failed to save budget');
    return res.json();
  },

  // --- CSV Export ---
  async exportCsv(monthYear: string): Promise<void> {
    const res = await authFetch(`${API_BASE}/transactions/export?monthYear=${encodeURIComponent(monthYear)}`);
    if (!res.ok) throw new Error('Failed to download CSV');

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Kharcha_${monthYear}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  // --- Seed & Clear ---
  async seedDemoData(): Promise<void> {
    const res = await authFetch(`${API_BASE}/transactions/seed`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to seed demo data');
  },

  async clearMonth(monthYear: string): Promise<void> {
    const res = await authFetch(`${API_BASE}/transactions/clear?monthYear=${encodeURIComponent(monthYear)}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to clear month data');
  },

  // --- Dynamic Categories ---
  async getCategories(type?: string): Promise<CategoryMeta[]> {
    const query = type && type !== 'ALL' ? `?type=${encodeURIComponent(type)}` : '';
    const res = await authFetch(`${API_BASE}/categories${query}`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    const data: any[] = await res.json();
    return data.map((c) => ({
      id: c.name,
      dbId: c.id,
      label: c.name,
      name: c.name,
      type: c.type as 'expense' | 'income',
      iconName: c.iconName || 'Sparkles',
      color: c.color || '#6366f1',
      isDefault: Boolean(c.isDefault),
      createdBy: c.createdBy,
    }));
  },

  async createCategory(input: CreateCategoryInput): Promise<CategoryMeta> {
    const res = await authFetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to create category');
    }
    const c = await res.json();
    return {
      id: c.name,
      dbId: c.id,
      label: c.name,
      name: c.name,
      type: c.type as 'expense' | 'income',
      iconName: c.iconName || 'Sparkles',
      color: c.color || '#6366f1',
      isDefault: Boolean(c.isDefault),
      createdBy: c.createdBy,
    };
  },

  async deleteCategory(id: number): Promise<void> {
    const res = await authFetch(`${API_BASE}/categories/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to delete category');
    }
  },
};
