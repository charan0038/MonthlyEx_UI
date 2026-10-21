import React from 'react';
import { ShieldCheck, AlertCircle, AlertTriangle, Settings, Banknote, ArrowRightCircle } from 'lucide-react';
import { formatINR } from '../utils/formatters';

interface BudgetCardProps {
  budgetLimit: number;
  totalExpense: number;
  budgetLeft: number;
  usedPercentage: number;
  isEndOfMonth?: boolean;
  onOpenBudgetModal: () => void;
  onCashCheckout?: () => void;
  onRolloverBalance?: () => void;
}

export const BudgetCard: React.FC<BudgetCardProps> = ({
  budgetLimit,
  totalExpense,
  budgetLeft,
  usedPercentage,
  isEndOfMonth = false,
  onOpenBudgetModal,
  onCashCheckout,
  onRolloverBalance,
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

      {/* Month-End Settlement Options: Cash Checkout or Next Month Opening Balance (Only occurs at end of month) */}
      {isEndOfMonth && budgetLeft > 0 && (onCashCheckout || onRolloverBalance) && (
        <div
          style={{
            marginTop: '14px',
            paddingTop: '12px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <div style={{ fontSize: '12px', color: 'var(--text-secondary, #94a3b8)' }}>
            Remaining <strong style={{ color: 'var(--income, #10b981)' }}>{formatINR(budgetLeft)}</strong> left:
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {onCashCheckout && (
              <button
                type="button"
                className="btn-outline"
                style={{
                  fontSize: '11px',
                  padding: '5px 10px',
                  borderRadius: '8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  cursor: 'pointer',
                }}
                onClick={onCashCheckout}
                title="Withdraw remaining balance as cash"
              >
                <Banknote size={13} /> Cash Checkout
              </button>
            )}

            {onRolloverBalance && (
              <button
                type="button"
                className="btn-primary"
                style={{
                  fontSize: '11px',
                  padding: '5px 10px',
                  borderRadius: '8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  cursor: 'pointer',
                }}
                onClick={onRolloverBalance}
                title="Save remaining balance as next month's opening income"
              >
                <ArrowRightCircle size={13} /> Add to Next Month Opening Balance
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
