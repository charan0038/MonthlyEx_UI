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
  theme?: 'dark' | 'light';
}

export const TransactionsList: React.FC<TransactionsListProps> = ({
  transactions,
  categories = [],
  search,
  category,
  type,
  payment,
  sortBy,
  theme = 'dark',
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
  const isDark = theme === 'dark';
  const expenseCats =
    categories.length > 0
      ? categories.filter((c) => !c.type || c.type.toLowerCase() === 'expense')
      : EXPENSE_CATEGORIES;

  const incomeCats =
    categories.length > 0
      ? categories.filter((c) => c.type?.toLowerCase() === 'income')
      : INCOME_CATEGORIES;

  return (
    <section
      id="transactions-section"
      className="transactions-card"
      style={{
        borderRadius: '20px',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(96, 193, 229, 0.65)',
        borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '4px solid #005A9C',
        background: isDark ? 'rgba(10, 19, 38, 0.85)' : '#A0E0EF',
        backdropFilter: 'blur(20px)',
        boxShadow: isDark
          ? '0 12px 32px rgba(0, 0, 0, 0.45)'
          : '0 8px 24px -4px rgba(0, 90, 156, 0.12), 0 2px 8px rgba(96, 193, 229, 0.25)',
        overflow: 'hidden',
        marginBottom: '28px',
        transition: 'all 0.25s ease',
      }}
    >
      <div
        className="transactions-header"
        style={{
          padding: '22px 24px 18px 24px',
          borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.07)' : '1px solid rgba(96, 193, 229, 0.4)',
        }}
      >
        <div
          className="transactions-top-row"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '18px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: isDark ? '#ffffff' : '#005A9C', margin: 0 }}>
              Transactions
            </h2>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '2px 8px',
                borderRadius: '999px',
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.85)',
                border: isDark ? 'none' : '1px solid rgba(96, 193, 229, 0.5)',
                color: isDark ? '#8A99AD' : '#005A9C',
                fontSize: '11px',
                fontFamily: 'ui-monospace, monospace',
                fontWeight: 600,
              }}
            >
              {transactions.length} record{transactions.length === 1 ? '' : 's'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {onExportPdf && (
              <button
                type="button"
                className="btn-outline"
                onClick={onExportPdf}
                title="Export Monthly PDF Statement"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '10px',
                  border: isDark ? '1px solid rgba(244, 63, 94, 0.35)' : '1px solid rgba(225, 29, 72, 0.45)',
                  backgroundColor: isDark ? 'rgba(244, 63, 94, 0.08)' : 'rgba(255, 255, 255, 0.85)',
                  color: isDark ? '#fb7185' : '#9f1239',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                }}
              >
                <FileText size={14} /> Export PDF
              </button>
            )}

            {onOpenCategoryManager && (
              <button
                type="button"
                className="btn-outline"
                onClick={onOpenCategoryManager}
                title="Manage dynamic categories"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '10px',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(96, 193, 229, 0.6)',
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.85)',
                  color: isDark ? '#cbd5e1' : '#005A9C',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                }}
              >
                <Layers size={14} /> Categories
              </button>
            )}

            <button
              type="button"
              className="btn-outline"
              onClick={onClearMonth}
              title="Clear all transactions for this month"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '10px',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(96, 193, 229, 0.6)',
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.85)',
                color: isDark ? '#8A99AD' : '#005A9C',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.18s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.5)';
                e.currentTarget.style.color = '#f43f5e';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(96, 193, 229, 0.6)';
                e.currentTarget.style.color = isDark ? '#8A99AD' : '#005A9C';
              }}
            >
              <Trash2 size={14} /> Clear Month
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div
          className="filter-bar"
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <div
            className="search-input-wrap"
            style={{
              position: 'relative',
              flex: 1,
              minWidth: '220px',
            }}
          >
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: isDark ? '#8A99AD' : '#005A9C',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              className="search-input"
              placeholder="Search note or description..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              style={{
                width: '100%',
                background: isDark ? 'rgba(5, 11, 20, 0.85)' : 'rgba(255, 255, 255, 0.9)',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(96, 193, 229, 0.65)',
                borderRadius: '999px',
                padding: '9px 16px 9px 38px',
                fontSize: '13px',
                color: isDark ? '#ffffff' : '#005A9C',
                outline: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#005A9C';
                e.target.style.boxShadow = '0 0 0 3px rgba(96, 193, 229, 0.35)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(96, 193, 229, 0.65)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <select
            className="filter-select"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            aria-label="Filter by Category"
            style={{
              background: isDark ? 'rgba(5, 11, 20, 0.85)' : 'rgba(255, 255, 255, 0.9)',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(96, 193, 229, 0.65)',
              borderRadius: '999px',
              padding: '9px 16px',
              fontSize: '12.5px',
              color: isDark ? '#e2e8f0' : '#005A9C',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="ALL">All Categories</option>
            <optgroup label="Expense Categories">
              {expenseCats.map((c) => (
                <option key={`exp-${c.label}`} value={c.label}>
                  {c.label}
                </option>
              ))}
            </optgroup>
            <optgroup label="Income Categories">
              {incomeCats.map((c) => (
                <option key={`inc-${c.label}`} value={c.label}>
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
            style={{
              background: isDark ? 'rgba(5, 11, 20, 0.85)' : 'rgba(255, 255, 255, 0.9)',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(96, 193, 229, 0.65)',
              borderRadius: '999px',
              padding: '9px 16px',
              fontSize: '12.5px',
              color: isDark ? '#e2e8f0' : '#005A9C',
              outline: 'none',
              cursor: 'pointer',
            }}
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
            style={{
              background: isDark ? 'rgba(5, 11, 20, 0.85)' : 'rgba(255, 255, 255, 0.9)',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(96, 193, 229, 0.65)',
              borderRadius: '999px',
              padding: '9px 16px',
              fontSize: '12.5px',
              color: isDark ? '#e2e8f0' : '#005A9C',
              outline: 'none',
              cursor: 'pointer',
            }}
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
            style={{
              background: isDark ? 'rgba(5, 11, 20, 0.85)' : 'rgba(255, 255, 255, 0.9)',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(96, 193, 229, 0.65)',
              borderRadius: '999px',
              padding: '9px 16px',
              fontSize: '12.5px',
              color: isDark ? '#e2e8f0' : '#005A9C',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Highest Amount</option>
            <option value="amount-asc">Lowest Amount</option>
          </select>

          <button
            type="button"
            className="clear-filters-btn"
            onClick={onResetFilters}
            style={{
              background: 'transparent',
              border: 'none',
              color: isDark ? '#8A99AD' : '#005A9C',
              fontSize: '12.5px',
              fontWeight: 600,
              padding: '8px 12px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'color 0.18s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#f43f5e')}
            onMouseLeave={(e) => (e.currentTarget.style.color = isDark ? '#8A99AD' : '#005A9C')}
          >
            <RotateCcw size={13} /> Reset
          </button>
        </div>
      </div>

      {/* Transactions List */}
      {transactions.length > 0 ? (
        <ul className="transaction-list" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {transactions.map((tx) => {
            const catKey = tx.categoryId || (typeof tx.category === 'object' ? tx.category?.name : tx.category);
            const meta = getCategoryMeta(catKey, tx.type);
            const isIncome = tx.type === 'income';

            return (
              <li
                key={tx.id}
                className="transaction-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 24px',
                  borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(96, 193, 229, 0.45)',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.035)' : 'rgba(255, 255, 255, 0.45)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '13px',
                      backgroundColor: meta.color || '#64748b',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 4px 14px ${meta.color}40`,
                      flexShrink: 0,
                    }}
                  >
                    <CategoryIcon name={meta.iconName} size={20} />
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: isDark ? '#ffffff' : '#005A9C',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={tx.note || meta.label}
                    >
                      {tx.note || meta.label}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '12px',
                        color: isDark ? '#8A99AD' : '#1E4D61',
                        marginTop: '3px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <span>{meta.label}</span>
                      {tx.subcategory && (
                        <>
                          <span style={{ opacity: 0.4 }}>›</span>
                          <span style={{ color: isDark ? '#e2e8f0' : '#005A9C', fontWeight: 500 }}>{tx.subcategory}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>{formatDateDisplay(tx.date)}</span>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '1px 7px',
                          borderRadius: '6px',
                          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.85)',
                          border: isDark ? 'none' : '1px solid rgba(96, 193, 229, 0.5)',
                          color: isDark ? '#cbd5e1' : '#005A9C',
                          fontSize: '10.5px',
                        }}
                      >
                        {tx.paymentMethod === 'Card' ? (
                          <CreditCard size={11} />
                        ) : tx.paymentMethod === 'Cash' ? (
                          <Banknote size={11} />
                        ) : (
                          <Smartphone size={11} />
                        )}
                        {tx.paymentMethod}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
                  <div
                    style={{
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                      fontSize: '15.5px',
                      fontWeight: 700,
                      letterSpacing: '-0.2px',
                      color: isIncome ? (isDark ? '#34D399' : '#065F46') : (isDark ? '#FB7185' : '#9F1239'),
                    }}
                  >
                    {isIncome ? '+ ' : '- '}
                    {formatINR(tx.amount)}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      type="button"
                      className="tx-action-btn edit-btn"
                      onClick={() => onEditTransaction(tx)}
                      title="Edit Transaction"
                      aria-label="Edit"
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(96, 193, 229, 0.65)',
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.85)',
                        color: isDark ? '#8A99AD' : '#005A9C',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = isDark ? 'rgba(6, 182, 212, 0.6)' : 'rgba(0, 90, 156, 0.7)';
                        e.currentTarget.style.color = isDark ? '#0284c7' : '#005A9C';
                        e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.95)' : '#ffffff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(96, 193, 229, 0.65)';
                        e.currentTarget.style.color = isDark ? '#8A99AD' : '#005A9C';
                        e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.85)';
                      }}
                    >
                      <Edit3 size={14} />
                    </button>

                    <button
                      type="button"
                      className="tx-action-btn delete-btn"
                      onClick={() => onDeleteTransaction(tx.id)}
                      title="Delete Transaction"
                      aria-label="Delete"
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(96, 193, 229, 0.65)',
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.85)',
                        color: isDark ? '#8A99AD' : '#005A9C',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.6)';
                        e.currentTarget.style.color = '#e11d48';
                        e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.95)' : '#ffffff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(96, 193, 229, 0.65)';
                        e.currentTarget.style.color = isDark ? '#8A99AD' : '#005A9C';
                        e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.85)';
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div
          className="empty-state"
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              backgroundColor: isDark ? 'rgba(255, 87, 34, 0.1)' : 'rgba(96, 193, 229, 0.25)',
              border: isDark ? '1px solid rgba(255, 87, 34, 0.25)' : '1px solid rgba(96, 193, 229, 0.65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isDark ? '#FF5722' : '#005A9C',
              marginBottom: '16px',
              boxShadow: isDark ? '0 0 24px rgba(255, 87, 34, 0.2)' : '0 4px 16px rgba(0, 90, 156, 0.25)',
            }}
          >
            <Plus size={28} />
          </div>

          <h3 style={{ fontSize: '16px', fontWeight: 700, color: isDark ? '#ffffff' : '#005A9C', marginBottom: '6px' }}>
            No transactions found
          </h3>
          <p style={{ fontSize: '13px', color: isDark ? '#8A99AD' : '#1E4D61', maxWidth: '380px', marginBottom: '20px' }}>
            No transactions found for this month or filter. Add your first transaction to get started.
          </p>

          <button
            type="button"
            className="btn-primary"
            onClick={onOpenAddModal}
            style={{
              background: isDark
                ? 'linear-gradient(135deg, #FF5722 0%, #FF7A45 100%)'
                : 'linear-gradient(135deg, #005A9C 0%, #60C1E5 100%)',
              boxShadow: isDark ? '0 0 20px rgba(255, 87, 34, 0.4)' : '0 4px 16px rgba(0, 90, 156, 0.35)',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(96, 193, 229, 0.6)',
              color: '#ffffff',
              fontWeight: 700,
              borderRadius: '12px',
              padding: '10px 20px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
            }}
          >
            <Plus size={16} strokeWidth={2.4} /> Add Transaction Now
          </button>
        </div>
      )}
    </section>
  );
};
