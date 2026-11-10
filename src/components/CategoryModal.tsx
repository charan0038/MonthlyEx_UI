import React, { useState, useEffect, useMemo } from 'react';
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
  Search,
  Zap,
  ArrowLeft,
  Pencil,
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
  onCategoryUpdated?: (updatedCat: CategoryMeta) => void;
  onRefreshCategories?: () => void;
}

interface AvailableIcon {
  name: string;
  label: string;
  group: 'all' | 'food' | 'living' | 'travel' | 'leisure' | 'work' | 'finance';
}

const AVAILABLE_ICONS: AvailableIcon[] = [
  // Food & Drinks
  { name: 'Utensils', label: 'Food', group: 'food' },
  { name: 'Coffee', label: 'Coffee', group: 'food' },
  // Living & Utilities
  { name: 'Home', label: 'Rent', group: 'living' },
  { name: 'Receipt', label: 'Bills', group: 'living' },
  { name: 'Zap', label: 'Electricity', group: 'living' },
  { name: 'Wifi', label: 'Internet', group: 'living' },
  { name: 'Smartphone', label: 'Mobile', group: 'living' },
  { name: 'Dog', label: 'Pets', group: 'living' },
  // Travel & Transport
  { name: 'Car', label: 'Transport', group: 'travel' },
  { name: 'Fuel', label: 'Fuel', group: 'travel' },
  { name: 'Plane', label: 'Travel', group: 'travel' },
  // Leisure & Health
  { name: 'ShoppingBag', label: 'Shopping', group: 'leisure' },
  { name: 'Gift', label: 'Gift', group: 'leisure' },
  { name: 'HeartPulse', label: 'Health', group: 'leisure' },
  { name: 'Dumbbell', label: 'Gym', group: 'leisure' },
  { name: 'Film', label: 'Movies', group: 'leisure' },
  { name: 'Tv', label: 'Streaming', group: 'leisure' },
  { name: 'Gamepad2', label: 'Gaming', group: 'leisure' },
  { name: 'Music', label: 'Music', group: 'leisure' },
  { name: 'Smile', label: 'Fun', group: 'leisure' },
  { name: 'Book', label: 'Books', group: 'leisure' },
  // Work & Education
  { name: 'Briefcase', label: 'Work', group: 'work' },
  { name: 'Laptop', label: 'Freelance', group: 'work' },
  { name: 'GraduationCap', label: 'Education', group: 'work' },
  // Finance & Income
  { name: 'Banknote', label: 'Salary', group: 'finance' },
  { name: 'TrendingUp', label: 'Invest', group: 'finance' },
  { name: 'PiggyBank', label: 'Savings', group: 'finance' },
  { name: 'Wallet', label: 'Wallet', group: 'finance' },
  { name: 'CreditCard', label: 'Card', group: 'finance' },
  { name: 'Shield', label: 'Insurance', group: 'finance' },
  { name: 'Sparkles', label: 'Other', group: 'all' },
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

// 1-Tap Quick Suggestions
const EXPENSE_SUGGESTIONS = [
  { name: 'Gym & Fitness', icon: 'Dumbbell', color: '#8b5cf6' },
  { name: 'Coffee & Snacks', icon: 'Coffee', color: '#f97316' },
  { name: 'Groceries', icon: 'Utensils', color: '#10b981' },
  { name: 'Fuel & Petrol', icon: 'Fuel', color: '#ef4444' },
  { name: 'Subscriptions', icon: 'Tv', color: '#06b6d4' },
  { name: 'Pet Care', icon: 'Dog', color: '#eab308' },
  { name: 'Health & Pharmacy', icon: 'HeartPulse', color: '#ec4899' },
  { name: 'Travel & Trips', icon: 'Plane', color: '#3b82f6' },
];

const INCOME_SUGGESTIONS = [
  { name: 'Salary', icon: 'Banknote', color: '#10b981' },
  { name: 'Freelance Work', icon: 'Laptop', color: '#6366f1' },
  { name: 'Investments', icon: 'TrendingUp', color: '#0ea5e9' },
  { name: 'Rental Income', icon: 'Home', color: '#f97316' },
  { name: 'Side Business', icon: 'Briefcase', color: '#8b5cf6' },
  { name: 'Bonus / Gift', icon: 'Gift', color: '#ec4899' },
];

const ICON_GROUPS = [
  { id: 'all', label: 'All' },
  { id: 'food', label: 'Food' },
  { id: 'living', label: 'Living' },
  { id: 'travel', label: 'Travel' },
  { id: 'leisure', label: 'Leisure' },
  { id: 'work', label: 'Work' },
  { id: 'finance', label: 'Finance' },
];

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  initialType = 'expense',
  categories,
  onClose,
  onCategoryCreated,
  onCategoryDeleted,
  onCategoryUpdated,
  onRefreshCategories,
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create');
  const [editingCategory, setEditingCategory] = useState<CategoryMeta | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<'expense' | 'income'>(initialType);
  const [iconName, setIconName] = useState('ShoppingBag');
  const [color, setColor] = useState('#ec4899');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [addingSubcatForId, setAddingSubcatForId] = useState<number | null>(null);
  const [newSubcatName, setNewSubcatName] = useState('');
  const [isSubcatSubmitting, setIsSubcatSubmitting] = useState(false);

  // Icon group filtering state
  const [selectedIconGroup, setSelectedIconGroup] = useState<string>('all');

  // Manage tab search & filter
  const [manageSearch, setManageSearch] = useState('');
  const [manageFilter, setManageFilter] = useState<'all' | 'expense' | 'income' | 'custom'>('all');

  useEffect(() => {
    if (isOpen) {
      setType(initialType);
      setName('');
      setIconName(initialType === 'expense' ? 'ShoppingBag' : 'Banknote');
      setColor(initialType === 'expense' ? '#ec4899' : '#10b981');
      setErrorMessage('');
      setActiveTab('create');
      setEditingCategory(null);
      setAddingSubcatForId(null);
      setNewSubcatName('');
      setSelectedIconGroup('all');
      setManageSearch('');
      setManageFilter('all');
    }
  }, [isOpen, initialType]);

  const handleStartEdit = (cat: CategoryMeta) => {
    setEditingCategory(cat);
    setName(cat.label || cat.name || '');
    setType(cat.type || 'expense');
    setIconName(cat.iconName || (cat.type === 'income' ? 'Banknote' : 'ShoppingBag'));
    setColor(cat.color || (cat.type === 'income' ? '#10b981' : '#ec4899'));
    setErrorMessage('');
    setActiveTab('create');
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setName('');
    setIconName(type === 'expense' ? 'ShoppingBag' : 'Banknote');
    setColor(type === 'expense' ? '#ec4899' : '#10b981');
    setErrorMessage('');
    setActiveTab('manage');
  };

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

  const handleSaveSubcategory = async (catId: number) => {
    const clean = newSubcatName.trim();
    if (!clean) return;
    try {
      setIsSubcatSubmitting(true);
      await api.createSubcategory(catId, clean);
      setAddingSubcatForId(null);
      setNewSubcatName('');
      if (onRefreshCategories) {
        onRefreshCategories();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to add subcategory');
    } finally {
      setIsSubcatSubmitting(false);
    }
  };

  const handleDeleteSubcategory = async (subId: number) => {
    if (!window.confirm('Are you sure you want to delete this custom subcategory?')) return;
    try {
      await api.deleteSubcategory(subId);
      if (onRefreshCategories) {
        onRefreshCategories();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete subcategory');
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

    if (editingCategory) {
      if (!editingCategory.dbId) return;

      // Check duplicate locally, excluding the category being edited
      const exists = categories.some(
        (c) =>
          c.dbId !== editingCategory.dbId &&
          c.label.toLowerCase() === cleanName.toLowerCase() &&
          c.type?.toLowerCase() === type.toLowerCase()
      );
      if (exists) {
        setErrorMessage(`A category named "${cleanName}" already exists for ${type}.`);
        return;
      }

      try {
        setIsSubmitting(true);
        const updatedCat = await api.updateCategory(editingCategory.dbId, {
          name: cleanName,
          iconName,
          color,
        });

        if (onCategoryUpdated) {
          onCategoryUpdated(updatedCat);
        }
        if (onRefreshCategories) {
          onRefreshCategories();
        }

        setEditingCategory(null);
        setName('');
        setActiveTab('manage');
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to update category');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Check duplicate locally for create
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

  // Filter icons based on selected group
  const filteredIcons = useMemo(() => {
    if (selectedIconGroup === 'all') return AVAILABLE_ICONS;
    return AVAILABLE_ICONS.filter(
      (ico) => ico.group === selectedIconGroup || ico.group === 'all'
    );
  }, [selectedIconGroup]);

  // Categories breakdown
  const customCategories = useMemo(() => categories.filter((c) => !c.isDefault), [categories]);

  // Filtered categories for manage tab
  const filteredManageCategories = useMemo(() => {
    let list = categories;
    if (manageFilter === 'expense') {
      list = list.filter((c) => !c.type || c.type.toLowerCase() === 'expense');
    } else if (manageFilter === 'income') {
      list = list.filter((c) => c.type?.toLowerCase() === 'income');
    } else if (manageFilter === 'custom') {
      list = list.filter((c) => !c.isDefault);
    }

    if (manageSearch.trim()) {
      const q = manageSearch.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.label.toLowerCase().includes(q) ||
          c.subcategories?.some((s) => s.name.toLowerCase().includes(q))
      );
    }

    return list;
  }, [categories, manageFilter, manageSearch]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop active cat-modal-backdrop"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-card category-modal-card">
        {/* Mobile touch sheet drag indicator (hidden on full-screen mobile) */}
        <div className="cat-sheet-drag-handle" />

        {/* Modal / Screen Header */}
        <div className="modal-header cat-mobile-screen-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Native Mobile Screen Back Arrow (shown on mobile) */}
            <button
              type="button"
              className="cat-screen-back-btn"
              onClick={editingCategory ? handleCancelEdit : onClose}
              aria-label="Back"
              title="Go Back"
            >
              <ArrowLeft size={19} />
            </button>

            <div className="cat-modal-header-icon">
              {editingCategory ? <Pencil size={18} /> : <Sparkles size={18} />}
            </div>
            <div>
              <h3 className="modal-title">
                {editingCategory
                  ? 'Edit Category'
                  : activeTab === 'create'
                  ? 'Create Category'
                  : 'All Categories'}
              </h3>
              <p className="modal-subtitle">
                {editingCategory
                  ? `Update name, icon & color for "${editingCategory.label}"`
                  : activeTab === 'create'
                  ? 'Dynamic Expense & Income Categories'
                  : `${categories.length} total categories`}
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close Modal">
            <X size={17} />
          </button>
        </div>

        {/* Tab Switcher: Create vs Manage */}
        <div className="cat-modal-tabs">
          <button
            type="button"
            className={`cat-modal-tab ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => {
              if (activeTab !== 'create') {
                setActiveTab('create');
              }
            }}
          >
            {editingCategory ? (
              <>
                <Pencil size={15} /> Edit Category
              </>
            ) : (
              <>
                <Plus size={15} /> Create Category
              </>
            )}
          </button>
          <button
            type="button"
            className={`cat-modal-tab ${activeTab === 'manage' ? 'active' : ''}`}
            onClick={() => {
              if (editingCategory) {
                setEditingCategory(null);
                setName('');
              }
              setActiveTab('manage');
            }}
          >
            <Layers size={15} /> All Categories ({categories.length})
          </button>
        </div>

        {activeTab === 'create' ? (
          <form className="cat-form-container" onSubmit={handleCreateSubmit}>
            <div className="cat-scroll-content">
              {errorMessage && (
                <div className="cat-modal-error-alert" role="alert">
                  {errorMessage}
                </div>
              )}

              {/* Type Switcher / Edit Notice */}
              {editingCategory ? (
                <div
                  className="cat-edit-mode-banner"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    marginBottom: '14px',
                    backgroundColor:
                      type === 'income' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
                    border: `1px solid ${
                      type === 'income' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.25)'
                    }`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Pencil size={15} color={type === 'income' ? '#10b981' : '#f43f5e'} />
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: type === 'income' ? '#10b981' : '#f43f5e',
                      }}
                    >
                      Editing {type === 'income' ? 'Income' : 'Expense'} Category: <strong>{editingCategory.label}</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    style={{
                      fontSize: '12px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    Cancel Edit
                  </button>
                </div>
              ) : (
                /* Type Switcher */
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
              )}

              {/* 1-Tap Quick Suggestions (only shown when creating new category) */}
              {!editingCategory && (
                <div className="cat-suggestions-section">
                  <div className="cat-section-header">
                    <span className="cat-section-title">
                      <Zap size={13} color="var(--primary, #2563eb)" /> Quick 1-Tap Suggestions
                    </span>
                    <span className="cat-section-hint">Auto-fills name, icon & color</span>
                  </div>
                  <div className="cat-suggestions-chips">
                    {(type === 'expense' ? EXPENSE_SUGGESTIONS : INCOME_SUGGESTIONS).map((sug) => (
                      <button
                        key={sug.name}
                        type="button"
                        className={`cat-suggestion-chip ${name === sug.name ? 'active' : ''}`}
                        onClick={() => {
                          setName(sug.name);
                          setIconName(sug.icon);
                          setColor(sug.color);
                          setErrorMessage('');
                        }}
                        title={`Tap to select ${sug.name}`}
                      >
                        <div className="cat-sug-icon" style={{ backgroundColor: sug.color }}>
                          <CategoryIcon name={sug.icon} size={11} />
                        </div>
                        <span>{sug.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Interactive Hero Card: Avatar Preview + Name Input */}
              <div className="cat-hero-card">
                <div
                  className="cat-hero-avatar"
                  style={{ backgroundColor: color }}
                  title="Live Category Preview"
                >
                  <CategoryIcon name={iconName} size={24} />
                </div>

                <div className="cat-hero-input-wrap">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label className="form-label" htmlFor="catNameInput" style={{ margin: 0 }}>
                      Category Name *
                    </label>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        padding: '1px 6px',
                        borderRadius: '6px',
                        backgroundColor: type === 'expense' ? 'rgba(244, 63, 94, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                        color: type === 'expense' ? '#f43f5e' : '#10b981',
                        border: type === 'expense' ? '1px solid rgba(244, 63, 94, 0.25)' : '1px solid rgba(16, 185, 129, 0.25)',
                      }}
                    >
                      {type}
                    </span>
                  </div>
                  <input
                    id="catNameInput"
                    type="text"
                    className="form-control"
                    placeholder={type === 'expense' ? 'e.g. Gym, Pet Care, Subscriptions...' : 'e.g. Salary, Consulting, Bonus...'}
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
              </div>

              {/* Category Color Palette */}
              <div className="cat-selector-card">
                <div className="cat-section-header">
                  <span className="cat-section-title">Category Color</span>
                  <span className="cat-selected-color-pill" style={{ backgroundColor: color }}>
                    {color}
                  </span>
                </div>
                <div className="cat-color-palette-scroll">
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

              {/* Category Icon Picker with Filter Tabs */}
              <div className="cat-selector-card">
                <div className="cat-section-header" style={{ flexWrap: 'wrap', gap: '8px' }}>
                  <span className="cat-section-title">Category Icon</span>
                  <div className="cat-icon-group-pills">
                    {ICON_GROUPS.map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        className={`cat-group-pill ${selectedIconGroup === g.id ? 'active' : ''}`}
                        onClick={() => setSelectedIconGroup(g.id)}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="cat-icon-picker-grid">
                  {filteredIcons.map((ico) => {
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
                            backgroundColor: isSelected ? color : undefined,
                            color: isSelected ? '#ffffff' : undefined,
                          }}
                        >
                          <CategoryIcon name={ico.name} size={17} />
                        </div>
                        <span className="cat-icon-caption">{ico.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sticky Action Footer */}
            <div className="cat-sticky-footer">
              <button
                type="button"
                className="btn-outline cat-footer-btn-cancel"
                onClick={editingCategory ? handleCancelEdit : onClose}
                disabled={isSubmitting}
              >
                {editingCategory ? 'Cancel' : 'Close'}
              </button>
              <button
                type="submit"
                className="btn-primary cat-footer-btn-submit"
                disabled={isSubmitting || !name.trim()}
              >
                {isSubmitting ? (
                  'Saving...'
                ) : editingCategory ? (
                  <>
                    <Check size={16} /> Save Changes
                  </>
                ) : (
                  <>
                    <Plus size={16} /> Create Category
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Manage Tab */
          <div className="cat-manage-container">
            {/* Search and Filters Bar */}
            <div className="cat-manage-toolbar">
              <div className="cat-manage-search-wrap">
                <Search size={14} className="cat-search-icon" />
                <input
                  type="text"
                  placeholder="Search categories or subcategories..."
                  value={manageSearch}
                  onChange={(e) => setManageSearch(e.target.value)}
                  className="cat-search-input"
                />
                {manageSearch && (
                  <button
                    type="button"
                    onClick={() => setManageSearch('')}
                    className="cat-search-clear"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              <div className="cat-manage-filter-pills">
                <button
                  type="button"
                  className={`cat-filter-pill ${manageFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setManageFilter('all')}
                >
                  All ({categories.length})
                </button>
                <button
                  type="button"
                  className={`cat-filter-pill ${manageFilter === 'expense' ? 'active' : ''}`}
                  onClick={() => setManageFilter('expense')}
                >
                  Expense
                </button>
                <button
                  type="button"
                  className={`cat-filter-pill ${manageFilter === 'income' ? 'active' : ''}`}
                  onClick={() => setManageFilter('income')}
                >
                  Income
                </button>
                <button
                  type="button"
                  className={`cat-filter-pill ${manageFilter === 'custom' ? 'active' : ''}`}
                  onClick={() => setManageFilter('custom')}
                >
                  Custom ({customCategories.length})
                </button>
              </div>
            </div>

            {/* Scrollable Categories List */}
            <div className="cat-manage-list">
              {filteredManageCategories.length > 0 ? (
                filteredManageCategories.map((c) => (
                  <div
                    key={c.dbId || `${c.id}-${c.type}`}
                    className={`cat-manage-item ${c.isDefault ? 'default-item' : 'custom-item'}`}
                  >
                    <div className="cat-item-top-row">
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

                      {c.isDefault ? (
                        <span className="cat-default-badge" title="Built-in default category">
                          <Lock size={12} /> Default
                        </span>
                      ) : (
                        <div className="cat-manage-actions">
                          <button
                            type="button"
                            className="cat-edit-btn"
                            onClick={() => handleStartEdit(c)}
                            title={`Edit ${c.label}`}
                            aria-label={`Edit ${c.label}`}
                          >
                            <Pencil size={15} />
                          </button>
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
                      )}
                    </div>

                    {/* Subcategories Shelf */}
                    <div className="cat-subcategories-shelf">
                      {(c.subcategories || []).map((sub) => (
                        <span key={sub.id} className="cat-subcat-chip">
                          {sub.name}
                          {!sub.isDefault && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSubcategory(sub.id);
                              }}
                              className="cat-subcat-del-btn"
                              title="Delete subcategory"
                            >
                              <X size={11} />
                            </button>
                          )}
                        </span>
                      ))}

                      {c.dbId && (
                        addingSubcatForId === c.dbId ? (
                          <div className="cat-add-subcat-form">
                            <input
                              type="text"
                              value={newSubcatName}
                              onChange={(e) => setNewSubcatName(e.target.value)}
                              placeholder="Subcategory..."
                              className="cat-inline-subcat-input"
                              autoFocus
                              disabled={isSubcatSubmitting}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleSaveSubcategory(c.dbId!);
                                } else if (e.key === 'Escape') {
                                  setAddingSubcatForId(null);
                                  setNewSubcatName('');
                                }
                              }}
                            />
                            <button
                              type="button"
                              disabled={isSubcatSubmitting}
                              onClick={() => handleSaveSubcategory(c.dbId!)}
                              className="cat-inline-save-btn"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              disabled={isSubcatSubmitting}
                              onClick={() => {
                                setAddingSubcatForId(null);
                                setNewSubcatName('');
                              }}
                              className="cat-inline-cancel-btn"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setAddingSubcatForId(c.dbId!);
                              setNewSubcatName('');
                            }}
                            className="cat-add-subcat-btn"
                          >
                            <Plus size={11} /> Add Subcategory
                          </button>
                        )
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="cat-manage-empty">
                  <Layers size={32} style={{ opacity: 0.4, marginBottom: '8px' }} />
                  <p style={{ fontWeight: 600, margin: '0 0 4px 0' }}>No categories found</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                    {manageSearch ? 'Try a different search query' : 'Create your first custom category above'}
                  </p>
                  {!manageSearch && (
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => setActiveTab('create')}
                      style={{ marginTop: '12px', padding: '7px 14px', fontSize: '12px' }}
                    >
                      <Plus size={14} /> Create Category
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
