import React, { useState, useRef, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';

interface CustomDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (dateStr: string) => void;
  label?: string;
  required?: boolean;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value,
  onChange,
  label = 'Date',
  required = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'days' | 'months' | 'years'>('days');
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial date
  const parseDate = (val: string) => {
    if (!val) {
      const now = new Date();
      return { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() };
    }
    const [yStr, mStr, dStr] = val.split('-');
    const y = parseInt(yStr, 10);
    const m = parseInt(mStr, 10) - 1;
    const d = parseInt(dStr, 10);
    if (isNaN(y) || isNaN(m) || isNaN(d)) {
      const now = new Date();
      return { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() };
    }
    return { year: y, month: m, day: d };
  };

  const selected = parseDate(value);
  const [viewYear, setViewYear] = useState<number>(selected.year);
  const [viewMonth, setViewMonth] = useState<number>(selected.month);

  // Update view when value changes from outside
  useEffect(() => {
    if (value) {
      const p = parseDate(value);
      setViewYear(p.year);
      setViewMonth(p.month);
    }
  }, [value]);

  // Close on outside click & scroll into view on open
  useEffect(() => {
    const handleDocClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setViewMode('days');
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleDocClick);
      setTimeout(() => {
        containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleDocClick);
    };
  }, [isOpen]);

  const padZero = (n: number) => String(n).padStart(2, '0');

  const toDateString = (y: number, m: number, d: number) => {
    return `${y}-${padZero(m + 1)}-${padZero(d)}`;
  };

  const today = new Date();
  const todayStr = toDateString(today.getFullYear(), today.getMonth(), today.getDate());

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = toDateString(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

  const isSelected = (y: number, m: number, d: number) => {
    return selected.year === y && selected.month === m && selected.day === d;
  };

  const isToday = (y: number, m: number, d: number) => {
    return today.getFullYear() === y && today.getMonth() === m && today.getDate() === d;
  };

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (y: number, m: number, d: number) => {
    const dateStr = toDateString(y, m, d);
    onChange(dateStr);
    setIsOpen(false);
    setViewMode('days');
  };

  const handleSelectToday = () => {
    onChange(todayStr);
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setIsOpen(false);
    setViewMode('days');
  };

  const handleSelectYesterday = () => {
    onChange(yesterdayStr);
    setViewYear(yesterday.getFullYear());
    setViewMonth(yesterday.getMonth());
    setIsOpen(false);
    setViewMode('days');
  };

  // Generate calendar days matrix
  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfWeek = (y: number, m: number) => new Date(y, m, 1).getDay();

  const daysInCurrentMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfWeek(viewYear, viewMonth);

  const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
  const prevMonthYear = viewMonth === 0 ? viewYear - 1 : viewYear;
  const daysInPrevMonth = getDaysInMonth(prevMonthYear, prevMonth);

  const daysArray: Array<{ year: number; month: number; day: number; isCurrentMonth: boolean }> = [];

  // Previous month padding
  for (let i = firstDay - 1; i >= 0; i--) {
    daysArray.push({
      year: prevMonthYear,
      month: prevMonth,
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let i = 1; i <= daysInCurrentMonth; i++) {
    daysArray.push({
      year: viewYear,
      month: viewMonth,
      day: i,
      isCurrentMonth: true,
    });
  }

  // Next month padding (to complete a multiple of 7, up to 35 or 42 cells)
  const remainingCells = (7 - (daysArray.length % 7)) % 7;
  const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
  const nextMonthYear = viewMonth === 11 ? viewYear + 1 : viewYear;
  for (let i = 1; i <= remainingCells; i++) {
    daysArray.push({
      year: nextMonthYear,
      month: nextMonth,
      day: i,
      isCurrentMonth: false,
    });
  }

  // Friendly display format for trigger input
  const getDisplayValue = () => {
    if (!value) return 'Select date';
    const d = new Date(selected.year, selected.month, selected.day);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const monthName = MONTH_SHORT[selected.month];
    return `${dayName}, ${selected.day} ${monthName} ${selected.year}`;
  };

  const isValueToday = value === todayStr;
  const isValueYesterday = value === yesterdayStr;

  return (
    <div className="custom-datepicker-container" ref={containerRef} style={{ position: 'relative' }}>
      {/* Label and Quick Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <label className="form-label" style={{ margin: 0 }}>
          {label} {required && '*'}
        </label>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            onClick={handleSelectYesterday}
            style={{
              padding: '2px 8px',
              borderRadius: '10px',
              fontSize: '11px',
              fontWeight: 500,
              cursor: 'pointer',
              border: isValueYesterday ? '1px solid var(--primary, #6366f1)' : '1px solid rgba(255,255,255,0.1)',
              backgroundColor: isValueYesterday ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.03)',
              color: isValueYesterday ? '#a5b4fc' : 'var(--text-muted, #94a3b8)',
              transition: 'all 0.15s ease',
            }}
          >
            Yesterday
          </button>
          <button
            type="button"
            onClick={handleSelectToday}
            style={{
              padding: '2px 8px',
              borderRadius: '10px',
              fontSize: '11px',
              fontWeight: 500,
              cursor: 'pointer',
              border: isValueToday ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
              backgroundColor: isValueToday ? 'rgba(16,185,129,0.18)' : 'rgba(255,255,255,0.03)',
              color: isValueToday ? '#34d399' : 'var(--text-muted, #94a3b8)',
              transition: 'all 0.15s ease',
            }}
          >
            Today
          </button>
        </div>
      </div>

      {/* Input Trigger Button */}
      <div
        className="form-control datepicker-trigger-input"
        onClick={() => {
          setIsOpen(!isOpen);
          setViewMode('days');
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          userSelect: 'none',
          padding: '10px 14px',
          background: 'var(--bg-input, #0e1422)',
          border: isOpen ? '1px solid var(--primary, #6366f1)' : '1px solid var(--border-color, #242f46)',
          borderRadius: '12px',
          boxShadow: isOpen ? '0 0 0 3px rgba(99,102,241,0.18)' : 'none',
          transition: 'all 0.2s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              backgroundColor: 'rgba(99,102,241,0.14)',
              color: 'var(--primary, #6366f1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CalendarIcon size={15} />
          </div>
          <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-main, #f8fafc)' }}>
            {getDisplayValue()}
          </span>
          {isValueToday && (
            <span
              style={{
                fontSize: '10px',
                padding: '1px 6px',
                borderRadius: '6px',
                backgroundColor: 'rgba(16,185,129,0.18)',
                color: '#34d399',
                fontWeight: 600,
              }}
            >
              Today
            </span>
          )}
          {isValueYesterday && (
            <span
              style={{
                fontSize: '10px',
                padding: '1px 6px',
                borderRadius: '6px',
                backgroundColor: 'rgba(99,102,241,0.18)',
                color: '#a5b4fc',
                fontWeight: 600,
              }}
            >
              Yesterday
            </span>
          )}
        </div>
        <ChevronDown
          size={16}
          style={{
            color: 'var(--text-muted, #94a3b8)',
            transform: isOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s ease',
          }}
        />
      </div>

      {/* Enhanced Calendar Popover Card */}
      {isOpen && (
        <div
          className="calendar-popover"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            zIndex: 9999,
            backgroundColor: 'var(--bg-surface-elevated, #1a2235)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '18px',
            padding: '16px',
            boxShadow: '0 20px 40px -8px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.06)',
            backdropFilter: 'blur(16px)',
            animation: 'modalSlideUp 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Calendar Header with Month/Year Switcher */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '14px',
            }}
          >
            {/* Clickable Month-Year Switcher Button */}
            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'days' ? 'months' : 'days')}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px',
                padding: '6px 12px',
                color: 'var(--text-main, #f8fafc)',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)')}
            >
              <span>{MONTH_NAMES[viewMonth]} {viewYear}</span>
              <ChevronDown
                size={14}
                style={{
                  transform: viewMode === 'months' ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.15s ease',
                  opacity: 0.7,
                }}
              />
            </button>

            {/* Stepper Arrows */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                type="button"
                onClick={handlePrevMonth}
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  color: 'var(--text-main, #f8fafc)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                title="Previous Month"
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)')}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  color: 'var(--text-main, #f8fafc)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                title="Next Month"
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)')}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* VIEW MODE 1: Fast Month & Year Picker Grid */}
          {viewMode === 'months' && (
            <div>
              {/* Year Selector Row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 12px',
                  marginBottom: '10px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                }}
              >
                <button
                  type="button"
                  onClick={() => setViewYear((y) => y - 1)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted, #94a3b8)',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                >
                  &laquo; {viewYear - 1}
                </button>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#a5b4fc' }}>
                  {viewYear}
                </span>
                <button
                  type="button"
                  onClick={() => setViewYear((y) => y + 1)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted, #94a3b8)',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                >
                  {viewYear + 1} &raquo;
                </button>
              </div>

              {/* 12 Months Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '10px' }}>
                {MONTH_SHORT.map((mName, idx) => {
                  const isCurrent = viewMonth === idx;
                  return (
                    <button
                      key={mName}
                      type="button"
                      onClick={() => {
                        setViewMonth(idx);
                        setViewMode('days');
                      }}
                      style={{
                        padding: '10px 4px',
                        borderRadius: '10px',
                        border: isCurrent ? '1px solid var(--primary, #6366f1)' : '1px solid rgba(255,255,255,0.06)',
                        backgroundColor: isCurrent ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.03)',
                        color: isCurrent ? '#a5b4fc' : 'var(--text-main, #f8fafc)',
                        fontSize: '12.5px',
                        fontWeight: isCurrent ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!isCurrent) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isCurrent) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
                      }}
                    >
                      {mName}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW MODE 2: Standard Days Calendar Grid */}
          {viewMode === 'days' && (
            <div>
              {/* Day of week labels */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  textAlign: 'center',
                  marginBottom: '8px',
                }}
              >
                {WEEKDAYS.map((wd, i) => (
                  <div
                    key={wd}
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: i === 0 || i === 6 ? '#f43f5e' : 'var(--text-muted, #94a3b8)',
                      opacity: 0.8,
                      padding: '4px 0',
                    }}
                  >
                    {wd}
                  </div>
                ))}
              </div>

              {/* Days grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: '4px',
                }}
              >
                {daysArray.map(({ year, month, day, isCurrentMonth }) => {
                  const selectedThis = isSelected(year, month, day);
                  const todayThis = isToday(year, month, day);

                  return (
                    <button
                      key={`${year}-${month}-${day}`}
                      type="button"
                      onClick={() => handleSelectDay(year, month, day)}
                      style={{
                        height: '36px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontSize: '12.5px',
                        fontWeight: selectedThis ? 700 : todayThis ? 700 : 500,
                        border: selectedThis
                          ? '1px solid #818cf8'
                          : todayThis
                          ? '1px solid rgba(99,102,241,0.5)'
                          : '1px solid transparent',
                        background: selectedThis
                          ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
                          : todayThis
                          ? 'rgba(99,102,241,0.12)'
                          : 'transparent',
                        color: selectedThis
                          ? '#ffffff'
                          : isCurrentMonth
                          ? 'var(--text-main, #f8fafc)'
                          : 'rgba(148,163,184,0.3)',
                        boxShadow: selectedThis ? '0 4px 12px rgba(99,102,241,0.45)' : 'none',
                        position: 'relative',
                        transition: 'all 0.12s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!selectedThis) {
                          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!selectedThis) {
                          e.currentTarget.style.backgroundColor = todayThis
                            ? 'rgba(99,102,241,0.12)'
                            : 'transparent';
                          e.currentTarget.style.transform = 'scale(1)';
                        }
                      }}
                    >
                      <span>{day}</span>
                      {todayThis && !selectedThis && (
                        <span
                          style={{
                            width: '4px',
                            height: '4px',
                            borderRadius: '50%',
                            backgroundColor: '#6366f1',
                            position: 'absolute',
                            bottom: '3px',
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Action Footer */}
          <div
            style={{
              marginTop: '14px',
              paddingTop: '12px',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <button
              type="button"
              onClick={handleSelectToday}
              style={{
                fontSize: '11.5px',
                fontWeight: 600,
                color: '#34d399',
                background: 'rgba(16,185,129,0.12)',
                border: '1px solid rgba(16,185,129,0.25)',
                borderRadius: '8px',
                padding: '5px 12px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Today
            </button>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{
                fontSize: '11.5px',
                fontWeight: 600,
                color: 'var(--text-muted, #94a3b8)',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                padding: '5px 14px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
