import React, { useState, useEffect } from 'react';
import { X, Check, ArrowDownRight, ArrowUpRight, Smartphone, Banknote, CreditCard, Plus } from 'lucide-react';
import type { Transaction, TransactionType, PaymentMethod, CreateTransactionInput, CategoryMeta, SubcategoryItem } from '../types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants/categories';
import { CategoryIcon } from './CategoryIcon';
import { CustomDatePicker } from './CustomDatePicker';
import { api } from '../services/api';

interface TransactionModalProps {
  isOpen: boolean;
  editingTransaction: Transaction | null;
  defaultMonthKey: string;
  categories?: CategoryMeta[];
  forcedCategory?: string;
  onClose: () => void;
  onSave: (data: CreateTransactionInput, id?: string) => Promise<void>;
  onOpenCreateCategory?: (type: TransactionType) => void;
  onSubcategoryCreated?: (categoryId: number, newSub: SubcategoryItem) => void;
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
  onSubcategoryCreated,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(1);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<number | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Dynamic inline subcategory creation states
  const [isAddingSub, setIsAddingSub] = useState<boolean>(false);
  const [newSubName, setNewSubName] = useState<string>('');
  const [isSubLoading, setIsSubLoading] = useState<boolean>(false);
  const [subError, setSubError] = useState<string>('');
  const [customSubcategories, setCustomSubcategories] = useState<Record<number, SubcategoryItem[]>>({});

  useEffect(() => {
    if (forcedCategory) {
      const match = categories.find(
        (c) =>
          c.label.toLowerCase() === forcedCategory.toLowerCase() ||
          c.id.toString().toLowerCase() === forcedCategory.toLowerCase()
      );
      if (match?.dbId) {
        setSelectedCategoryId(match.dbId);
        setSelectedSubcategoryId(null);
        setSelectedSubcategory('');
        setIsAddingSub(false);
        setNewSubName('');
        setSubError('');
      }
    }
  }, [forcedCategory, categories]);

