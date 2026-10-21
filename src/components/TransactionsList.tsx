import React from 'react';
import {
  Search,
  RotateCcw,
  Trash2,
  Edit3,
  CreditCard,
  Smartphone,
  Banknote,
  Plus,
  Layers,
  FileText,
} from 'lucide-react';
import type { Transaction, CategoryMeta } from '../types';
import { getCategoryMeta, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants/categories';
import { CategoryIcon } from './CategoryIcon';
import { formatINR, formatDateDisplay } from '../utils/formatters';

interface TransactionsListProps {
  transactions: Transaction[];
  categories?: CategoryMeta[];
  search: string;
  category: string;
  type: string;
  payment: string;
  sortBy: string;
  onSearchChange: (val: string) => void;
  onCategoryChange: (val: string) => void;
  onTypeChange: (val: string) => void;
  onPaymentChange: (val: string) => void;
  onSortByChange: (val: string) => void;
  onResetFilters: () => void;
  onClearMonth: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onOpenAddModal: () => void;
  onOpenCategoryManager?: () => void;
  onExportPdf?: () => void;
}

export const TransactionsList: React.FC<TransactionsListProps> = ({
  transactions,
  categories = [],
  search,
  category,
  type,
  payment,
  sortBy,
  onSearchChange,
  onCategoryChange,
  onTypeChange,
  onPaymentChange,
  onSortByChange,
  onResetFilters,
  onClearMonth,
  onEditTransaction,
  onDeleteTransaction,
  onOpenAddModal,
  onOpenCategoryManager,
  onExportPdf,
}) => {
  const expenseCats = categories.length > 0
    ? categories.filter((c) => !c.type || c.type.toLowerCase() === 'expense')
    : EXPENSE_CATEGORIES;

  const incomeCats = categories.length > 0
    ? categories.filter((c) => c.type?.toLowerCase() === 'income')
    : INCOME_CATEGORIES;

  return (
    <section id="transactions-section" className="transactions-card">
      <div className="transactions-header">
        <div className="transactions-top-row">
          <div className="transactions-title-group">
            <h2>Transactions</h2>
            <span className="transactions-count-badge">
              {transactions.length} record{transactions.length === 1 ? '' : 's'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {onExportPdf && (
              <button
                className="btn-outline"
                onClick={onExportPdf}
                title="Export Monthly PDF Statement"
                style={{
                  borderColor: 'rgba(239, 68, 68, 0.3)',
                  color: '#fb7185',
                  backgroundColor: 'rgba(239, 68, 68, 0.05)',
                }}
              >
                <FileText size={14} /> Export PDF
              </button>
            )}
            {onOpenCategoryManager && (
              <button
                className="btn-outline"
                onClick={onOpenCategoryManager}
                title="Manage dynamic categories"
              >
                <Layers size={14} /> Categories
              </button>
            )}
            <button
              className="btn-outline"
              onClick={onClearMonth}
              title="Clear all transactions for this month"
            >
              <Trash2 size={14} /> Clear Month
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="filter-bar">
          <div className="search-input-wrap">
            <Search size={16} />
            <input
              type="text"
              className="search-input"
              placeholder="Search note or description..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          <select
            className="filter-select"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            aria-label="Filter by Category"
          >
            <option value="ALL">All Categories</option>
            <optgroup label="Expense Categories">
              {expenseCats.map((c) => (
                <option key={`exp-${c.label}`} value={c.dbId?.toString() || c.label}>
                  {c.label}
                </option>
              ))}
            </optgroup>
            <optgroup label="Income Categories">
              {incomeCats.map((c) => (
                <option key={`inc-${c.label}`} value={c.dbId?.toString() || c.label}>
                  {c.label}
                </option>
              ))}
            </optgroup>
          </select>

          <select
            className="filter-select"
            value={type}
            onChange={(e) => onTypeChange(e.target.value)}
            aria-label="Filter by Type"
          >
            <option value="ALL">All Types</option>
            <option value="expense">Expenses Only</option>
            <option value="income">Income Only</option>
          </select>

          <select
            className="filter-select"
            value={payment}
            onChange={(e) => onPaymentChange(e.target.value)}
            aria-label="Filter by Payment Method"
          >
            <option value="ALL">All Payments</option>
            <option value="UPI">UPI</option>
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
          </select>

          <select
            className="filter-select"
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            aria-label="Sort Transactions"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Highest Amount</option>
            <option value="amount-asc">Lowest Amount</option>
          </select>

          <button className="clear-filters-btn" onClick={onResetFilters}>
            <RotateCcw size={14} /> Reset
          </button>
        </div>
      </div>

      {/* Transactions List */}
      {transactions.length > 0 ? (
        <ul className="transaction-list">
          {transactions.map((tx) => {
            const catKey = tx.categoryId || (typeof tx.category === 'object' ? tx.category?.name : tx.category);
            const meta = getCategoryMeta(catKey, tx.type);
            const isIncome = tx.type === 'income';

            return (
              <li key={tx.id} className="transaction-item">
                <div className="tx-left">
                  <div className="tx-category-icon" style={{ backgroundColor: meta.color }}>
                    <CategoryIcon name={meta.iconName} size={20} />
                  </div>
                  <div className="tx-details">
                    <div className="tx-note" title={tx.note || meta.label}>
                      {tx.note || meta.label}
                    </div>
                    <div className="tx-meta">
                      <span>{meta.label}</span>
                      {tx.subcategory && (
                        <>
                          <span style={{ opacity: 0.4 }}>›</span>
                          <span style={{ color: 'var(--text-primary, #f1f5f9)', fontWeight: 500 }}>{tx.subcategory}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>{formatDateDisplay(tx.date)}</span>
                      <span className="tx-chip">
                        {tx.paymentMethod === 'Card' ? (
                          <CreditCard size={12} />
                        ) : tx.paymentMethod === 'Cash' ? (
                          <Banknote size={12} />
                        ) : (
                          <Smartphone size={12} />
                        )}
                        {tx.paymentMethod}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="tx-right">
                  <div className={`tx-amount ${isIncome ? 'income' : 'expense'}`}>
                    {isIncome ? '+ ' : '- '}
                    {formatINR(tx.amount)}
                  </div>
                  <div className="tx-actions">
                    <button
                      className="tx-action-btn edit-btn"
                      onClick={() => onEditTransaction(tx)}
                      title="Edit Transaction"
                      aria-label="Edit"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      className="tx-action-btn delete-btn"
                      onClick={() => onDeleteTransaction(tx.id)}
                      title="Delete Transaction"
                      aria-label="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="empty-state">
          <svg className="empty-state-svg" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="80" fill="var(--bg-muted)" />
            <path
              d="M70 120H130C135.523 120 140 115.523 140 110V80C140 74.4772 135.523 70 130 70H70C64.4772 70 60 74.4772 60 80V110C60 115.523 64.4772 120 70 120Z"
              stroke="var(--primary)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="145" cy="65" r="16" fill="var(--income)" />
            <path d="M145 58V72M138 65H152" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <h3 className="empty-state-title">No transactions found</h3>
          <p className="empty-state-desc">
            No transactions found for this month or filter. Add your first transaction to get started.
          </p>
          <button className="btn-primary" onClick={onOpenAddModal}>
            <Plus size={16} /> Add Transaction Now
          </button>
        </div>
      )}
    </section>
  );
};
