import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CalendarDays,
  FileText,
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
  activeDashboard?: 'monthly' | 'weekly' | 'yearly';
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onJumpToday: () => void;
  onSelectMonthYear?: (year: number, month: number) => void;
  onToggleTheme: () => void;
  onExportPdf: () => void;
  onOpenCategories?: () => void;
  onOpenAddModal: () => void;
  onOpenAuthModal: () => void;
  onOpenProfile?: () => void;
  onLogout: () => void;
}

const MONTHS_LIST = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export const Navbar: React.FC<NavbarProps> = ({
  currentYear,
  currentMonth,
  theme,
  user,
  activeDashboard = 'monthly',
  onPrevMonth,
  onNextMonth,
  onJumpToday,
  onSelectMonthYear,
  onToggleTheme,
  onExportPdf,
  onOpenCategories,
  onOpenAddModal,
  onOpenAuthModal,
  onOpenProfile,
  onLogout,
}) => {
  const [isMonthCalendarOpen, setIsMonthCalendarOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState<number>(currentYear);
  const monthPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPickerYear(currentYear);
  }, [currentYear, isMonthCalendarOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (monthPickerRef.current && !monthPickerRef.current.contains(e.target as Node)) {
        setIsMonthCalendarOpen(false);
      }
    };
    if (isMonthCalendarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMonthCalendarOpen]);
  return (
    <header className="app-header">
      <div className="header-brand-row">
        <div className="brand-group">
          <div className="brand-icon">
            <img src="/logo-icon.png" alt="Vessel" className="brand-logo-img" />
          </div>
          <div>
            <div className="brand-title">
              Vessel <span className="brand-badge">Tracks every leak</span>
            </div>
            <p className="brand-subtitle">Smart Monthly Personal Finances</p>
          </div>
        </div>

        {/* Quick mobile-only actions (Theme + User) */}
        <div className="mobile-header-actions">
          <button
            className="icon-action-btn mobile-theme-btn"
            onClick={onToggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {user ? (
            <div className="mobile-user-group">
              <div
                className="mobile-user-avatar"
                title={`Logged in as ${user.fullName} (${user.mobileNumber}) - Click for Profile & Password`}
                onClick={onOpenProfile}
                style={{ cursor: onOpenProfile ? 'pointer' : 'default' }}
              >
                {user.fullName.charAt(0).toUpperCase()}
              </div>
              <button
                className="icon-action-btn mobile-logout-btn"
                onClick={onLogout}
                title="Logout"
                aria-label="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              className="btn-signin mobile-signin-btn"
              onClick={onOpenAuthModal}
              title="Sign In"
            >
              <LogIn size={15} />
            </button>
          )}
        </div>
      </div>

      <div className="header-actions">
        {activeDashboard === 'yearly' ? (
          <div
            className="navbar-yearly-badge"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '999px',
              backgroundColor: 'rgba(99,102,241,0.14)',
              border: '1px solid rgba(99,102,241,0.28)',
              color: '#818cf8',
              fontSize: '13px',
              fontWeight: 700,
            }}
          >
            <CalendarDays size={14} />
            <span>Annual View {currentYear}</span>
          </div>
        ) : activeDashboard === 'weekly' ? (
          <div
            className="navbar-yearly-badge"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '999px',
              backgroundColor: 'rgba(14,165,233,0.14)',
              border: '1px solid rgba(14,165,233,0.28)',
              color: '#38bdf8',
              fontSize: '13px',
              fontWeight: 700,
            }}
          >
            <CalendarDays size={14} />
            <span>Weekly Report View</span>
          </div>
        ) : (
          <>
            {/* Month Selector Pill */}
            <div className="month-picker-pill" ref={monthPickerRef} style={{ position: 'relative' }}>
              <button
                className="month-nav-btn"
                onClick={onPrevMonth}
                title="Previous Month"
                aria-label="Previous Month"
              >
                <ChevronLeft size={16} />
              </button>

              <button
                type="button"
                className="month-display month-display-interactive"
                onClick={() => setIsMonthCalendarOpen(!isMonthCalendarOpen)}
                title="Click to select month & year"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <CalendarDays size={14} style={{ color: 'var(--primary, #6366f1)', opacity: 0.85 }} />
                <span>{getMonthName(currentMonth, currentYear)}</span>
                <ChevronDown
                  size={13}
                  style={{
                    opacity: 0.6,
                    transform: isMonthCalendarOpen ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.18s ease',
                  }}
                />
              </button>

              <button
                className="month-nav-btn"
                onClick={onNextMonth}
                title="Next Month"
                aria-label="Next Month"
              >
                <ChevronRight size={16} />
              </button>

              {/* Enhanced Monthly Calendar Modal / Dropdown */}
              {isMonthCalendarOpen && (
                <div
                  className="navbar-month-calendar-modal"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 9999,
                    minWidth: '280px',
                    backgroundColor: 'var(--bg-surface-elevated, #1a2235)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '18px',
                    padding: '16px',
                    boxShadow: '0 20px 40px -8px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)',
                    backdropFilter: 'blur(16px)',
                  }}
                >
                  {/* Year Navigation Header */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '12px',
                      paddingBottom: '10px',
                      borderBottom: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setPickerYear((y) => y - 1)}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.08)',
                        backgroundColor: 'rgba(255,255,255,0.04)',
                        color: 'var(--text-main, #f8fafc)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                      title="Previous Year"
                    >
                      <ChevronLeft size={15} />
                    </button>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#a5b4fc' }}>
                      {pickerYear}
                    </div>
                    <button
                      type="button"
                      onClick={() => setPickerYear((y) => y + 1)}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.08)',
                        backgroundColor: 'rgba(255,255,255,0.04)',
                        color: 'var(--text-main, #f8fafc)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                      title="Next Year"
                    >
                      <ChevronRight size={15} />
                    </button>
                  </div>

                  {/* 12 Months Grid */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '8px',
                      marginBottom: '12px',
                    }}
                  >
                    {MONTHS_LIST.map((mName, idx) => {
                      const isCurrentSelected = currentYear === pickerYear && currentMonth === idx;
                      const isCurrentActualMonth =
                        new Date().getFullYear() === pickerYear && new Date().getMonth() === idx;

                      return (
                        <button
                          key={mName}
                          type="button"
                          onClick={() => {
                            if (onSelectMonthYear) {
                              onSelectMonthYear(pickerYear, idx);
                            }
                            setIsMonthCalendarOpen(false);
                          }}
                          style={{
                            padding: '10px 6px',
                            borderRadius: '12px',
                            border: isCurrentSelected
                              ? '1px solid #818cf8'
                              : isCurrentActualMonth
                              ? '1px solid rgba(16,185,129,0.4)'
                              : '1px solid rgba(255,255,255,0.06)',
                            background: isCurrentSelected
                              ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
                              : isCurrentActualMonth
                              ? 'rgba(16,185,129,0.1)'
                              : 'rgba(255,255,255,0.03)',
                            color: isCurrentSelected
                              ? '#ffffff'
                              : isCurrentActualMonth
                              ? '#34d399'
                              : 'var(--text-main, #f8fafc)',
                            fontSize: '13px',
                            fontWeight: isCurrentSelected ? 700 : 500,
                            cursor: 'pointer',
                            boxShadow: isCurrentSelected ? '0 4px 12px rgba(99,102,241,0.45)' : 'none',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={(e) => {
                            if (!isCurrentSelected) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
                          }}
                          onMouseLeave={(e) => {
                            if (!isCurrentSelected) {
                              e.currentTarget.style.backgroundColor = isCurrentActualMonth
                                ? 'rgba(16,185,129,0.1)'
                                : 'rgba(255,255,255,0.03)';
                            }
                          }}
                        >
                          {mName}
                        </button>
                      );
                    })}
                  </div>

                  {/* Bottom Quick Actions */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: '10px',
                      borderTop: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onJumpToday();
                        setIsMonthCalendarOpen(false);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#34d399',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      This Month
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsMonthCalendarOpen(false)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted, #94a3b8)',
                        fontSize: '11.5px',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button className="today-quick-btn" onClick={onJumpToday} title="Jump to this month">
              This Month
            </button>
          </>
        )}

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

        {/* PDF Export Button */}
        <button
          className="icon-action-btn pdf-export-btn"
          onClick={onExportPdf}
          title="Export PDF Statement Report"
          aria-label="Export PDF Statement Report"
        >
          <FileText size={18} />
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
            <div
              className="user-avatar-badge"
              onClick={onOpenProfile}
              style={{ cursor: onOpenProfile ? 'pointer' : 'default' }}
              title="Click for Profile & Password Settings"
            >
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div
              className="user-info-text"
              onClick={onOpenProfile}
              style={{ cursor: onOpenProfile ? 'pointer' : 'default' }}
              title={onOpenProfile ? 'Click for Profile & Password Settings' : undefined}
            >
              <span className="user-name-text">{user.fullName}</span>
              <span className="user-meta-text">
                <ShieldCheck size={11} className="text-success inline-icon" /> Active
              </span>
            </div>
            <button
              className="user-logout-btn"
              onClick={onLogout}
              title="Logout"
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
