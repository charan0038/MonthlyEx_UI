import React from 'react';
import {
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
  Settings2,
  Coins,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { formatINR } from '../utils/formatters';

interface BudgetCardProps {
  budgetLimit: number;
  totalExpense: number;
  budgetLeft: number;
  usedPercentage: number;
  netBalance?: number;
  isBudgetSet?: boolean;
  isEndOfMonth?: boolean;
  theme?: 'dark' | 'light';
  onOpenBudgetModal: () => void;
  onCashCheckout?: () => void;
  onRolloverBalance?: () => void;
}

export const BudgetCard: React.FC<BudgetCardProps> = ({
  budgetLimit,
  totalExpense,
  budgetLeft,
  usedPercentage,
  netBalance = 0,
  isBudgetSet = true,
  isEndOfMonth: _isEndOfMonth = false,
  theme = 'dark',
  onOpenBudgetModal,
  onCashCheckout,
  onRolloverBalance,
}) => {
  const isDark = theme === 'dark';
  const isDanger = isBudgetSet && budgetLimit > 0 && totalExpense > budgetLimit;
  const isWarning = isBudgetSet && !isDanger && budgetLimit > 0 && totalExpense >= budgetLimit * 0.8;

  // Dual-zone gauge calculation
  const excessAmount = Math.max(0, totalExpense - budgetLimit);
  let baseBarPercent = 0;
  let excessBarPercent = 0;

  if (isBudgetSet && budgetLimit > 0) {
    if (totalExpense <= budgetLimit) {
      baseBarPercent = Math.min(100, Math.max(0, usedPercentage));
      excessBarPercent = 0;
    } else {
      // Scale proportionally so safe zone + excess fill the gauge
      baseBarPercent = (budgetLimit / totalExpense) * 100;
      excessBarPercent = (excessAmount / totalExpense) * 100;
    }
  }

  return (
    <section
      className="budget-banner-card"
      aria-label="Monthly Budget Progress"
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '20px',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.09)' : '1px solid rgba(74, 182, 206, 0.55)',
        background: isDark
          ? 'linear-gradient(180deg, rgba(10, 19, 38, 0.92) 0%, rgba(6, 12, 24, 0.88) 100%)'
          : 'linear-gradient(135deg, #A0E0EF 0%, #B8EBF6 50%, #A0E0EF 100%)',
        padding: '24px 26px',
        backdropFilter: 'blur(24px)',
        boxShadow: isDark
          ? '0 20px 45px -10px rgba(0, 0, 0, 0.65), 0 0 1px rgba(255, 255, 255, 0.1)'
          : '0 16px 36px -6px rgba(10, 35, 66, 0.12), 0 2px 8px rgba(160, 224, 239, 0.4)',
        marginBottom: '24px',
        transition: 'all 0.25s ease',
      }}
    >
      {/* Top Right Ambient Glow */}
      <div
        style={{
          position: 'absolute',
          top: '-60px',
          right: '-60px',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: isDanger
            ? isDark ? 'rgba(244, 63, 94, 0.14)' : 'rgba(244, 63, 94, 0.15)'
            : isDark ? 'rgba(255, 87, 34, 0.12)' : 'rgba(255, 87, 34, 0.12)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }}
      />

      {/* Top Row: Title + Emergency Beacon + Telemetry Readout */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h2
            style={{
              fontSize: '18px',
              fontWeight: 800,
              letterSpacing: '-0.3px',
              color: isDark ? '#ffffff' : '#081C30',
              margin: 0,
              transition: 'color 0.2s ease',
            }}
          >
            Monthly Budget
          </h2>

          {!isBudgetSet ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 10px',
                borderRadius: '999px',
                background: isDark ? 'rgba(148, 163, 184, 0.12)' : 'rgba(255, 255, 255, 0.75)',
                color: isDark ? '#94a3b8' : '#1E4D61',
                border: isDark ? '1px solid rgba(148, 163, 184, 0.25)' : '1px solid rgba(74, 182, 206, 0.45)',
                fontSize: '11.5px',
                fontWeight: 600,
              }}
            >
              <AlertCircle size={13} /> Not Set
            </span>
          ) : isDanger ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '3px 10px',
                borderRadius: '999px',
                background: isDark ? 'rgba(244, 63, 94, 0.15)' : 'rgba(255, 255, 255, 0.85)',
                color: isDark ? '#fda4af' : '#9F1239',
                border: isDark ? '1px solid rgba(244, 63, 94, 0.45)' : '1px solid rgba(159, 18, 57, 0.35)',
                fontSize: '11.5px',
                fontWeight: 700,
                boxShadow: isDark ? '0 0 16px rgba(244, 63, 94, 0.35)' : '0 2px 8px rgba(244, 63, 94, 0.2)',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#f43f5e',
                  boxShadow: '0 0 8px #f43f5e',
                }}
              />
              Exceeded {Math.round(usedPercentage)}%
            </span>
          ) : isWarning ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 10px',
                borderRadius: '999px',
                background: isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.85)',
                color: isDark ? '#fcd34d' : '#92400E',
                border: isDark ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(146, 64, 14, 0.35)',
                fontSize: '11.5px',
                fontWeight: 600,
              }}
            >
              <AlertCircle size={13} /> Warning (80%+)
            </span>
          ) : (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 10px',
                borderRadius: '999px',
                background: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.85)',
                color: isDark ? '#6ee7b7' : '#065F46',
                border: isDark ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(6, 95, 70, 0.35)',
                fontSize: '11.5px',
                fontWeight: 600,
                boxShadow: isDark ? '0 0 12px rgba(16, 185, 129, 0.25)' : '0 1px 4px rgba(16, 185, 129, 0.15)',
              }}
            >
              <ShieldCheck size={13} /> On Track
            </span>
          )}
        </div>

        {/* Right Telemetry & Settings Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '13px', color: isDark ? '#8A99AD' : '#1E4D61' }}>
            Telemetry:{' '}
            <strong
              style={{
                color: isDark ? '#ffffff' : '#081C30',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                fontSize: '14px',
                fontWeight: 700,
                letterSpacing: '-0.3px',
              }}
            >
              Spent: {formatINR(totalExpense)} of {isBudgetSet ? formatINR(budgetLimit) : 'Not Set'}
            </strong>
          </div>

          <button
            type="button"
            onClick={onOpenBudgetModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 13px',
              borderRadius: '10px',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(74, 182, 206, 0.55)',
              background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.7)',
              color: isDark ? '#e2e8f0' : '#081C30',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.18s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#FF5722';
              e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 87, 34, 0.12)' : '#ffffff';
              e.currentTarget.style.color = '#FF5722';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(74, 182, 206, 0.55)';
              e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.7)';
              e.currentTarget.style.color = isDark ? '#e2e8f0' : '#081C30';
            }}
          >
            <Settings2 size={13} color="#FF5722" />
            <span>Set Budget</span>
          </button>
        </div>
      </div>

      {/* High-Precision Gauge Progress Bar */}
      <div style={{ marginBottom: '16px' }}>
        <div
          style={{
            position: 'relative',
            height: '18px',
            width: '100%',
            overflow: 'hidden',
            borderRadius: '999px',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(74, 182, 206, 0.45)',
            backgroundColor: isDark ? 'rgba(0, 0, 0, 0.65)' : 'rgba(255, 255, 255, 0.6)',
            boxShadow: isDark ? 'inset 0 2px 6px rgba(0, 0, 0, 0.7)' : 'inset 0 2px 4px rgba(10, 35, 66, 0.1)',
            padding: '2px',
            display: 'flex',
          }}
        >
          {/* Safe Zone (Teal/Emerald) */}
          <div
            style={{
              width: `${baseBarPercent}%`,
              height: '100%',
              borderRadius: '999px',
              background: 'linear-gradient(90deg, #0284c7 0%, #059669 100%)',
              boxShadow: isDark ? '0 0 14px rgba(16, 185, 129, 0.4)' : '0 2px 8px rgba(5, 150, 105, 0.3)',
              transition: 'width 0.4s ease',
            }}
          />
          {/* Exceeded Portion (Animated Hazard Stripes in Neon Coral) */}
          {excessBarPercent > 0 && (
            <div
              className="animate-hazard-stripes"
              style={{
                width: `${excessBarPercent}%`,
                height: '100%',
                borderRadius: '999px',
                boxShadow: isDark ? '0 0 20px rgba(244, 63, 94, 0.65)' : '0 2px 10px rgba(244, 63, 94, 0.4)',
                transition: 'width 0.4s ease',
              }}
            />
          )}
        </div>

        {/* Sub-Indicators */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '8px',
            fontSize: '12px',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            fontWeight: 600,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            {!isBudgetSet ? (
              <span style={{ color: isDark ? '#8A99AD' : '#1E4D61' }}>Click "Set Budget" to define monthly spending limit</span>
            ) : isDanger ? (
              <span style={{ color: isDark ? '#FB7185' : '#9F1239', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <AlertTriangle size={13} color="#F43F5E" />
                Exceeded by: {formatINR(excessAmount)}
              </span>
            ) : (
              <span style={{ color: isDark ? '#34D399' : '#065F46' }}>Remaining: {formatINR(budgetLeft)}</span>
            )}
          </div>

          <div style={{ color: isDanger ? (isDark ? '#FB7185' : '#9F1239') : (isDark ? '#8A99AD' : '#1E4D61'), fontWeight: 700 }}>
            {isBudgetSet ? `${Math.round(usedPercentage)}% used` : '0% used'}
          </div>
        </div>
      </div>

      {/* Bottom Settlement Row */}
      {netBalance > 0 && (onCashCheckout || onRolloverBalance) && (
        <div
          style={{
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(74, 182, 206, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: isDark ? '#8A99AD' : '#1E4D61' }}>
            <div
              style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.8)',
                color: isDark ? '#34d399' : '#065F46',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isDark ? 'none' : '0 1px 4px rgba(6, 95, 70, 0.2)',
              }}
            >
              <CheckCircle2 size={14} />
            </div>
            <span>Net Balance surplus:</span>
            <strong
              style={{
                color: isDark ? '#34D399' : '#065F46',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                fontSize: '14px',
                fontWeight: 700,
              }}
            >
              {formatINR(netBalance)}
            </strong>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {onCashCheckout && (
              <button
                type="button"
                onClick={onCashCheckout}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '10px',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(74, 182, 206, 0.45)',
                  background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.75)',
                  color: isDark ? '#cbd5e1' : '#081C30',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(74, 182, 206, 0.8)';
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.color = '#000000';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(74, 182, 206, 0.45)';
                  e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.75)';
                  e.currentTarget.style.color = isDark ? '#cbd5e1' : '#081C30';
                }}
              >
                <Coins size={13} color="#f59e0b" />
                <span>Cash Checkout ({formatINR(netBalance)})</span>
              </button>
            )}

            {onRolloverBalance && (
              <button
                type="button"
                onClick={onRolloverBalance}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '10px',
                  border: isDark ? '1px solid rgba(6, 182, 212, 0.45)' : '1px solid rgba(6, 182, 212, 0.65)',
                  background: isDark
                    ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)'
                    : 'linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.85) 100%)',
                  color: isDark ? '#67e8f9' : '#0369a1',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: isDark ? '0 0 16px rgba(6, 182, 212, 0.25)' : '0 4px 14px rgba(6, 182, 212, 0.25)',
                  transition: 'all 0.18s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = isDark ? 'rgba(6, 182, 212, 0.8)' : '#0284c7';
                  e.currentTarget.style.boxShadow = '0 4px 18px rgba(6, 182, 212, 0.35)';
                  e.currentTarget.style.color = isDark ? '#ffffff' : '#0284c7';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = isDark ? 'rgba(6, 182, 212, 0.45)' : 'rgba(6, 182, 212, 0.65)';
                  e.currentTarget.style.boxShadow = isDark ? '0 0 16px rgba(6, 182, 212, 0.25)' : '0 4px 14px rgba(6, 182, 212, 0.25)';
                  e.currentTarget.style.color = isDark ? '#67e8f9' : '#0369a1';
                }}
              >
                <Sparkles size={13} color="#22d3ee" />
                <span>Add to Next Month Opening Balance ({formatINR(netBalance)})</span>
                <ArrowRight size={13} />
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
