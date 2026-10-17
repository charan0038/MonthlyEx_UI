import React, { useState, useEffect } from 'react';
import {
  Lock,
  User as UserIcon,
  X,
  Eye,
  EyeOff,
  ShieldCheck,
  Zap,
  AlertCircle,
  Clock,
  CheckCircle2,
} from 'lucide-react';

import { api, RateLimitError } from '../services/api';
import type { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User, message: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Rate Limiting Cooldown state
  const [rateLimitSeconds, setRateLimitSeconds] = useState<number>(0);

  // Countdown timer for rate limiting
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

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    const cleanMobile = mobileNumber.replace(/\D/g, '');
    if (cleanMobile.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (mode === 'register' && (!fullName.trim() || fullName.trim().length < 2)) {
      setError('Please enter your full name (at least 2 characters).');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'login') {
        const auth = await api.login({
          mobileNumber: cleanMobile,
          password,
        });
        onSuccess(auth.user, `Welcome back, ${auth.user.fullName}! 6-month session activated.`);
        onClose();
      } else {
        const auth = await api.register({
          fullName: fullName.trim(),
          mobileNumber: cleanMobile,
          password,
        });
        onSuccess(auth.user, `Account created successfully! Welcome to Kharcha, ${auth.user.fullName}.`);
        onClose();
      }
    } catch (err: any) {
      if (err instanceof RateLimitError || err.statusCode === 429) {
        setRateLimitSeconds(err.retryAfterSeconds || 60);
        setError(
          `Security Alert: Too many login attempts detected. Rate limiter active for ${err.retryAfterSeconds || 60}s to protect your account.`
        );
      } else {
        setError(err.message || 'Authentication failed. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setMobileNumber('9876543210');
    setPassword('Password@123');
    setError(null);
    setIsLoading(true);

    try {
      const auth = await api.login({
        mobileNumber: '9876543210',
        password: 'Password@123',
      });
      onSuccess(auth.user, `Logged in with Demo Account! 6-month JWT session ready.`);
      onClose();
    } catch (err: any) {
      if (err instanceof RateLimitError || err.statusCode === 429) {
        setRateLimitSeconds(err.retryAfterSeconds || 60);
        setError(`Rate limit active. Please wait ${err.retryAfterSeconds || 60}s before retrying.`);
      } else {
        setError(err.message || 'Demo login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-backdrop active" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-card auth-modal-box"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '440px', padding: '0', overflow: 'hidden' }}
      >

        {/* Header Header Banner */}
        <div className="auth-header-gradient">
          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
            style={{ position: 'absolute', top: '14px', right: '14px', color: 'white', background: 'rgba(255,255,255,0.15)' }}
          >
            <X size={18} />
          </button>

          <div className="auth-header-icon-ring">
            <ShieldCheck size={28} />
          </div>
          <h2 className="auth-title">
            {mode === 'login' ? 'Sign In to Kharcha' : 'Create Your Account'}
          </h2>
          <p className="auth-subtitle">
            Secure Mobile & JWT Authentication with 6-Month Refresh Token
          </p>

          {/* Mode Switcher Tabs */}
          <div className="auth-mode-tabs">
            <button
              type="button"
              className={`auth-mode-tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => {
                setMode('login');
                setError(null);
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`auth-mode-tab ${mode === 'register' ? 'active' : ''}`}
              onClick={() => {
                setMode('register');
                setError(null);
              }}
            >
              New Account
            </button>
          </div>
        </div>

        {/* Modal Form Body */}
        <div style={{ padding: '24px' }}>
          {/* Rate limit warning box */}
          {rateLimitSeconds > 0 && (
            <div className="auth-rate-limit-banner">
              <Clock size={18} className="spin-slow" />
              <div>
                <strong>Rate Limiter Active</strong>
                <p>
                  Please wait <strong>{rateLimitSeconds}s</strong> before attempting to authenticate again.
                </p>
              </div>
            </div>
          )}

          {/* Standard error banner */}
          {error && rateLimitSeconds === 0 && (
            <div className="auth-error-banner">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {mode === 'register' && (
              <div className="form-group">
                <label className="form-label" htmlFor="authFullName">
                  Full Name
                </label>
                <div className="input-with-icon">
                  <UserIcon size={18} className="input-icon-left" />
                  <input
                    id="authFullName"
                    type="text"
                    className="form-input with-left-icon"
                    placeholder="e.g. Charan Reddy"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="authMobile">
                Mobile Number (10 Digits)
              </label>
              <div className="input-with-icon">
                <div className="mobile-prefix-tag">+91</div>
                <input
                  id="authMobile"
                  type="tel"
                  maxLength={10}
                  className="form-input with-prefix"
                  placeholder="9876543210"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                  required
                  autoFocus={mode === 'login'}
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" htmlFor="authPassword">
                  Password
                </label>
                <span className="auth-hint">Min 6 characters</span>
              </div>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon-left" />
                <input
                  id="authPassword"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input with-left-icon with-right-icon"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-primary auth-submit-btn"
              disabled={isLoading || rateLimitSeconds > 0}
            >
              {isLoading ? (
                <span className="btn-spinner-text">Processing...</span>
              ) : mode === 'login' ? (
                'Sign In'
              ) : (
                'Create Account & Login'
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Button */}
          <div className="auth-divider">
            <span>OR FAST TEST</span>
          </div>

          <button
            type="button"
            className="auth-demo-btn"
            onClick={handleQuickDemoLogin}
            disabled={isLoading || rateLimitSeconds > 0}
          >
            <Zap size={16} className="text-warning" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 600, fontSize: '13px' }}>1-Click Demo Login</div>
              <div style={{ fontSize: '11px', opacity: 0.8 }}>Mobile: 9876543210 • Password: Password@123</div>
            </div>
          </button>

          {/* Security Features Badges */}
          <div className="auth-security-badges">
            <div className="security-badge-item">
              <CheckCircle2 size={13} className="text-success" />
              <span>6 Months Persistent Token</span>
            </div>
            <div className="security-badge-item">
              <CheckCircle2 size={13} className="text-success" />
              <span>Anti-Brute-Force Rate Limiter</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
