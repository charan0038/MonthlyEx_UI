import React from 'react';
import { Sparkles, Zap } from 'lucide-react';

interface InsightsCardProps {
  insightMessage: string;
}

export const InsightsCard: React.FC<InsightsCardProps> = ({ insightMessage }) => {
  return (
    <section
      className="insights-card"
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '18px',
        border: '1px solid rgba(6, 182, 212, 0.25)',
        background: 'linear-gradient(135deg, rgba(10, 19, 38, 0.88) 0%, rgba(6, 182, 212, 0.05) 50%, rgba(255, 87, 34, 0.05) 100%)',
        padding: '18px 22px',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 12px 32px -8px rgba(0, 0, 0, 0.55), 0 0 1px rgba(6, 182, 212, 0.2)',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
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
          background: 'rgba(6, 182, 212, 0.15)',
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
          boxShadow: '0 0 20px rgba(6, 182, 212, 0.45)',
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
              color: '#22d3ee',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Zap size={12} color="#22d3ee" /> Monthly Spending Telemetry Insight
          </span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '1px 6px',
              borderRadius: '999px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              fontSize: '9.5px',
              fontFamily: 'ui-monospace, monospace',
              color: '#34d399',
              fontWeight: 600,
            }}
          >
            <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#34d399' }} /> Live
          </span>
        </div>

        <div
          style={{
            fontSize: '13.5px',
            color: '#e2e8f0',
            fontWeight: 500,
            lineHeight: 1.5,
          }}
        >
          {insightMessage || 'Analyzing your spending patterns and comparing with previous trends...'}
        </div>
      </div>
    </section>
  );
};
