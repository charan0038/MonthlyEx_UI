import React from 'react';
import { Sparkles } from 'lucide-react';

interface InsightsCardProps {
  insightMessage: string;
}

export const InsightsCard: React.FC<InsightsCardProps> = ({ insightMessage }) => {
  return (
    <section className="insights-card">
      <div className="insight-icon-pill">
        <Sparkles size={18} />
      </div>
      <div className="insight-content">
        <div className="insight-title">Monthly Spending Insight</div>
        <div className="insight-text">
          {insightMessage ||
            'Analyzing your spending patterns and comparing with previous trends...'}
        </div>
      </div>
    </section>
  );
};
