import React from 'react';
import { ArrowDownLeft, ArrowUpRight, Scale, PiggyBank, Plus, Minus, CheckCircle, AlertCircle } from 'lucide-react';
import { formatINR } from '../utils/formatters';

interface SummaryCardsProps {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  budgetLeft: number;
  usedPercentage: number;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  totalIncome,
  totalExpense,
  netBalance,
  budgetLeft,
  usedPercentage,
}) => {
  return (
    <section className="summary-grid" aria-label="Financial Summary Cards">
      {/* Income Card */}
      <div className="stat-card stat-income">
        <div className="stat-card-header">
          <span className="stat-card-label">Total Income</span>
          <div className="stat-card-icon">
            <ArrowDownLeft size={20} />
          </div>
        </div>
        <div className="stat-card-value">{formatINR(totalIncome)}</div>
        <div className="stat-card-sub">
          <span className="stat-badge positive">
            <Plus size={11} style={{ marginRight: '2px' }} /> Inflow
          </span>
          <span>Earned this month</span>
        </div>
      </div>

      {/* Expense Card */}
      <div className="stat-card stat-expense">
        <div className="stat-card-header">
          <span className="stat-card-label">Total Expenses</span>
          <div className="stat-card-icon">
            <ArrowUpRight size={20} />
          </div>
        </div>
        <div className="stat-card-value">{formatINR(totalExpense)}</div>
        <div className="stat-card-sub">
          <span className="stat-badge negative">
            <Minus size={11} style={{ marginRight: '2px' }} /> Outflow
          </span>
          <span>Spent this month</span>
        </div>
      </div>

      {/* Net Balance Card */}
      <div className="stat-card stat-balance">
        <div className="stat-card-header">
          <span className="stat-card-label">Net Balance</span>
          <div className="stat-card-icon">
            <Scale size={20} />
          </div>
        </div>
        <div className="stat-card-value">{formatINR(netBalance)}</div>
        <div className="stat-card-sub">
          {netBalance >= 0 ? (
            <>
              <span className="stat-badge positive">
                <CheckCircle size={11} style={{ marginRight: '3px' }} /> Surplus
              </span>
              <span>Savings intact</span>
            </>
          ) : (
            <>
              <span className="stat-badge negative">
                <AlertCircle size={11} style={{ marginRight: '3px' }} /> Deficit
              </span>
              <span>Spending exceeded income</span>
            </>
          )}
        </div>
      </div>

      {/* Budget Left Card */}
      <div className="stat-card stat-budget">
        <div className="stat-card-header">
          <span className="stat-card-label">Budget Left</span>
          <div className="stat-card-icon">
            <PiggyBank size={20} />
          </div>
        </div>
        <div className="stat-card-value">{formatINR(budgetLeft)}</div>
        <div className="stat-card-sub">
          {budgetLeft >= 0 ? (
            <span>{Math.round(100 - usedPercentage)}% allowance remaining</span>
          ) : (
            <span style={{ color: 'var(--expense)', fontWeight: 700 }}>
              Over budget by {formatINR(Math.abs(budgetLeft))}
            </span>
          )}
        </div>
      </div>
    </section>
  );
};
