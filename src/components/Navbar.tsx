import React from 'react';
import {
  Wallet,
  ChevronLeft,
  ChevronRight,
  FileDown,
  Sun,
  Moon,
  Plus,
  LogIn,
  LogOut,
  ShieldCheck,
  Layers,
} from 'lucide-react';

import { getMonthName } from '../utils/formatters';
import type { User } from '../types';

interface NavbarProps {
  currentYear: number;
  currentMonth: number;
  theme: 'dark' | 'light';
  user: User | null;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onJumpToday: () => void;
  onToggleTheme: () => void;
  onExportCsv: () => void;
  onOpenCategories?: () => void;
  onOpenAddModal: () => void;
  onOpenAuthModal: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentYear,
  currentMonth,
  theme,
  user,
  onPrevMonth,
  onNextMonth,
  onJumpToday,
  onToggleTheme,
  onExportCsv,
  onOpenCategories,
  onOpenAddModal,
  onOpenAuthModal,
  onLogout,
}) => {
  return (
    <header className="app-header">
      <div className="brand-group">
        <div className="brand-icon">
          <Wallet size={22} />
        </div>
        <div>
          <div className="brand-title">
            Kharcha <span className="brand-badge">React + .NET</span>
          </div>
          <p className="brand-subtitle">Smart Monthly Personal Finances</p>
        </div>
      </div>

      <div className="header-actions">
        {/* Month Selector Pill */}
        <div className="month-picker-pill">
          <button
            className="month-nav-btn"
            onClick={onPrevMonth}
            title="Previous Month"
            aria-label="Previous Month"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="month-display">
            {getMonthName(currentMonth, currentYear)}
          </div>
          <button
            className="month-nav-btn"
            onClick={onNextMonth}
            title="Next Month"
            aria-label="Next Month"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <button className="today-quick-btn" onClick={onJumpToday} title="Jump to this month">
          This Month
        </button>

        {/* Categories Manager Button */}
        {onOpenCategories && (
          <button
            className="icon-action-btn"
            onClick={onOpenCategories}
            title="Manage dynamic categories"
            aria-label="Categories"
          >
            <Layers size={18} />
          </button>
        )}

        {/* CSV Export Button */}
        <button
          className="icon-action-btn"
          onClick={onExportCsv}
          title="Export CSV from .NET backend"
          aria-label="Export CSV"
        >
          <FileDown size={18} />
        </button>

        {/* Theme Toggle */}
        <button
          className="icon-action-btn"
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* User Auth Profile Pill / Login Button */}
        {user ? (
          <div className="user-profile-pill" title={`Logged in as ${user.fullName} (${user.mobileNumber})`}>
            <div className="user-avatar-badge">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="user-info-text">
              <span className="user-name-text">{user.fullName}</span>
              <span className="user-meta-text">
                <ShieldCheck size={11} className="text-success inline-icon" /> 6M Session
              </span>
            </div>
            <button
              className="user-logout-btn"
              onClick={onLogout}
              title="Logout session"
              aria-label="Logout"
            >
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <button
            className="btn-signin"
            onClick={onOpenAuthModal}
            title="Sign In with Mobile & Password"
          >
            <LogIn size={16} />
            <span>Sign In</span>
          </button>
        )}

        {/* Desktop Primary Add Button */}
        <button className="btn-primary btn-desktop-add" onClick={onOpenAddModal}>
          <Plus size={18} /> Add Transaction
        </button>
      </div>
    </header>
  );
};
