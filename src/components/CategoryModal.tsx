import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Check,
  Sparkles,
  ArrowDownRight,
  ArrowUpRight,
  Lock,
  Layers,
} from 'lucide-react';
import type { CategoryMeta, CreateCategoryInput } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { api } from '../services/api';

interface CategoryModalProps {
  isOpen: boolean;
  initialType?: 'expense' | 'income';
  categories: CategoryMeta[];
  onClose: () => void;
  onCategoryCreated: (newCat: CategoryMeta) => void;
  onCategoryDeleted: (dbId: number) => void;
}

const AVAILABLE_ICONS = [
  { name: 'Utensils', label: 'Food' },
  { name: 'Coffee', label: 'Coffee' },
  { name: 'Car', label: 'Transport' },
  { name: 'Fuel', label: 'Fuel' },
  { name: 'Home', label: 'Rent' },
  { name: 'Receipt', label: 'Bills' },
  { name: 'ShoppingBag', label: 'Shopping' },
  { name: 'Gift', label: 'Gift' },
  { name: 'HeartPulse', label: 'Health' },
  { name: 'Film', label: 'Movies' },
  { name: 'Tv', label: 'Streaming' },
  { name: 'Dumbbell', label: 'Gym' },
  { name: 'Gamepad2', label: 'Gaming' },
  { name: 'Plane', label: 'Travel' },
  { name: 'Book', label: 'Books' },
  { name: 'GraduationCap', label: 'Education' },
  { name: 'Music', label: 'Music' },
  { name: 'Briefcase', label: 'Work' },
  { name: 'PiggyBank', label: 'Savings' },
  { name: 'Shield', label: 'Insurance' },
  { name: 'Smile', label: 'Fun' },
  { name: 'Dog', label: 'Pets' },
  { name: 'Wifi', label: 'Internet' },
  { name: 'Smartphone', label: 'Mobile' },
  { name: 'Zap', label: 'Electricity' },
  { name: 'Banknote', label: 'Salary' },
  { name: 'Laptop', label: 'Freelance' },
  { name: 'TrendingUp', label: 'Invest' },
  { name: 'Wallet', label: 'Wallet' },
  { name: 'CreditCard', label: 'Card' },
  { name: 'Sparkles', label: 'Other' },
];

