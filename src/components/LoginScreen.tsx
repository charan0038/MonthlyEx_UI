import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  ShieldCheck,
  Zap,
  AlertCircle,
  Clock,
  ArrowRight,
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react';
import { api, RateLimitError } from '../services/api';
import type { User } from '../types';

interface LoginScreenProps {
  onSuccess: (user: User, message: string) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onSuccess,
  theme,
  onToggleTheme,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Rate Limiting countdown
  const [rateLimitSeconds, setRateLimitSeconds] = useState<number>(0);

  useEffect(() => {
    if (rateLimitSeconds <= 0) return;
    const interval = setInterval(() => {
      setRateLimitSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [rateLimitSeconds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const inputIdentifier = mobileNumber.trim();
    if (!inputIdentifier) {
      setError(
        mode === 'login'
          ? 'Please enter your mobile number or username (e.g. Admin).'
          : 'Please enter your 10-digit mobile number.'
      );
      return;
    }

    if (mode === 'register') {
      const cleanMobile = inputIdentifier.replace(/\D/g, '');
      if (cleanMobile.length !== 10) {
        setError('Please enter a valid 10-digit Indian mobile number for registration.');
        return;
      }
    } else {
      const isDigitsOnly = /^\d+$/.test(inputIdentifier);
      if (isDigitsOnly && inputIdentifier.length !== 10) {
        setError('Please enter a valid 10-digit mobile number or username.');
        return;
      }
      if (!isDigitsOnly && inputIdentifier.length < 3) {
        setError('Username must be at least 3 characters.');
        return;
      }
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (mode === 'register' && (!fullName.trim() || fullName.trim().length < 2)) {
      setError('Please enter your full name (minimum 2 characters).');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'login') {
        const auth = await api.login({
          mobileNumber: inputIdentifier,
          password,
        });
        onSuccess(auth.user, `Welcome back, ${auth.user.fullName}! 6-month session activated.`);
      } else {
        const cleanMobile = inputIdentifier.replace(/\D/g, '');
        const auth = await api.register({
          fullName: fullName.trim(),
          mobileNumber: cleanMobile,
          password,
        });
        onSuccess(auth.user, `Welcome to Kharcha, ${auth.user.fullName}! Account created.`);
      }
    } catch (err: any) {
      if (err instanceof RateLimitError || err.statusCode === 429) {
        setRateLimitSeconds(err.retryAfterSeconds || 60);
        setError(
          `Rate limit triggered! Please wait ${err.retryAfterSeconds || 60} seconds before retrying.`
        );
      } else {
        setError(err.message || 'Authentication failed. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAdminLogin = async () => {
    setMobileNumber('Admin');
    setPassword('123456');
    setError(null);
    setIsLoading(true);

    try {
      const auth = await api.login({
        mobileNumber: 'Admin',
        password: '123456',
      });
      onSuccess(auth.user, 'Logged in as Admin! 6-month session active.');
    } catch (err: any) {
      if (err instanceof RateLimitError || err.statusCode === 429) {
        setRateLimitSeconds(err.retryAfterSeconds || 60);
        setError(`Rate limit active. Wait ${err.retryAfterSeconds || 60}s.`);
      } else {
        setError(err.message || 'Admin login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-screen-wrapper">
      {/* Background ambient lighting orbs */}
      <div className="login-ambient-orb orb-primary" />
      <div className="login-ambient-orb orb-accent" />

      {/* Top Bar with Brand & Theme Switcher */}
      <header className="login-top-bar">
        <div className="login-brand">
          <div className="login-brand-icon">
            <Wallet size={22} />
          </div>
          <div className="login-brand-text">
            <span className="login-brand-name">Kharcha</span>
            <span className="login-brand-tag">Expense Tracker</span>
          </div>
        </div>

        <button
          className="login-theme-btn"
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      {/* Main Login Card Container */}
      <main className="login-content-container">
        <div className="login-card">
          <div className="login-card-header">
            <h1 className="login-title">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="login-subtitle">
              {mode === 'login'
                ? 'Sign in with your 10-digit mobile number'
                : 'Start tracking monthly expenses in seconds'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="login-tabs">
            <button
              type="button"
              className={`login-tab-btn ${mode === 'login' ? 'active' : ''}`}
              onClick={() => {
                setMode('login');
                setError(null);
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`login-tab-btn ${mode === 'register' ? 'active' : ''}`}
              onClick={() => {
                setMode('register');
                setError(null);
              }}
            >
              New Account
            </button>
          </div>

          {/* Rate Limit Alert */}
          {rateLimitSeconds > 0 && (
            <div className="login-alert-banner alert-warning">
              <Clock size={18} className="alert-icon pulse" />
              <div>
                <strong>Rate Limit Active</strong>
                <p>Too many requests. Cooldown: {rateLimitSeconds}s remaining.</p>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && rateLimitSeconds === 0 && (
            <div className="login-alert-banner alert-error">
              <AlertCircle size={18} className="alert-icon" />
              <span>{error}</span>
            </div>
          )}

          {/* Auth Form */}
          <form className="login-form" onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div className="form-group">
                <label className="form-label" htmlFor="loginFullName">
                  Full Name *
                </label>
                <div className="input-with-icon">
                  <UserIcon size={18} className="field-icon" />
                  <input
                    id="loginFullName"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Charan Kumar"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={mode === 'register'}
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="loginMobileNumber">
                {mode === 'login' ? 'Mobile Number or Username *' : 'Mobile Number *'}
              </label>
              <div className="input-with-icon">
                {mode === 'register' ? (
                  <span className="phone-prefix-badge">🇮🇳 +91</span>
                ) : (
                  <UserIcon size={18} className="field-icon" />
                )}
                <input
                  id="loginMobileNumber"
                  type={mode === 'register' ? 'tel' : 'text'}
                  inputMode={mode === 'register' ? 'numeric' : 'text'}
                  className={`form-control ${mode === 'register' ? 'form-control-phone' : ''}`}
                  placeholder={mode === 'login' ? 'Admin or 10-digit mobile' : '9876543210'}
                  value={mobileNumber}
                  onChange={(e) =>
                    setMobileNumber(mode === 'register' ? e.target.value.replace(/\D/g, '') : e.target.value)
                  }
                  required
                  autoComplete={mode === 'login' ? 'username' : 'tel-national'}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="loginPassword">
                Password *
              </label>
              <div className="input-with-icon">
                <Lock size={18} className="field-icon" />
                <input
                  id="loginPassword"
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="login-submit-btn"
              disabled={isLoading || rateLimitSeconds > 0}
            >
              {isLoading ? (
                <div className="btn-spinner" />
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In' : 'Create My Account'}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Quick Default Admin Login Option */}
          <div className="login-divider">
            <span>or 1-click admin login</span>
          </div>

          <button
            type="button"
            className="login-demo-btn"
            onClick={handleQuickAdminLogin}
            disabled={isLoading || rateLimitSeconds > 0}
          >
            <Sparkles size={16} />
            <span>Default Login: Admin (pass: 123456)</span>
          </button>

          {/* Security Features Footer */}
          <div className="login-security-badges">
            <span className="sec-badge">
              <ShieldCheck size={13} /> 6-Month JWT
            </span>
            <span className="sec-badge">
              <Zap size={13} /> Rate Limited
            </span>
            <span className="sec-badge">
              <Lock size={13} /> PostgreSQL
            </span>
          </div>
        </div>
      </main>
    </div>
  );
};
