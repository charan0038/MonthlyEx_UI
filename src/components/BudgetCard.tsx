import React from 'react';
import { ShieldCheck, AlertCircle, AlertTriangle, Settings } from 'lucide-react';
import { formatINR } from '../utils/formatters';

interface BudgetCardProps {
  budgetLimit: number;
  totalExpense: number;
  budgetLeft: number;
  usedPercentage: number;
  onOpenBudgetModal: () => void;
}

export const BudgetCard: React.FC<BudgetCardProps> = ({
  budgetLimit,
  totalExpense,
  budgetLeft,
  usedPercentage,
  onOpenBudgetModal,
}) => {
  const isDanger = usedPercentage >= 100;
  const isWarning = usedPercentage >= 80 && usedPercentage < 100;
  const visualWidth = Math.min(Math.max(usedPercentage, 0), 100);

  return (
    <section className="budget-banner-card" aria-label="Monthly Budget Progress">
      <div className="budget-banner-header">
        <div className="budget-title-wrap">
          <span style={{ fontWeight: 700, fontSize: '15px' }}>Monthly Budget</span>
          {isDanger ? (
            <span className="budget-status-pill budget-status-danger">
              <AlertTriangle size={14} /> Exceeded 100%
            </span>
          ) : isWarning ? (
            <span className="budget-status-pill budget-status-warning">
              <AlertCircle size={14} /> Warning (80%+)
            </span>
          ) : (
            <span className="budget-status-pill budget-status-safe">
              <ShieldCheck size={14} /> On Track
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="budget-numbers-grid">
            <span>
              Spent: <strong className="budget-spent-val">{formatINR(totalExpense)}</strong>
            </span>
            <span>of <span className="budget-limit-val">{formatINR(budgetLimit)}</span></span>
          </div>

          <button className="budget-btn-set" onClick={onOpenBudgetModal}>
            <Settings size={14} /> Set Budget
          </button>
        </div>
      </div>

      {/* Progress Track */}
      <div className="progress-track" title={`${Math.round(usedPercentage)}% spent`}>
        <div
          className={`progress-fill ${
            isDanger ? 'status-danger' : isWarning ? 'status-warning' : 'status-safe'
          }`}
          style={{ width: `${visualWidth}%` }}
        />
      </div>

      <div className="budget-footer-text">
        <span>
          {budgetLeft >= 0
            ? `Remaining: ${formatINR(budgetLeft)}`
            : `Exceeded by: ${formatINR(Math.abs(budgetLeft))}`}
        </span>
        <span>{Math.round(usedPercentage)}% used</span>
      </div>
    </section>
  );
};
