import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Printer,
  FileText,
  Calendar,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wallet,
  Clock,
  PieChart,
  BarChart3,
  Search,
  CheckCircle2,
  CalendarRange,
} from 'lucide-react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import type { WeeklySummary, User, CategoryMeta } from '../types';
import { api } from '../services/api';
import { formatINR } from '../utils/formatters';
import { exportWeeklyPdfReport } from '../utils/pdfExport';
import { CategoryIcon } from './CategoryIcon';
import { getCategoryMeta } from '../constants/categories';
import './WeeklyDashboard.css';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement
);

interface WeeklyDashboardProps {
  initialDate?: Date;
  theme: 'dark' | 'light';
  user: User | null;
  categories: CategoryMeta[];
  onToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onOpenAddModal?: () => void;
}

export const WeeklyDashboard: React.FC<WeeklyDashboardProps> = ({
  initialDate = new Date(),
  theme,
  user,
  categories,
  onToast,
  onOpenAddModal,
}) => {
  const [targetDate, setTargetDate] = useState<Date>(initialDate);
  const [summary, setSummary] = useState<WeeklySummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'expense' | 'income'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const isDark = theme === 'dark';
  const gridColor = isDark ? 'rgba(36, 47, 70, 0.6)' : 'rgba(226, 232, 240, 0.8)';
  const textColor = isDark ? '#94a3b8' : '#64748b';

  // Fetch weekly data whenever targetDate changes
  const loadWeekData = useCallback(async (date: Date) => {
    setIsLoading(true);
    try {
      const data = await api.getWeeklySummary(date);
      setSummary(data);
    } catch (err: any) {
      console.error('Error fetching weekly summary:', err);
      onToast?.(err.message || 'Failed to load weekly report', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [onToast]);

  useEffect(() => {
    loadWeekData(targetDate);
  }, [loadWeekData, targetDate]);

  // Navigation handlers
  const handlePrevWeek = () => {
    setTargetDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() - 7);
      return next;
    });
    setSelectedDay(null);
  };

  const handleNextWeek = () => {
    setTargetDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + 7);
      return next;
    });
    setSelectedDay(null);
  };

  const handleCurrentWeek = () => {
    setTargetDate(new Date());
    setSelectedDay(null);
  };

  const handleDateJump = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const parts = e.target.value.split('-');
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        setTargetDate(d);
        setSelectedDay(null);
      }
    }
  };

  // Print Report Handler: Triggers native browser print with dedicated CSS
  const handlePrint = () => {
    onToast?.('Preparing printable weekly statement...', 'info');
    setTimeout(() => {
      window.print();
    }, 250);
  };

  // PDF Export Handler: Generates executive PDF using jsPDF & autoTable
  const handleExportPdf = () => {
    if (!summary) {
      onToast?.('No summary data available to export', 'error');
      return;
    }
    try {
      exportWeeklyPdfReport({ summary, user });
      onToast?.(
        `Exported Weekly PDF Statement (Week ${summary.weekNumber})!`,
        'success'
      );
    } catch (err: any) {
      console.error('PDF export error:', err);
      onToast?.(err.message || 'Failed to generate PDF', 'error');
    }
  };

  // Filtered transactions for the itemized list
  const filteredTransactions = useMemo(() => {
    if (!summary?.transactions) return [];
    let list = summary.transactions;

    // Filter by selected day
    if (selectedDay) {
      list = list.filter((t) => t.date === selectedDay);
    }

    // Filter by transaction type
    if (typeFilter !== 'ALL') {
      list = list.filter((t) => t.type?.toLowerCase() === typeFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((t) => {
        const catName =
          typeof t.category === 'object' && t.category?.name
            ? t.category.name.toLowerCase()
            : typeof t.category === 'string'
            ? t.category.toLowerCase()
            : '';
        const subName = (t.subcategory || '').toLowerCase();
        const note = (t.note || '').toLowerCase();
        const pay = (t.paymentMethod || '').toLowerCase();
        return catName.includes(q) || subName.includes(q) || note.includes(q) || pay.includes(q);
      });
    }

    return list;
  }, [summary, selectedDay, typeFilter, searchQuery]);

  // Daily Bar Chart Data (Mon - Sun)
  const barChartData = useMemo(() => {
    const days = summary?.dailyBreakdown || [];
    const labels = days.map((d) => d.dayShort);
    const expenseData = days.map((d) => d.totalExpense);
    const incomeData = days.map((d) => d.totalIncome);

    return {
      labels,
      datasets: [
        {
          label: 'Expenses',
          data: expenseData,
          backgroundColor: 'rgba(239, 68, 68, 0.75)',
          hoverBackgroundColor: 'rgba(239, 68, 68, 0.95)',
          borderRadius: 6,
          borderSkipped: false,
        },
        {
          label: 'Income',
          data: incomeData,
          backgroundColor: 'rgba(16, 185, 129, 0.75)',
          hoverBackgroundColor: 'rgba(16, 185, 129, 0.95)',
          borderRadius: 6,
          borderSkipped: false,
        },
      ],
    };
  }, [summary]);

  const barChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: textColor,
          boxWidth: 12,
          font: { size: 11.5, weight: '600' },
        },
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.98)',
        titleColor: isDark ? '#f8fafc' : '#0f172a',
        bodyColor: isDark ? '#cbd5e1' : '#334155',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (context: any) => {
            const val = context.parsed.y || 0;
            return ` ${context.dataset.label}: ${formatINR(val)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: textColor, font: { size: 11, weight: '600' } },
      },
      y: {
        grid: { color: gridColor },
        ticks: {
          color: textColor,
          font: { size: 10.5 },
          callback: (value: number) => `₹${value.toLocaleString('en-IN')}`,
        },
      },
    },
  };

  // Category Doughnut Chart Data
  const doughnutChartData = useMemo(() => {
    const cats = summary?.categoryBreakdown || [];
    const labels = cats.map((c) => c.category);
    const data = cats.map((c) => c.amount);

    const defaultColors = [
      '#6366f1', '#ec4899', '#3b82f6', '#10b981', '#f59e0b',
      '#8b5cf6', '#14b8a6', '#f97316', '#06b6d4', '#84cc16'
    ];

    const backgroundColors = cats.map((c, i) => {
      const meta = getCategoryMeta(c.category, 'expense');
      return meta?.color || defaultColors[i % defaultColors.length];
    });

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: backgroundColors,
          borderWidth: isDark ? 2 : 1,
          borderColor: isDark ? '#1e293b' : '#ffffff',
          hoverOffset: 6,
        },
      ],
    };
  }, [summary, categories, isDark]);

  const doughnutOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: textColor,
          boxWidth: 11,
          font: { size: 11 },
          padding: 12,
        },
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.98)',
        titleColor: isDark ? '#f8fafc' : '#0f172a',
        bodyColor: isDark ? '#cbd5e1' : '#334155',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (context: any) => {
            const val = context.parsed || 0;
            const total = summary?.totalExpense || 1;
            const pct = Math.round((val / total) * 100);
            return ` ${context.label}: ${formatINR(val)} (${pct}%)`;
          },
        },
      },
    },
    cutout: '68%',
  };

  const todayStr = new Date().toISOString().substring(0, 10);

  return (
    <div
      className="weekly-dashboard-container"
      id="printable-weekly-report"
      style={{ opacity: isLoading ? 0.75 : 1, transition: 'opacity 0.2s' }}
    >
      {/* Print-Only Header (Appears only on paper or native browser print preview) */}
      <div className="weekly-print-only-header">
        <h1 className="print-banner-title">VESSEL  |  WEEKLY FINANCIAL REPORT</h1>
        <div className="print-banner-meta">
          <span>
            <strong>Statement Period:</strong> {summary?.formattedRange || ''} (Week {summary?.weekNumber || 0}, {summary?.year || 0})
          </span>
          <span>
            <strong>Account Holder:</strong> {user?.fullName || 'Personal'} {user?.mobileNumber ? `(+91 ${user.mobileNumber})` : ''}
          </span>
          <span>
            <strong>Generated:</strong> {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Control Header Bar */}
      <div className="weekly-controls-bar">
        <div className="weekly-selector-group">
          <button
            type="button"
            className="weekly-nav-btn"
            onClick={handlePrevWeek}
            title="Previous Week"
            aria-label="Previous Week"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="weekly-title-card">
            <div className="weekly-title-row">
              <span className="weekly-badge">Week {summary?.weekNumber || '—'}</span>
              <span className="weekly-range-text">
                {summary?.formattedRange || 'Loading week...'}
              </span>
            </div>
            <span className="weekly-year-text">
              {summary ? `Year ${summary.year} • 7 Days Performance` : 'Calculating...'}
            </span>
          </div>

          <button
            type="button"
            className="weekly-nav-btn"
            onClick={handleNextWeek}
            title="Next Week"
            aria-label="Next Week"
          >
            <ChevronRight size={18} />
          </button>

          <button
            type="button"
            className="weekly-quick-today-btn"
            onClick={handleCurrentWeek}
            title="Jump to current week"
          >
            This Week
          </button>

          {/* Jump to specific Date */}
          <div className="weekly-date-jump" title="Select a date to jump directly to its week">
            <label htmlFor="weekly-jump-input">
              <Calendar size={13} /> Jump:
            </label>
            <input
              id="weekly-jump-input"
              type="date"
              className="weekly-date-input"
              onChange={handleDateJump}
            />
          </div>
        </div>

        {/* Action Buttons: Print Report & Download PDF */}
        <div className="weekly-actions-group">
          <button
            type="button"
            className="weekly-action-btn weekly-print-btn"
            onClick={handlePrint}
            title="Print weekly report (Browser print dialog / paper / PDF)"
            id="btn-print-weekly-report"
          >
            <Printer size={16} />
            <span>Print Report</span>
          </button>

          <button
            type="button"
            className="weekly-action-btn weekly-pdf-btn"
            onClick={handleExportPdf}
            title="Download executive PDF document"
            id="btn-export-weekly-pdf"
          >
            <FileText size={16} />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards Grid */}
      <div className="weekly-kpi-grid">
        {/* Total Expenses */}
        <div className="weekly-kpi-card">
          <div className="weekly-kpi-icon-wrap expense">
            <TrendingDown size={22} />
          </div>
          <div className="weekly-kpi-body">
            <span className="weekly-kpi-label">Weekly Outflow</span>
            <span className="weekly-kpi-value">
              {formatINR(summary?.totalExpense || 0)}
            </span>
            {summary?.weekOverWeekChangePercent !== null && summary?.weekOverWeekChangePercent !== undefined ? (
              <span
                className={`weekly-kpi-trend ${
                  summary.weekOverWeekChangePercent > 0 ? 'higher' : 'lower'
                }`}
              >
                {summary.weekOverWeekChangePercent > 0 ? '+' : ''}
                {summary.weekOverWeekChangePercent}% vs prior week
              </span>
            ) : (
              <span className="weekly-kpi-trend neutral">Baseline week</span>
            )}
          </div>
        </div>

        {/* Total Income */}
        <div className="weekly-kpi-card">
          <div className="weekly-kpi-icon-wrap income">
            <TrendingUp size={22} />
          </div>
          <div className="weekly-kpi-body">
            <span className="weekly-kpi-label">Weekly Income</span>
            <span className="weekly-kpi-value">
              {formatINR(summary?.totalIncome || 0)}
            </span>
            <span className="weekly-kpi-trend neutral">
              {summary?.transactions?.filter((t) => t.type === 'income').length || 0} incoming entries
            </span>
          </div>
        </div>

        {/* Net Weekly Balance */}
        <div className="weekly-kpi-card">
          <div className="weekly-kpi-icon-wrap balance">
            <Wallet size={22} />
          </div>
          <div className="weekly-kpi-body">
            <span className="weekly-kpi-label">Weekly Net Surplus</span>
            <span
              className="weekly-kpi-value"
              style={{
                color: (summary?.netBalance || 0) >= 0 ? '#10b981' : '#f87171',
              }}
            >
              {(summary?.netBalance || 0) >= 0 ? '+ ' : ''}
              {formatINR(summary?.netBalance || 0)}
            </span>
            <span className="weekly-kpi-trend neutral">
              {(summary?.netBalance || 0) >= 0 ? 'Savings retained' : 'Deficit spent'}
            </span>
          </div>
        </div>

        {/* Daily Average Spending */}
        <div className="weekly-kpi-card">
          <div className="weekly-kpi-icon-wrap average">
            <Clock size={22} />
          </div>
          <div className="weekly-kpi-body">
            <span className="weekly-kpi-label">Daily Average</span>
            <span className="weekly-kpi-value">
              {formatINR(summary?.dailyAverage || 0)}
            </span>
            <span className="weekly-kpi-trend neutral">per day (across 7 days)</span>
          </div>
        </div>

        {/* Peak Spending Day */}
        <div className="weekly-kpi-card">
          <div className="weekly-kpi-icon-wrap peak">
            <BarChart3 size={22} />
          </div>
          <div className="weekly-kpi-body">
            <span className="weekly-kpi-label">Peak Spending Day</span>
            <span className="weekly-kpi-value" style={{ fontSize: '17px' }}>
              {summary?.highestDayName !== 'None' ? summary?.highestDayName : '—'}
            </span>
            <span className="weekly-kpi-trend neutral">
              {summary && summary.highestDayAmount > 0
                ? formatINR(summary.highestDayAmount)
                : 'No peak record'}
            </span>
          </div>
        </div>
      </div>

      {/* Smart Weekly Insight Banner */}
      {summary?.insightMessage && (
        <div className="weekly-insight-banner">
          <Sparkles size={20} className="weekly-insight-icon" />
          <div>
            <span className="weekly-insight-strong">Weekly Financial Takeaway: </span>
            <span>{summary.insightMessage}</span>
          </div>
        </div>
      )}

      {/* 7-Day Performance Cards (Monday through Sunday) */}
      <div className="weekly-days-section">
        <div className="weekly-section-header">
          <div className="weekly-section-title">
            <CalendarRange size={16} />
            <span>7-Day Performance Overview</span>
          </div>
          {selectedDay && (
            <button
              type="button"
              className="weekly-quick-today-btn"
              onClick={() => setSelectedDay(null)}
              style={{ fontSize: '11.5px', padding: '3px 8px' }}
            >
              Clear Day Filter
            </button>
          )}
        </div>

        <div className="weekly-days-grid">
          {(summary?.dailyBreakdown || []).map((day) => {
            const isSelected = selectedDay === day.date;
            const isToday = day.date === todayStr;

            return (
              <div
                key={day.date}
                className={`weekly-day-card ${isSelected ? 'selected' : ''} ${
                  isToday ? 'today' : ''
                }`}
                onClick={() => setSelectedDay(isSelected ? null : day.date)}
                title={`Click to filter transactions for ${day.dayName} (${day.date})`}
              >
                <span className="weekly-day-name">{day.dayShort}</span>
                <span className="weekly-day-date">
                  {new Date(day.date).getDate()}{' '}
                  {new Date(day.date).toLocaleDateString('en-IN', { month: 'short' })}
                </span>
                <span className="weekly-day-expense">
                  {day.totalExpense > 0 ? formatINR(day.totalExpense) : '₹0'}
                </span>
                {day.totalIncome > 0 && (
                  <span className="weekly-day-income">+{formatINR(day.totalIncome)}</span>
                )}
                <span className="weekly-day-count">
                  {day.transactionCount} {day.transactionCount === 1 ? 'record' : 'records'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Charts & Breakdown Row (2 columns: Daily Spending Trend + Category Outflow) */}
      <div className="weekly-charts-row">
        {/* Daily Spending Trend (Bar Chart) */}
        <div className="weekly-chart-box">
          <div className="weekly-chart-header">
            <span className="weekly-section-title">
              <BarChart3 size={16} />
              <span>Daily Outflow vs Inflow</span>
            </span>
          </div>
          <div className="weekly-chart-canvas-wrap">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>

        {/* Category Breakdown (Doughnut Chart + List) */}
        <div className="weekly-chart-box">
          <div className="weekly-chart-header">
            <span className="weekly-section-title">
              <PieChart size={16} />
              <span>Category Outflow</span>
            </span>
          </div>

          {summary?.categoryBreakdown && summary.categoryBreakdown.length > 0 ? (
            <>
              <div className="weekly-chart-canvas-wrap" style={{ height: '180px' }}>
                <Doughnut data={doughnutChartData} options={doughnutOptions} />
              </div>

              <div className="weekly-category-list">
                {summary.categoryBreakdown.map((cat) => {
                  const meta = getCategoryMeta(cat.category, 'expense');
                  return (
                    <div key={cat.category} className="weekly-category-item">
                      <div className="weekly-category-left">
                        <CategoryIcon
                          name={meta?.iconName || 'ShoppingBag'}
                          color={meta?.color || '#6366f1'}
                          size={15}
                        />
                        <span className="weekly-category-name">{cat.category}</span>
                      </div>
                      <div className="weekly-category-right">
                        <span className="weekly-category-amount">
                          {formatINR(cat.amount)}
                        </span>
                        <span className="weekly-category-pct">
                          {cat.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="weekly-empty-state" style={{ padding: '30px 10px' }}>
              <PieChart size={32} style={{ opacity: 0.4 }} />
              <p>No category expenses logged this week.</p>
            </div>
          )}
        </div>
      </div>

      {/* Itemized Transactions Table */}
      <div className="weekly-txs-card">
        <div className="weekly-txs-toolbar">
          <div className="weekly-section-title">
            <span>
              Itemized Records ({filteredTransactions.length} of{' '}
              {summary?.transactions?.length || 0})
            </span>
            {selectedDay && (
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#818cf8',
                  background: 'rgba(99,102,241,0.14)',
                  padding: '2px 8px',
                  borderRadius: '6px',
                }}
              >
                Filtered: {selectedDay}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Filter Pills: All, Expense, Income */}
            <div className="weekly-filter-pills">
              <button
                type="button"
                className={`weekly-filter-pill ${typeFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => setTypeFilter('ALL')}
              >
                All
              </button>
              <button
                type="button"
                className={`weekly-filter-pill ${typeFilter === 'expense' ? 'active' : ''}`}
                onClick={() => setTypeFilter('expense')}
              >
                Expenses
              </button>
              <button
                type="button"
                className={`weekly-filter-pill ${typeFilter === 'income' ? 'active' : ''}`}
                onClick={() => setTypeFilter('income')}
              >
                Income
              </button>
            </div>

            {/* Search Input */}
            <div className="weekly-tx-search-wrap">
              <Search size={14} style={{ color: 'var(--text-muted, #94a3b8)' }} />
              <input
                type="text"
                placeholder="Search transactions..."
                className="weekly-tx-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {filteredTransactions.length > 0 ? (
          <div className="weekly-txs-table-wrap">
            <table className="weekly-txs-table">
              <thead>
                <tr>
                  <th>Date & Day</th>
                  <th>Category</th>
                  <th>Note / Details</th>
                  <th>Payment</th>
                  <th>Type</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx) => {
                  const isExp = tx.type?.toLowerCase() === 'expense';
                  const catName =
                    typeof tx.category === 'object' && tx.category?.name
                      ? tx.category.name
                      : typeof tx.category === 'string'
                      ? tx.category
                      : 'Other';
                  const meta = getCategoryMeta(catName, tx.type === 'income' ? 'income' : 'expense');

                  const dateObj = new Date(tx.date);
                  const dayName = dateObj.toLocaleDateString('en-IN', { weekday: 'short' });
                  const dateFormatted = dateObj.toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                  });

                  return (
                    <tr key={tx.id}>
                      <td>
                        <span style={{ fontWeight: 600 }}>{dateFormatted}</span>{' '}
                        <span style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '11.5px' }}>
                          ({dayName})
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <CategoryIcon
                            name={meta?.iconName || 'ShoppingBag'}
                            color={meta?.color || '#6366f1'}
                            size={14}
                          />
                          <span>{catName}</span>
                          {tx.subcategory && (
                            <span
                              style={{
                                fontSize: '11px',
                                color: 'var(--text-muted, #94a3b8)',
                                background: 'rgba(255,255,255,0.06)',
                                padding: '1px 5px',
                                borderRadius: '4px',
                              }}
                            >
                              {tx.subcategory}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ color: tx.note ? 'inherit' : 'var(--text-muted, #94a3b8)' }}>
                        {tx.note || '—'}
                      </td>
                      <td>
                        <span className="weekly-payment-badge">{tx.paymentMethod || 'UPI'}</span>
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            color: isExp ? '#f87171' : '#34d399',
                          }}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td className={`weekly-amount-cell ${isExp ? 'expense' : 'income'}`}>
                        {isExp ? '- ' : '+ '}
                        {formatINR(tx.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="weekly-empty-state">
            <CheckCircle2 size={36} style={{ color: '#34d399', opacity: 0.7 }} />
            <span className="weekly-empty-title">
              {searchQuery || selectedDay || typeFilter !== 'ALL'
                ? 'No matching transactions found'
                : 'No transactions recorded for this week'}
            </span>
            <p style={{ fontSize: '13px', maxWidth: '380px' }}>
              {searchQuery || selectedDay || typeFilter !== 'ALL'
                ? 'Try resetting your search query or day filter to see all weekly entries.'
                : 'Add a new transaction or pick another week to explore your historical outflow.'}
            </p>
            {onOpenAddModal && (
              <button
                type="button"
                className="weekly-action-btn weekly-pdf-btn"
                onClick={onOpenAddModal}
                style={{ marginTop: '10px' }}
              >
                + Add Transaction
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyDashboard;
