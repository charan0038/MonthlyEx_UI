import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { PieChart, BarChart2 } from 'lucide-react';
import type { CategoryBreakdown, DailySpending } from '../types';
import { getCategoryMeta } from '../constants/categories';
import { formatINR } from '../utils/formatters';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

interface ChartsSectionProps {
  categoryBreakdown: CategoryBreakdown[];
  dailySpending: DailySpending[];
  theme: 'dark' | 'light';
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({
  categoryBreakdown,
  dailySpending,
  theme,
}) => {
  const isDark = theme === 'dark';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 90, 156, 0.12)';
  const textColor = isDark ? '#8A99AD' : '#005A9C';

  // 1. Doughnut chart configuration
  const hasCategoryData = categoryBreakdown.length > 0;
  const doughnutLabels = categoryBreakdown.map((c) => c.category);
  const doughnutData = categoryBreakdown.map((c) => c.amount);
  const doughnutColors = categoryBreakdown.map(
    (c) => getCategoryMeta(c.category, 'expense').color
  );

  const doughnutChartData = {
    labels: doughnutLabels,
    datasets: [
      {
        data: doughnutData,
        backgroundColor: doughnutColors,
        borderColor: isDark ? '#0A1326' : '#A0E0EF',
        borderWidth: 3,
        hoverOffset: 6,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: textColor,
          font: { family: 'Plus Jakarta Sans', size: 12, weight: 600 },
          boxWidth: 10,
          padding: 14,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const val = context.raw || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const pct = total > 0 ? Math.round((val / total) * 100) : 0;
            return ` ${label}: ${formatINR(val)} (${pct}%)`;
          },
        },
      },
    },
    cutout: '68%',
  };

  // 2. Bar chart configuration
  const hasDailySpending = dailySpending.some((d) => d.amount > 0);
  const barLabels = dailySpending.map((d) => `${d.day}`);
  const barValues = dailySpending.map((d) => d.amount);

  const barChartData = {
    labels: barLabels,
    datasets: [
      {
        label: 'Daily Spending (₹)',
        data: barValues,
        backgroundColor: isDark ? 'rgba(255, 87, 34, 0.85)' : '#005A9C',
        hoverBackgroundColor: isDark ? '#FF7A45' : '#60C1E5',
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: textColor,
          font: { family: 'Plus Jakarta Sans', size: 11 },
          maxTicksLimit: 16,
        },
      },
      y: {
        grid: { color: gridColor },
        ticks: {
          color: textColor,
          font: { family: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', size: 11 },
          callback: (value: any) => '₹' + value,
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => ` Spent: ${formatINR(context.raw)}`,
        },
      },
    },
  };

  return (
    <section id="charts-section" className="analytics-grid">
      {/* Category Doughnut Card */}
      <div
        className="chart-card chart-card-doughnut"
        style={{
          borderRadius: '20px',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(96, 193, 229, 0.65)',
          borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '3px solid #005A9C',
          background: isDark ? 'rgba(10, 19, 38, 0.85)' : '#A0E0EF',
          backdropFilter: 'blur(20px)',
          boxShadow: isDark
            ? '0 12px 32px rgba(0, 0, 0, 0.45)'
            : '0 8px 24px -4px rgba(0, 90, 156, 0.12), 0 2px 8px rgba(96, 193, 229, 0.25)',
          padding: '24px',
          transition: 'all 0.25s ease',
        }}
      >
        <div className="chart-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  backgroundColor: isDark ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.85)',
                  color: isDark ? '#22d3ee' : '#005A9C',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PieChart size={16} />
              </div>
              <h2 className="chart-title" style={{ fontSize: '17px', fontWeight: 700, color: isDark ? '#ffffff' : '#005A9C', margin: 0 }}>
                Spending by Category
              </h2>
            </div>
            <p className="chart-subtitle" style={{ fontSize: '12px', color: isDark ? '#8A99AD' : '#1E4D61', margin: '4px 0 0 36px' }}>
              Breakdown of this month's expenses
            </p>
          </div>
        </div>
        <div className="chart-canvas-wrapper" style={{ minHeight: '260px' }}>
          {hasCategoryData ? (
            <Doughnut data={doughnutChartData} options={doughnutOptions} />
          ) : (
            <div className="chart-empty-state">
              <PieChart size={36} style={{ opacity: 0.35, color: isDark ? '#8A99AD' : '#1E4D61' }} />
              <span style={{ color: isDark ? '#8A99AD' : '#1E4D61', fontSize: '13px' }}>No expense data to display</span>
            </div>
          )}
        </div>
      </div>

      {/* Daily Spending Trend Card */}
      <div
        className="chart-card chart-card-daily"
        style={{
          borderRadius: '20px',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(96, 193, 229, 0.65)',
          borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '3px solid #005A9C',
          background: isDark ? 'rgba(10, 19, 38, 0.85)' : '#A0E0EF',
          backdropFilter: 'blur(20px)',
          boxShadow: isDark
            ? '0 12px 32px rgba(0, 0, 0, 0.45)'
            : '0 8px 24px -4px rgba(0, 90, 156, 0.12), 0 2px 8px rgba(96, 193, 229, 0.25)',
          padding: '24px',
          transition: 'all 0.25s ease',
        }}
      >
        <div className="chart-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  backgroundColor: isDark ? 'rgba(255, 87, 34, 0.15)' : 'rgba(255, 255, 255, 0.85)',
                  color: isDark ? '#FF5722' : '#005A9C',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <BarChart2 size={16} />
              </div>
              <h2 className="chart-title" style={{ fontSize: '17px', fontWeight: 700, color: isDark ? '#ffffff' : '#005A9C', margin: 0 }}>
                Daily Spending Trend
              </h2>
            </div>
            <p className="chart-subtitle" style={{ fontSize: '12px', color: isDark ? '#8A99AD' : '#1E4D61', margin: '4px 0 0 36px' }}>
              Day-by-day expense distribution
            </p>
          </div>
        </div>
        <div className="chart-canvas-wrapper" style={{ minHeight: '260px' }}>
          {hasDailySpending ? (
            <Bar data={barChartData} options={barOptions} />
          ) : (
            <div className="chart-empty-state">
              <BarChart2 size={36} style={{ opacity: 0.35, color: '#8A99AD' }} />
              <span style={{ color: '#8A99AD', fontSize: '13px' }}>No daily expenses recorded yet</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
