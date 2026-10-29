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
}

interface SpotlightCardProps {
  children: React.ReactNode;
  spotlightColor?: string;
  className?: string;
}

const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  spotlightColor = 'rgba(255, 87, 34, 0.15)',
  className = '',
}) => {
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
        border: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(10, 19, 38, 0.82)',
        padding: '20px 22px',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 12px 30px -8px rgba(0, 0, 0, 0.55)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'border-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease',
      }}
      className={`spotlight-card ${className}`}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.18)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 16px 36px -8px rgba(0, 0, 0, 0.7)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 12px 30px -8px rgba(0, 0, 0, 0.55)';
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
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
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
}) => {
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
      <SpotlightCard spotlightColor="rgba(16, 185, 129, 0.16)">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                color: '#8A99AD',
              }}
            >
              Total Income
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '12px',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                color: '#34d399',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px rgba(16, 185, 129, 0.25)',
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
              color: '#ffffff',
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
              border: '1px solid rgba(16, 185, 129, 0.25)',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              fontFamily: 'ui-monospace, monospace',
              fontSize: '10.5px',
              fontWeight: 600,
              color: '#6ee7b7',
            }}
          >
            + Inflow | Earned this month
          </span>
        </div>
      </SpotlightCard>

      {/* 2. TOTAL EXPENSES */}
      <SpotlightCard spotlightColor="rgba(244, 63, 94, 0.16)">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                color: '#8A99AD',
              }}
            >
              Total Expenses
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '12px',
                border: '1px solid rgba(244, 63, 94, 0.35)',
                backgroundColor: 'rgba(244, 63, 94, 0.12)',
                color: '#fb7185',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px rgba(244, 63, 94, 0.25)',
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
              color: '#ffffff',
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
              border: '1px solid rgba(244, 63, 94, 0.25)',
              backgroundColor: 'rgba(244, 63, 94, 0.1)',
              fontFamily: 'ui-monospace, monospace',
              fontSize: '10.5px',
              fontWeight: 600,
              color: '#fda4af',
            }}
          >
            — Outflow | Spent this month
          </span>
        </div>
      </SpotlightCard>

      {/* 3. NET BALANCE */}
      <SpotlightCard spotlightColor={netBalance >= 0 ? 'rgba(52, 211, 153, 0.16)' : 'rgba(244, 63, 94, 0.16)'}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                color: '#8A99AD',
              }}
            >
              Net Balance
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '12px',
                border: netBalance >= 0 ? '1px solid rgba(52, 211, 153, 0.35)' : '1px solid rgba(244, 63, 94, 0.35)',
                backgroundColor: netBalance >= 0 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
                color: netBalance >= 0 ? '#34d399' : '#fb7185',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: netBalance >= 0 ? '0 0 16px rgba(52, 211, 153, 0.25)' : '0 0 16px rgba(244, 63, 94, 0.25)',
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
              color: netBalance >= 0 ? '#34D399' : '#FB7185',
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
                border: '1px solid rgba(16, 185, 129, 0.25)',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fontFamily: 'ui-monospace, monospace',
                fontSize: '10.5px',
                fontWeight: 600,
                color: '#6ee7b7',
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
                border: '1px solid rgba(244, 63, 94, 0.25)',
                backgroundColor: 'rgba(244, 63, 94, 0.1)',
                fontFamily: 'ui-monospace, monospace',
                fontSize: '10.5px',
                fontWeight: 600,
                color: '#fda4af',
              }}
            >
              <AlertCircle size={11} /> Deficit | Spending exceeded income
            </span>
          )}
        </div>
      </SpotlightCard>

      {/* 4. BUDGET LEFT */}
      <SpotlightCard spotlightColor={budgetLeft < 0 ? 'rgba(244, 63, 94, 0.2)' : 'rgba(255, 87, 34, 0.16)'}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                color: '#8A99AD',
              }}
            >
              Budget Left
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '12px',
                border: budgetLeft < 0 ? '1px solid rgba(244, 63, 94, 0.35)' : '1px solid rgba(255, 87, 34, 0.35)',
                backgroundColor: budgetLeft < 0 ? 'rgba(244, 63, 94, 0.12)' : 'rgba(255, 87, 34, 0.12)',
                color: budgetLeft < 0 ? '#fb7185' : '#FF7A45',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: budgetLeft < 0 ? '0 0 16px rgba(244, 63, 94, 0.25)' : '0 0 16px rgba(255, 87, 34, 0.25)',
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
              color: !isBudgetSet ? '#8A99AD' : budgetLeft < 0 ? '#FB7185' : '#ffffff',
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
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                fontFamily: 'ui-monospace, monospace',
                fontSize: '10.5px',
                color: '#8A99AD',
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
                border: '1px solid rgba(244, 63, 94, 0.35)',
                backgroundColor: 'rgba(244, 63, 94, 0.15)',
                fontFamily: 'ui-monospace, monospace',
                fontSize: '10.5px',
                fontWeight: 700,
                color: '#fca5a5',
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
                border: '1px solid rgba(16, 185, 129, 0.25)',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fontFamily: 'ui-monospace, monospace',
                fontSize: '10.5px',
                fontWeight: 600,
                color: '#6ee7b7',
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
