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
        border: isDark ? '1px solid rgba(6, 182, 212, 0.25)' : '1px solid rgba(74, 182, 206, 0.55)',
        background: isDark
          ? 'linear-gradient(135deg, rgba(10, 19, 38, 0.88) 0%, rgba(6, 182, 212, 0.05) 50%, rgba(255, 87, 34, 0.05) 100%)'
          : 'linear-gradient(135deg, #A0E0EF 0%, #B8EBF6 50%, #A0E0EF 100%)',
        padding: '18px 22px',
        backdropFilter: 'blur(20px)',
        boxShadow: isDark
          ? '0 12px 32px -8px rgba(0, 0, 0, 0.55), 0 0 1px rgba(6, 182, 212, 0.2)'
          : '0 12px 28px -6px rgba(10, 35, 66, 0.12), 0 2px 8px rgba(160, 224, 239, 0.4)',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        transition: 'all 0.25s ease',
      }}
    >
      {/* Background Micro Glow */}
      <div
        style={{
          position: 'absolute',
          top: '-30px',
          left: '-30px',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: isDark ? 'rgba(6, 182, 212, 0.15)' : 'rgba(6, 182, 212, 0.12)',
          filter: 'blur(35px)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'relative',
          width: '42px',
          height: '42px',
          minWidth: '42px',
          borderRadius: '13px',
          background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isDark ? '0 0 20px rgba(6, 182, 212, 0.45)' : '0 2px 10px rgba(6, 182, 212, 0.35)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
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
              color: isDark ? '#22d3ee' : '#0369a1',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Zap size={12} color={isDark ? '#22d3ee' : '#0369a1'} /> Monthly Spending Telemetry Insight
          </span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '1px 6px',
              borderRadius: '999px',
              background: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.8)',
              border: isDark ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(6, 95, 70, 0.3)',
              fontSize: '9.5px',
              fontFamily: 'ui-monospace, monospace',
              color: isDark ? '#34d399' : '#065F46',
              fontWeight: 600,
            }}
          >
            <span
              style={{
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                backgroundColor: isDark ? '#34d399' : '#065F46',
              }}
            />{' '}
            Live
          </span>
        </div>

        <div
          style={{
            fontSize: '13.5px',
            color: isDark ? '#e2e8f0' : '#081C30',
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
