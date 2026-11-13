import { useState, useEffect, useCallback, useMemo } from 'react';
import type {
  Transaction,
  MonthlySummary,
  CreateTransactionInput,
  MonthlyBudget,
  User,
  CategoryMeta,
  SubcategoryItem,
  EmiLoan,
} from './types';
import { api, isNetworkFailure } from './services/api';
import { getMonthKey, getMonthName, formatINR } from './utils/formatters';
import { getCategoryMeta, setDynamicCategoriesCache, getDynamicCategoriesCache } from './constants/categories';
import { exportMonthlyPdfReport, exportYearlyPdfReport } from './utils/pdfExport';
import {
  isMonthBudgetExplicit,
  markMonthBudgetExplicit,
  isAutoBudgetTransaction,
  isRolloverTransferOutTransaction,
  computeMonthlySummary,
} from './utils/budgetHelper';

import { CalendarDays, BarChart3, CalendarRange, Landmark } from 'lucide-react';

import { Navbar } from './components/Navbar';
import { BudgetCard } from './components/BudgetCard';
import { SummaryCards } from './components/SummaryCards';
import { InsightsCard } from './components/InsightsCard';
import { ChartsSection } from './components/ChartsSection';
import { TransactionsList } from './components/TransactionsList';
import { YearlyDashboard } from './components/YearlyDashboard';
import { WeeklyDashboard } from './components/WeeklyDashboard';
import { EmiDashboard } from './components/EmiDashboard';
import { TransactionModal } from './components/TransactionModal';
import { BudgetModal } from './components/BudgetModal';
import { AuthModal } from './components/AuthModal';
import { LoginScreen } from './components/LoginScreen';
import { CategoryModal } from './components/CategoryModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { ProfileModal } from './components/ProfileModal';
import { ConfirmModal } from './components/ConfirmModal';
import { CalculatorModal } from './components/CalculatorModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { ToastContainer } from './components/Toast';
import type { ToastMessage } from './components/Toast';

import './App.css';

