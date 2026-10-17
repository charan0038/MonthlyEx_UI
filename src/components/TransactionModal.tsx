import React, { useState, useEffect } from 'react';
import { X, Check, ArrowDownRight, ArrowUpRight, Smartphone, Banknote, CreditCard, Plus } from 'lucide-react';
import type { Transaction, TransactionType, PaymentMethod, CreateTransactionInput, CategoryMeta } from '../types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants/categories';
import { CategoryIcon } from './CategoryIcon';

interface TransactionModalProps {
  isOpen: boolean;
  editingTransaction: Transaction | null;
  defaultMonthKey: string;
  categories?: CategoryMeta[];
  forcedCategory?: string;
  onClose: () => void;
  onSave: (data: CreateTransactionInput, id?: string) => Promise<void>;
  onOpenCreateCategory?: (type: TransactionType) => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  editingTransaction,
  defaultMonthKey,
  categories = [],
  forcedCategory,
  onClose,
  onSave,
  onOpenCreateCategory,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(1);
  const [date, setDate] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (forcedCategory) {
      const match = categories.find(
        (c) =>
          c.label.toLowerCase() === forcedCategory.toLowerCase() ||
          c.id.toString().toLowerCase() === forcedCategory.toLowerCase()
      );
      if (match?.dbId) {
        setSelectedCategoryId(match.dbId);
      }
    }
  }, [forcedCategory, categories]);

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(editingTransaction.amount.toString());
      if (editingTransaction.categoryId) {
        setSelectedCategoryId(editingTransaction.categoryId);
      } else {
        const catName =
          typeof editingTransaction.category === 'object'
            ? editingTransaction.category?.name
            : editingTransaction.category;
        const match = categories.find((c) => c.label.toLowerCase() === catName?.toLowerCase());
        setSelectedCategoryId(match?.dbId || 1);
      }
      setDate(editingTransaction.date);
      setPaymentMethod(editingTransaction.paymentMethod);
      setNote(editingTransaction.note || '');
    } else {
      setType('expense');
      setAmount('');
      const defaultExp = categories.find((c) => c.type === 'expense');
      setSelectedCategoryId(defaultExp?.dbId || 1);
      setPaymentMethod('UPI');
      setNote('');

      const today = new Date();
      const currentPrefix = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
      if (defaultMonthKey === currentPrefix) {
        setDate(today.toISOString().split('T')[0]);
      } else {
        setDate(`${defaultMonthKey}-01`);
      }
    }
  }, [editingTransaction, defaultMonthKey, isOpen, categories]);

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const available = categories.filter((c) => !c.type || c.type.toLowerCase() === newType.toLowerCase());
    if (available.length > 0 && available[0].dbId) {
      setSelectedCategoryId(available[0].dbId);
    } else {
      setSelectedCategoryId(newType === 'expense' ? 1 : 9);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid amount greater than ₹0');
      return;
    }
    if (!date) {
      alert('Please choose a valid date');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave(
        {
          type,
          amount: numAmount,
          categoryId: selectedCategoryId,
          date,
          paymentMethod,
          note: note.trim(),
        },
        editingTransaction ? editingTransaction.id : undefined
      );
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const categoryList =
    categories && categories.length > 0
      ? categories.filter((c) => !c.type || c.type.toLowerCase() === type.toLowerCase())
      : type === 'expense'
      ? EXPENSE_CATEGORIES
      : INCOME_CATEGORIES;

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
          <h3 className="modal-title">
            {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
          </h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close Modal">
            <X size={16} />
          </button>
        </div>

        <form className="modal-body" onSubmit={handleSubmit}>
          {/* Expense / Income Switch */}
          <div className="type-switcher" role="tablist">
            <button
              type="button"
              className={`type-tab ${type === 'expense' ? 'tab-expense active' : ''}`}
              onClick={() => handleTypeChange('expense')}
            >
              <ArrowDownRight size={16} /> Expense
            </button>
            <button
              type="button"
              className={`type-tab ${type === 'income' ? 'tab-income active' : ''}`}
              onClick={() => handleTypeChange('income')}
            >
              <ArrowUpRight size={16} /> Income
            </button>
          </div>

          {/* Amount Input */}
          <div className="form-group">
            <label className="form-label" htmlFor="txAmountInput">
              Amount (₹) *
            </label>
            <div className="amount-input-wrap">
              <span className="amount-currency-symbol">₹</span>
              <input
                id="txAmountInput"
                type="number"
                className="amount-input"
                placeholder="0.00"
                step="any"
                min="0.01"
                required
                autoFocus
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          {/* Category Tile Grid */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label className="form-label" style={{ margin: 0 }}>Category *</label>
              {onOpenCreateCategory && (
                <button
                  type="button"
                  className="quick-link-btn"
                  onClick={() => onOpenCreateCategory(type)}
                >
                  <Plus size={13} /> Add Category
                </button>
              )}
            </div>
            <div className="category-grid">
              {categoryList.map((cat) => (
                <div
                  key={cat.id}
                  className={`category-tile ${selectedCategoryId === cat.dbId ? 'selected' : ''}`}
                  onClick={() => setSelectedCategoryId(cat.dbId || 1)}
                >
                  <div className="category-tile-icon" style={{ backgroundColor: cat.color }}>
                    <CategoryIcon name={cat.iconName} size={15} />
                  </div>
                  <span className="category-tile-name">{cat.label}</span>
                </div>
              ))}

              {onOpenCreateCategory && (
                <div
                  className="category-tile category-tile-add"
                  onClick={() => onOpenCreateCategory(type)}
                  title="Create custom category dynamically"
                >
                  <div className="category-tile-icon category-tile-icon-add">
                    <Plus size={16} />
                  </div>
                  <span className="category-tile-name">+ New</span>
                </div>
              )}
            </div>
          </div>

          {/* Date Picker */}
          <div className="form-group">
            <label className="form-label" htmlFor="txDateInput">
              Date *
            </label>
            <input
              id="txDateInput"
              type="date"
              className="form-control"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Payment Method */}
          <div className="form-group">
            <label className="form-label">Payment Method</label>
            <div className="payment-methods-row">
              <button
                type="button"
                className={`payment-option-btn ${paymentMethod === 'UPI' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('UPI')}
              >
                <Smartphone size={16} /> UPI
              </button>
              <button
                type="button"
                className={`payment-option-btn ${paymentMethod === 'Cash' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('Cash')}
              >
                <Banknote size={16} /> Cash
              </button>
              <button
                type="button"
                className={`payment-option-btn ${paymentMethod === 'Card' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('Card')}
              >
                <CreditCard size={16} /> Card
              </button>
            </div>
          </div>

          {/* Note Input */}
          <div className="form-group">
            <label className="form-label" htmlFor="txNoteInput">
              Note / Description
            </label>
            <input
              id="txNoteInput"
              type="text"
              className="form-control"
              placeholder="e.g. Swiggy, Groceries, Metro smartcard..."
              maxLength={80}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="modal-footer" style={{ padding: '0', border: 'none', marginTop: '24px' }}>
            <button type="button" className="btn-outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              <Check size={16} /> {isSubmitting ? 'Saving...' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
