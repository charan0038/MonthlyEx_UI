import React from 'react';
import {
  X,
  ArrowRightCircle,
  Banknote,
  AlertTriangle,
  ArrowRight,
  Wallet,
  Check,
} from 'lucide-react';
import { formatINR } from '../utils/formatters';

export interface ConfirmModalProps {
  isOpen: boolean;
  type?: 'rollover' | 'cash' | 'danger';
  title: string;
  subtitle?: string;
  amount?: number;
  fromMonth?: string;
  toMonth?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  type = 'rollover',
  title,
  subtitle,
  amount,
  fromMonth,
  toMonth,
  confirmText,
  cancelText = 'Cancel',
  isLoading = false,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  const isRollover = type === 'rollover';
  const isCash = type === 'cash';
  const isDanger = type === 'danger';

  return (
    <div
      className="modal-backdrop active"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="modal-card confirm-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          className="profile-close-btn"
          onClick={onClose}
          aria-label="Close modal"
          disabled={isLoading}
        >
          <X size={16} />
        </button>

        {/* Header with Icon */}
        <div className="confirm-modal-header">
          <div
            className={`confirm-icon-ring ${
              isRollover
                ? 'ring-rollover'
                : isCash
                ? 'ring-cash'
                : 'ring-danger'
            }`}
          >
            {isRollover ? (
              <ArrowRightCircle size={28} />
            ) : isCash ? (
              <Banknote size={28} />
            ) : (
              <AlertTriangle size={28} />
            )}
          </div>

          <h3 className="confirm-modal-title">{title}</h3>
          {subtitle && <p className="confirm-modal-subtitle">{subtitle}</p>}
        </div>

        {/* Featured Amount Card */}
        {typeof amount === 'number' && amount > 0 && (
          <div className="confirm-amount-card">
            <div className="confirm-amount-label">Settlement Amount</div>
            <div className="confirm-amount-val">{formatINR(amount)}</div>

            {/* Path visualization for Rollover */}
            {isRollover && fromMonth && toMonth && (
              <div className="confirm-flow-row">
                <div className="flow-step">
                  <span className="flow-step-label">From</span>
                  <span className="flow-step-val">{fromMonth}</span>
                  <span className="flow-step-badge badge-unspent">Unspent Budget</span>
                </div>
                <div className="flow-arrow">
                  <ArrowRight size={16} />
                </div>
                <div className="flow-step">
                  <span className="flow-step-label">To</span>
                  <span className="flow-step-val">{toMonth}</span>
                  <span className="flow-step-badge badge-income">Opening Income</span>
                </div>
              </div>
            )}

            {/* Detail for Cash Checkout */}
            {isCash && (
              <div className="confirm-cash-detail">
                <Wallet size={14} />
                <span>Withdraw as cash &amp; balance recorded as spent outflow</span>
              </div>
            )}
          </div>
        )}

        {/* Actions Footer */}
        <div className="confirm-modal-actions">
          <button
            type="button"
            className="profile-btn-cancel"
            onClick={onClose}
            disabled={isLoading}
          >
            <X size={15} />
            <span>{cancelText}</span>
          </button>

          <button
            type="button"
            className={`profile-btn-save ${isDanger ? 'btn-danger-confirm' : ''}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="btn-spinner" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Check size={16} />
                <span>{confirmText || 'Confirm'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