export function App() {
  const [currentYear, setCurrentYear] = useState<number>(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(() => new Date().getMonth());
  const [activeDashboard, setActiveDashboard] = useState<'monthly' | 'weekly' | 'yearly' | 'emi'>('monthly');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('kharcha_theme_v2');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });

  // Auth state
  const [user, setUser] = useState<User | null>(() => api.getStoredUser());
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);

  // Data states
  const [rawTransactions, setRawTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<CategoryMeta[]>(() => getDynamicCategoriesCache());
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [budget, setBudget] = useState<MonthlyBudget>({
    monthYear: getMonthKey(currentYear, currentMonth),
    amount: 0,
  });

  // Filter states
  const [search, setSearch] = useState<string>('');
  const [category, setCategory] = useState<string>('ALL');
  const [type, setType] = useState<string>('ALL');
  const [payment, setPayment] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('date-desc');

  // Modal states
  const [isAddEditOpen, setIsAddEditOpen] = useState<boolean>(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isBudgetOpen, setIsBudgetOpen] = useState<boolean>(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState<boolean>(false);
  const [calculatorPrefillAmount, setCalculatorPrefillAmount] = useState<string>('');
  const [txInitialNote, setTxInitialNote] = useState<string>('');
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [categoryModalType, setCategoryModalType] = useState<'expense' | 'income'>('expense');
  const [forcedTxCategory, setForcedTxCategory] = useState<string | undefined>(undefined);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'rollover' | 'cash' | 'danger';
    title: string;
    subtitle?: string;
    amount?: number;
    fromMonth?: string;
    toMonth?: string;
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    type: 'rollover',
    title: '',
    onConfirm: async () => {},
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Server cold-start and connection status
  const [isServerWakingUp, setIsServerWakingUp] = useState<boolean>(false);
  const [isOfflineOrWaking, setIsOfflineOrWaking] = useState<boolean>(false);

  // Warm up the backend & Neon DB as soon as App loads + start periodic keep-alive
  useEffect(() => {
    api.warmup();
    const stopKeepAlive = api.startKeepAlive(7);
    return () => stopKeepAlive();
  }, []);

  const addToast = (message: string, toastType: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 4);
    setToasts((prev) => [...prev, { id, message, type: toastType }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  // Sync theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('kharcha_theme_v2', theme);
  }, [theme]);

  // Auth sync on initial mount
  useEffect(() => {
    if (api.isAuthenticated()) {
      api.getCurrentUser().then((currentUser) => {
        if (currentUser) setUser(currentUser);
      });
    }

    const handleAuthChange = (e: any) => {
      setUser(e.detail);
    };

    window.addEventListener('kharcha_auth_change', handleAuthChange);
    return () => window.removeEventListener('kharcha_auth_change', handleAuthChange);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const monthYearKey = getMonthKey(currentYear, currentMonth);

  // Month-end calculation: settlement options only occur at the end of the month
  const today = new Date();
  const currentActualYear = today.getFullYear();
  const currentActualMonth = today.getMonth();
  const currentActualDay = today.getDate();
  const daysInViewMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const isPastMonth =
    currentYear < currentActualYear ||
    (currentYear === currentActualYear && currentMonth < currentActualMonth);

  const isCurrentMonth =
    currentYear === currentActualYear && currentMonth === currentActualMonth;

  // Occurs during the final days of the month (last 3 days) or for past completed months
  const isMonthEnd = isCurrentMonth && currentActualDay >= daysInViewMonth - 3;
  const isEndOfMonth = isPastMonth || isMonthEnd;

  // Track if surplus balance has already been rolled over to next month
  const isRolloverTransferred = useMemo(() => {
    if (!user) return false;
    return localStorage.getItem(`kharcha_rollover_done_${user.id}_${monthYearKey}`) === 'true';
  }, [user?.id, monthYearKey]);

  // Hydrate from localStorage cache immediately on month or user change (Instant 0ms display)
  useEffect(() => {
    if (!user) return;
    try {
      const cacheKey = `kharcha_cache_${user.id}_${monthYearKey}`;
      const cachedStr = localStorage.getItem(cacheKey);
      if (cachedStr) {
        const cached = JSON.parse(cachedStr);
        if (Array.isArray(cached.transactions)) {
          setRawTransactions(cached.transactions);
        }
        if (cached.summary) {
          setSummary(cached.summary);
        }
        if (cached.budget) {
          setBudget(cached.budget);
        }
      } else {
        // If this specific month hasn't been cached yet, clear previous month's lingering state
        setRawTransactions([]);
        setSummary(null);
        setBudget({ monthYear: monthYearKey, amount: 0 });
      }
    } catch {
      // Ignore cache read failures
    }
  }, [user?.id, monthYearKey]);

  // Instant client-side filtering (0ms latency, 100% offline-ready, immune to network drops)
  const displayedTransactions = useMemo(() => {
    let list = [...rawTransactions];

    // Filter by search
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter((t) => {
        const catKey = t.categoryId || (typeof t.category === 'object' ? t.category?.name : t.category);
        const meta = getCategoryMeta(catKey, t.type);
        const catName = typeof t.category === 'object' ? (t.category?.name || '') : (t.category || '');
        const paymentStr = t.paymentMethod || (t as any).payment || '';
        const noteStr = t.note || '';
        const subcatStr = t.subcategory || '';
        const amountStr = t.amount !== undefined ? t.amount.toString() : '';

        return (
          noteStr.toLowerCase().includes(q) ||
          meta.label.toLowerCase().includes(q) ||
          catName.toLowerCase().includes(q) ||
          subcatStr.toLowerCase().includes(q) ||
          paymentStr.toLowerCase().includes(q) ||
          amountStr.includes(q)
        );
      });
    }

    // Filter by category (matches by label name, dbId, categoryId, or raw category string)
    if (category && category !== 'ALL') {
      const target = category.trim().toLowerCase();
      list = list.filter((t) => {
        const catKey = t.categoryId || (typeof t.category === 'object' ? t.category?.name : t.category);
        const meta = getCategoryMeta(catKey, t.type);
        const catName = typeof t.category === 'object' ? (t.category?.name || '') : (t.category || '');

        return (
          meta.label.toLowerCase() === target ||
          meta.id.toLowerCase() === target ||
          (meta.dbId !== undefined && meta.dbId.toString() === target) ||
          catName.toLowerCase() === target ||
          (t.categoryId !== undefined && t.categoryId !== null && t.categoryId.toString() === target)
        );
      });
    }

    // Filter by type
    if (type && type !== 'ALL') {
      const targetType = type.trim().toLowerCase();
      list = list.filter((t) => (t.type || '').toLowerCase() === targetType);
    }

    // Filter by payment (matches paymentMethod or payment)
    if (payment && payment !== 'ALL') {
      const targetPayment = payment.trim().toLowerCase();
      list = list.filter((t) => {
        const p = (t.paymentMethod || (t as any).payment || '').toLowerCase();
        return p === targetPayment;
      });
    }

    // Sort
    list.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (sortBy === 'date-asc') return dateA - dateB;
      if (sortBy === 'amount-desc') return (Number(b.amount) || 0) - (Number(a.amount) || 0);
      if (sortBy === 'amount-asc') return (Number(a.amount) || 0) - (Number(b.amount) || 0);
      return dateB - dateA;
    });

    return list;
  }, [rawTransactions, search, category, type, payment, sortBy]);

  // Load monthly summary and transactions from .NET backend
  const refreshData = useCallback(async (isSilent = false) => {
    if (!api.isAuthenticated() || !user) {
      setRawTransactions([]);
      setSummary(null);
      return;
    }

    // If request takes longer than 2.5s (free tier cold start), show status banner
    const wakeTimer = setTimeout(() => {
      setIsServerWakingUp(true);
    }, 2500);

    try {
      const [txs, bgt] = await Promise.all([
        api.getTransactions({ monthYear: monthYearKey }),
        api.getBudget(monthYearKey).catch(() => null),
      ]);

      const isExplicit = isMonthBudgetExplicit(monthYearKey, bgt);

      // Filter out auto-created ghost budget transactions if user never explicitly clicked "Set Budget"
      // and purge legacy rollover transfer-out fake expense transactions so user expenses are purely real spending!
      const cleanTxs = txs.filter((t) => {
        if (!isExplicit && isAutoBudgetTransaction(t)) {
          // Asynchronously purge ghost transaction from backend database
          api.deleteTransaction(t.id).catch(() => {});
          return false;
        }
        if (isRolloverTransferOutTransaction(t)) {
          // Asynchronously purge legacy fake expense rollover transaction from backend database!
          api.deleteTransaction(t.id).catch(() => {});
          if (user) {
            try {
              localStorage.setItem(`kharcha_rollover_done_${user.id}_${monthYearKey}`, 'true');
            } catch {}
          }
          return false;
        }
        return true;
      });

      const effectiveBudget = isExplicit && bgt ? bgt : { monthYear: monthYearKey, amount: 0 };
      const sum = computeMonthlySummary(monthYearKey, cleanTxs, effectiveBudget);

      setRawTransactions(cleanTxs);
      setSummary(sum);
      setBudget(effectiveBudget);
      setIsOfflineOrWaking(false);

      // Save to localStorage cache so next app opening is instantaneous (0ms)
      try {
        const cacheKey = `kharcha_cache_${user.id}_${monthYearKey}`;
        localStorage.setItem(
          cacheKey,
          JSON.stringify({
            transactions: cleanTxs,
            summary: sum,
            budget: effectiveBudget,
            updatedAt: Date.now(),
          })
        );
      } catch {
        // Ignore storage quota errors
      }
    } catch (err: any) {
      console.warn('Backend sync notice:', err);
      // Suppress unauthorized error toast if user logged out
      if (!api.isAuthenticated()) return;

      if (isNetworkFailure(err)) {
        setIsOfflineOrWaking(true);
        // Do NOT show an aggressive red "Failed to fetch" toast!
        // Only show an info toast if the user has zero data cached
        if (rawTransactions.length === 0 && !isSilent) {
          addToast('Connecting to cloud server... Cloud server is waking up', 'info');
        }
      } else {
        addToast(err.message || 'Error connecting to backend API', 'error');
      }
    } finally {
      clearTimeout(wakeTimer);
      setIsServerWakingUp(false);
    }
  }, [monthYearKey, user, rawTransactions.length]);

  useEffect(() => {
    if (user && api.isAuthenticated()) {
      refreshData();
    }
  }, [refreshData, user]);

  // Auto-revalidate when browser connection is restored
  useEffect(() => {
    const handleOnline = () => {
      if (api.isAuthenticated()) {
        refreshData(true);
      }
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [refreshData]);

  // Load dynamic categories
  const refreshCategories = useCallback(async () => {
    if (!api.isAuthenticated() || !user) {
      setCategories([]);
      return;
    }

    try {
      const cats = await api.getCategories();
      setCategories(cats);
      setDynamicCategoriesCache(cats);
    } catch (err: any) {
      console.error('Error fetching categories from API:', err);
    }
  }, [user]);

  useEffect(() => {
    if (user && api.isAuthenticated()) {
      refreshCategories();
    }
  }, [refreshCategories, user]);

  const handleOpenCategoryModal = (initialType: 'expense' | 'income' = 'expense') => {
    setCategoryModalType(initialType);
    setIsCategoryModalOpen(true);
  };

  const handleCategoryCreated = (newCat: CategoryMeta) => {
    setCategories((prev) => {
      const next = [...prev.filter((c) => c.label !== newCat.label), newCat];
      setDynamicCategoriesCache(next);
      return next;
    });
    setForcedTxCategory(newCat.label);
    addToast(`Category "${newCat.label}" created dynamically!`, 'success');
  };

  const handleSubcategoryCreated = (categoryId: number, newSub: SubcategoryItem) => {
    setCategories((prev) => {
      const next = prev.map((c) => {
        if (c.dbId === categoryId) {
          const subs = c.subcategories || [];
          if (!subs.some((s) => s.id === newSub.id || s.name.toLowerCase() === newSub.name.toLowerCase())) {
            return { ...c, subcategories: [...subs, newSub] };
          }
        }
        return c;
      });
      setDynamicCategoriesCache(next);
      return next;
    });
    addToast(`Subcategory "${newSub.name}" added successfully!`, 'success');
  };

  const handleCategoryDeleted = (dbId: number) => {
    setCategories((prev) => {
      const next = prev.filter((c) => c.dbId !== dbId);
      setDynamicCategoriesCache(next);
      return next;
    });
    addToast('Category deleted successfully', 'info');
  };

  const handleCategoryUpdated = (updatedCat: CategoryMeta) => {
    setCategories((prev) => {
      const next = prev.map((c) => (c.dbId === updatedCat.dbId ? updatedCat : c));
      setDynamicCategoriesCache(next);
      return next;
    });
    refreshCategories();
    refreshData();
    addToast(`Category "${updatedCat.label}" updated successfully!`, 'success');
  };

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleJumpToday = () => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    addToast('Jumped to current month', 'info');
  };

  // Auth handlers
  const handleAuthSuccess = (loggedUser: User, msg: string) => {
    setUser(loggedUser);
    addToast(msg, 'success');
    refreshData();
    refreshCategories();
  };

  const handleLogout = async () => {
    await api.logout();
    setUser(null);
    setRawTransactions([]);
    setSummary(null);
    setCategories([]);
    addToast('Logged out', 'info');
  };

  // CRUD actions
  const handleOpenAdd = (amountToPrefill?: string) => {
    setEditingTransaction(null);
    setForcedTxCategory(undefined);
    setTxInitialNote('');
    if (typeof amountToPrefill === 'string') {
      setCalculatorPrefillAmount(amountToPrefill);
    }
    setIsAddEditOpen(true);
  };

  const handlePayEmi = (emi: EmiLoan) => {
    setForcedTxCategory(emi.categoryName);
    setCalculatorPrefillAmount(emi.monthlyAmount.toString());
    setTxInitialNote(`${emi.name} - Monthly EMI`);
    setEditingTransaction(null);
    setIsAddEditOpen(true);
  };

  const handleApplyCalculatorResult = (calculatedAmount: number) => {
    const formattedStr = calculatedAmount.toString();
    setCalculatorPrefillAmount(formattedStr);
    setIsCalculatorOpen(false);
    addToast(`Calculated ₹${calculatedAmount.toLocaleString('en-IN')} applied!`, 'success');
    if (!isAddEditOpen) {
      setEditingTransaction(null);
      setForcedTxCategory(undefined);
      setIsAddEditOpen(true);
    }
  };

  const handleEdit = (tx: Transaction) => {
    setEditingTransaction(tx);
    setForcedTxCategory(undefined);
    setIsAddEditOpen(true);
  };

  const handleSaveTransaction = async (data: CreateTransactionInput, id?: string) => {
    try {
      if (id) {
        await api.updateTransaction(id, data);
        addToast('Transaction updated successfully!', 'success');
      } else {
        await api.createTransaction(data);
        addToast('Transaction created successfully!', 'success');
      }
      await refreshData();
    } catch (err: any) {
      const msg = isNetworkFailure(err)
        ? 'Could not save transaction: Cloud server is waking up or offline. Please retry in a moment.'
        : (err.message || 'Failed to save transaction');
      addToast(msg, 'error');
    }
  };

  const handleDelete = (id: string) => {
    const tx = rawTransactions.find((t) => t.id === id);
    setConfirmModal({
      isOpen: true,
      type: 'danger',
      title: 'Delete Transaction',
      subtitle: tx
        ? `Are you sure you want to permanently delete "${tx.note || tx.category?.name || 'Transaction'}"?`
        : 'Are you sure you want to permanently delete this transaction?',
      amount: tx?.amount,
      confirmText: 'Delete Transaction',
      cancelText: 'Cancel',
      isLoading: false,
      onConfirm: async () => {
        try {
          setConfirmModal((prev) => ({ ...prev, isLoading: true }));
          await api.deleteTransaction(id);
          addToast('Transaction deleted', 'info');
          setConfirmModal((prev) => ({ ...prev, isOpen: false, isLoading: false }));
          await refreshData();
        } catch (err: any) {
          setConfirmModal((prev) => ({ ...prev, isLoading: false }));
          const msg = isNetworkFailure(err)
            ? 'Could not delete transaction: Cloud server is waking up or offline. Please retry.'
            : (err.message || 'Failed to delete transaction');
          addToast(msg, 'error');
        }
      },
    });
  };

  const handleSaveBudget = async (amount: number, addToIncome: boolean = true) => {
    try {
      await api.setBudget(monthYearKey, amount, addToIncome);
      markMonthBudgetExplicit(monthYearKey);

      if (!addToIncome) {
        // If user explicitly chose NOT to add to total income, remove any auto-created budget income transaction
        const currentTxs = await api.getTransactions({ monthYear: monthYearKey });
        const budgetTxs = currentTxs.filter((t) => isAutoBudgetTransaction(t));
        for (const bTx of budgetTxs) {
          await api.deleteTransaction(bTx.id).catch(() => {});
        }
      }

      setBudget({ monthYear: monthYearKey, amount, id: 1 });
      addToast(
        addToIncome
          ? `Budget set to ${formatINR(amount)} and added to Total Income!`
          : `Budget set to ${formatINR(amount)}!`,
        'success'
      );
      await refreshData();
    } catch (err: any) {
      addToast(err.message || 'Failed to update budget', 'error');
    }
  };

  const handleCashCheckout = () => {
    const remaining = summary?.netBalance ?? 0;
    if (remaining <= 0) {
      addToast('No surplus net balance available to checkout.', 'info');
      return;
    }

    const [y, m] = monthYearKey.split('-');
    const currentMonthName = getMonthName(parseInt(m, 10) - 1, parseInt(y, 10));

    setConfirmModal({
      isOpen: true,
      type: 'cash',
      title: 'Cash Checkout',
      subtitle: `Withdraw your surplus monthly net balance as physical cash. This will record a cash outflow for ${currentMonthName}.`,
      amount: remaining,
      fromMonth: currentMonthName,
      confirmText: `Checkout ${formatINR(remaining)} Cash`,
      cancelText: 'Cancel',
      isLoading: false,
      onConfirm: async () => {
        try {
          setConfirmModal((prev) => ({ ...prev, isLoading: true }));
          await api.cashCheckout(monthYearKey, remaining);
          addToast(`Cash checkout of ${formatINR(remaining)} completed!`, 'success');
          setConfirmModal((prev) => ({ ...prev, isOpen: false, isLoading: false }));
          await refreshData();
        } catch (err: any) {
          setConfirmModal((prev) => ({ ...prev, isLoading: false }));
          addToast(err.message || 'Failed to complete cash checkout', 'error');
        }
      },
    });
  };

  const handleRolloverBalance = () => {
    const remaining = summary?.netBalance ?? 0;
    if (remaining <= 0) {
      addToast('No surplus net balance available to carry forward.', 'info');
      return;
    }

    const [y, m] = monthYearKey.split('-');
    const currentMonthName = getMonthName(parseInt(m, 10) - 1, parseInt(y, 10));
    const nextDate = new Date(parseInt(y, 10), parseInt(m, 10), 1);
    const nextMonthName = getMonthName(nextDate.getMonth(), nextDate.getFullYear());

    setConfirmModal({
      isOpen: true,
      type: 'rollover',
      title: 'Add to Next Month Opening Balance',
      subtitle: `Transfer your surplus net balance from ${currentMonthName} directly to ${nextMonthName}'s opening balance as incoming funds.`,
      amount: remaining,
      fromMonth: currentMonthName,
      toMonth: nextMonthName,
      confirmText: `Transfer ${formatINR(remaining)} to ${nextMonthName}`,
      cancelText: 'Cancel',
      isLoading: false,
      onConfirm: async () => {
        try {
          setConfirmModal((prev) => ({ ...prev, isLoading: true }));
          await api.rolloverBalance(monthYearKey, remaining);
          if (user) {
            try {
              localStorage.setItem(`kharcha_rollover_done_${user.id}_${monthYearKey}`, 'true');
            } catch {}
          }
          addToast(
            `Transferred ${formatINR(remaining)} to ${nextMonthName} as opening income!`,
            'success'
          );
          setConfirmModal((prev) => ({ ...prev, isOpen: false, isLoading: false }));
          await refreshData();
        } catch (err: any) {
          setConfirmModal((prev) => ({ ...prev, isLoading: false }));
          addToast(err.message || 'Failed to carry forward balance', 'error');
        }
      },
    });
  };

  const handleExportPdf = async () => {
    try {
      if (activeDashboard === 'yearly') {
        const yearSum = await api.getYearlySummary(currentYear);
        exportYearlyPdfReport({
          year: currentYear,
          user,
          summary: yearSum,
        });
        addToast(`Exported Annual PDF Report for ${currentYear}!`, 'success');
      } else {
        // Fetch authoritative fresh data for this month (unfiltered by UI search/category)
        let exportSummary = summary;
        let exportBudgetAmount = budget.amount;
        let exportTransactions: Transaction[] = rawTransactions;

        try {
          const [freshSum, freshBgt, allTxs] = await Promise.all([
            api.getMonthlySummary(monthYearKey),
            api.getBudget(monthYearKey),
            api.getTransactions({ monthYear: monthYearKey, sortBy: 'date-desc' }),
          ]);
          if (freshSum) exportSummary = freshSum;
          const isExplicit = isMonthBudgetExplicit(monthYearKey, freshBgt);
          exportBudgetAmount = isExplicit && freshBgt?.amount ? freshBgt.amount : 0;
          if (allTxs && allTxs.length > 0) {
            exportTransactions = allTxs.filter((t) => !(!isExplicit && isAutoBudgetTransaction(t)));
          }
        } catch {
          // Fall back gracefully to active state if network fails
        }

        // If exportSummary has 0s or is null but transactions exist, recalculate totals directly
        if (exportTransactions.length > 0) {
          const inc = exportTransactions
            .filter((t: Transaction) => t.type?.toLowerCase() === 'income')
            .reduce((s: number, t: Transaction) => s + (Number(t.amount) || 0), 0);
          const exp = exportTransactions
            .filter((t: Transaction) => t.type?.toLowerCase() === 'expense')
            .reduce((s: number, t: Transaction) => s + (Number(t.amount) || 0), 0);
          const net = inc - exp;
          const bLeft = exportBudgetAmount - exp;

          if (
            !exportSummary ||
            (exportSummary.totalIncome === 0 && exportSummary.totalExpense === 0 && (inc > 0 || exp > 0))
          ) {
            exportSummary = {
              monthYear: monthYearKey,
              totalIncome: inc,
              totalExpense: exp,
              netBalance: net,
              budgetLimit: exportBudgetAmount,
              budgetLeft: bLeft,
              budgetUsedPercentage: exportBudgetAmount > 0 ? (exp / exportBudgetAmount) * 100 : 0,
              totalTransactions: exportTransactions.length,
              insightMessage: '',
              categoryBreakdown: exportSummary?.categoryBreakdown || [],
              dailySpending: exportSummary?.dailySpending || [],
            };
          }
        }

        exportMonthlyPdfReport({
          monthYear: monthYearKey,
          user,
          summary: exportSummary,
          budgetAmount: exportBudgetAmount,
          transactions: exportTransactions,
        });
        addToast(
          `Exported Monthly PDF Statement for ${getMonthName(currentMonth, currentYear)}!`,
          'success'
        );
      }
    } catch (err: any) {
      addToast(err.message || 'Failed to generate PDF Report', 'error');
    }
  };

  const handleClearMonth = async () => {
    if (rawTransactions.length === 0) {
      addToast('No transactions found for this month', 'info');
      return;
    }
    if (
      !window.confirm(
        `Are you sure you want to delete all ${rawTransactions.length} transactions for ${monthYearKey}?`
      )
    ) {
      return;
    }

    try {
      await api.clearMonth(monthYearKey);
      addToast(`Cleared transactions for ${monthYearKey}`, 'info');
      await refreshData();
    } catch (err: any) {
      addToast(err.message || 'Failed to clear transactions', 'error');
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('ALL');
    setType('ALL');
    setPayment('ALL');
    setSortBy('date-desc');
    addToast('Filters reset', 'info');
  };

  if (!user) {
    return (
      <div className="login-screen-root">
        <LoginScreen
          onSuccess={handleAuthSuccess}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
        <ToastContainer toasts={toasts} />
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Navigation Header */}
      <Navbar
        currentYear={currentYear}
        currentMonth={currentMonth}
        theme={theme}
        user={user}
        activeDashboard={activeDashboard}
        isOfflineOrWaking={isOfflineOrWaking || isServerWakingUp}
        onReconnect={() => refreshData()}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onJumpToday={handleJumpToday}
        onSelectMonthYear={(y, m) => {
          setCurrentYear(y);
          setCurrentMonth(m);
        }}
        onToggleTheme={toggleTheme}
        onExportPdf={handleExportPdf}
        onOpenCategories={() => handleOpenCategoryModal('expense')}
        onOpenCalculator={() => setIsCalculatorOpen(true)}
        onOpenAddModal={handleOpenAdd}
        onOpenAuthModal={() => setIsAuthOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onLogout={handleLogout}
      />

      {/* Cloud Server Cold-Start Warmup Notice */}
      {(isServerWakingUp || isOfflineOrWaking) && (
        <div
          style={{
            maxWidth: '1280px',
            margin: '0.75rem auto',
            padding: '8px 16px',
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            fontSize: '0.86rem',
            color: '#f59e0b',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          <div
            className="btn-spinner"
            style={{
              width: 14,
              height: 14,
              borderWidth: 2,
              borderColor: '#f59e0b',
              borderTopColor: 'transparent',
            }}
          />
          <span>
            {isServerWakingUp
              ? 'Waking up cloud server (Render & Neon DB)...'
              : 'Using offline cached data. Server may be spinning up.'}
          </span>
          <button
            type="button"
            onClick={() => refreshData()}
            style={{
              background: 'rgba(245, 158, 11, 0.25)',
              border: '1px solid rgba(245, 158, 11, 0.45)',
              color: '#fcd34d',
              borderRadius: '6px',
              padding: '3px 10px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
          >
            Retry Sync
          </button>
        </div>
      )}

      {/* Dashboard Switcher Bar */}
      <div className="dashboard-switcher-container">
        <div className="dashboard-switcher-pills" role="tablist" aria-label="Dashboard views">
          <button
            type="button"
            role="tab"
            aria-selected={activeDashboard === 'monthly'}
            className={`dashboard-switcher-btn ${activeDashboard === 'monthly' ? 'active' : ''}`}
            onClick={() => setActiveDashboard('monthly')}
            id="tab-monthly-dashboard"
          >
            <CalendarDays size={15} />
            <span className="dashboard-tab-title-full">Monthly Tracker</span>
            <span className="dashboard-tab-title-short">Monthly</span>
            <span className="dashboard-tab-sub">({getMonthName(currentMonth, currentYear)})</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeDashboard === 'weekly'}
            className={`dashboard-switcher-btn ${activeDashboard === 'weekly' ? 'active' : ''}`}
            onClick={() => setActiveDashboard('weekly')}
            id="tab-weekly-dashboard"
          >
            <CalendarRange size={15} />
            <span className="dashboard-tab-title-full">Weekly Report</span>
            <span className="dashboard-tab-title-short">Weekly</span>
            <span className="dashboard-tab-badge">7-Day</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeDashboard === 'emi'}
            className={`dashboard-switcher-btn ${activeDashboard === 'emi' ? 'active' : ''}`}
            onClick={() => setActiveDashboard('emi')}
            id="tab-emi-dashboard"
          >
            <Landmark size={15} />
            <span className="dashboard-tab-title-full">EMI & Loan Tracker</span>
            <span className="dashboard-tab-title-short">EMI</span>
            <span className="dashboard-tab-badge">Payoff</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeDashboard === 'yearly'}
            className={`dashboard-switcher-btn ${activeDashboard === 'yearly' ? 'active' : ''}`}
            onClick={() => setActiveDashboard('yearly')}
            id="tab-yearly-dashboard"
          >
            <BarChart3 size={15} />
            <span className="dashboard-tab-title-full">Overall Year Dashboard</span>
            <span className="dashboard-tab-title-short">Annual</span>
            <span className="dashboard-tab-badge">{currentYear}</span>
          </button>
        </div>
      </div>

      {activeDashboard === 'weekly' ? (
        <main className="dashboard-content-view weekly-view" key="weekly-dashboard-view">
          <WeeklyDashboard
            theme={theme}
            user={user}
            categories={categories}
            onToast={addToast}
            onOpenAddModal={handleOpenAdd}
          />
        </main>
      ) : activeDashboard === 'yearly' ? (
        <main className="dashboard-content-view yearly-view" key={`yearly-${currentYear}`}>
          <YearlyDashboard
            initialYear={currentYear}
            theme={theme}
            user={user}
            onNavigateToMonth={(y, m) => {
              setCurrentYear(y);
              setCurrentMonth(m);
              setActiveDashboard('monthly');
              addToast(`Jumped to ${getMonthName(m, y)} ${y}`, 'info');
            }}
            onToast={addToast}
          />
        </main>
      ) : activeDashboard === 'emi' ? (
        <main className="dashboard-content-view emi-view" key="emi-dashboard-view">
          <EmiDashboard
            theme={theme}
            categories={categories}
            onToast={addToast}
            onPayEmi={handlePayEmi}
            onCategoriesUpdated={refreshCategories}
          />
        </main>
      ) : (
        <main className="dashboard-content-view monthly-view" key={`monthly-${monthYearKey}`}>
          {/* Monthly Budget Card */}
          <BudgetCard
            budgetLimit={
              summary?.budgetLimit ?? Math.max(budget.amount, summary?.totalIncome ?? 0)
            }
            totalExpense={summary?.totalExpense ?? 0}
            budgetLeft={
              summary?.budgetLeft ?? (Math.max(budget.amount, summary?.totalIncome ?? 0) - (summary?.totalExpense ?? 0))
            }
            usedPercentage={summary?.budgetUsedPercentage ?? 0}
            netBalance={summary?.netBalance ?? 0}
            isBudgetSet={
              isMonthBudgetExplicit(monthYearKey, budget) || (summary?.totalIncome ?? 0) > 0 || (summary?.budgetLimit ?? 0) > 0 || budget.amount > 0
            }
            isEndOfMonth={isEndOfMonth}
            isRolloverTransferred={isRolloverTransferred}
            theme={theme}
            onOpenBudgetModal={() => setIsBudgetOpen(true)}
            onCashCheckout={handleCashCheckout}
            onRolloverBalance={handleRolloverBalance}
          />

          {/* 4 Summary Cards */}
          <SummaryCards
            totalIncome={summary?.totalIncome ?? 0}
            totalExpense={summary?.totalExpense ?? 0}
            netBalance={summary?.netBalance ?? 0}
            budgetLeft={
              summary?.budgetLeft ?? (Math.max(budget.amount, summary?.totalIncome ?? 0) - (summary?.totalExpense ?? 0))
            }
            usedPercentage={summary?.budgetUsedPercentage ?? 0}
            isBudgetSet={
              isMonthBudgetExplicit(monthYearKey, budget) || (summary?.totalIncome ?? 0) > 0 || (summary?.budgetLimit ?? 0) > 0 || budget.amount > 0
            }
            theme={theme}
          />

          {/* Smart Insight Banner */}
          <InsightsCard insightMessage={summary?.insightMessage ?? ''} theme={theme} />

          {/* Charts Section */}
          <ChartsSection
            categoryBreakdown={summary?.categoryBreakdown ?? []}
            dailySpending={summary?.dailySpending ?? []}
            theme={theme}
          />

          {/* Transactions List & Filter Toolbar */}
          <TransactionsList
            transactions={displayedTransactions}
            categories={categories}
            search={search}
            category={category}
            type={type}
            payment={payment}
            sortBy={sortBy}
            theme={theme}
            onSearchChange={setSearch}
            onCategoryChange={setCategory}
            onTypeChange={setType}
            onPaymentChange={setPayment}
            onSortByChange={setSortBy}
            onResetFilters={handleResetFilters}
            onClearMonth={handleClearMonth}
            onEditTransaction={handleEdit}
            onDeleteTransaction={handleDelete}
            onOpenAddModal={handleOpenAdd}
            onOpenCategoryManager={() => handleOpenCategoryModal('expense')}
            onExportPdf={handleExportPdf}
          />
        </main>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeDashboard={activeDashboard}
        onChangeDashboard={setActiveDashboard}
        onOpenAddModal={handleOpenAdd}
        onOpenCategories={() => handleOpenCategoryModal('expense')}
      />

      {/* Transaction Modal (Add/Edit) */}
      <TransactionModal
        isOpen={isAddEditOpen}
        editingTransaction={editingTransaction}
        defaultMonthKey={monthYearKey}
        categories={categories}
        forcedCategory={forcedTxCategory}
        initialAmount={calculatorPrefillAmount}
        initialNote={txInitialNote}
        onClose={() => {
          setIsAddEditOpen(false);
          setCalculatorPrefillAmount('');
          setTxInitialNote('');
          setForcedTxCategory(undefined);
        }}
        onSave={handleSaveTransaction}
        onOpenCreateCategory={(t) => handleOpenCategoryModal(t)}
        onSubcategoryCreated={handleSubcategoryCreated}
        onOpenCalculator={() => setIsCalculatorOpen(true)}
      />

      {/* Financial Calculator Modal */}
      <CalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        onApplyResult={handleApplyCalculatorResult}
        initialValue={calculatorPrefillAmount ? parseFloat(calculatorPrefillAmount) : undefined}
      />

      {/* Category Modal (Create / Manage Dynamic Categories) */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        initialType={categoryModalType}
        categories={categories}
        onClose={() => setIsCategoryModalOpen(false)}
        onCategoryCreated={handleCategoryCreated}
        onCategoryDeleted={handleCategoryDeleted}
        onCategoryUpdated={handleCategoryUpdated}
        onRefreshCategories={refreshCategories}
      />

      {/* Budget Modal */}
      <BudgetModal
        isOpen={isBudgetOpen}
        currentBudget={isMonthBudgetExplicit(monthYearKey, budget) ? budget.amount : 0}
        monthYear={monthYearKey}
        onClose={() => setIsBudgetOpen(false)}
        onSave={handleSaveBudget}
      />

      {/* Auth Modal (Login / Register with Mobile & Password) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Change Password Modal (For logged-in users) */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        onSuccess={(msg) => addToast(msg, 'success')}
      />

      {/* Profile & Security Settings Modal (Edit username, phone & change password) */}
      <ProfileModal
        isOpen={isProfileOpen}
        user={user}
        onClose={() => setIsProfileOpen(false)}
        onSuccess={(updatedUser) => {
          setUser(updatedUser);
          addToast(`Profile updated! Welcome, ${updatedUser.fullName}`, 'success');
        }}
        onPasswordChanged={(msg) => addToast(msg, 'success')}
      />

      {/* Confirmation & Settlement Modal (Rollover, Cash Checkout, Delete) */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        type={confirmModal.type}
        title={confirmModal.title}
        subtitle={confirmModal.subtitle}
        amount={confirmModal.amount}
        fromMonth={confirmModal.fromMonth}
        toMonth={confirmModal.toMonth}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        isLoading={confirmModal.isLoading}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} />
    </div>
  );
}

export default App;
