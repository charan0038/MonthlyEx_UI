import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Landmark,
  Plus,
  RefreshCw,
  CheckCircle2,
  TrendingDown,
  Calendar,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Edit2,
  Trash2,
  AlertCircle,
  Receipt,
  X,
} from 'lucide-react';
import type { EmiLoan, CreateEmiInput, UpdateEmiInput, CategoryMeta, EmiPaymentItem } from '../types';
import { api } from '../services/api';
import { formatINR } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import './EmiDashboard.css';

interface EmiDashboardProps {
  theme: 'dark' | 'light';
  categories: CategoryMeta[];
  onToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onPayEmi: (emi: EmiLoan) => void;
  onCategoriesUpdated?: () => void;
}

export const EmiDashboard: React.FC<EmiDashboardProps> = ({
  theme,
  categories,
  onToast,
  onPayEmi,
  onCategoriesUpdated,
}) => {
  const [emis, setEmis] = useState<EmiLoan[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filterTab, setFilterTab] = useState<'active' | 'completed' | 'all'>('active');

  // Modal states for Create / Edit
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingEmi, setEditingEmi] = useState<EmiLoan | null>(null);

  // Form states
  const [formName, setFormName] = useState<string>('');
  const [formTotalAmount, setFormTotalAmount] = useState<string>('');
  const [formMonthlyAmount, setFormMonthlyAmount] = useState<string>('');
  const [categoryMode, setCategoryMode] = useState<'auto' | 'existing'>('auto');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(0);
  const [formNewCategoryName, setFormNewCategoryName] = useState<string>('');
  const [formNewCategoryColor, setFormNewCategoryColor] = useState<string>('#6366f1');
  const [formStartDate, setFormStartDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [formDueDay, setFormDueDay] = useState<number>(5);
  const [formTenorMonths, setFormTenorMonths] = useState<number>(12);
  const [formNotes, setFormNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');

  // History Drawer state
  const [expandedHistoryId, setExpandedHistoryId] = useState<number | null>(null);
  const [historyCache, setHistoryCache] = useState<Record<number, EmiPaymentItem[]>>({});
  const [loadingHistoryId, setLoadingHistoryId] = useState<number | null>(null);

  // Keep a stable ref to onToast so its reference changes never trigger re-renders or fetch loops
  const onToastRef = useRef(onToast);
  useEffect(() => {
    onToastRef.current = onToast;
  }, [onToast]);

  const isFetchingRef = useRef(false);

  // Load EMIs from API safely without infinite re-trigger cycles
  const loadEmis = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsLoading(true);
    try {
      const data = await api.getEmis();
      setEmis(data);
    } catch (err: any) {
      console.error('Failed to load dues:', err);
      onToastRef.current?.(err?.message || 'Failed to load dues and commitments', 'error');
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    loadEmis();
  }, [loadEmis]);

  // Aggregate metrics
  const stats = useMemo(() => {
    const totalDebt = emis.reduce((acc, e) => acc + (e.totalAmount || 0), 0);
    const totalPaid = emis.reduce((acc, e) => acc + (e.totalPaid || 0), 0);
    const totalRemaining = emis.reduce((acc, e) => acc + (e.remainingAmount || 0), 0);
    const monthlyObligation = emis
      .filter((e) => !e.isCompleted)
      .reduce((acc, e) => acc + (e.monthlyAmount || 0), 0);

    const overallPct = totalDebt > 0 ? Math.min(100, Math.round((totalPaid / totalDebt) * 100)) : 0;

    return {
      totalDebt,
      totalPaid,
      totalRemaining,
      monthlyObligation,
      overallPct,
      activeCount: emis.filter((e) => !e.isCompleted).length,
      completedCount: emis.filter((e) => e.isCompleted).length,
    };
  }, [emis]);

  // Filtered list
  const filteredEmis = useMemo(() => {
    if (filterTab === 'active') return emis.filter((e) => !e.isCompleted);
    if (filterTab === 'completed') return emis.filter((e) => e.isCompleted);
    return emis;
  }, [emis, filterTab]);

  // Handle open create modal
  const handleOpenCreate = () => {
    setEditingEmi(null);
    setFormName('');
    setFormTotalAmount('');
    setFormMonthlyAmount('');
    setCategoryMode('auto');
    const firstExp = categories.find((c) => c.type === 'expense');
    setSelectedCategoryId(firstExp?.dbId || 0);
    setFormNewCategoryName('');
    setFormNewCategoryColor('#6366f1');
    setFormStartDate(new Date().toISOString().split('T')[0]);
    setFormDueDay(5);
    setFormTenorMonths(12);
    setFormNotes('');
    setFormError('');
    setIsModalOpen(true);
  };

  // Handle open edit modal
  const handleOpenEdit = (emi: EmiLoan) => {
    setEditingEmi(emi);
    setFormName(emi.name);
    setFormTotalAmount(emi.totalAmount.toString());
    setFormMonthlyAmount(emi.monthlyAmount.toString());
    setCategoryMode('existing');
    setSelectedCategoryId(emi.categoryId);
    setFormNewCategoryName('');
    setFormStartDate(emi.startDate || new Date().toISOString().split('T')[0]);
    setFormDueDay(emi.dueDay || 5);
    setFormTenorMonths(emi.totalTenorMonths || 12);
    setFormNotes(emi.notes || '');
    setFormError('');
    setIsModalOpen(true);
  };

  // Toggle history accordion
  const handleToggleHistory = async (emi: EmiLoan) => {
    if (expandedHistoryId === emi.id) {
      setExpandedHistoryId(null);
      return;
    }

    setExpandedHistoryId(emi.id);

    // If not in cache or want fresh
    if (!historyCache[emi.id]) {
      setLoadingHistoryId(emi.id);
      try {
        const history = await api.getEmiHistory(emi.id);
        setHistoryCache((prev) => ({ ...prev, [emi.id]: history }));
      } catch (err: any) {
        onToastRef.current?.('Failed to fetch payment history', 'error');
      } finally {
        setLoadingHistoryId(null);
      }
    }
  };

  // Handle save EMI
  const handleSaveEmi = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const name = formName.trim();
    if (!name) {
      setFormError('Please enter a name for the due/commitment.');
      return;
    }

    const totalAmt = parseFloat(formTotalAmount);
    if (isNaN(totalAmt) || totalAmt <= 0) {
      setFormError('Please enter a valid total amount or target.');
      return;
    }

    const monthlyAmt = parseFloat(formMonthlyAmount);
    if (isNaN(monthlyAmt) || monthlyAmt <= 0) {
      setFormError('Please enter a valid monthly installment / due amount.');
      return;
    }

    if (categoryMode === 'existing' && !selectedCategoryId) {
      setFormError('Please select a category to link.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingEmi) {
        const input: UpdateEmiInput = {
          name,
          totalAmount: totalAmt,
          monthlyAmount: monthlyAmt,
          categoryId: selectedCategoryId,
          startDate: formStartDate,
          dueDay: formDueDay,
          totalTenorMonths: formTenorMonths,
          notes: formNotes.trim() || undefined,
        };
        const updated = await api.updateEmi(editingEmi.id, input);
        setEmis((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        onToastRef.current?.(`Updated "${updated.name}" successfully`, 'success');
      } else {
        const input: CreateEmiInput = {
          name,
          totalAmount: totalAmt,
          monthlyAmount: monthlyAmt,
          categoryId: categoryMode === 'existing' ? selectedCategoryId : 0,
          newCategoryName: categoryMode === 'auto' ? (formNewCategoryName.trim() || `Due - ${name}`) : undefined,
          newCategoryIcon: 'CreditCard',
          newCategoryColor: formNewCategoryColor,
          startDate: formStartDate,
          dueDay: formDueDay,
          totalTenorMonths: formTenorMonths,
          notes: formNotes.trim() || undefined,
        };
        const created = await api.createEmi(input);
        setEmis((prev) => [created, ...prev]);
        onToastRef.current?.(`Created commitment "${created.name}" and linked to category "${created.categoryName}"`, 'success');
        onCategoriesUpdated?.();
      }

      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err?.message || 'Failed to save due record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete EMI
  const handleDeleteEmi = async (emi: EmiLoan) => {
    if (!window.confirm(`Are you sure you want to remove commitment "${emi.name}"? Past expense transactions in category "${emi.categoryName}" will remain untouched.`)) {
      return;
    }

    try {
      await api.deleteEmi(emi.id);
      setEmis((prev) => prev.filter((item) => item.id !== emi.id));
      onToastRef.current?.(`Deleted "${emi.name}"`, 'info');
    } catch (err: any) {
      onToastRef.current?.(err?.message || 'Failed to delete record', 'error');
    }
  };

  return (
    <div className="emi-dashboard-container" data-theme={theme}>
      {/* Top Controls Header Bar */}
      <div className="emi-header-bar">
        <div className="emi-header-left">
          <div className="emi-header-icon-box">
            <Landmark size={24} />
          </div>
          <div className="emi-header-titles">
            <h2 className="emi-main-title">
              Dues & Commitments Tracker
            </h2>
            <p className="emi-subtitle">
              Track chit funds (cheetu), hand loans, EMIs & personal borrowings with auto-deduction
            </p>
          </div>
        </div>

        <div className="emi-header-actions">
          <button
            type="button"
            className="emi-refresh-btn"
            onClick={loadEmis}
            title="Refresh Dues Data"
            disabled={isLoading}
          >
            <RefreshCw size={17} className={isLoading ? 'animate-spin' : ''} />
          </button>

          <button
            type="button"
            className="emi-add-btn"
            onClick={handleOpenCreate}
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>Add Due / Cheetu / Loan</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="emi-summary-grid">
        {/* Total Debt Card */}
        <div className="emi-stat-card stat-debt">
          <div className="emi-stat-header">
            <span className="emi-stat-title">Total Commitment</span>
            <div className="emi-stat-icon">
              <Landmark size={18} />
            </div>
          </div>
          <div className="emi-stat-value">{formatINR(stats.totalDebt)}</div>
          <div className="emi-stat-meta">
            <span>Across {emis.length} tracked commitments</span>
          </div>
        </div>

        {/* Total Paid So Far Card */}
        <div className="emi-stat-card stat-paid">
          <div className="emi-stat-header">
            <span className="emi-stat-title">Total Paid So Far</span>
            <div className="emi-stat-icon">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="emi-stat-value">{formatINR(stats.totalPaid)}</div>
          <div className="emi-stat-meta">
            <span className="emi-stat-badge badge-green">
              {stats.overallPct}% Cleared
            </span>
            <span>via category expenses</span>
          </div>
        </div>

        {/* Total Remaining Balance Card */}
        <div className="emi-stat-card stat-remaining">
          <div className="emi-stat-header">
            <span className="emi-stat-title">Remaining Balance</span>
            <div className="emi-stat-icon">
              <TrendingDown size={18} />
            </div>
          </div>
          <div className="emi-stat-value">{formatINR(stats.totalRemaining)}</div>
          <div className="emi-stat-meta">
            <span>Outstanding balance to pay</span>
          </div>
        </div>

        {/* Monthly Obligation Card */}
        <div className="emi-stat-card stat-monthly">
          <div className="emi-stat-header">
            <span className="emi-stat-title">Monthly Obligation</span>
            <div className="emi-stat-icon">
              <CreditCard size={18} />
            </div>
          </div>
          <div className="emi-stat-value">{formatINR(stats.monthlyObligation)}</div>
          <div className="emi-stat-meta">
            <span className="emi-stat-badge badge-amber">
              {stats.activeCount} Active Dues
            </span>
            <span>due each month</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="emi-filters-bar">
        <div className="emi-filter-pills" role="tablist">
          <button
            type="button"
            className={`emi-pill-btn ${filterTab === 'active' ? 'active' : ''}`}
            onClick={() => setFilterTab('active')}
          >
            <span>Active Dues</span>
            <span className="emi-pill-count">{stats.activeCount}</span>
          </button>
          <button
            type="button"
            className={`emi-pill-btn ${filterTab === 'completed' ? 'active' : ''}`}
            onClick={() => setFilterTab('completed')}
          >
            <span>Paid Off</span>
            <span className="emi-pill-count">{stats.completedCount}</span>
          </button>
          <button
            type="button"
            className={`emi-pill-btn ${filterTab === 'all' ? 'active' : ''}`}
            onClick={() => setFilterTab('all')}
          >
            <span>All Commitments</span>
            <span className="emi-pill-count">{emis.length}</span>
          </button>
        </div>
      </div>

      {/* EMI Cards Grid or Empty State */}
      {isLoading && emis.length === 0 ? (
        <div className="emi-empty-state">
          <div className="btn-spinner" style={{ width: 32, height: 32 }} />
          <p className="emi-empty-desc">Loading your dues and commitment records...</p>
        </div>
      ) : filteredEmis.length === 0 ? (
        <div className="emi-empty-state">
          <div className="emi-empty-icon">
            <Landmark size={32} />
          </div>
          <h3 className="emi-empty-title">
            {filterTab === 'completed'
              ? 'No Completed Dues Yet'
              : filterTab === 'active'
              ? 'No Active Dues or Commitments'
              : 'No Dues or Commitments Found'}
          </h3>
          <p className="emi-empty-desc">
            Save your chit fund (cheetu), hand loan, or EMI target amount here. Whenever you add an expense under its linked category,
            the balance will automatically decrease in real time!
          </p>
          <button
            type="button"
            className="emi-add-btn"
            onClick={handleOpenCreate}
            style={{ marginTop: 8 }}
          >
            <Plus size={16} />
            <span>Add Your First Due / Cheetu / Loan</span>
          </button>
        </div>
      ) : (
        <div className="emi-cards-grid">
          {filteredEmis.map((emi) => {
            const isCompleted = emi.isCompleted || emi.remainingAmount <= 0;
            const progress = Math.min(100, Math.max(0, emi.progressPercentage || 0));
            const isHistoryOpen = expandedHistoryId === emi.id;
            const historyItems = historyCache[emi.id] || emi.recentPayments || [];

            return (
              <div
                key={emi.id}
                className={`emi-card ${isCompleted ? 'completed' : ''}`}
              >
                {/* Header */}
                <div className="emi-card-header">
                  <div className="emi-card-title-group">
                    <div
                      className="emi-cat-icon-tile"
                      style={{
                        backgroundColor: emi.categoryColor
                          ? `${emi.categoryColor}22`
                          : 'rgba(99, 102, 241, 0.15)',
                        color: emi.categoryColor || '#818cf8',
                        border: `1px solid ${emi.categoryColor ? `${emi.categoryColor}44` : 'rgba(99, 102, 241, 0.3)'}`,
                      }}
                    >
                      <CategoryIcon name={emi.categoryIcon || 'CreditCard'} size={20} />
                    </div>
                    <div className="emi-card-name-wrap">
                      <h3 className="emi-card-name">{emi.name}</h3>
                      <div className="emi-card-category-tag">
                        <span>Linked to: <strong>{emi.categoryName}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="emi-card-menu-btns">
                    <button
                      type="button"
                      className="emi-icon-btn"
                      onClick={() => handleOpenEdit(emi)}
                      title="Edit commitment details"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      className="emi-icon-btn btn-delete"
                      onClick={() => handleDeleteEmi(emi)}
                      title="Delete commitment"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="emi-progress-container">
                  <div className="emi-progress-labels">
                    <span className="emi-progress-pct">
                      {isCompleted ? '100% Cleared 🎉' : `${progress.toFixed(1)}% Cleared`}
                    </span>
                    <span className="emi-progress-counts">
                      {emi.paymentsCount || 0} payments made
                    </span>
                  </div>
                  <div className="emi-progress-track">
                    <div
                      className="emi-progress-fill"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Numbers Matrix */}
                <div className="emi-matrix-grid">
                  <div className="emi-matrix-item">
                    <span className="emi-matrix-label">Remaining Balance</span>
                    <span className="emi-matrix-val highlight-remaining">
                      {formatINR(emi.remainingAmount)}
                    </span>
                  </div>
                  <div className="emi-matrix-item">
                    <span className="emi-matrix-label">Paid So Far</span>
                    <span className="emi-matrix-val highlight-paid">
                      {formatINR(emi.totalPaid)}
                    </span>
                  </div>
                  <div className="emi-matrix-item">
                    <span className="emi-matrix-label">Total Target / Debt</span>
                    <span className="emi-matrix-val">{formatINR(emi.totalAmount)}</span>
                  </div>
                  <div className="emi-matrix-item">
                    <span className="emi-matrix-label">Monthly Due</span>
                    <span className="emi-matrix-val">{formatINR(emi.monthlyAmount)}</span>
                  </div>
                </div>

                {/* Meta Strip */}
                <div className="emi-meta-strip">
                  <div className="emi-due-badge">
                    <Calendar size={13} />
                    <span>Due on {emi.dueDay}th of each month</span>
                  </div>
                  {emi.totalTenorMonths > 0 && (
                    <span>Tenor: {emi.totalTenorMonths} Mo</span>
                  )}
                </div>

                {/* Notes if any */}
                {emi.notes && (
                  <p style={{
                    fontSize: '0.76rem',
                    color: 'var(--text-muted, #94a3b8)',
                    margin: '0 0 14px 0',
                    fontStyle: 'italic',
                  }}>
                    "{emi.notes}"
                  </p>
                )}

                {/* Action Buttons */}
                <div className="emi-card-actions">
                  {!isCompleted && (
                    <button
                      type="button"
                      className="emi-pay-now-btn"
                      onClick={() => onPayEmi(emi)}
                      title={`Add expense for ₹${emi.monthlyAmount}`}
                    >
                      <Receipt size={15} />
                      <span>Pay Due ({formatINR(emi.monthlyAmount)})</span>
                    </button>
                  )}

                  <button
                    type="button"
                    className="emi-history-toggle-btn"
                    onClick={() => handleToggleHistory(emi)}
                  >
                    <span>History</span>
                    {isHistoryOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>
                </div>

                {/* History Drawer */}
                {isHistoryOpen && (
                  <div className="emi-history-drawer">
                    <h4 className="emi-history-title">
                      <span>Payments Deducted ({historyItems.length})</span>
                      {loadingHistoryId === emi.id && (
                        <div className="btn-spinner" style={{ width: 12, height: 12 }} />
                      )}
                    </h4>

                    {historyItems.length === 0 ? (
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted, #94a3b8)', margin: 0 }}>
                        No expenses logged under "{emi.categoryName}" yet. Click "Pay Due" above or add an expense in this category to start deducting.
                      </p>
                    ) : (
                      <div className="emi-history-list">
                        {historyItems.map((item, idx) => (
                          <div key={item.transactionId || idx} className="emi-history-item">
                            <div className="emi-history-left">
                              <span className="emi-history-date">{item.date}</span>
                              {item.note && (
                                <span className="emi-history-note">{item.note}</span>
                              )}
                            </div>
                            <div className="emi-history-right">
                              <span className="emi-history-amt">-{formatINR(item.amount)}</span>
                              <span className="emi-history-method">{item.paymentMethod || 'UPI'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit EMI Modal mounted directly to document.body via Portal */}
      {isModalOpen && createPortal(
        <div
          className="emi-modal-backdrop active"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSubmitting) setIsModalOpen(false);
          }}
          data-theme={theme}
        >
          <div className="emi-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="emi-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'rgba(99, 102, 241, 0.15)',
                    color: '#818cf8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Landmark size={18} />
                </div>
                <div>
                  <h3 className="emi-modal-title">
                    {editingEmi ? 'Edit Due / Commitment Details' : 'Add New Due / Commitment'}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--text-muted, #94a3b8)' }}>
                    {editingEmi ? 'Update target, monthly due amount or dates' : 'Track chit funds (cheetu), hand loans, EMIs & personal debts'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="emi-modal-close-btn"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEmi} className="emi-modal-form">
              <div className="emi-modal-body">
                {formError && (
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'rgba(244, 63, 94, 0.15)',
                    border: '1px solid rgba(244, 63, 94, 0.3)',
                    color: '#fb7185',
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <AlertCircle size={16} />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Name */}
                <div className="emi-form-group">
                  <label className="emi-form-label">
                    <span>Due / Commitment Name *</span>
                  </label>
                  <input
                    type="text"
                    className="emi-form-input"
                    placeholder="e.g. Cheetu 50k, Ramesh Hand Loan, Bike EMI, iPhone"
                    value={formName}
                    onChange={(e) => {
                      setFormName(e.target.value);
                      if (categoryMode === 'auto' && !formNewCategoryName) {
                        // Keep synced dynamically
                      }
                    }}
                    required
                  />
                </div>

                {/* Amounts Row */}
                <div className="emi-form-row">
                  <div className="emi-form-group">
                    <label className="emi-form-label">
                      <span>Total Payable / Target Amount (₹) *</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="1"
                      className="emi-form-input"
                      placeholder="e.g. 50000"
                      value={formTotalAmount}
                      onChange={(e) => setFormTotalAmount(e.target.value)}
                      required
                    />
                  </div>

                  <div className="emi-form-group">
                    <label className="emi-form-label">
                      <span>Monthly Due / Installment (₹) *</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="1"
                      className="emi-form-input"
                      placeholder="e.g. 5000"
                      value={formMonthlyAmount}
                      onChange={(e) => setFormMonthlyAmount(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Category Linking Mode */}
                {!editingEmi && (
                  <div className="emi-form-group">
                    <label className="emi-form-label">
                      <span>Category Linking Strategy</span>
                    </label>
                    <div className="emi-cat-toggle-box">
                      <button
                        type="button"
                        className={`emi-cat-toggle-btn ${categoryMode === 'auto' ? 'active' : ''}`}
                        onClick={() => setCategoryMode('auto')}
                      >
                        Auto-Create Category
                      </button>
                      <button
                        type="button"
                        className={`emi-cat-toggle-btn ${categoryMode === 'existing' ? 'active' : ''}`}
                        onClick={() => setCategoryMode('existing')}
                      >
                        Link Existing Category
                      </button>
                    </div>

                    {categoryMode === 'auto' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                        <input
                          type="text"
                          className="emi-form-input"
                          placeholder={`Category name: ${formName ? `Due - ${formName}` : 'e.g. Cheetu - 50k, Due - Ramesh, EMI - iPhone'}`}
                          value={formNewCategoryName}
                          onChange={(e) => setFormNewCategoryName(e.target.value)}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #94a3b8)' }}>Color tint:</span>
                          <input
                            type="color"
                            value={formNewCategoryColor}
                            onChange={(e) => setFormNewCategoryColor(e.target.value)}
                            style={{
                              width: '36px',
                              height: '28px',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              background: 'transparent',
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <select
                        className="emi-form-select"
                        value={selectedCategoryId}
                        onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
                        style={{ marginTop: '6px' }}
                      >
                        <option value={0}>-- Select Expense Category --</option>
                        {categories
                          .filter((c) => !c.type || c.type.toLowerCase() === 'expense')
                          .map((c) => (
                            <option key={c.dbId || c.id} value={c.dbId}>
                              {c.label}
                            </option>
                          ))}
                      </select>
                    )}
                  </div>
                )}

                {/* If Editing: Allow re-linking category */}
                {editingEmi && (
                  <div className="emi-form-group">
                    <label className="emi-form-label">
                      <span>Linked Expense Category</span>
                    </label>
                    <select
                      className="emi-form-select"
                      value={selectedCategoryId}
                      onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
                    >
                      {categories
                        .filter((c) => !c.type || c.type.toLowerCase() === 'expense')
                        .map((c) => (
                          <option key={c.dbId || c.id} value={c.dbId}>
                            {c.label}
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                {/* Dates & Tenor Row */}
                <div className="emi-form-row">
                  <div className="emi-form-group">
                    <label className="emi-form-label">
                      <span>Monthly Due Day (1-31)</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      className="emi-form-input"
                      value={formDueDay}
                      onChange={(e) => setFormDueDay(parseInt(e.target.value) || 5)}
                    />
                  </div>

                  <div className="emi-form-group">
                    <label className="emi-form-label">
                      <span>Total Tenor (Months / Dues)</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="360"
                      className="emi-form-input"
                      value={formTenorMonths}
                      onChange={(e) => setFormTenorMonths(parseInt(e.target.value) || 12)}
                    />
                  </div>
                </div>

                {/* Start Date */}
                <div className="emi-form-group">
                  <label className="emi-form-label">
                    <span>Start Date</span>
                  </label>
                  <input
                    type="date"
                    className="emi-form-input"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                  />
                </div>

                {/* Notes */}
                <div className="emi-form-group">
                  <label className="emi-form-label">
                    <span>Notes / Person or Cheetu Details (Optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    className="emi-form-textarea"
                    placeholder="e.g. Hand loan from Ramesh Anna, 20-month chit fund, HDFC Loan #123"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="emi-modal-footer">
                <button
                  type="button"
                  className="emi-btn-cancel"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="emi-btn-save"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="btn-spinner" style={{ width: 14, height: 14 }} />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingEmi ? 'Update Due Record' : 'Save Due Record'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
