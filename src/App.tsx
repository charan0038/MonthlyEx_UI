import { useState, useEffect, useCallback } from 'react';
import type {
  Transaction,
  MonthlySummary,
  CreateTransactionInput,
  MonthlyBudget,
  User,
  CategoryMeta,
} from './types';
import { api } from './services/api';
import type { FilterParams } from './services/api';
import { getMonthKey, getMonthName, formatINR } from './utils/formatters';
import { setDynamicCategoriesCache } from './constants/categories';
import { exportMonthlyPdfReport, exportYearlyPdfReport } from './utils/pdfExport';
import {
  isMonthBudgetExplicit,
  markMonthBudgetExplicit,
  isAutoBudgetTransaction,
} from './utils/budgetHelper';

import { CalendarDays, BarChart3, CalendarRange } from 'lucide-react';

import { Navbar } from './components/Navbar';
import { BudgetCard } from './components/BudgetCard';
import { SummaryCards } from './components/SummaryCards';
import { InsightsCard } from './components/InsightsCard';
import { ChartsSection } from './components/ChartsSection';
import { TransactionsList } from './components/TransactionsList';
import { YearlyDashboard } from './components/YearlyDashboard';
import { WeeklyDashboard } from './components/WeeklyDashboard';
import { TransactionModal } from './components/TransactionModal';
import { BudgetModal } from './components/BudgetModal';
import { AuthModal } from './components/AuthModal';
import { LoginScreen } from './components/LoginScreen';
import { CategoryModal } from './components/CategoryModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { ProfileModal } from './components/ProfileModal';
import { ConfirmModal } from './components/ConfirmModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { ToastContainer } from './components/Toast';
import type { ToastMessage } from './components/Toast';

import './App.css';

