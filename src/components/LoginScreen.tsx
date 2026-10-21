import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  AlertCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  Sun,
  Moon,
} from 'lucide-react';
import DodgeField from './DodgeField';
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
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
          ? 'Please enter your mobile number or username.'
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

    if (mode === 'forgot') {
      if (password !== confirmPassword) {
        setError('New password and confirm password do not match.');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (mode === 'login') {
        const auth = await api.login({
          mobileNumber: inputIdentifier,
          password,
        });
        onSuccess(auth.user, `Welcome back, ${auth.user.fullName}!`);
      } else if (mode === 'register') {
        const cleanMobile = inputIdentifier.replace(/\D/g, '');
        const auth = await api.register({
          fullName: fullName.trim(),
          mobileNumber: cleanMobile,
          password,
        });
        onSuccess(auth.user, `Welcome to Vessel, ${auth.user.fullName}! Account created.`);
      } else if (mode === 'forgot') {
        const res = await api.forgotPassword({
          mobileNumber: inputIdentifier,
          newPassword: password,
        });
        setSuccessMessage(res.message || 'Password reset successfully! Please sign in with your new password.');
        setMode('login');
        setPassword('');
        setConfirmPassword('');
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
            <span className="login-brand-name">Vessel</span>
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
              {mode === 'login'
                ? 'Welcome Back'
                : mode === 'register'
                ? 'Create Account'
                : 'Reset Password'}
            </h1>
            <p className="login-subtitle">
              {mode === 'login'
                ? 'Sign in with your 10-digit mobile number'
                : mode === 'register'
                ? 'Start tracking monthly expenses in seconds'
                : 'Set a new password for your registered mobile number'}
            </p>
          </div>

          {/* Mode Switcher Tabs (or Back to Sign In when resetting) */}
          {mode !== 'forgot' ? (
            <div className="login-tabs">
              <button
                type="button"
                className={`login-tab-btn ${mode === 'login' ? 'active' : ''}`}
                onClick={() => {
                  setMode('login');
                  setError(null);
                  setSuccessMessage(null);
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
                  setSuccessMessage(null);
                }}
              >
                New Account
              </button>
            </div>
          ) : (
            <div style={{ marginBottom: '20px' }}>
              <button
                type="button"
                className="back-to-login-btn"
                onClick={() => {
                  setMode('login');
                  setError(null);
                  setSuccessMessage(null);
                }}
              >
                <ArrowLeft size={16} /> Back to Sign In
              </button>
            </div>
          )}

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

          {/* Success Banner */}
          {successMessage && !error && rateLimitSeconds === 0 && (
            <div className="login-alert-banner alert-success">
              <CheckCircle2 size={18} className="alert-icon text-success" />
              <span>{successMessage}</span>
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
                  <UserIcon size={18} className="input-icon-left" />
                  <input
                    id="loginFullName"
                    type="text"
                    className="form-control with-left-icon"
                    placeholder="Enter your name"
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
                {mode === 'register' ? 'Mobile Number *' : 'Mobile Number or Username *'}
              </label>
              <div className="input-with-icon">
                {mode === 'register' ? (
                  <>
                    <span className="mobile-prefix-tag">+91</span>
                    <input
                      id="loginMobileNumber"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      className="form-control with-prefix"
                      placeholder="9876543210"
                      value={mobileNumber}
                      onChange={(e) =>
                        setMobileNumber(e.target.value.replace(/\D/g, ''))
                      }
                      required
                      autoComplete="tel-national"
                    />
                  </>
                ) : (
                  <>
                    <UserIcon size={18} className="input-icon-left" />
                    <input
                      id="loginMobileNumber"
                      type="text"
                      className="form-control with-left-icon"
                      placeholder="Mobile number or username"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      required
                      autoComplete="username"
                    />
                  </>
                )}
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="form-label" htmlFor="loginPassword" style={{ margin: 0 }}>
                  {mode === 'forgot' ? 'New Password *' : 'Password *'}
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    className="forgot-password-link"
                    onClick={() => {
                      setMode('forgot');
                      setError(null);
                      setSuccessMessage(null);
                    }}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon-left" />
                <input
                  id="loginPassword"
                  type={showPassword ? 'text' : 'password'}
                  className="form-control with-left-icon with-right-icon"
                  placeholder={mode === 'forgot' ? 'Enter new password' : 'Enter your password'}
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

            {mode === 'forgot' && (
              <div className="form-group">
                <label className="form-label" htmlFor="loginConfirmPassword">
                  Confirm New Password *
                </label>
                <div className="input-with-icon">
                  <KeyRound size={18} className="input-icon-left" />
                  <input
                    id="loginConfirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="form-control with-left-icon with-right-icon"
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            <DodgeField
              patience={3}
              fieldHeight={76}
              reach={65}
              radius={140}
              falloff={2}
              fleeDuration={130}
              returnDuration={620}
              returnBounce={0.1}
              axis="both"
              wall="clamp"
              disabled={isLoading || rateLimitSeconds > 0 || mode !== 'login'}
              onCatch={() => console.log('caught')}
            >
              {({ dodges, gave }) => (
                <button
                  type="submit"
                  className="login-submit-btn"
                  disabled={isLoading || rateLimitSeconds > 0}
                  style={{
                    width: mode === 'login' ? '280px' : '100%',
                    maxWidth: '100%',
                    margin: '0 auto',
                  }}
                >
                  {isLoading ? (
                    <div className="btn-spinner" />
                  ) : (
                    <>
                      <span>
                        {mode === 'login'
                          ? gave
                            ? 'Okay, okay · Sign In'
                            : dodges
                            ? `Nope x${dodges} · Catch me`
                            : 'Sign In'
                          : mode === 'register'
                          ? 'Create My Account'
                          : 'Reset Password'}
                      </span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              )}
            </DodgeField>
          </form>
        </div>
      </main>
    </div>
  );
};
