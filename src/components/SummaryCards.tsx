import React, { useRef, useState, type MouseEvent } from 'react';
import {
  ArrowUpRight,
  ArrowDownRight,
  Scale,
  AlertCircle,
  PiggyBank,
  CheckCircle2,
} from 'lucide-react';
import { formatINR } from '../utils/formatters';

interface SummaryCardsProps {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  budgetLeft: number;
  usedPercentage: number;
  isBudgetSet?: boolean;
  theme?: 'dark' | 'light';
}

interface SpotlightCardProps {
  children: React.ReactNode;
  spotlightColor?: string;
  className?: string;
  theme?: 'dark' | 'light';
}

const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  spotlightColor = 'rgba(255, 87, 34, 0.15)',
  className = '',
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '18px',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
        borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
        background: isDark ? 'rgba(10, 19, 38, 0.82)' : '#ffffff',
        padding: '20px 22px',
        backdropFilter: 'blur(20px)',
        boxShadow: isDark
          ? '0 12px 30px -8px rgba(0, 0, 0, 0.55)'
          : '0 4px 16px -2px rgba(15, 23, 42, 0.05), 0 1px 3px rgba(15, 23, 42, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'border-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease',
      }}
      className={`spotlight-card ${className}`}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.18)' : '#cbd5e1';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = isDark
          ? '0 16px 36px -8px rgba(0, 0, 0, 0.7)'
          : '0 8px 24px -4px rgba(15, 23, 42, 0.08)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = isDark
          ? '0 12px 30px -8px rgba(0, 0, 0, 0.55)'
          : '0 4px 16px -2px rgba(15, 23, 42, 0.05), 0 1px 3px rgba(15, 23, 42, 0.04)';
      }}
    >
      {/* Spotlight Radial Overlay */}
      <div
        style={{
          pointerEvents: 'none',
          position: 'absolute',
          inset: 0,
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(350px circle at ${mousePos.x}px ${mousePos.y}px, ${spotlightColor}, transparent 80%)`,
          transition: 'opacity 0.25s ease',
        }}
      />

      {/* Top Edge Specular Highlight */}
      <div
        style={{
          pointerEvents: 'none',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: isDark
            ? 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)'
            : 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.7), transparent)',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  );
};

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  totalIncome,
  totalExpense,
  netBalance,
  budgetLeft,
  usedPercentage,
  isBudgetSet = true,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';

  return (
    <section
      className="summary-grid"
      aria-label="Financial Summary Cards"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
      }}
    >
      {/* 1. TOTAL INCOME */}
      <SpotlightCard
        theme={theme}
        spotlightColor={isDark ? 'rgba(16, 185, 129, 0.16)' : 'rgba(5, 150, 105, 0.08)'}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                color: isDark ? '#8A99AD' : '#64748b',
              }}
            >
              Total Income
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '12px',
                border: isDark ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid #a7f3d0',
                backgroundColor: isDark ? 'rgba(16, 185, 129, 0.12)' : '#ecfdf5',
                color: isDark ? '#34d399' : '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isDark ? '0 0 16px rgba(16, 185, 129, 0.25)' : 'none',
              }}
            >
              <ArrowUpRight size={18} strokeWidth={2.4} />
            </div>
          </div>

          <div
            style={{
              marginTop: '12px',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              fontSize: '28px',
              fontWeight: 800,
              letterSpacing: '-0.5px',
              color: isDark ? '#ffffff' : '#059669',
            }}
          >
            {formatINR(totalIncome)}
          </div>
        </div>

        <div style={{ marginTop: '14px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: '6px',
              border: isDark ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid #a7f3d0',
              backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#ecfdf5',
              fontFamily: 'ui-monospace, monospace',
              fontSize: '10.5px',
              fontWeight: 600,
              color: isDark ? '#6ee7b7' : '#047857',
            }}
          >
            + Inflow | Earned this month
          </span>
        </div>
      </SpotlightCard>

      {/* 2. TOTAL EXPENSES */}
      <SpotlightCard
        theme={theme}
        spotlightColor={isDark ? 'rgba(244, 63, 94, 0.16)' : 'rgba(220, 38, 38, 0.08)'}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                color: isDark ? '#8A99AD' : '#64748b',
              }}
            >
              Total Expenses
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '12px',
                border: isDark ? '1px solid rgba(244, 63, 94, 0.35)' : '1px solid #fecdd3',
                backgroundColor: isDark ? 'rgba(244, 63, 94, 0.12)' : '#fff1f2',
                color: isDark ? '#fb7185' : '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isDark ? '0 0 16px rgba(244, 63, 94, 0.25)' : 'none',
              }}
            >
              <ArrowDownRight size={18} strokeWidth={2.4} />
            </div>
          </div>

          <div
            style={{
              marginTop: '12px',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              fontSize: '28px',
              fontWeight: 800,
              letterSpacing: '-0.5px',
              color: isDark ? '#FB7185' : '#dc2626',
            }}
          >
            {formatINR(totalExpense)}
          </div>
        </div>

        <div style={{ marginTop: '14px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: '6px',
              border: isDark ? '1px solid rgba(244, 63, 94, 0.25)' : '1px solid #fecdd3',
              backgroundColor: isDark ? 'rgba(244, 63, 94, 0.1)' : '#fff1f2',
              fontFamily: 'ui-monospace, monospace',
              fontSize: '10.5px',
              fontWeight: 600,
              color: isDark ? '#fda4af' : '#be123c',
            }}
          >
            — Outflow | Spent this month
          </span>
        </div>
      </SpotlightCard>

      {/* 3. NET BALANCE */}
      <SpotlightCard
        theme={theme}
        spotlightColor={
          netBalance >= 0
            ? isDark ? 'rgba(52, 211, 153, 0.16)' : 'rgba(5, 150, 105, 0.08)'
            : isDark ? 'rgba(244, 63, 94, 0.16)' : 'rgba(220, 38, 38, 0.08)'
        }
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                color: isDark ? '#8A99AD' : '#64748b',
              }}
            >
              Net Balance
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '12px',
                border:
                  netBalance >= 0
                    ? isDark ? '1px solid rgba(52, 211, 153, 0.35)' : '1px solid #a7f3d0'
                    : isDark ? '1px solid rgba(244, 63, 94, 0.35)' : '1px solid #fecdd3',
                backgroundColor: isDark
                  ? netBalance >= 0 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)'
                  : netBalance >= 0 ? '#ecfdf5' : '#fff1f2',
                color:
                  netBalance >= 0
                    ? isDark ? '#34d399' : '#059669'
                    : isDark ? '#fb7185' : '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isDark ? '0 0 16px rgba(52, 211, 153, 0.25)' : 'none',
              }}
            >
              <Scale size={18} strokeWidth={2.2} />
            </div>
          </div>

          <div
            style={{
              marginTop: '12px',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              fontSize: '28px',
              fontWeight: 800,
              letterSpacing: '-0.5px',
              color:
                netBalance >= 0
                  ? isDark ? '#34D399' : '#059669'
                  : isDark ? '#FB7185' : '#dc2626',
            }}
          >
            {formatINR(netBalance)}
          </div>
        </div>

        <div style={{ marginTop: '14px' }}>
          {netBalance >= 0 ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 8px',
                borderRadius: '6px',
                border: isDark ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid #a7f3d0',
                backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#ecfdf5',
                fontFamily: 'ui-monospace, monospace',
                fontSize: '10.5px',
                fontWeight: 600,
                color: isDark ? '#6ee7b7' : '#047857',
              }}
            >
              <CheckCircle2 size={11} /> Surplus | Savings intact
            </span>
          ) : (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 8px',
                borderRadius: '6px',
                border: isDark ? '1px solid rgba(244, 63, 94, 0.25)' : '1px solid #fecdd3',
                backgroundColor: isDark ? 'rgba(244, 63, 94, 0.1)' : '#fff1f2',
                fontFamily: 'ui-monospace, monospace',
                fontSize: '10.5px',
                fontWeight: 600,
                color: isDark ? '#fda4af' : '#be123c',
              }}
            >
              <AlertCircle size={11} /> Deficit | Spending exceeded income
            </span>
          )}
        </div>
      </SpotlightCard>

      {/* 4. BUDGET LEFT */}
      <SpotlightCard
        theme={theme}
        spotlightColor={
          budgetLeft < 0
            ? isDark ? 'rgba(244, 63, 94, 0.2)' : 'rgba(220, 38, 38, 0.08)'
            : isDark ? 'rgba(255, 87, 34, 0.16)' : 'rgba(37, 99, 235, 0.08)'
        }
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                color: isDark ? '#8A99AD' : '#64748b',
              }}
            >
              Budget Left
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '12px',
                border:
                  budgetLeft < 0
                    ? isDark ? '1px solid rgba(244, 63, 94, 0.35)' : '1px solid #fecdd3'
                    : isDark ? '1px solid rgba(255, 87, 34, 0.35)' : '1px solid #bfdbfe',
                backgroundColor: isDark
                  ? budgetLeft < 0 ? 'rgba(244, 63, 94, 0.12)' : 'rgba(255, 87, 34, 0.12)'
                  : budgetLeft < 0 ? '#fff1f2' : '#eff6ff',
                color:
                  budgetLeft < 0
                    ? isDark ? '#fb7185' : '#dc2626'
                    : isDark ? '#FF7A45' : '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isDark ? '0 0 16px rgba(244, 63, 94, 0.25)' : 'none',
              }}
            >
              {budgetLeft < 0 ? <AlertCircle size={18} strokeWidth={2.2} /> : <PiggyBank size={18} strokeWidth={2.2} />}
            </div>
          </div>

          <div
            style={{
              marginTop: '12px',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              fontSize: '28px',
              fontWeight: 800,
              letterSpacing: '-0.5px',
              color: !isBudgetSet
                ? isDark ? '#8A99AD' : '#64748b'
                : budgetLeft < 0
                ? isDark ? '#FB7185' : '#dc2626'
                : isDark ? '#ffffff' : '#0f172a',
            }}
          >
            {isBudgetSet ? formatINR(budgetLeft) : 'Not Set'}
          </div>
        </div>

        <div style={{ marginTop: '14px' }}>
          {!isBudgetSet ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 8px',
                borderRadius: '6px',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #cbd5e1',
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f1f5f9',
                fontFamily: 'ui-monospace, monospace',
                fontSize: '10.5px',
                color: isDark ? '#8A99AD' : '#475569',
              }}
            >
              Define in budget settings
            </span>
          ) : budgetLeft < 0 ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 8px',
                borderRadius: '6px',
                border: isDark ? '1px solid rgba(244, 63, 94, 0.35)' : '1px solid #fecdd3',
                backgroundColor: isDark ? 'rgba(244, 63, 94, 0.15)' : '#fff1f2',
                fontFamily: 'ui-monospace, monospace',
                fontSize: '10.5px',
                fontWeight: 700,
                color: isDark ? '#fca5a5' : '#be123c',
              }}
            >
              ⚠ Over budget by {formatINR(Math.abs(budgetLeft))}
            </span>
          ) : (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 8px',
                borderRadius: '6px',
                border: isDark ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid #a7f3d0',
                backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#ecfdf5',
                fontFamily: 'ui-monospace, monospace',
                fontSize: '10.5px',
                fontWeight: 600,
                color: isDark ? '#6ee7b7' : '#047857',
              }}
            >
              {Math.round(100 - usedPercentage)}% allowance remaining
            </span>
          )}
        </div>
      </SpotlightCard>
    </section>
  );
};
