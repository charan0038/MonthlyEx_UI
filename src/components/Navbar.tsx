import React, { useState, useRef, useEffect } from 'react';
import {
  Ship,
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
  Layers,
  Calculator,
  Landmark,
  Sparkles,
} from 'lucide-react';

import { getMonthName, getShortMonthName } from '../utils/formatters';
import type { User } from '../types';

interface NavbarProps {
  currentYear: number;
  currentMonth: number;
  theme: 'dark' | 'light';
  user: User | null;
  activeDashboard?: 'monthly' | 'weekly' | 'yearly' | 'emi';
  isOfflineOrWaking?: boolean;
  onReconnect?: () => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onJumpToday: () => void;
  onSelectMonthYear?: (year: number, month: number) => void;
  onToggleTheme: () => void;
  onExportPdf: () => void;
  onOpenCategories?: () => void;
  onOpenCalculator?: () => void;
  onOpenWhatsNew?: () => void;
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
  isOfflineOrWaking = false,
  onReconnect,
  onPrevMonth,
  onNextMonth,
  onJumpToday,
  onSelectMonthYear,
  onToggleTheme,
  onExportPdf,
  onOpenCategories,
  onOpenCalculator,
  onOpenWhatsNew,
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
        <div className="brand-group" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            className="brand-icon"
            style={{
              position: 'relative',
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #FF5722 0%, #FF7A45 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: theme === 'dark' ? '0 0 24px rgba(255, 87, 34, 0.45)' : '0 4px 14px rgba(255, 87, 34, 0.3)',
              border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.25)' : '1px solid rgba(255, 87, 34, 0.3)',
              flexShrink: 0,
            }}
          >
            <Ship size={24} color="#ffffff" strokeWidth={2.4} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span
                className="brand-title"
                style={{
                  fontSize: '22px',
                  fontWeight: 800,
                  letterSpacing: '-0.5px',
                  color: theme === 'dark' ? '#ffffff' : '#0f172a',
                  transition: 'color 0.2s ease',
                }}
              >
                Vessel
              </span>
              <span
                className="brand-badge"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  border: theme === 'dark' ? '1px solid rgba(6, 182, 212, 0.45)' : '1px solid #e2e8f0',
                  backgroundColor: theme === 'dark' ? 'rgba(6, 182, 212, 0.1)' : '#f1f5f9',
                  color: theme === 'dark' ? '#22d3ee' : '#2563eb',
                  fontSize: '10px',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  fontWeight: 700,
                  letterSpacing: '0.8px',
                  textTransform: 'uppercase',
                  boxShadow: theme === 'dark' ? '0 0 12px rgba(6, 182, 212, 0.25)' : 'none',
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: theme === 'dark' ? '#22d3ee' : '#2563eb',
                    boxShadow: theme === 'dark' ? '0 0 8px #22d3ee' : '0 0 6px rgba(37, 99, 235, 0.4)',
                  }}
                />
                TRACKS EVERY LEAK
              </span>
            </div>
            <p
              className="brand-subtitle"
              style={{
                fontSize: '12px',
                color: theme === 'dark' ? '#8A99AD' : '#64748b',
                margin: '2px 0 0 0',
                fontWeight: 500,
                transition: 'color 0.2s ease',
              }}
            >
              Smart Monthly Personal Finances
            </p>
          </div>
        </div>

        {/* Quick mobile-only actions (Theme + User + Updates) */}
        <div className="mobile-header-actions">
          {onOpenWhatsNew && (
            <button
              className="icon-action-btn whats-new-btn mobile-whats-new-btn"
              onClick={onOpenWhatsNew}
              title="What's New in Vessel (Updates)"
              aria-label="What's New"
            >
              <Sparkles size={16} />
              <span className="whats-new-badge-dot" />
            </button>
          )}

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
        ) : activeDashboard === 'emi' ? (
          <div
            className="navbar-yearly-badge"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '999px',
              backgroundColor: 'rgba(16, 185, 129, 0.14)',
              border: '1px solid rgba(16, 185, 129, 0.28)',
              color: '#34d399',
              fontSize: '13px',
              fontWeight: 700,
            }}
          >
            <Landmark size={14} />
            <span>Dues & Commitments</span>
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
                  gap: '5px',
                  minWidth: 0,
                }}
              >
                <CalendarDays size={14} className="month-display-icon" style={{ color: 'var(--primary, #6366f1)', opacity: 0.85, flexShrink: 0 }} />
                <span className="month-display-text-full">{getMonthName(currentMonth, currentYear)}</span>
                <span className="month-display-text-short">{getShortMonthName(currentMonth, currentYear)}</span>
                <ChevronDown
                  size={13}
                  className="month-display-chevron"
                  style={{
                    opacity: 0.6,
                    transform: isMonthCalendarOpen ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.18s ease',
                    flexShrink: 0,
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
                    backgroundColor: theme === 'dark' ? 'var(--bg-surface-elevated, #1a2235)' : '#ffffff',
                    border: theme === 'dark' ? '1px solid rgba(255,255,255,0.12)' : '1px solid #e2e8f0',
                    borderRadius: '18px',
                    padding: '16px',
                    boxShadow: theme === 'dark'
                      ? '0 20px 40px -8px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)'
                      : '0 20px 40px -8px rgba(15,23,42,0.12), 0 0 0 1px #e2e8f0',
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
                      borderBottom: theme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid #f1f5f9',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setPickerYear((y) => y - 1)}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '8px',
                        border: theme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
                        backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.04)' : '#f8fafc',
                        color: theme === 'dark' ? 'var(--text-main, #f8fafc)' : '#0f172a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                      title="Previous Year"
                    >
                      <ChevronLeft size={15} />
                    </button>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: theme === 'dark' ? '#a5b4fc' : '#2563eb' }}>
                      {pickerYear}
                    </div>
                    <button
                      type="button"
                      onClick={() => setPickerYear((y) => y + 1)}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '8px',
                        border: theme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
                        backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.04)' : '#f8fafc',
                        color: theme === 'dark' ? 'var(--text-main, #f8fafc)' : '#0f172a',
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
                              ? '1px solid #2563eb'
                              : isCurrentActualMonth
                              ? (theme === 'dark' ? '1px solid rgba(16,185,129,0.4)' : '1px solid #a7f3d0')
                              : (theme === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0'),
                            background: isCurrentSelected
                              ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
                              : isCurrentActualMonth
                              ? (theme === 'dark' ? 'rgba(16,185,129,0.1)' : '#ecfdf5')
                              : (theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#ffffff'),
                            color: isCurrentSelected
                              ? '#ffffff'
                              : isCurrentActualMonth
                              ? (theme === 'dark' ? '#34d399' : '#047857')
                              : (theme === 'dark' ? 'var(--text-main, #f8fafc)' : '#0f172a'),
                            fontSize: '13px',
                            fontWeight: isCurrentSelected ? 700 : 500,
                            cursor: 'pointer',
                            boxShadow: isCurrentSelected ? '0 4px 12px rgba(37,99,235,0.35)' : 'none',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={(e) => {
                            if (!isCurrentSelected) e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(255,255,255,0.08)' : '#f1f5f9';
                          }}
                          onMouseLeave={(e) => {
                            if (!isCurrentSelected) {
                              e.currentTarget.style.backgroundColor = isCurrentActualMonth
                                ? (theme === 'dark' ? 'rgba(16,185,129,0.1)' : '#ecfdf5')
                                : (theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#ffffff');
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
                      borderTop: theme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid #f1f5f9',
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
                        color: theme === 'dark' ? '#34d399' : '#059669',
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
                        color: theme === 'dark' ? 'var(--text-muted, #94a3b8)' : '#64748b',
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
              <span className="today-text-full">This Month</span>
              <span className="today-text-short">Today</span>
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

        {/* Calculator Button */}
        {onOpenCalculator && (
          <button
            className="icon-action-btn calculator-btn"
            onClick={onOpenCalculator}
            title="Financial Calculator"
            aria-label="Calculator"
          >
            <Calculator size={18} />
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

        {/* What's New Updates Button */}
        {onOpenWhatsNew && (
          <button
            className="icon-action-btn whats-new-btn desktop-whats-new-btn"
            onClick={onOpenWhatsNew}
            title="What's New in Vessel (Updates)"
            aria-label="What's New"
          >
            <Sparkles size={18} />
            <span className="whats-new-badge-dot" />
          </button>
        )}

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
          <div
            className="user-profile-pill"
            title={`Logged in as ${user.fullName} (${user.mobileNumber})`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 10px 4px 5px',
              borderRadius: '999px',
              backgroundColor: theme === 'dark' ? 'rgba(5, 11, 20, 0.85)' : '#ffffff',
              border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #e2e8f0',
              boxShadow: theme === 'dark' ? 'none' : '0 1px 4px rgba(15, 23, 42, 0.08)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <div
              className="user-avatar-badge"
              onClick={onOpenProfile}
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: theme === 'dark' ? 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)' : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 700,
                fontFamily: 'ui-monospace, monospace',
                cursor: onOpenProfile ? 'pointer' : 'default',
                boxShadow: theme === 'dark' ? '0 0 10px rgba(6, 182, 212, 0.35)' : '0 2px 6px rgba(37, 99, 235, 0.25)',
              }}
              title="Click for Profile & Password Settings"
            >
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div
              className="user-info-text"
              onClick={onOpenProfile}
              style={{ cursor: onOpenProfile ? 'pointer' : 'default', display: 'flex', flexDirection: 'column' }}
              title={onOpenProfile ? 'Click for Profile & Password Settings' : undefined}
            >
              <span
                className="user-name-text"
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: theme === 'dark' ? '#ffffff' : '#0f172a',
                  lineHeight: 1.2,
                }}
              >
                {user.fullName}
              </span>
              <span
                className="user-meta-text"
                style={{
                  fontSize: '10px',
                  color: isOfflineOrWaking ? '#fbbf24' : '#34d399',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  lineHeight: 1.2,
                  cursor: isOfflineOrWaking && onReconnect ? 'pointer' : 'default',
                }}
                onClick={(e) => {
                  if (isOfflineOrWaking && onReconnect) {
                    e.stopPropagation();
                    onReconnect();
                  }
                }}
                title={isOfflineOrWaking ? 'Server waking up. Click to retry connecting' : 'Connected to cloud server'}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: isOfflineOrWaking ? '#fbbf24' : '#34d399',
                    boxShadow: isOfflineOrWaking ? '0 0 6px #fbbf24' : '0 0 6px #34d399',
                  }}
                />
                {isOfflineOrWaking ? 'Syncing...' : 'Active'}
              </span>
            </div>
            <button
              className="user-logout-btn"
              onClick={onLogout}
              title="Logout"
              aria-label="Logout"
              style={{
                marginLeft: '4px',
                background: 'none',
                border: 'none',
                color: theme === 'dark' ? '#8A99AD' : '#64748b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '4px',
                borderRadius: '6px',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#f43f5e')}
              onMouseLeave={(e) => (e.currentTarget.style.color = theme === 'dark' ? '#8A99AD' : '#64748b')}
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
        <button
          className="btn-primary btn-desktop-add"
          onClick={onOpenAddModal}
          style={{
            background: 'linear-gradient(135deg, #FF5722 0%, #FF7A45 100%)',
            boxShadow: theme === 'dark' ? '0 0 20px rgba(255, 87, 34, 0.45)' : '0 4px 14px rgba(255, 87, 34, 0.35)',
            border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(255, 87, 34, 0.4)',
            color: '#ffffff',
            fontWeight: 700,
            letterSpacing: '0.2px',
            borderRadius: '12px',
            padding: '9px 18px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            transition: 'transform 0.18s ease, box-shadow 0.18s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.03)';
            e.currentTarget.style.boxShadow = theme === 'dark' ? '0 0 28px rgba(255, 87, 34, 0.65)' : '0 6px 20px rgba(255, 87, 34, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = theme === 'dark' ? '0 0 20px rgba(255, 87, 34, 0.45)' : '0 4px 14px rgba(255, 87, 34, 0.35)';
          }}
        >
          <Plus size={18} strokeWidth={2.4} /> Add Transaction
        </button>
      </div>
    </header>
  );
};
