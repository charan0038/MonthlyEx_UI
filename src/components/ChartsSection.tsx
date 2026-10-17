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
  const gridColor = isDark ? 'rgba(36, 47, 70, 0.7)' : 'rgba(226, 232, 240, 0.8)';
  const textColor = isDark ? '#94a3b8' : '#64748b';

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
        borderColor: isDark ? '#121826' : '#ffffff',
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
          boxWidth: 12,
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
        backgroundColor: isDark ? 'rgba(99, 102, 241, 0.75)' : 'rgba(79, 70, 229, 0.8)',
        hoverBackgroundColor: isDark ? '#818cf8' : '#4f46e5',
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
          font: { family: 'Plus Jakarta Sans', size: 11 },
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
    <section className="analytics-grid">
      {/* Category Doughnut Card */}
      <div className="chart-card chart-card-doughnut">
        <div className="chart-header">
          <div>
            <h2 className="chart-title">Spending by Category</h2>
            <p className="chart-subtitle">Breakdown of this month's expenses</p>
          </div>
        </div>
        <div className="chart-canvas-wrapper">
          {hasCategoryData ? (
            <Doughnut data={doughnutChartData} options={doughnutOptions} />
          ) : (
            <div className="chart-empty-state">
              <PieChart size={36} style={{ opacity: 0.5 }} />
              <span>No expense data to display</span>
            </div>
          )}
        </div>
      </div>

      {/* Daily Spending Trend Card */}
      <div className="chart-card chart-card-daily">
        <div className="chart-header">
          <div>
            <h2 className="chart-title">Daily Spending Trend</h2>
            <p className="chart-subtitle">Day-by-day expense distribution</p>
          </div>
        </div>
        <div className="chart-canvas-wrapper">
          {hasDailySpending ? (
            <Bar data={barChartData} options={barOptions} />
          ) : (
            <div className="chart-empty-state">
              <BarChart2 size={36} style={{ opacity: 0.5 }} />
              <span>No daily expenses recorded yet</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