const PRESET_COLORS = [
  '#f97316', // Orange
  '#ef4444', // Red
  '#ec4899', // Pink
  '#f43f5e', // Rose
  '#8b5cf6', // Violet
  '#6366f1', // Indigo
  '#3b82f6', // Blue
  '#0ea5e9', // Sky
  '#06b6d4', // Cyan
  '#14b8a6', // Teal
  '#10b981', // Emerald
  '#84cc16', // Lime
  '#eab308', // Amber
  '#64748b', // Slate
];

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  initialType = 'expense',
  categories,
  onClose,
  onCategoryCreated,
  onCategoryDeleted,
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create');
  const [name, setName] = useState('');
  const [type, setType] = useState<'expense' | 'income'>(initialType);
  const [iconName, setIconName] = useState('Sparkles');
  const [color, setColor] = useState('#6366f1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setType(initialType);
      setName('');
      setIconName(initialType === 'expense' ? 'ShoppingBag' : 'Banknote');
      setColor(initialType === 'expense' ? '#ec4899' : '#10b981');
      setErrorMessage('');
      setActiveTab('create');
    }
  }, [isOpen, initialType]);

  if (!isOpen) return null;

  const handleTypeChange = (newType: 'expense' | 'income') => {
    setType(newType);
    if (newType === 'income') {
      setIconName('Banknote');
      setColor('#10b981');
    } else {
      setIconName('ShoppingBag');
      setColor('#ec4899');
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanName = name.trim();
    if (!cleanName) {
      setErrorMessage('Please enter a category name');
      return;
    }

    // Check duplicate locally
    const exists = categories.some(
      (c) =>
        c.label.toLowerCase() === cleanName.toLowerCase() &&
        c.type?.toLowerCase() === type.toLowerCase()
    );
    if (exists) {
      setErrorMessage(`A category named "${cleanName}" already exists for ${type}.`);
      return;
    }

    try {
      setIsSubmitting(true);
      const newCat: CreateCategoryInput = {
        name: cleanName,
        type,
        iconName,
        color,
      };

      const created = await api.createCategory(newCat);
      onCategoryCreated(created);
      setName('');
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (cat: CategoryMeta) => {
    if (!cat.dbId) return;
    if (cat.isDefault) {
      alert('System default categories cannot be deleted.');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete category "${cat.label}"?`)) {
      return;
    }

    try {
      await api.deleteCategory(cat.dbId);
      onCategoryDeleted(cat.dbId);
    } catch (err: any) {
      alert(err.message || 'Failed to delete category');
    }
  };

  const customCategories = categories.filter((c) => !c.isDefault);
  const defaultCategories = categories.filter((c) => c.isDefault);

  return (
    <div
      className="modal-backdrop active"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-card category-modal-card">
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="cat-modal-header-icon">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="modal-title">Categories</h3>
              <p className="modal-subtitle">Dynamic Expense & Income Categories</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close Modal">
            <X size={16} />
          </button>
        </div>

        {/* Tab Switcher: Create vs Manage */}
        <div className="cat-modal-tabs">
          <button
            type="button"
            className={`cat-modal-tab ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            <Plus size={15} /> Create Category
          </button>
          <button
            type="button"
            className={`cat-modal-tab ${activeTab === 'manage' ? 'active' : ''}`}
            onClick={() => setActiveTab('manage')}
          >
            <Layers size={15} /> All Categories ({categories.length})
          </button>
        </div>

        {activeTab === 'create' ? (
          <form className="modal-body" onSubmit={handleCreateSubmit}>
            {errorMessage && (
              <div className="cat-modal-error-alert" role="alert">
                {errorMessage}
              </div>
            )}

            {/* Type Switcher */}
            <div className="type-switcher" role="tablist">
              <button
                type="button"
                className={`type-tab ${type === 'expense' ? 'tab-expense active' : ''}`}
                onClick={() => handleTypeChange('expense')}
              >
                <ArrowDownRight size={16} /> Expense Category
              </button>
              <button
                type="button"
                className={`type-tab ${type === 'income' ? 'tab-income active' : ''}`}
                onClick={() => handleTypeChange('income')}
              >
                <ArrowUpRight size={16} /> Income Category
              </button>
            </div>

            {/* Category Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="catNameInput">
                Category Name *
              </label>
              <input
                id="catNameInput"
                type="text"
                className="form-control"
                placeholder="e.g. Gym & Fitness, Pet Care, Crypto, Subscriptions..."
                maxLength={40}
                required
                autoFocus
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
              />
            </div>

            {/* Color Palette Picker */}
            <div className="form-group">
              <label className="form-label">Category Color</label>
              <div className="cat-color-palette">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`cat-color-swatch ${color === c ? 'selected' : ''}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                    title={c}
                    aria-label={`Select color ${c}`}
                  >
                    {color === c && <Check size={14} className="cat-color-check" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Icon Picker */}
            <div className="form-group">
              <label className="form-label">Category Icon</label>
              <div className="cat-icon-picker-grid">
                {AVAILABLE_ICONS.map((ico) => {
                  const isSelected = iconName.toLowerCase() === ico.name.toLowerCase();
                  return (
                    <button
                      key={ico.name}
                      type="button"
                      className={`cat-icon-pick-btn ${isSelected ? 'selected' : ''}`}
                      onClick={() => setIconName(ico.name)}
                      title={ico.label}
                    >
                      <div
                        className="cat-icon-symbol"
                        style={{
                          backgroundColor: isSelected ? color : 'var(--bg-card)',
                          color: isSelected ? '#ffffff' : 'var(--text-main)',
                        }}
                      >
                        <CategoryIcon name={ico.name} size={16} />
                      </div>
                      <span className="cat-icon-caption">{ico.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Badge Preview */}
            <div className="cat-preview-box">
              <span className="cat-preview-label">Live Preview:</span>
              <div className="cat-live-pill" style={{ borderColor: color }}>
                <div className="cat-live-icon" style={{ backgroundColor: color }}>
                  <CategoryIcon name={iconName} size={15} />
                </div>
                <div className="cat-live-details">
                  <span className="cat-live-name">{name.trim() || 'New Category'}</span>
                  <span className="cat-live-type">
                    {type === 'expense' ? 'Expense' : 'Income'}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="modal-footer" style={{ padding: 0, border: 'none', marginTop: '20px' }}>
              <button
                type="button"
                className="btn-outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                <Plus size={16} /> {isSubmitting ? 'Creating...' : 'Create Category'}
              </button>
            </div>
          </form>
        ) : (
          /* Manage Tab */
          <div className="cat-manage-body">
            {customCategories.length > 0 && (
              <div className="cat-group-section">
                <h4 className="cat-section-title">
                  Your Custom Categories ({customCategories.length})
                </h4>
                <div className="cat-list-items">
                  {customCategories.map((c) => (
                    <div key={c.dbId || c.id} className="cat-manage-item">
                      <div className="cat-manage-left">
                        <div className="cat-manage-icon" style={{ backgroundColor: c.color }}>
                          <CategoryIcon name={c.iconName} size={16} />
                        </div>
                        <div>
                          <div className="cat-manage-name">{c.label}</div>
                          <span
                            className={`cat-manage-type-tag ${
                              c.type === 'income' ? 'tag-income' : 'tag-expense'
                            }`}
                          >
                            {c.type === 'income' ? 'Income' : 'Expense'}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="cat-delete-btn"
                        onClick={() => handleDelete(c)}
                        title={`Delete ${c.label}`}
                        aria-label={`Delete ${c.label}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="cat-group-section">
              <h4 className="cat-section-title">
                Default System Categories ({defaultCategories.length})
              </h4>
              <div className="cat-list-items">
                {defaultCategories.map((c) => (
                  <div key={c.id + (c.type || '')} className="cat-manage-item default-item">
                    <div className="cat-manage-left">
                      <div className="cat-manage-icon" style={{ backgroundColor: c.color }}>
                        <CategoryIcon name={c.iconName} size={16} />
                      </div>
                      <div>
                        <div className="cat-manage-name">{c.label}</div>
                        <span
                          className={`cat-manage-type-tag ${
                            c.type === 'income' ? 'tag-income' : 'tag-expense'
                          }`}
                        >
                          {c.type === 'income' ? 'Income' : 'Expense'}
                        </span>
                      </div>
                    </div>

                    <span className="cat-default-badge" title="Built-in default category">
                      <Lock size={12} /> Default
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