  useEffect(() => {
    setIsAddingSub(false);
    setNewSubName('');
    setSubError('');

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
      setSelectedSubcategoryId(editingTransaction.subcategoryId || null);
      setSelectedSubcategory(editingTransaction.subcategory || '');
      setDate(editingTransaction.date);
      setPaymentMethod(editingTransaction.paymentMethod);
      setNote(editingTransaction.note || '');
    } else {
      setType('expense');
      setAmount('');
      const defaultExp = categories.find((c) => c.type === 'expense');
      setSelectedCategoryId(defaultExp?.dbId || 1);
      setSelectedSubcategoryId(null);
      setSelectedSubcategory('');
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
    setSelectedSubcategoryId(null);
    setSelectedSubcategory('');
    setIsAddingSub(false);
    setNewSubName('');
    setSubError('');
  };

  const handleCreateSubcategory = async () => {
    const trimmed = newSubName.trim();
    if (!trimmed) {
      setSubError('Please enter a subcategory name');
      return;
    }
    if (!selectedCategoryId) {
      setSubError('Please select a category first');
      return;
    }

    try {
      setIsSubLoading(true);
      setSubError('');
      const createdSub: SubcategoryItem = await api.createSubcategory(selectedCategoryId, trimmed);

      // Add to local custom subcategories map
      setCustomSubcategories((prev) => ({
        ...prev,
        [selectedCategoryId]: [...(prev[selectedCategoryId] || []), createdSub],
      }));

      // Immediately select newly created subcategory
      setSelectedSubcategoryId(createdSub.id);
      setSelectedSubcategory(createdSub.name);

      // Notify parent to refresh cache / global state
      if (onSubcategoryCreated) {
        onSubcategoryCreated(selectedCategoryId, createdSub);
      }

      setIsAddingSub(false);
      setNewSubName('');
    } catch (err: any) {
      console.error('Failed to create subcategory:', err);
      setSubError(err.message || 'Failed to add subcategory');
    } finally {
      setIsSubLoading(false);
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
          subcategoryId: selectedSubcategoryId || undefined,
          subcategory: selectedSubcategory.trim() ? selectedSubcategory.trim() : undefined,
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
                  onClick={() => {
                    setSelectedCategoryId(cat.dbId || 1);
                    setSelectedSubcategoryId(null);
                    setSelectedSubcategory('');
                    setIsAddingSub(false);
                    setNewSubName('');
                    setSubError('');
                  }}
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

            {/* Optional Subcategories */}
            {(() => {
              const currentCat = categoryList.find(
                (c) => c.dbId === selectedCategoryId || c.id === String(selectedCategoryId)
              );
              const baseSubs = currentCat?.subcategories || [];
              const localSubs = customSubcategories[selectedCategoryId] || [];
              const combinedSubs: SubcategoryItem[] = [...baseSubs];
              for (const ls of localSubs) {
                if (!combinedSubs.some((s) => s.id === ls.id || s.name.toLowerCase() === ls.name.toLowerCase())) {
                  combinedSubs.push(ls);
                }
              }

              return (
                <div style={{ marginTop: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary, #94a3b8)' }}>
                      Subcategory <span style={{ opacity: 0.7, fontWeight: 400 }}>(Optional)</span>
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {selectedSubcategory && (
                        <button
                          type="button"
                          className="quick-link-btn"
                          style={{ fontSize: '11px', padding: 0, textDecoration: 'underline' }}
                          onClick={() => {
                            setSelectedSubcategoryId(null);
                            setSelectedSubcategory('');
                          }}
                        >
                          Clear subcategory
                        </button>
                      )}
                      {!isAddingSub && (
                        <button
                          type="button"
                          className="quick-link-btn"
                          onClick={() => {
                            setIsAddingSub(true);
                            setNewSubName('');
                            setSubError('');
                          }}
                        >
                          <Plus size={12} /> Add Subcategory
                        </button>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                    <button
                      type="button"
                      style={{
                        padding: '4px 10px',
                        borderRadius: '14px',
                        fontSize: '11px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        border: !selectedSubcategory ? '1px solid var(--primary, #6366f1)' : '1px solid rgba(255,255,255,0.12)',
                        backgroundColor: !selectedSubcategory ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.03)',
                        color: !selectedSubcategory ? '#a5b4fc' : 'var(--text-secondary, #94a3b8)',
                        transition: 'all 0.15s ease',
                      }}
                      onClick={() => {
                        setSelectedSubcategoryId(null);
                        setSelectedSubcategory('');
                      }}
                    >
                      None
                    </button>
                    {combinedSubs.map((sub) => {
                      const isSelected =
                        selectedSubcategoryId === sub.id ||
                        selectedSubcategory.toLowerCase() === sub.name.toLowerCase();
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          style={{
                            padding: '4px 10px',
                            borderRadius: '14px',
                            fontSize: '11px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            border: isSelected ? '1px solid var(--primary, #6366f1)' : '1px solid rgba(255,255,255,0.12)',
                            backgroundColor: isSelected ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.03)',
                            color: isSelected ? '#a5b4fc' : 'var(--text-secondary, #94a3b8)',
                            transition: 'all 0.15s ease',
                          }}
                          onClick={() => {
                            setSelectedSubcategoryId(sub.id);
                            setSelectedSubcategory(sub.name);
                          }}
                        >
                          {sub.name}
                        </button>
                      );
                    })}

                    {!isAddingSub && (
                      <button
                        type="button"
                        className="subcat-pill-add"
                        onClick={() => {
                          setIsAddingSub(true);
                          setNewSubName('');
                          setSubError('');
                        }}
                        title="Add subcategory"
                      >
                        <Plus size={11} /> Add
                      </button>
                    )}
                  </div>

                  {isAddingSub && (
                    <div style={{ marginTop: '8px' }}>
                      <div className="subcat-inline-add">
                        <input
                          type="text"
                          className="subcat-inline-input"
                          value={newSubName}
                          onChange={(e) => {
                            setNewSubName(e.target.value);
                            if (subError) setSubError('');
                          }}
                          placeholder={`Add subcategory for ${currentCat?.label || 'category'}...`}
                          autoFocus
                          maxLength={35}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleCreateSubcategory();
                            } else if (e.key === 'Escape') {
                              setIsAddingSub(false);
                              setNewSubName('');
                              setSubError('');
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="subcat-inline-btn-save"
                          onClick={() => handleCreateSubcategory()}
                          disabled={isSubLoading || !newSubName.trim()}
                        >
                          {isSubLoading ? (
                            'Saving...'
                          ) : (
                            <>
                              <Check size={12} /> Add
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          className="subcat-inline-btn-cancel"
                          onClick={() => {
                            setIsAddingSub(false);
                            setNewSubName('');
                            setSubError('');
                          }}
                          title="Cancel"
                        >
                          <X size={15} />
                        </button>
                      </div>
                      {subError && (
                        <div style={{ color: 'var(--danger, #ef4444)', fontSize: '11px', marginTop: '4px', paddingLeft: '4px' }}>
                          {subError}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Enhanced Modern Date Picker & Calendar */}
          <div className="form-group">
            <CustomDatePicker
              value={date}
              onChange={setDate}
              label="Date"
              required
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
