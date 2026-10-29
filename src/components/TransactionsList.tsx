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
        border: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(10, 19, 38, 0.85)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.45)',
        overflow: 'hidden',
        marginBottom: '28px',
      }}
    >
      <div
        className="transactions-header"
        style={{
          padding: '22px 24px 18px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
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
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', margin: 0 }}>
              Transactions
            </h2>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '2px 8px',
                borderRadius: '999px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: '#8A99AD',
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
                  border: '1px solid rgba(244, 63, 94, 0.35)',
                  backgroundColor: 'rgba(244, 63, 94, 0.08)',
                  color: '#fb7185',
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
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  color: '#cbd5e1',
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
                border: '1px solid rgba(255, 255, 255, 0.12)',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                color: '#8A99AD',
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
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                e.currentTarget.style.color = '#8A99AD';
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
                color: '#8A99AD',
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
                background: 'rgba(5, 11, 20, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '999px',
                padding: '9px 16px 9px 38px',
                fontSize: '13px',
                color: '#ffffff',
                outline: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#FF5722';
                e.target.style.boxShadow = '0 0 0 3px rgba(255, 87, 34, 0.25)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
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
              background: 'rgba(5, 11, 20, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '999px',
              padding: '9px 16px',
              fontSize: '12.5px',
              color: '#e2e8f0',
              outline: 'none',
              cursor: 'pointer',
            }}
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
            style={{
              background: 'rgba(5, 11, 20, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '999px',
              padding: '9px 16px',
              fontSize: '12.5px',
              color: '#e2e8f0',
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
              background: 'rgba(5, 11, 20, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '999px',
              padding: '9px 16px',
              fontSize: '12.5px',
              color: '#e2e8f0',
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
              background: 'rgba(5, 11, 20, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '999px',
              padding: '9px 16px',
              fontSize: '12.5px',
              color: '#e2e8f0',
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
              color: '#8A99AD',
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
            onMouseLeave={(e) => (e.currentTarget.style.color = '#8A99AD')}
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
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.035)')}
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
                        color: '#ffffff',
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
                        color: '#8A99AD',
                        marginTop: '3px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <span>{meta.label}</span>
                      {tx.subcategory && (
                        <>
                          <span style={{ opacity: 0.4 }}>›</span>
                          <span style={{ color: '#e2e8f0', fontWeight: 500 }}>{tx.subcategory}</span>
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
                          backgroundColor: 'rgba(255, 255, 255, 0.06)',
                          color: '#cbd5e1',
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
                      color: isIncome ? '#34D399' : '#FB7185',
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
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        color: '#8A99AD',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.4)';
                        e.currentTarget.style.color = '#22d3ee';
                        e.currentTarget.style.backgroundColor = 'rgba(6, 182, 212, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                        e.currentTarget.style.color = '#8A99AD';
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
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
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        color: '#8A99AD',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.4)';
                        e.currentTarget.style.color = '#f43f5e';
                        e.currentTarget.style.backgroundColor = 'rgba(244, 63, 94, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                        e.currentTarget.style.color = '#8A99AD';
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
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
              backgroundColor: 'rgba(255, 87, 34, 0.1)',
              border: '1px solid rgba(255, 87, 34, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FF5722',
              marginBottom: '16px',
              boxShadow: '0 0 24px rgba(255, 87, 34, 0.2)',
            }}
          >
            <Plus size={28} />
          </div>

          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', marginBottom: '6px' }}>
            No transactions found
          </h3>
          <p style={{ fontSize: '13px', color: '#8A99AD', maxWidth: '380px', marginBottom: '20px' }}>
            No transactions found for this month or filter. Add your first transaction to get started.
          </p>

          <button
            type="button"
            className="btn-primary"
            onClick={onOpenAddModal}
            style={{
              background: 'linear-gradient(135deg, #FF5722 0%, #FF7A45 100%)',
              boxShadow: '0 0 20px rgba(255, 87, 34, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
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
