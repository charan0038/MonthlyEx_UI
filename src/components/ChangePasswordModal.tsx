import React, { useState } from 'react';
import {
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  X,
  AlertCircle,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { api, RateLimitError } from '../services/api';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitSeconds, setRateLimitSeconds] = useState(0);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentPassword) {
      setError('Please enter your current password.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword === currentPassword) {
      setError('New password must be different from your current password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.changePassword({
        currentPassword,
        newPassword,
      });

      onSuccess(res.message || 'Password updated successfully!');
      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    } catch (err: any) {
      if (err instanceof RateLimitError || err.statusCode === 429) {
        setRateLimitSeconds(err.retryAfterSeconds || 60);
        setError(`Rate limit active. Please wait ${err.retryAfterSeconds || 60}s before retrying.`);
      } else {
        setError(err.message || 'Failed to change password. Please check your current password.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    onClose();
  };

  return (
    <div className="modal-backdrop active" onClick={handleClose} role="dialog" aria-modal="true">
      <div
        className="modal-card auth-modal-box"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '440px', padding: '0', overflow: 'hidden' }}
      >
        {/* Header Gradient */}
        <div className="auth-header-gradient">
          <button
            className="modal-close-btn"
            onClick={handleClose}
            aria-label="Close modal"
            style={{
              position: 'absolute',
              top: '14px',
              right: '14px',
              color: 'white',
              background: 'rgba(255,255,255,0.15)',
            }}
          >
            <X size={18} />
          </button>

          <div className="auth-header-icon-ring">
            <KeyRound size={26} />
          </div>
          <h2 className="auth-title">Change Password</h2>
          <p className="auth-subtitle">
            Update your password to keep your Vessel account safe and secure
          </p>
        </div>

        {/* Form Body */}
        <div style={{ padding: '24px' }}>
          {/* Rate Limit Alert */}
          {rateLimitSeconds > 0 && (
            <div className="auth-rate-limit-banner">
              <Clock size={18} className="spin-slow" />
              <div>
                <strong>Rate Limiter Active</strong>
                <p>Please wait {rateLimitSeconds}s before retrying.</p>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && rateLimitSeconds === 0 && (
            <div className="auth-error-banner">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Current Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="currentPasswordInput">
                Current Password *
              </label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon-left" />
                <input
                  id="currentPasswordInput"
                  type={showCurrent ? 'text' : 'password'}
                  className="form-control with-left-icon with-right-icon"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  autoFocus
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowCurrent(!showCurrent)}
                  aria-label={showCurrent ? 'Hide password' : 'Show password'}
                >
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" htmlFor="newPasswordInput">
                  New Password *
                </label>
                <span className="auth-hint">Min 6 characters</span>
              </div>
              <div className="input-with-icon">
                <KeyRound size={18} className="input-icon-left" />
                <input
                  id="newPasswordInput"
                  type={showNew ? 'text' : 'password'}
                  className="form-control with-left-icon with-right-icon"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowNew(!showNew)}
                  aria-label={showNew ? 'Hide password' : 'Show password'}
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="confirmNewPasswordInput">
                Confirm New Password *
              </label>
              <div className="input-with-icon">
                <ShieldCheck size={18} className="input-icon-left" />
                <input
                  id="confirmNewPasswordInput"
                  type={showConfirm ? 'text' : 'password'}
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
                  onClick={() => setShowConfirm(!showConfirm)}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
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
                <span className="btn-spinner-text">Updating Password...</span>
              ) : (
                'Update Password'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
