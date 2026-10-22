import React from 'react';
import { Calendar, CalendarRange, BarChart3, Plus, Receipt } from 'lucide-react';

interface MobileBottomNavProps {
  activeDashboard: 'monthly' | 'weekly' | 'yearly';
  onChangeDashboard: (dashboard: 'monthly' | 'weekly' | 'yearly') => void;
  onOpenAddModal: () => void;
  onOpenCategories: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeDashboard,
  onChangeDashboard,
  onOpenAddModal,
  onOpenCategories,
}) => {
  const scrollTo = (id?: string) => {
    if (!id) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
      <button
        type="button"
        className={`mobile-nav-item ${activeDashboard === 'monthly' ? 'active' : ''}`}
        onClick={() => {
          onChangeDashboard('monthly');
          scrollTo();
        }}
        title="Monthly Overview"
      >
        <Calendar size={19} />
        <span>Monthly</span>
      </button>

      <button
        type="button"
        className={`mobile-nav-item ${activeDashboard === 'weekly' ? 'active' : ''}`}
        onClick={() => {
          onChangeDashboard('weekly');
          scrollTo();
        }}
        title="Weekly Report & Print"
      >
        <CalendarRange size={19} />
        <span>Weekly</span>
      </button>

      {/* Prominent Elevated Center Add Button */}
      <button
        type="button"
        className="mobile-nav-add-btn"
        onClick={onOpenAddModal}
        aria-label="Add Transaction"
      >
        <div className="mobile-add-btn-inner">
          <Plus size={26} strokeWidth={2.6} />
        </div>
      </button>

      <button
        type="button"
        className={`mobile-nav-item ${activeDashboard === 'yearly' ? 'active' : ''}`}
        onClick={() => {
          onChangeDashboard('yearly');
          scrollTo();
        }}
        title="Overall Year Expense Tracker"
      >
        <BarChart3 size={19} />
        <span>Annual</span>
      </button>

      <button
        type="button"
        className="mobile-nav-item"
        onClick={onOpenCategories}
        title="Manage Categories"
      >
        <Receipt size={19} />
        <span>Categories</span>
      </button>
    </nav>
  );
};