export function App() {
  const [currentYear, setCurrentYear] = useState<number>(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(() => new Date().getMonth());
  const [activeDashboard, setActiveDashboard] = useState<'monthly' | 'weekly' | 'yearly'>('monthly');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('kharcha_theme_v2');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });

  // Auth state
  const [user, setUser] = useState<User | null>(() => api.getStoredUser());
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);

  // Data states
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<CategoryMeta[]>([]);
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

  // Load monthly summary and transactions from .NET backend
  const refreshData = useCallback(async () => {
    if (!api.isAuthenticated() || !user) {
      setTransactions([]);
      setSummary(null);
      return;
    }

    try {
      const filterParams: FilterParams = {
        monthYear: monthYearKey,
        search,
        category,
        type,
        payment,
        sortBy,
      };

      const [txs, sum, bgt] = await Promise.all([
        api.getTransactions(filterParams),
        api.getMonthlySummary(monthYearKey),
        api.getBudget(monthYearKey).catch(() => null),
      ]);

      const isExplicit = isMonthBudgetExplicit(monthYearKey, bgt);

      // Filter out auto-created ghost budget transactions if user never explicitly clicked "Set Budget"
      const cleanTxs = txs.filter((t) => {
        if (!isExplicit && isAutoBudgetTransaction(t)) {
          // Asynchronously purge ghost transaction from backend database
          api.deleteTransaction(t.id).catch(() => {});
          return false;
        }
        return true;
      });

      setTransactions(cleanTxs);
      setSummary(sum);
      setBudget(isExplicit && bgt ? bgt : { monthYear: monthYearKey, amount: 0 });
    } catch (err: any) {
      console.error('Error fetching data from API:', err);
      // Suppress unauthorized error toast if user logged out
      if (!api.isAuthenticated()) return;
      addToast(err.message || 'Error connecting to backend API', 'error');
    }
  }, [monthYearKey, search, category, type, payment, sortBy, user]);

  useEffect(() => {
    if (user && api.isAuthenticated()) {
      refreshData();
    }
  }, [refreshData, user]);

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

  const handleCategoryDeleted = (dbId: number) => {
    setCategories((prev) => {
      const next = prev.filter((c) => c.dbId !== dbId);
      setDynamicCategoriesCache(next);
      return next;
    });
    addToast('Category deleted successfully', 'info');
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
    setTransactions([]);
    setSummary(null);
    setCategories([]);
    addToast('Logged out', 'info');
  };

  // CRUD actions
  const handleOpenAdd = () => {
    setEditingTransaction(null);
    setForcedTxCategory(undefined);
    setIsAddEditOpen(true);
  };

  const handleEdit = (tx: Transaction) => {
    setEditingTransaction(tx);
    setForcedTxCategory(undefined);
    setIsAddEditOpen(true);
  };

  const handleSaveTransaction = async (data: CreateTransactionInput, id?: string) => {
    if (id) {
      await api.updateTransaction(id, data);
      addToast('Transaction updated successfully!', 'success');
    } else {
      await api.createTransaction(data);
      addToast('Transaction created successfully!', 'success');
    }
    await refreshData();
  };

  const handleDelete = (id: string) => {
    const tx = transactions.find((t) => t.id === id);
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
          addToast(err.message || 'Failed to delete transaction', 'error');
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
        let exportTransactions = transactions;

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
            .filter((t) => t.type?.toLowerCase() === 'income')
            .reduce((s, t) => s + (Number(t.amount) || 0), 0);
          const exp = exportTransactions
            .filter((t) => t.type?.toLowerCase() === 'expense')
            .reduce((s, t) => s + (Number(t.amount) || 0), 0);
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
    if (transactions.length === 0) {
      addToast('No transactions found for this month', 'info');
      return;
    }
    if (
      !window.confirm(
        `Are you sure you want to delete all ${transactions.length} transactions for ${monthYearKey}?`
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
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onJumpToday={handleJumpToday}
        onSelectMonthYear={(y, m) => {
          setCurrentYear(y);
          setCurrentMonth(m);
        }}
        onToggleTheme={toggleTheme}
        onExportPdf={handleExportPdf}
        activeDashboard={activeDashboard}
        onOpenCategories={() => handleOpenCategoryModal('expense')}
        onOpenAddModal={handleOpenAdd}
        onOpenAuthModal={() => setIsAuthOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onLogout={handleLogout}
      />

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
      ) : (
        <main className="dashboard-content-view monthly-view" key={`monthly-${monthYearKey}`}>
          {/* Monthly Budget Card */}
          <BudgetCard
            budgetLimit={isMonthBudgetExplicit(monthYearKey, budget) ? (summary?.budgetLimit ?? budget.amount) : 0}
            totalExpense={summary?.totalExpense ?? 0}
            budgetLeft={isMonthBudgetExplicit(monthYearKey, budget) ? (summary?.budgetLeft ?? 0) : 0}
            usedPercentage={summary?.budgetUsedPercentage ?? 0}
            netBalance={summary?.netBalance ?? 0}
            isBudgetSet={isMonthBudgetExplicit(monthYearKey, budget)}
            isEndOfMonth={isEndOfMonth}
            onOpenBudgetModal={() => setIsBudgetOpen(true)}
            onCashCheckout={handleCashCheckout}
            onRolloverBalance={handleRolloverBalance}
          />

          {/* 4 Summary Cards */}
          <SummaryCards
            totalIncome={summary?.totalIncome ?? 0}
            totalExpense={summary?.totalExpense ?? 0}
            netBalance={summary?.netBalance ?? 0}
            budgetLeft={isMonthBudgetExplicit(monthYearKey, budget) ? (summary?.budgetLeft ?? 0) : 0}
            usedPercentage={summary?.budgetUsedPercentage ?? 0}
            isBudgetSet={isMonthBudgetExplicit(monthYearKey, budget)}
          />

          {/* Smart Insight Banner */}
          <InsightsCard insightMessage={summary?.insightMessage ?? ''} />

          {/* Charts Section */}
          <ChartsSection
            categoryBreakdown={summary?.categoryBreakdown ?? []}
            dailySpending={summary?.dailySpending ?? []}
            theme={theme}
          />

          {/* Transactions List & Filter Toolbar */}
          <TransactionsList
            transactions={transactions}
            categories={categories}
            search={search}
            category={category}
            type={type}
            payment={payment}
            sortBy={sortBy}
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
        onClose={() => setIsAddEditOpen(false)}
        onSave={handleSaveTransaction}
        onOpenCreateCategory={(t) => handleOpenCategoryModal(t)}
      />

      {/* Category Modal (Create / Manage Dynamic Categories) */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        initialType={categoryModalType}
        categories={categories}
        onClose={() => setIsCategoryModalOpen(false)}
        onCategoryCreated={handleCategoryCreated}
        onCategoryDeleted={handleCategoryDeleted}
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
