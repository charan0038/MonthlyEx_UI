import React from 'react';
import { Sparkles, Zap } from 'lucide-react';

interface InsightsCardProps {
  insightMessage: string;
  theme?: 'dark' | 'light';
}

export const InsightsCard: React.FC<InsightsCardProps> = ({ insightMessage, theme = 'dark' }) => {
  const isDark = theme === 'dark';

  return (
    <section
      className="insights-card"
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '18px',
        border: isDark ? '1px solid rgba(6, 182, 212, 0.25)' : '1px solid #e2e8f0',
        borderTop: isDark ? '1px solid rgba(6, 182, 212, 0.25)' : '1px solid #e2e8f0',
        background: isDark
          ? 'linear-gradient(135deg, rgba(10, 19, 38, 0.88) 0%, rgba(6, 182, 212, 0.05) 50%, rgba(255, 87, 34, 0.05) 100%)'
          : '#ffffff',
        padding: '18px 22px',
        backdropFilter: 'blur(20px)',
        boxShadow: isDark
          ? '0 12px 32px -8px rgba(0, 0, 0, 0.55), 0 0 1px rgba(6, 182, 212, 0.2)'
          : '0 4px 16px -2px rgba(15, 23, 42, 0.06), 0 1px 3px rgba(15, 23, 42, 0.04)',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        transition: 'all 0.25s ease',
      }}
    >
      {/* Background Micro Glow */}
      {isDark && (
        <div
          style={{
            position: 'absolute',
            top: '-30px',
            left: '-30px',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'rgba(6, 182, 212, 0.15)',
            filter: 'blur(35px)',
            pointerEvents: 'none',
          }}
        />
      )}

      <div
        style={{
          position: 'relative',
          width: '42px',
          height: '42px',
          minWidth: '42px',
          borderRadius: '13px',
          background: isDark ? 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)' : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isDark ? '0 0 20px rgba(6, 182, 212, 0.45)' : '0 2px 8px rgba(37, 99, 235, 0.25)',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.25)' : '1px solid #2563eb',
          flexShrink: 0,
        }}
      >
        <Sparkles size={20} strokeWidth={2.4} />
      </div>

      <div style={{ flex: 1, minWidth: 0, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
          <span
            style={{
              fontSize: '11px',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              color: isDark ? '#22d3ee' : '#2563eb',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Zap size={12} color={isDark ? '#22d3ee' : '#2563eb'} /> Monthly Spending Telemetry Insight
          </span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '1px 6px',
              borderRadius: '999px',
              background: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ecfdf5',
              border: isDark ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid #a7f3d0',
              fontSize: '9.5px',
              fontFamily: 'ui-monospace, monospace',
              color: isDark ? '#34d399' : '#047857',
              fontWeight: 600,
            }}
          >
            <span
              style={{
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                backgroundColor: isDark ? '#34d399' : '#10b981',
              }}
            />{' '}
            Live
          </span>
        </div>

        <div
          style={{
            fontSize: '13.5px',
            color: isDark ? '#e2e8f0' : '#0f172a',
            fontWeight: 600,
            lineHeight: 1.5,
          }}
        >
          {insightMessage || 'Analyzing your spending patterns and comparing with previous trends...'}
        </div>
      </div>
    </section>
  );
};
