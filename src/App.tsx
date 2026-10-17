import { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
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
import { getMonthKey } from './utils/formatters';
import { setDynamicCategoriesCache } from './constants/categories';

import { Navbar } from './components/Navbar';
import { BudgetCard } from './components/BudgetCard';
import { SummaryCards } from './components/SummaryCards';
import { InsightsCard } from './components/InsightsCard';
import { ChartsSection } from './components/ChartsSection';
import { TransactionsList } from './components/TransactionsList';
import { TransactionModal } from './components/TransactionModal';
import { BudgetModal } from './components/BudgetModal';
import { AuthModal } from './components/AuthModal';
import { LoginScreen } from './components/LoginScreen';
import { CategoryModal } from './components/CategoryModal';
import { ToastContainer } from './components/Toast';
import type { ToastMessage } from './components/Toast';

import './App.css';

export function App() {
  const [currentYear, setCurrentYear] = useState<number>(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(() => new Date().getMonth());
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
    amount: 50000,
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
  const [categoryModalType, setCategoryModalType] = useState<'expense' | 'income'>('expense');
  const [forcedTxCategory, setForcedTxCategory] = useState<string | undefined>(undefined);

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

  // Load monthly summary and transactions from .NET backend
  const refreshData = useCallback(async () => {
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
        api.getBudget(monthYearKey),
      ]);

      setTransactions(txs);
      setSummary(sum);
      setBudget(bgt);
    } catch (err: any) {
      console.error('Error fetching data from API:', err);
      addToast(err.message || 'Error connecting to backend API', 'error');
    }
  }, [monthYearKey, search, category, type, payment, sortBy]);

  useEffect(() => {
    refreshData();
  }, [refreshData, user]);

  // Load dynamic categories
  const refreshCategories = useCallback(async () => {
    try {
      const cats = await api.getCategories();
      setCategories(cats);
      setDynamicCategoriesCache(cats);
    } catch (err: any) {
      console.error('Error fetching categories from API:', err);
    }
  }, []);

  useEffect(() => {
    refreshCategories();
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
    addToast('Logged out of 6-month session', 'info');
    refreshData();
    refreshCategories();
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

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await api.deleteTransaction(id);
      addToast('Transaction deleted', 'info');
      await refreshData();
    } catch (err: any) {
      addToast(err.message || 'Failed to delete transaction', 'error');
    }
  };

  const handleSaveBudget = async (amount: number) => {
    try {
      await api.setBudget(monthYearKey, amount);
      addToast('Budget updated successfully!', 'success');
      await refreshData();
    } catch (err: any) {
      addToast(err.message || 'Failed to update budget', 'error');
    }
  };

  const handleExportCsv = async () => {
    try {
      await api.exportCsv(monthYearKey);
      addToast(`Exported CSV for ${monthYearKey}`, 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to download CSV', 'error');
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
        onToggleTheme={toggleTheme}
        onExportCsv={handleExportCsv}
        onOpenCategories={() => handleOpenCategoryModal('expense')}
        onOpenAddModal={handleOpenAdd}
        onOpenAuthModal={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
      />

      {/* Monthly Budget Card */}
      <BudgetCard
        budgetLimit={summary?.budgetLimit ?? budget.amount}
        totalExpense={summary?.totalExpense ?? 0}
        budgetLeft={summary?.budgetLeft ?? budget.amount}
        usedPercentage={summary?.budgetUsedPercentage ?? 0}
        onOpenBudgetModal={() => setIsBudgetOpen(true)}
      />

      {/* 4 Summary Cards */}
      <SummaryCards
        totalIncome={summary?.totalIncome ?? 0}
        totalExpense={summary?.totalExpense ?? 0}
        netBalance={summary?.netBalance ?? 0}
        budgetLeft={summary?.budgetLeft ?? budget.amount}
        usedPercentage={summary?.budgetUsedPercentage ?? 0}
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
      />

      {/* Floating Action Button (Mobile) */}
      <button
        className="fab-btn"
        onClick={handleOpenAdd}
        title="Add Transaction"
        aria-label="Add Transaction"
      >
        <Plus size={24} />
      </button>

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
      />

      {/* Budget Modal */}
      <BudgetModal
        isOpen={isBudgetOpen}
        currentBudget={budget.amount}
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

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} />
    </div>
  );
}

export default App;
