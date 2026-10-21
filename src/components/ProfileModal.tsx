import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Phone,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  X,
  AlertCircle,
  CheckCircle2,
  Save,
  ShieldCheck,
  Calendar,
  Clock,
} from 'lucide-react';
import { api, RateLimitError } from '../services/api';
import type { User } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onSuccess: (updatedUser: User) => void;
  onPasswordChanged?: (message: string) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  user,
  onClose,
  onSuccess,
  onPasswordChanged,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

  // --- Profile state ---
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  // --- Password state ---
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPwdLoading, setIsPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);
  const [rateLimitSeconds, setRateLimitSeconds] = useState<number>(0);

  // Countdown timer for rate limiting
  useEffect(() => {
    if (rateLimitSeconds <= 0) return;
    const interval = setInterval(() => {
      setRateLimitSeconds((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [rateLimitSeconds]);

  // Sync state whenever modal opens or user prop updates
  useEffect(() => {
    if (user && isOpen) {
      setFullName(user.fullName || '');
      setMobileNumber(user.mobileNumber || '');
      setProfileError(null);
      setProfileSuccess(null);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPwdError(null);
      setPwdSuccess(null);
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const isProfileDirty =
    fullName.trim() !== (user.fullName || '').trim() ||
    mobileNumber.trim() !== (user.mobileNumber || '').trim();

  // --- Profile submission ---
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);

    const cleanName = fullName.trim();
    const cleanMobile = mobileNumber.trim();

    if (!cleanName) {
      setProfileError('Please enter your full name or username.');
      return;
    }

    if (cleanName.length < 2 || cleanName.length > 100) {
      setProfileError('Username / Full name must be between 2 and 100 characters.');
      return;
    }

    if (!cleanMobile) {
      setProfileError('Please enter your 10-digit mobile number.');
      return;
    }

    if (!/^[0-9]{10}$/.test(cleanMobile)) {
      setProfileError('Please enter a valid 10-digit mobile number (digits 0-9 only).');
      return;
    }

    if (!isProfileDirty) {
      setProfileError('No changes detected in your username or mobile number.');
      return;
    }

    setIsProfileLoading(true);

    try {
      const updated = await api.updateProfile({
        fullName: cleanName,
        mobileNumber: cleanMobile,
      });

      setProfileSuccess('Profile updated successfully!');
      onSuccess(updated);
    } catch (err: any) {
      setProfileError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsProfileLoading(false);
    }
  };

  // --- Password change submission ---
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError(null);
    setPwdSuccess(null);

    if (!currentPassword) {
      setPwdError('Please enter your current password.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setPwdError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword === currentPassword) {
      setPwdError('New password must be different from your current password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdError('New password and confirm password do not match.');
      return;
    }

    setIsPwdLoading(true);

    try {
      const res = await api.changePassword({
        currentPassword,
        newPassword,
      });

      setPwdSuccess(res.message || 'Password changed successfully!');
      if (onPasswordChanged) {
        onPasswordChanged(res.message || 'Password changed successfully!');
      }

      // Reset password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      if (err instanceof RateLimitError || err.statusCode === 429) {
        setRateLimitSeconds(err.retryAfterSeconds || 60);
        setPwdError(`Rate limit active. Please wait ${err.retryAfterSeconds || 60}s before retrying.`);
      } else {
        setPwdError(err.message || 'Failed to change password. Check your current password.');
      }
    } finally {
      setIsPwdLoading(false);
    }
  };

  const handleClose = () => {
    setProfileError(null);
    setProfileSuccess(null);
    setPwdError(null);
    setPwdSuccess(null);
    onClose();
  };

  const formattedDate = user.createdDate || user.createdAt
    ? new Date(user.createdDate || user.createdAt!).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : 'Oct 2026';

  return (
    <div className="modal-backdrop active" onClick={handleClose} role="dialog" aria-modal="true">
      <div
        className="modal-card auth-modal-box profile-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Avatar & Gradient */}
        <div className="profile-header-gradient">
          <button
            className="profile-close-btn"
            onClick={handleClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>

          <div className="profile-avatar-large">
            <span>{fullName.trim().charAt(0).toUpperCase() || user.fullName.charAt(0).toUpperCase()}</span>
          </div>
          <h2 className="profile-modal-title">Profile & Security</h2>
          <p className="profile-modal-subtitle">
            Manage your account details and password
          </p>

          <div className="profile-badges-row">
            <span className="profile-badge">
              <Calendar size={12} /> Joined {formattedDate}
            </span>
            <span className="profile-badge badge-active">
              <span className="badge-dot-pulse" />
              <ShieldCheck size={12} /> Active
            </span>
          </div>

          {/* Tab Switcher Pills */}
          <div className="profile-tabs-pill-row">
            <button
              type="button"
              className={`profile-tab-pill ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('profile');
                setProfileError(null);
                setProfileSuccess(null);
              }}
            >
              <UserIcon size={14} />
              <span>Profile Info</span>
            </button>
            <button
              type="button"
              className={`profile-tab-pill ${activeTab === 'password' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('password');
                setPwdError(null);
                setPwdSuccess(null);
              }}
            >
              <KeyRound size={14} />
              <span>Change Password</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="profile-modal-body">
          {/* TAB 1: Profile Details */}
          {activeTab === 'profile' && (
            <div>
              {profileError && (
                <div className="auth-error-banner" style={{ marginBottom: '16px' }}>
                  <AlertCircle size={18} />
                  <span>{profileError}</span>
                </div>
              )}

              {profileSuccess && (
                <div className="auth-success-banner" style={{ marginBottom: '16px' }}>
                  <CheckCircle2 size={18} />
                  <span>{profileSuccess}</span>
                </div>
              )}

              <form onSubmit={handleProfileSubmit}>
                {/* User Name / Full Name Field */}
                <div className="profile-input-group">
                  <label className="profile-label" htmlFor="profile-fullname">
                    <span>User Name / Full Name</span>
                    {isProfileDirty && (
                      <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 600 }}>
                        • Unsaved Changes
                      </span>
                    )}
                  </label>
                  <div className="profile-input-wrapper">
                    <UserIcon size={18} className="profile-field-icon" />
                    <input
                      id="profile-fullname"
                      type="text"
                      className="profile-input"
                      placeholder="Enter full name / username"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      maxLength={100}
                      disabled={isProfileLoading}
                      autoComplete="name"
                      required
                    />
                  </div>
                  <span className="profile-field-hint">
                    Displayed across monthly expenses, categories, and CSV exports
                  </span>
                </div>

                {/* Mobile Number Field */}
                <div className="profile-input-group">
                  <label className="profile-label" htmlFor="profile-mobile">
                    <span>Phone Number (Mobile)</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
                      {mobileNumber.length}/10 digits
                    </span>
                  </label>
                  <div className="profile-input-wrapper">
                    <Phone size={18} className="profile-field-icon" />
                    <input
                      id="profile-mobile"
                      type="tel"
                      className="profile-input"
                      placeholder="10-digit mobile number"
                      value={mobileNumber}
                      onChange={(e) => {
                        const onlyNums = e.target.value.replace(/[^0-9]/g, '');
                        if (onlyNums.length <= 10) {
                          setMobileNumber(onlyNums);
                        }
                      }}
                      maxLength={10}
                      disabled={isProfileLoading}
                      autoComplete="tel"
                      required
                    />
                  </div>
                  <span className="profile-field-hint">
                    Your 10-digit registered number used for secure login
                  </span>
                </div>

                {/* Actions Footer */}
                <div className="profile-actions-footer">
                  <button
                    type="button"
                    className="profile-btn-cancel"
                    onClick={handleClose}
                    disabled={isProfileLoading}
                  >
                    <X size={15} />
                    <span>Cancel</span>
                  </button>
                  <button
                    type="submit"
                    className="profile-btn-save"
                    disabled={isProfileLoading || !isProfileDirty}
                  >
                    {isProfileLoading ? (
                      <>
                        <span className="btn-spinner" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save size={15} />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: Change Password (Inside Profile) */}
          {activeTab === 'password' && (
            <div>
              {/* Rate limit warning */}
              {rateLimitSeconds > 0 && (
                <div className="auth-rate-limit-banner">
                  <Clock size={18} className="spin-slow" />
                  <div>
                    <strong>Rate Limit Active</strong>
                    <p>Please wait {rateLimitSeconds}s before retrying.</p>
                  </div>
                </div>
              )}

              {pwdError && rateLimitSeconds === 0 && (
                <div className="auth-error-banner" style={{ marginBottom: '16px' }}>
                  <AlertCircle size={18} />
                  <span>{pwdError}</span>
                </div>
              )}

              {pwdSuccess && (
                <div className="auth-success-banner" style={{ marginBottom: '16px' }}>
                  <CheckCircle2 size={18} />
                  <span>{pwdSuccess}</span>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit}>
                {/* Current Password */}
                <div className="profile-input-group">
                  <label className="profile-label" htmlFor="pwd-current">
                    <span>Current Password</span>
                    <span style={{ fontSize: '11px', color: 'var(--expense)', fontWeight: 600 }}>*Required</span>
                  </label>
                  <div className="profile-input-wrapper">
                    <Lock size={18} className="profile-field-icon" />
                    <input
                      id="pwd-current"
                      type={showCurrent ? 'text' : 'password'}
                      className="profile-input with-right-btn"
                      placeholder="Enter your current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      disabled={isPwdLoading}
                      required
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
                <div className="profile-input-group">
                  <label className="profile-label" htmlFor="pwd-new">
                    <span>New Password</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>Min 6 characters</span>
                  </label>
                  <div className="profile-input-wrapper">
                    <KeyRound size={18} className="profile-field-icon" />
                    <input
                      id="pwd-new"
                      type={showNew ? 'text' : 'password'}
                      className="profile-input with-right-btn"
                      placeholder="Create a new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={isPwdLoading}
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
                <div className="profile-input-group">
                  <label className="profile-label" htmlFor="pwd-confirm">
                    <span>Confirm New Password</span>
                    {confirmPassword && newPassword && (
                      <span style={{ fontSize: '11px', color: confirmPassword === newPassword ? 'var(--income)' : 'var(--expense)', fontWeight: 600 }}>
                        {confirmPassword === newPassword ? '✓ Passwords match' : '✗ Does not match'}
                      </span>
                    )}
                  </label>
                  <div className="profile-input-wrapper">
                    <ShieldCheck size={18} className="profile-field-icon" />
                    <input
                      id="pwd-confirm"
                      type={showConfirm ? 'text' : 'password'}
                      className="profile-input with-right-btn"
                      placeholder="Re-enter your new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isPwdLoading}
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

                {/* Password Actions Footer */}
                <div className="profile-actions-footer">
                  <button
                    type="button"
                    className="profile-btn-cancel"
                    onClick={handleClose}
                    disabled={isPwdLoading}
                  >
                    <X size={15} />
                    <span>Cancel</span>
                  </button>
                  <button
                    type="submit"
                    className="profile-btn-save"
                    disabled={isPwdLoading || !currentPassword || !newPassword || !confirmPassword}
                  >
                    {isPwdLoading ? (
                      <>
                        <span className="btn-spinner" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <KeyRound size={15} />
                        <span>Update Password</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
