import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { getMonthName } from '../utils/formatters';

interface BudgetModalProps {
  isOpen: boolean;
  currentBudget: number;
  monthYear: string;
  onClose: () => void;
  onSave: (amount: number) => Promise<void>;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  currentBudget,
  monthYear,
  onClose,
  onSave,
}) => {
  const [amount, setAmount] = useState<string>(currentBudget.toString());
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    setAmount(currentBudget.toString());
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
      await onSave(num);
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
          <h3 className="modal-title">Set Monthly Budget</h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close Modal">
            <X size={16} />
          </button>
        </div>

        <form className="modal-body" onSubmit={handleSubmit}>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Set a spending limit for <strong>{monthDisplayName}</strong>. The tracker will alert you as
            you reach 80% and 100% of your budget.
          </p>

          <div className="form-group">
            <label className="form-label" htmlFor="budgetInput">
              Monthly Target (₹)
            </label>
            <div className="amount-input-wrap">
              <span className="amount-currency-symbol">₹</span>
              <input
                id="budgetInput"
                type="number"
                className="amount-input"
                placeholder="50000"
                step="1000"
                min="0"
                required
                autoFocus
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            {/* Quick Presets */}
            <div className="preset-buttons">
              <button type="button" className="preset-btn" onClick={() => setAmount('15000')}>
                ₹15,000
              </button>
              <button type="button" className="preset-btn" onClick={() => setAmount('25000')}>
                ₹25,000
              </button>
              <button type="button" className="preset-btn" onClick={() => setAmount('50000')}>
                ₹50,000
              </button>
              <button type="button" className="preset-btn" onClick={() => setAmount('75000')}>
                ₹75,000
              </button>
              <button type="button" className="preset-btn" onClick={() => setAmount('100000')}>
                ₹1,00,000
              </button>
            </div>
          </div>

          <div className="modal-footer" style={{ padding: '0', border: 'none', marginTop: '24px' }}>
            <button type="button" className="btn-outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              <Check size={16} /> {isSubmitting ? 'Saving...' : 'Save Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
