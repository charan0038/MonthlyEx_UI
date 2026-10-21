import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Calendar,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Sparkles,
  Layers,
  ArrowRight,
  Award,
  FileText,
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
import type { YearlySummary, User } from '../types';
import { api } from '../services/api';
import { formatINR } from '../utils/formatters';
import { getCategoryMeta } from '../constants/categories';
import { exportYearlyPdfReport } from '../utils/pdfExport';

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

interface YearlyDashboardProps {
  initialYear?: number;
  theme: 'dark' | 'light';
  user: User | null;
  onNavigateToMonth: (year: number, monthIndex: number) => void;
  onToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const YearlyDashboard: React.FC<YearlyDashboardProps> = ({
  initialYear = new Date().getFullYear(),
  theme,
  user,
  onNavigateToMonth,
  onToast,
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(initialYear);
  const [summary, setSummary] = useState<YearlySummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [chartTab, setChartTab] = useState<'flow' | 'category'>('flow');

  const isDark = theme === 'dark';
  const gridColor = isDark ? 'rgba(36, 47, 70, 0.6)' : 'rgba(226, 232, 240, 0.8)';
  const textColor = isDark ? '#94a3b8' : '#64748b';

  const loadYearData = async (year: number) => {
    setIsLoading(true);
    try {
      const data = await api.getYearlySummary(year);
      setSummary(data);
    } catch (err) {
      console.error('Error fetching yearly summary:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadYearData(selectedYear);
  }, [selectedYear]);

  const handlePrevYear = () => setSelectedYear((y) => y - 1);
  const handleNextYear = () => setSelectedYear((y) => y + 1);
  const handleCurrentYear = () => setSelectedYear(new Date().getFullYear());

  // 12-Month Flow Chart Data (Income vs Expense)
  const monthlyItems = summary?.monthlyBreakdown || [];
  const monthLabels = monthlyItems.map((m) => m.monthName);
  const incomeData = monthlyItems.map((m) => m.totalIncome);
  const expenseData = monthlyItems.map((m) => m.totalExpense);

  const barChartData = {
    labels: monthLabels,
    datasets: [
      {
        label: 'Income',
        data: incomeData,
        backgroundColor: '#10b981',
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: 'Expense',
        data: expenseData,
        backgroundColor: '#f43f5e',
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: isDark ? '#f8fafc' : '#0f172a',
          font: { weight: 600 as const, size: 12 },
          usePointStyle: true,
          boxWidth: 8,
        },
      },
      tooltip: {
        backgroundColor: isDark ? '#1a2235' : '#ffffff',
        titleColor: isDark ? '#f8fafc' : '#0f172a',
        bodyColor: isDark ? '#cbd5e1' : '#334155',
        borderColor: isDark ? '#242f46' : '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 10,
        callbacks: {
          label: (ctx: any) => ` ${ctx.dataset.label}: ${formatINR(ctx.raw)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: textColor, font: { weight: 600 as const } },
      },
      y: {
        grid: { color: gridColor },
        ticks: {
          color: textColor,
          callback: (val: any) => (val >= 1000 ? `₹${val / 1000}k` : `₹${val}`),
        },
      },
    },
  };

  // Category Breakdown Doughnut Chart Data
  const categories = summary?.categoryBreakdown || [];
  const doughnutLabels = categories.map((c) => c.category);
  const doughnutData = categories.map((c) => c.amount);
  const doughnutColors = categories.map((c) => getCategoryMeta(c.category, 'expense').color);

  const doughnutChartData = {
    labels: doughnutLabels,
    datasets: [
      {
        data: doughnutData,
        backgroundColor: doughnutColors,
        borderWidth: 2,
        borderColor: isDark ? '#121826' : '#ffffff',
        hoverOffset: 6,
      },
    ],
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: isDark ? '#f8fafc' : '#0f172a',
          padding: 12,
          font: { size: 12, weight: 600 as const },
          usePointStyle: true,
          boxWidth: 8,
        },
      },
      tooltip: {
        backgroundColor: isDark ? '#1a2235' : '#ffffff',
        titleColor: isDark ? '#f8fafc' : '#0f172a',
        bodyColor: isDark ? '#cbd5e1' : '#334155',
        borderColor: isDark ? '#242f46' : '#e2e8f0',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (ctx: any) => ` ${ctx.label}: ${formatINR(ctx.raw)}`,
        },
      },
    },
  };

  if (isLoading && !summary) {
    return (
      <div className="card" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ display: 'inline-block' }}>
          <Sparkles size={32} style={{ color: 'var(--primary)' }} />
        </div>
        <p style={{ marginTop: '14px', fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>
          Loading {selectedYear} Annual Tracker...
        </p>
      </div>
    );
  }

  return (
    <div
      className="yearly-dashboard-root"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        opacity: isLoading ? 0.7 : 1,
        transition: 'opacity 0.15s ease',
      }}
    >
      {/* 1. Header Toolbar */}
      <div className="card yearly-header-card">
        <div className="yearly-header-brand">
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(99,102,241,0.05) 100%)',
              border: '1px solid rgba(99,102,241,0.25)',
              color: '#818cf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Calendar size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
              Annual Expense Tracker
            </h2>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: 0 }}>
              Complete 12-month financial performance and spending analytics for {selectedYear}
            </p>
          </div>
        </div>

        {/* Year Stepper & Actions */}
        <div className="yearly-header-controls">
          <div className="month-picker-pill" style={{ display: 'flex', alignItems: 'center' }}>
            <button
              className="month-nav-btn"
              onClick={handlePrevYear}
              title="Previous Year"
              aria-label="Previous Year"
            >
              <ChevronLeft size={16} />
            </button>
            <div
              className="month-display"
              style={{
                fontSize: '15px',
                fontWeight: 800,
                color: '#a5b4fc',
                letterSpacing: '0.5px',
                minWidth: '80px',
                textAlign: 'center',
              }}
            >
              {selectedYear}
            </div>
            <button
              className="month-nav-btn"
              onClick={handleNextYear}
              title="Next Year"
              aria-label="Next Year"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {selectedYear !== new Date().getFullYear() && (
            <button
              type="button"
              className="today-quick-btn"
              onClick={handleCurrentYear}
              title="Jump to current year"
            >
              Current Year
            </button>
          )}

          <button
            type="button"
            className="btn-outline yearly-pdf-btn"
            onClick={() => {
              if (!summary) return;
              exportYearlyPdfReport({
                year: selectedYear,
                user,
                summary,
              });
              onToast?.(`Exported Annual PDF Report for ${selectedYear}`, 'success');
            }}
            title={`Export Annual PDF Report for ${selectedYear}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 600,
              borderColor: 'rgba(239, 68, 68, 0.35)',
              color: '#fb7185',
              backgroundColor: 'rgba(239, 68, 68, 0.06)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <FileText size={14} />
            <span>Export Annual PDF</span>
          </button>
        </div>
      </div>

      {/* 2. Key Metric Stat Cards */}
      <div className="yearly-stats-grid">
        {/* Total Annual Income */}
        <div className="card" style={{ padding: '16px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
              Annual Total Income
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(16,185,129,0.12)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TrendingUp size={16} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#10b981', marginTop: '8px' }}>
            {formatINR(summary?.totalIncome || 0)}
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Avg {formatINR(summary?.averageMonthlyIncome || 0)} / month
          </div>
        </div>

        {/* Total Annual Expenses */}
        <div className="card" style={{ padding: '16px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
              Annual Total Expenses
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(244,63,94,0.12)',
                color: '#f43f5e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TrendingDown size={16} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#f43f5e', marginTop: '8px' }}>
            {formatINR(summary?.totalExpense || 0)}
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Avg {formatINR(summary?.averageMonthlyExpense || 0)} / month
          </div>
        </div>

        {/* Net Annual Savings */}
        <div className="card" style={{ padding: '16px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
              Net Annual Savings
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(99,102,241,0.14)',
                color: '#818cf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PiggyBank size={16} />
            </div>
          </div>
          <div
            style={{
              fontSize: '24px',
              fontWeight: 800,
              color: (summary?.netSavings || 0) >= 0 ? '#38bdf8' : '#fb7185',
              marginTop: '8px',
            }}
          >
            {formatINR(summary?.netSavings || 0)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: '6px',
                backgroundColor:
                  (summary?.savingsRate || 0) >= 20 ? 'rgba(16,185,129,0.18)' : 'rgba(99,102,241,0.18)',
                color: (summary?.savingsRate || 0) >= 20 ? '#34d399' : '#a5b4fc',
              }}
            >
              {summary?.savingsRate || 0}% Saved
            </span>
            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
              {summary?.totalTransactions || 0} transactions
            </span>
          </div>
        </div>

        {/* Peak Spending Highlights */}
        <div className="card" style={{ padding: '16px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
              Top Expense Category
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(234,179,8,0.14)',
                color: '#eab308',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Award size={16} />
            </div>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)', marginTop: '8px' }}>
            {summary?.topExpenseCategory || 'None'}
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {summary?.topExpenseCategoryAmount ? formatINR(summary.topExpenseCategoryAmount) : '₹0'} spent
          </div>
        </div>
      </div>

      {/* 3. Smart Insight Banner */}
      {summary?.insightMessage && (
        <div
          className="card"
          style={{
            padding: '14px 18px',
            background:
              'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(16,185,129,0.05) 100%)',
            border: '1px solid rgba(99,102,241,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              minWidth: '32px',
              borderRadius: '8px',
              backgroundColor: 'rgba(99,102,241,0.2)',
              color: '#818cf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sparkles size={16} />
          </div>
          <div style={{ fontSize: '13px', lineHeight: 1.5, color: 'var(--text-main)' }}>
            <strong>Yearly Financial Insight:</strong> {summary.insightMessage}
          </div>
        </div>
      )}

      {/* 4. Charts Section (12-Month Flow & Category Breakdown) */}
      <div
        className="card"
        style={{
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={18} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>
              12-Month Cash Flow & Category Distribution
            </span>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              onClick={() => setChartTab('flow')}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                border: chartTab === 'flow' ? '1px solid var(--primary)' : '1px solid transparent',
                backgroundColor: chartTab === 'flow' ? 'rgba(99,102,241,0.2)' : 'transparent',
                color: chartTab === 'flow' ? '#a5b4fc' : 'var(--text-muted)',
                transition: 'all 0.15s ease',
              }}
            >
              12-Month Trend
            </button>
            <button
              type="button"
              onClick={() => setChartTab('category')}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                border: chartTab === 'category' ? '1px solid var(--primary)' : '1px solid transparent',
                backgroundColor: chartTab === 'category' ? 'rgba(99,102,241,0.2)' : 'transparent',
                color: chartTab === 'category' ? '#a5b4fc' : 'var(--text-muted)',
                transition: 'all 0.15s ease',
              }}
            >
              Annual Categories
            </button>
          </div>
        </div>

        <div className="yearly-chart-container" style={{ position: 'relative' }}>
          {chartTab === 'flow' ? (
            <Bar data={barChartData} options={barChartOptions} />
          ) : categories.length > 0 ? (
            <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
          ) : (
            <div
              style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                fontSize: '13px',
              }}
            >
              No expense transactions recorded for {selectedYear} yet.
            </div>
          )}
        </div>
      </div>

      {/* 5. Top Subcategories Spending List (if available) */}
      {(summary?.subcategoryBreakdown?.length || 0) > 0 && (
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Layers size={17} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>
              Top Subcategories in {selectedYear}
            </span>
          </div>

          <div className="yearly-subcats-grid">
            {summary?.subcategoryBreakdown.map((item, index) => (
              <div
                key={`${item.category}-${item.subcategory}-${index}`}
                style={{
                  padding: '10px 14px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--bg-input, #0e1422)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        padding: '1px 6px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(255,255,255,0.06)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {item.category}
                    </span>
                    <strong style={{ fontSize: '13px', color: 'var(--text-main)' }}>
                      {item.subcategory}
                    </strong>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#f87171' }}>
                    {formatINR(item.amount)}
                  </span>
                </div>
                {/* Progress mini-bar */}
                <div
                  style={{
                    height: '4px',
                    borderRadius: '2px',
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min(100, item.percentage)}%`,
                      backgroundColor: 'var(--primary, #6366f1)',
                      borderRadius: '2px',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Comprehensive 12-Month Performance Table */}
      <div className="card yearly-breakdown-card">
        <div className="yearly-breakdown-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={17} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>
              12-Month Performance Breakdown ({selectedYear})
            </span>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Tap or click "View Month" to drill down into any month
          </span>
        </div>

        {/* Desktop Table View (>= 641px) */}
        <div className="yearly-table-desktop">
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '13px',
              textAlign: 'left',
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: '1px solid var(--border-color)',
                  color: 'var(--text-muted)',
                  fontWeight: 600,
                }}
              >
                <th style={{ padding: '10px 12px' }}>Month</th>
                <th style={{ padding: '10px 12px' }}>Income</th>
                <th style={{ padding: '10px 12px' }}>Expenses</th>
                <th style={{ padding: '10px 12px' }}>Net Savings</th>
                <th style={{ padding: '10px 12px' }}>Top Expense Category</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {monthlyItems.map((item, idx) => {
                const isSurplus = item.netBalance >= 0;
                const hasData = item.totalIncome > 0 || item.totalExpense > 0;
                const isCurrentCalendarMonth =
                  new Date().getFullYear() === selectedYear && new Date().getMonth() === idx;

                return (
                  <tr
                    key={item.monthKey}
                    style={{
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      backgroundColor: isCurrentCalendarMonth
                        ? 'rgba(99,102,241,0.06)'
                        : 'transparent',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)')}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = isCurrentCalendarMonth
                        ? 'rgba(99,102,241,0.06)'
                        : 'transparent')
                    }
                  >
                    <td style={{ padding: '12px', fontWeight: 700, color: 'var(--text-main)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{item.monthName}</span>
                        {isCurrentCalendarMonth && (
                          <span
                            style={{
                              fontSize: '10px',
                              padding: '1px 5px',
                              borderRadius: '4px',
                              backgroundColor: 'rgba(99,102,241,0.2)',
                              color: '#a5b4fc',
                              fontWeight: 700,
                            }}
                          >
                            Current
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '12px', color: '#10b981', fontWeight: 600 }}>
                      {item.totalIncome > 0 ? formatINR(item.totalIncome) : '—'}
                    </td>
                    <td style={{ padding: '12px', color: '#f43f5e', fontWeight: 600 }}>
                      {item.totalExpense > 0 ? formatINR(item.totalExpense) : '—'}
                    </td>
                    <td style={{ padding: '12px', fontWeight: 700 }}>
                      {hasData ? (
                        <span style={{ color: isSurplus ? '#34d399' : '#f87171' }}>
                          {isSurplus ? '+' : ''}
                          {formatINR(item.netBalance)}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                      {item.topCategory && item.topCategory !== 'None' ? (
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: '12px',
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            fontSize: '11.5px',
                            fontWeight: 500,
                            color: 'var(--text-main)',
                          }}
                        >
                          {item.topCategory}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => onNavigateToMonth(selectedYear, idx)}
                        style={{
                          padding: '5px 12px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-color)',
                          backgroundColor: 'rgba(255,255,255,0.04)',
                          color: '#a5b4fc',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--primary)';
                          e.currentTarget.style.color = '#ffffff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)';
                          e.currentTarget.style.color = '#a5b4fc';
                        }}
                      >
                        <span>View Month</span>
                        <ArrowRight size={12} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Month Cards (< 640px) */}
        <div className="yearly-mobile-cards">
          {monthlyItems.map((item, idx) => {
            const isSurplus = item.netBalance >= 0;
            const hasData = item.totalIncome > 0 || item.totalExpense > 0;
            const isCurrentCalendarMonth =
              new Date().getFullYear() === selectedYear && new Date().getMonth() === idx;

            return (
              <div
                key={item.monthKey}
                className={`yearly-mobile-month-card ${isCurrentCalendarMonth ? 'current-month-card' : ''} ${hasData ? 'has-data' : 'empty-month'}`}
                onClick={() => onNavigateToMonth(selectedYear, idx)}
                role="button"
                tabIndex={0}
              >
                <div className="ym-card-header">
                  <div className="ym-card-month">
                    <span className="ym-month-name">{item.monthName}</span>
                    {isCurrentCalendarMonth && <span className="ym-current-pill">Current</span>}
                  </div>
                  <div className="ym-card-net">
                    {hasData ? (
                      <span className={`ym-net-pill ${isSurplus ? 'surplus' : 'deficit'}`}>
                        {isSurplus ? '+' : ''}{formatINR(item.netBalance)}
                      </span>
                    ) : (
                      <span className="ym-net-pill empty">—</span>
                    )}
                  </div>
                </div>

                <div className="ym-card-body">
                  <div className="ym-card-stat">
                    <span className="ym-stat-label">Income</span>
                    <span className="ym-stat-value income">
                      {item.totalIncome > 0 ? formatINR(item.totalIncome) : '—'}
                    </span>
                  </div>
                  <div className="ym-card-stat">
                    <span className="ym-stat-label">Expenses</span>
                    <span className="ym-stat-value expense">
                      {item.totalExpense > 0 ? formatINR(item.totalExpense) : '—'}
                    </span>
                  </div>
                  <div className="ym-card-stat">
                    <span className="ym-stat-label">Top Category</span>
                    <span className="ym-stat-value category">
                      {item.topCategory && item.topCategory !== 'None' ? item.topCategory : '—'}
                    </span>
                  </div>
                </div>

                <div className="ym-card-footer">
                  <span className="ym-tap-hint">Tap to view {item.monthName}</span>
                  <div className="ym-arrow-btn">
                    <span>View Month</span>
                    <ArrowRight size={13} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
