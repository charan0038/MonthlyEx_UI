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
        border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(226, 232, 240, 0.95)',
        background: isDark ? 'rgba(10, 19, 38, 0.82)' : 'rgba(255, 255, 255, 0.96)',
        padding: '20px 22px',
        backdropFilter: 'blur(20px)',
        boxShadow: isDark
          ? '0 12px 30px -8px rgba(0, 0, 0, 0.55)'
          : '0 10px 25px -4px rgba(15, 23, 42, 0.06), 0 2px 6px -1px rgba(15, 23, 42, 0.03)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'border-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease',
      }}
      className={`spotlight-card ${className}`}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(203, 213, 225, 1)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = isDark
          ? '0 16px 36px -8px rgba(0, 0, 0, 0.7)'
          : '0 16px 36px -6px rgba(15, 23, 42, 0.1)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 0.95)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = isDark
          ? '0 12px 30px -8px rgba(0, 0, 0, 0.55)'
          : '0 10px 25px -4px rgba(15, 23, 42, 0.06), 0 2px 6px -1px rgba(15, 23, 42, 0.03)';
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
            : 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent)',
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
        spotlightColor={isDark ? 'rgba(16, 185, 129, 0.16)' : 'rgba(16, 185, 129, 0.08)'}
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
                border: isDark ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(16, 185, 129, 0.3)',
                backgroundColor: isDark ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.1)',
                color: isDark ? '#34d399' : '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isDark ? '0 0 16px rgba(16, 185, 129, 0.25)' : '0 2px 8px rgba(16, 185, 129, 0.15)',
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
              color: isDark ? '#ffffff' : '#0f172a',
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
              border: isDark ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(16, 185, 129, 0.3)',
              backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.12)',
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
        spotlightColor={isDark ? 'rgba(244, 63, 94, 0.16)' : 'rgba(244, 63, 94, 0.08)'}
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
                border: isDark ? '1px solid rgba(244, 63, 94, 0.35)' : '1px solid rgba(244, 63, 94, 0.3)',
                backgroundColor: isDark ? 'rgba(244, 63, 94, 0.12)' : 'rgba(244, 63, 94, 0.1)',
                color: isDark ? '#fb7185' : '#e11d48',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isDark ? '0 0 16px rgba(244, 63, 94, 0.25)' : '0 2px 8px rgba(244, 63, 94, 0.15)',
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
              color: isDark ? '#FB7185' : '#e11d48',
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
              border: isDark ? '1px solid rgba(244, 63, 94, 0.25)' : '1px solid rgba(244, 63, 94, 0.3)',
              backgroundColor: isDark ? 'rgba(244, 63, 94, 0.1)' : 'rgba(244, 63, 94, 0.1)',
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
            ? isDark ? 'rgba(52, 211, 153, 0.16)' : 'rgba(16, 185, 129, 0.08)'
            : isDark ? 'rgba(244, 63, 94, 0.16)' : 'rgba(244, 63, 94, 0.08)'
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
                    ? isDark ? '1px solid rgba(52, 211, 153, 0.35)' : '1px solid rgba(16, 185, 129, 0.35)'
                    : isDark ? '1px solid rgba(244, 63, 94, 0.35)' : '1px solid rgba(244, 63, 94, 0.3)',
                backgroundColor:
                  netBalance >= 0
                    ? isDark ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.1)'
                    : isDark ? 'rgba(244, 63, 94, 0.12)' : 'rgba(244, 63, 94, 0.1)',
                color:
                  netBalance >= 0
                    ? isDark ? '#34d399' : '#059669'
                    : isDark ? '#fb7185' : '#e11d48',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow:
                  netBalance >= 0
                    ? isDark ? '0 0 16px rgba(52, 211, 153, 0.25)' : '0 2px 8px rgba(16, 185, 129, 0.15)'
                    : isDark ? '0 0 16px rgba(244, 63, 94, 0.25)' : '0 2px 8px rgba(244, 63, 94, 0.15)',
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
                  : isDark ? '#FB7185' : '#e11d48',
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
                border: isDark ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(16, 185, 129, 0.3)',
                backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.12)',
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
                border: isDark ? '1px solid rgba(244, 63, 94, 0.25)' : '1px solid rgba(244, 63, 94, 0.3)',
                backgroundColor: isDark ? 'rgba(244, 63, 94, 0.1)' : 'rgba(244, 63, 94, 0.1)',
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
            ? isDark ? 'rgba(244, 63, 94, 0.2)' : 'rgba(244, 63, 94, 0.08)'
            : isDark ? 'rgba(255, 87, 34, 0.16)' : 'rgba(255, 87, 34, 0.08)'
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
                    ? isDark ? '1px solid rgba(244, 63, 94, 0.35)' : '1px solid rgba(244, 63, 94, 0.3)'
                    : isDark ? '1px solid rgba(255, 87, 34, 0.35)' : '1px solid rgba(255, 87, 34, 0.3)',
                backgroundColor:
                  budgetLeft < 0
                    ? isDark ? 'rgba(244, 63, 94, 0.12)' : 'rgba(244, 63, 94, 0.1)'
                    : isDark ? 'rgba(255, 87, 34, 0.12)' : 'rgba(255, 87, 34, 0.1)',
                color:
                  budgetLeft < 0
                    ? isDark ? '#fb7185' : '#e11d48'
                    : '#FF7A45',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow:
                  budgetLeft < 0
                    ? isDark ? '0 0 16px rgba(244, 63, 94, 0.25)' : '0 2px 8px rgba(244, 63, 94, 0.15)'
                    : isDark ? '0 0 16px rgba(255, 87, 34, 0.25)' : '0 2px 8px rgba(255, 87, 34, 0.15)',
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
                ? isDark ? '#8A99AD' : '#94a3b8'
                : budgetLeft < 0
                ? isDark ? '#FB7185' : '#e11d48'
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
                border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(203, 213, 225, 0.8)',
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(241, 245, 249, 0.8)',
                fontFamily: 'ui-monospace, monospace',
                fontSize: '10.5px',
                color: isDark ? '#8A99AD' : '#64748b',
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
                border: isDark ? '1px solid rgba(244, 63, 94, 0.35)' : '1px solid rgba(244, 63, 94, 0.3)',
                backgroundColor: isDark ? 'rgba(244, 63, 94, 0.15)' : 'rgba(244, 63, 94, 0.1)',
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
                border: isDark ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(16, 185, 129, 0.3)',
                backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.12)',
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
