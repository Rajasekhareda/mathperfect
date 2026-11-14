import React, { useState, useMemo } from 'react';
import { useCms, AdminUser, ROOT_WEBMASTER_EMAIL, DEFAULT_FALLBACK_CONTENT } from '../context/CmsContext';
import { useTheme } from '../context/ThemeContext';
import {
  Shield,
  Edit3,
  Users,
  Palette,
  Search,
  RotateCcw,
  Check,
  X,
  UserPlus,
  Lock,
  Unlock,
  Trash2,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Eye,
  Sliders,
  CheckCircle2,
  RefreshCw,
  LogOut,
  LogIn
} from 'lucide-react';

interface AdminConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenThemeCustomizer: () => void;
}

export const AdminConsoleModal: React.FC<AdminConsoleModalProps> = ({
  isOpen,
  onClose,
  onOpenThemeCustomizer
}) => {
  const {
    content,
    defaultContent,
    currentUser,
    isAdmin,
    isSuperAdmin,
    canEdit,
    isMasterEditMode,
    toggleMasterEditMode,
    getText,
    setText,
    resetText,
    resetAllText,
    resetSectionText,
    isModified,
    users,
    refreshUsers,
    addUser,
    updateUserRole,
    setUserStatus,
    deleteUser,
    loginAs,
    logout,
    isSaving
  } = useCms();

  const [activeTab, setActiveTab] = useState<'cms' | 'users' | 'theme'>('cms');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [filterModifiedOnly, setFilterModifiedOnly] = useState(false);

  // User form state
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<AdminUser['role']>('editor');
  const [newUserNotes, setNewUserNotes] = useState('');
  const [userFormError, setUserFormError] = useState('');
  const [userFormSuccess, setUserFormSuccess] = useState('');
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);

  // Quick switch login state
  const [quickLoginEmail, setQuickLoginEmail] = useState('');

  // Inline editing state for CMS table
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');

  // All known keys with sections
  const textKeysWithMeta = useMemo(() => {
    const keys = Object.keys(DEFAULT_FALLBACK_CONTENT);
    return keys.map((key) => {
      let section = 'General';
      let sectionName = 'General';
      if (key.startsWith('site.nav.')) {
        section = 'nav';
        sectionName = 'Navigation Menu Items';
      } else if (key.startsWith('site.')) {
        section = 'brand';
        sectionName = 'Header & Branding';
      } else if (key.startsWith('home.hero.')) {
        section = 'hero';
        sectionName = 'Hero Section & Slogans';
      } else if (key.startsWith('home.teaser.')) {
        section = 'teaser';
        sectionName = 'Math Interactive Teaser';
      } else if (key.startsWith('home.features.')) {
        section = 'features';
        sectionName = 'Platform Features Banner';
      } else if (key.startsWith('home.card.')) {
        section = 'cards';
        sectionName = 'Feature Pillar Cards';
      } else if (key.startsWith('home.audience.')) {
        section = 'audience';
        sectionName = 'Audience Roles';
      } else if (key.startsWith('footer.')) {
        section = 'footer';
        sectionName = 'Footer & Institutional';
      }

      return {
        key,
        section,
        sectionName,
        currentValue: content[key] ?? defaultContent[key] ?? DEFAULT_FALLBACK_CONTENT[key] ?? '',
        defaultValue: defaultContent[key] ?? DEFAULT_FALLBACK_CONTENT[key] ?? '',
        modified: isModified(key)
      };
    });
  }, [content, defaultContent, isModified]);

  // Filtered keys
  const filteredKeys = useMemo(() => {
    return textKeysWithMeta.filter((item) => {
      if (selectedSection !== 'all' && item.section !== selectedSection) {
        return false;
      }
      if (filterModifiedOnly && !item.modified) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.key.toLowerCase().includes(q) ||
          item.currentValue.toLowerCase().includes(q) ||
          item.defaultValue.toLowerCase().includes(q) ||
          item.sectionName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [textKeysWithMeta, selectedSection, filterModifiedOnly, searchQuery]);

  const modifiedCount = useMemo(() => {
    return textKeysWithMeta.filter((t) => t.modified).length;
  }, [textKeysWithMeta]);

  if (!isOpen) return null;

  const handleStartInlineEdit = (key: string, currentVal: string) => {
    setEditingKey(key);
    setEditingValue(currentVal);
  };

  const handleSaveInlineEdit = async (key: string) => {
    await setText(key, editingValue);
    setEditingKey(null);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserFormError('');
    setUserFormSuccess('');

    if (!newUserEmail.includes('@')) {
      setUserFormError('Please provide a valid email address.');
      return;
    }

    setIsSubmittingUser(true);
    const res = await addUser({
      name: newUserName || newUserEmail.split('@')[0],
      email: newUserEmail,
      role: newUserRole,
      status: 'active',
      notes: newUserNotes
    });
    setIsSubmittingUser(false);

    if (res.success) {
      setUserFormSuccess(`User ${newUserEmail} access granted successfully!`);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserNotes('');
    } else {
      setUserFormError(res.error || 'Failed to add user');
    }
  };

  const handleQuickLogin = async (email: string) => {
    const res = await loginAs(email);
    if (!res.success) {
      alert(res.error || 'Could not log in as this user');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-hidden animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-amber-500/40 rounded-3xl shadow-[0_0_80px_rgba(245,158,11,0.2)] w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-white tracking-tight">
                  Webmaster Admin Console
                </h2>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Master Control
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <span>Active Session:</span>
                <span className="font-mono text-amber-300 font-bold">
                  {currentUser ? currentUser.email : 'Visitor (Not Authenticated)'}
                </span>
                {currentUser && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/30 text-indigo-300 font-mono">
                    [{currentUser.role.toUpperCase()}]
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Master Edit Toggle */}
            <button
              id="admin-toggle-master-edit-mode"
              type="button"
              onClick={toggleMasterEditMode}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                isMasterEditMode
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.5)] font-black'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/15'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              <span>{isMasterEditMode ? 'Master Edit: ACTIVE' : 'Enable On-Page Edit'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selector & Navigation */}
        <div className="px-6 border-b border-white/10 bg-slate-950/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              id="tab-btn-cms"
              type="button"
              onClick={() => setActiveTab('cms')}
              aria-selected={activeTab === 'cms'}
              data-selected={activeTab === 'cms'}
              className={`flex items-center gap-2 py-3.5 px-4 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all ${
                activeTab === 'cms'
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              <span>All Text Boxes (CMS)</span>
              {modifiedCount > 0 && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-200 border border-amber-400/40">
                  {modifiedCount} edited
                </span>
              )}
            </button>

            <button
              id="tab-btn-users"
              type="button"
              onClick={() => setActiveTab('users')}
              aria-selected={activeTab === 'users'}
              data-selected={activeTab === 'users'}
              className={`flex items-center gap-2 py-3.5 px-4 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all ${
                activeTab === 'users'
                  ? 'border-indigo-400 text-indigo-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>User Access & Webmaster Rights</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200">
                {users.length || 3}
              </span>
            </button>

            <button
              id="tab-btn-theme"
              type="button"
              onClick={() => {
                onClose();
                onOpenThemeCustomizer();
              }}
              className="flex items-center gap-2 py-3.5 px-4 text-xs font-bold text-slate-400 hover:text-cyan-300 transition-colors"
            >
              <Palette className="w-4 h-4" />
              <span>Color Palettes & Menu Sizes</span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {currentUser ? (
              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-300 hover:bg-rose-950/40 border border-rose-500/20"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleQuickLogin(ROOT_WEBMASTER_EMAIL)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-300"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign in as Webmaster</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab 1: CMS MASTER TEXT EDITING */}
        {activeTab === 'cms' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Filter Bar */}
            <div className="p-4 sm:px-6 bg-slate-900/90 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3 flex-1 min-w-[280px]">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by text key, words, or section..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Section filter */}
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                >
                  <option value="all">All Sections ({textKeysWithMeta.length})</option>
                  <option value="brand">Header & Branding</option>
                  <option value="nav">Navigation Menu Items</option>
                  <option value="hero">Hero Section</option>
                  <option value="teaser">Math Solver Teaser</option>
                  <option value="features">Institutional Banners</option>
                  <option value="cards">Pillar Cards</option>
                  <option value="audience">Audience Roles</option>
                  <option value="footer">Footer & Legal</option>
                </select>

                <button
                  type="button"
                  onClick={() => setFilterModifiedOnly(!filterModifiedOnly)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors whitespace-nowrap ${
                    filterModifiedOnly
                      ? 'bg-amber-500/20 text-amber-300 border-amber-400/50'
                      : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                  }`}
                >
                  Modified Only ({modifiedCount})
                </button>
              </div>

              {/* Global & Section Reset Buttons */}
              <div className="flex items-center gap-2">
                {selectedSection !== 'all' && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (window.confirm(`Reset all text items in section "${selectedSection}" to factory default?`)) {
                        await resetSectionText(
                          selectedSection === 'brand' ? 'site.' :
                          selectedSection === 'nav' ? 'site.nav.' :
                          selectedSection === 'hero' ? 'home.hero.' :
                          selectedSection === 'cards' ? 'home.card.' :
                          selectedSection === 'footer' ? 'footer.' : 'home.'
                        );
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-amber-300 bg-amber-950/40 hover:bg-amber-900/50 border border-amber-500/30 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Section</span>
                  </button>
                )}

                <button
                  id="btn-reset-all-website-text"
                  type="button"
                  onClick={async () => {
                    if (window.confirm('WARNING: Are you sure you want to RESET ALL WEBSITE TEXT back to factory default strings? This action will overwrite any custom text changes.')) {
                      await resetAllText();
                    }
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 transition-colors shadow-sm"
                  title="Reset all texts across the website"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All to Defaults</span>
                </button>
              </div>
            </div>

            {/* List / Table of Text Items */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
              {filteredKeys.length === 0 ? (
                <div className="p-12 text-center text-slate-400 space-y-2">
                  <Edit3 className="w-10 h-10 mx-auto text-slate-600" />
                  <p className="font-semibold text-base">No text keys found matching filter.</p>
                  <p className="text-xs text-slate-500">
                    Try clearing the search query or changing the section filter.
                  </p>
                </div>
              ) : (
                filteredKeys.map((item) => {
                  const isBeingEdited = editingKey === item.key;
                  return (
                    <div
                      key={item.key}
                      className={`p-4 rounded-2xl border transition-all ${
                        item.modified
                          ? 'bg-amber-950/20 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.08)]'
                          : 'bg-slate-950/50 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-white/5">
                        <div className="flex items-center gap-2.5">
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-white/10 text-slate-300">
                            {item.sectionName}
                          </span>
                          <code className="text-xs font-mono font-bold text-amber-400">
                            {item.key}
                          </code>
                        </div>

                        <div className="flex items-center gap-2">
                          {item.modified ? (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-300 border border-amber-500/40">
                              Custom Live Value
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-slate-400">
                              Factory Default
                            </span>
                          )}

                          {/* Individual Reset button */}
                          <button
                            type="button"
                            onClick={async () => {
                              await resetText(item.key);
                              if (editingKey === item.key) {
                                setEditingValue(item.defaultValue);
                              }
                            }}
                            disabled={!item.modified}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                              item.modified
                                ? 'text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40'
                                : 'text-slate-600 bg-transparent border border-white/5 cursor-not-allowed opacity-50'
                            }`}
                            title="Reset this specific text box to default"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Reset</span>
                          </button>
                        </div>
                      </div>

                      {/* Content editor */}
                      <div className="pt-3 space-y-2">
                        {isBeingEdited ? (
                          <div className="space-y-2">
                            {item.defaultValue.length > 80 ? (
                              <textarea
                                rows={3}
                                value={editingValue}
                                onChange={(e) => setEditingValue(e.target.value)}
                                className="w-full p-3 rounded-xl bg-slate-900 border border-amber-400 text-white text-sm focus:outline-none shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                              />
                            ) : (
                              <input
                                type="text"
                                value={editingValue}
                                onChange={(e) => setEditingValue(e.target.value)}
                                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-amber-400 text-white text-sm focus:outline-none shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                              />
                            )}

                            <div className="flex items-center justify-between">
                              <span className="text-[11px] text-slate-400 font-mono">
                                Default: "{item.defaultValue}"
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setEditingKey(null)}
                                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-white"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSaveInlineEdit(item.key)}
                                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-300"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Save</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div
                            onClick={() => handleStartInlineEdit(item.key, item.currentValue)}
                            className="group/item flex items-start justify-between gap-4 p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-white/5 hover:border-amber-400/40 cursor-pointer transition-all"
                          >
                            <p className="text-sm text-slate-200 leading-relaxed font-medium">
                              {item.currentValue}
                            </p>
                            <button
                              type="button"
                              className="shrink-0 opacity-40 group-hover/item:opacity-100 flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Tab 2: USER ACCESS & WEBMASTER RIGHTS (ADD USER, GRANT ACCESS, INVOKE / REVOKE) */}
        {activeTab === 'users' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Super Admin / Webmaster Callout Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-purple-950/60 border border-indigo-500/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 text-indigo-300 flex items-center justify-center font-bold text-xl shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                  👑
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-white">
                      Webmaster Authority Root
                    </h3>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-indigo-200/80 font-mono">
                    {ROOT_WEBMASTER_EMAIL}
                  </p>
                  <p className="text-[11px] text-slate-400 pt-0.5">
                    Full write authorization: Live on-page text modification, user access revocation, and database persistence.
                  </p>
                </div>
              </div>

              {/* Quick Switch Button */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin(ROOT_WEBMASTER_EMAIL)}
                  className="px-3.5 py-2 rounded-xl text-xs font-black bg-indigo-500 hover:bg-indigo-400 text-white shadow-md flex items-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Switch to Root Webmaster</span>
                </button>
              </div>
            </div>

            {/* User Access Management Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 1 Col: Provision / Add New User Form */}
              <div className="lg:col-span-1 bg-slate-950/60 border border-white/10 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                  <UserPlus className="w-5 h-5 text-amber-400" />
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                    Add User & Grant Access
                  </h4>
                </div>

                <form onSubmit={handleCreateUser} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">
                      User Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      placeholder="e.g. colleague@institution.edu"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/20 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      placeholder="e.g. Dr. Jane Smith"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/20 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">
                      Authorization Role
                    </label>
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value as AdminUser['role'])}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/20 text-xs text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="super_admin">Super Admin (Full Webmaster)</option>
                      <option value="admin">Administrator (Users & Content)</option>
                      <option value="editor">Content Editor (Text & Curricula)</option>
                      <option value="viewer">Viewer (Read-only)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">
                      Access Notes / Department
                    </label>
                    <input
                      type="text"
                      value={newUserNotes}
                      onChange={(e) => setNewUserNotes(e.target.value)}
                      placeholder="e.g. Mathematics Faculty Lead"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/20 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {userFormError && (
                    <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{userFormError}</span>
                    </div>
                  )}

                  {userFormSuccess && (
                    <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{userFormSuccess}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmittingUser}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{isSubmittingUser ? 'Granting...' : 'Grant Access'}</span>
                  </button>
                </form>
              </div>

              {/* Right 2 Cols: Authorized Users Directory & Invoke/Revoke Actions */}
              <div className="lg:col-span-2 bg-slate-950/60 border border-white/10 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-400" />
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                      Authorized Webmaster Accounts ({users.length})
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => refreshUsers()}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                    title="Refresh user list"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  {users.map((user) => {
                    const isRoot = user.email.toLowerCase() === ROOT_WEBMASTER_EMAIL.toLowerCase();
                    const isCurrent = currentUser?.id === user.id;
                    const isActive = user.status === 'active';

                    return (
                      <div
                        key={user.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          isRoot
                            ? 'bg-indigo-950/30 border-indigo-500/40'
                            : isActive
                            ? 'bg-slate-900/60 border-white/10'
                            : 'bg-rose-950/20 border-rose-500/30 opacity-75'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                                isRoot
                                  ? 'bg-indigo-600 text-white'
                                  : isActive
                                  ? 'bg-slate-800 text-amber-300 border border-white/15'
                                  : 'bg-rose-900/60 text-rose-300 border border-rose-500/30'
                              }`}
                            >
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h5 className="text-sm font-bold text-white">{user.name}</h5>
                                {isRoot && (
                                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                    Root Webmaster
                                  </span>
                                )}
                                {isCurrent && (
                                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                    You (Logged In)
                                  </span>
                                )}
                              </div>
                              <p className="text-xs font-mono text-slate-400">{user.email}</p>
                              {user.notes && (
                                <p className="text-[11px] text-slate-500">{user.notes}</p>
                              )}
                            </div>
                          </div>

                          {/* Controls: Role, Status (Grant/Invoke), Actions */}
                          <div className="flex items-center gap-2 self-end sm:self-center">
                            {/* Role selector */}
                            <select
                              disabled={isRoot || !isSuperAdmin}
                              value={user.role}
                              onChange={(e) => updateUserRole(user.id, e.target.value as AdminUser['role'])}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/15 text-xs text-slate-200 focus:outline-none focus:border-amber-400 disabled:opacity-60"
                            >
                              <option value="super_admin">Super Admin</option>
                              <option value="admin">Administrator</option>
                              <option value="editor">Editor</option>
                              <option value="viewer">Viewer</option>
                            </select>

                            {/* Invoke / Revoke Access Toggle */}
                            {!isRoot ? (
                              isActive ? (
                                <button
                                  type="button"
                                  onClick={() => setUserStatus(user.id, 'revoked')}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40 transition-colors"
                                  title="Revoke access immediately"
                                >
                                  <Lock className="w-3.5 h-3.5" />
                                  <span>Revoke</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setUserStatus(user.id, 'active')}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/40 transition-colors"
                                  title="Grant/Restore access"
                                >
                                  <Unlock className="w-3.5 h-3.5" />
                                  <span>Grant</span>
                                </button>
                              )
                            ) : (
                              <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-950/30 border border-emerald-500/30">
                                <Check className="w-3 h-3" />
                                <span>Permitted</span>
                              </span>
                            )}

                            {/* Quick Switch to this User */}
                            {!isCurrent && (
                              <button
                                type="button"
                                onClick={() => handleQuickLogin(user.email)}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10"
                                title={`Simulate login as ${user.email}`}
                              >
                                Test
                              </button>
                            )}

                            {/* Delete User */}
                            {!isRoot && isSuperAdmin && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`Delete user account "${user.email}"?`)) {
                                    deleteUser(user.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                                title="Delete user"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="px-6 py-3 bg-slate-950/80 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span>Persistence: Backend JSON database synced with live memory cache</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px]">
              {isSaving ? 'Synchronizing with live server...' : 'All edits autosaved to backend'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
