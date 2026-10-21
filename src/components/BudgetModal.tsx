import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { getMonthName, formatINR } from '../utils/formatters';

interface BudgetModalProps {
  isOpen: boolean;
  currentBudget: number;
  monthYear: string;
  onClose: () => void;
  onSave: (amount: number, addToIncome: boolean) => Promise<void>;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  currentBudget,
  monthYear,
  onClose,
  onSave,
}) => {
  const [amount, setAmount] = useState<string>(
    currentBudget > 0 ? currentBudget.toString() : '10000'
  );
  const [addToIncome, setAddToIncome] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setAmount(currentBudget > 0 ? currentBudget.toString() : '10000');
      setAddToIncome(true);
    }
  }, [currentBudget, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num < 0) {
      alert('Please enter a valid positive budget amount');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave(num, addToIncome);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const [y, m] = monthYear.split('-');
  const monthDisplayName = getMonthName(parseInt(m, 10) - 1, parseInt(y, 10));

  return (
    <div
      className="modal-backdrop active"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-card">
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Set Monthly Budget</h3>
            <p className="modal-subtitle">Default budget is ₹10,000 (10k)</p>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close Modal">
            <X size={16} />
          </button>
        </div>

        <form className="modal-body" onSubmit={handleSubmit}>
          <p style={{ fontSize: '13px', color: 'var(--text-muted, #94a3b8)', marginBottom: '16px' }}>
            Set a spending limit for <strong>{monthDisplayName}</strong>. Once set, this amount will also be added to your <strong>Total Income</strong>.
          </p>

          <div className="form-group">
            <label className="form-label" htmlFor="budgetInput">
              Monthly Budget (₹)
            </label>
            <div className="amount-input-wrap">
              <span className="amount-currency-symbol">₹</span>
              <input
                id="budgetInput"
                type="number"
                className="amount-input"
                placeholder="10000"
                step="1000"
                min="0"
                required
                autoFocus
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            {/* Quick Presets */}
            <div className="preset-buttons" style={{ marginTop: '10px' }}>
              <button
                type="button"
                className={`preset-btn ${amount === '10000' ? 'active' : ''}`}
                style={amount === '10000' ? { borderColor: 'var(--primary, #6366f1)', color: '#818cf8', fontWeight: 600 } : {}}
                onClick={() => setAmount('10000')}
              >
                ₹10,000 (10k)
              </button>
              <button
                type="button"
                className={`preset-btn ${amount === '15000' ? 'active' : ''}`}
                onClick={() => setAmount('15000')}
              >
                ₹15,000
              </button>
              <button
                type="button"
                className={`preset-btn ${amount === '25000' ? 'active' : ''}`}
                onClick={() => setAmount('25000')}
              >
                ₹25,000
              </button>
              <button
                type="button"
                className={`preset-btn ${amount === '50000' ? 'active' : ''}`}
                onClick={() => setAmount('50000')}
              >
                ₹50,000
              </button>
              <button
                type="button"
                className={`preset-btn ${amount === '75000' ? 'active' : ''}`}
                onClick={() => setAmount('75000')}
              >
                ₹75,000
              </button>
            </div>
          </div>

          {/* Add to Total Income checkbox */}
          <div
            style={{
              padding: '12px',
              borderRadius: '10px',
              backgroundColor: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              marginTop: '16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              cursor: 'pointer'
            }}
            onClick={() => setAddToIncome(!addToIncome)}
          >
            <input
              type="checkbox"
              id="addToIncomeCheck"
              checked={addToIncome}
              onChange={(e) => setAddToIncome(e.target.checked)}
              style={{ marginTop: '3px', cursor: 'pointer', accentColor: 'var(--primary, #6366f1)' }}
            />
            <label htmlFor="addToIncomeCheck" style={{ cursor: 'pointer', fontSize: '13px', color: 'var(--text-primary, #f1f5f9)' }}>
              <strong>Add to Total Income</strong>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary, #94a3b8)', marginTop: '2px' }}>
                Automatically records this budget as incoming funds for {monthDisplayName} ({formatINR(parseFloat(amount) || 0)}).
              </div>
            </label>
          </div>

          <div className="modal-footer" style={{ padding: '0', border: 'none', marginTop: '24px' }}>
            <button type="button" className="btn-outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              <Check size={16} /> {isSubmitting ? 'Saving...' : 'Set Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
