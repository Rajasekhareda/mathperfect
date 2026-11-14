import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'editor' | 'viewer';
  status: 'active' | 'revoked';
  avatarUrl?: string;
  createdAt: string;
  lastActive?: string;
  notes?: string;
}

export const ROOT_WEBMASTER_EMAIL = 'Rajasekhar.eda@gmail.com';

const LOCAL_STORAGE_CMS_KEY = 'mathperfect_cms_content_v2';
const LOCAL_STORAGE_ADMIN_USER_KEY = 'mathperfect_admin_session_v2';
const LOCAL_STORAGE_MASTER_EDIT_KEY = 'mathperfect_master_edit_mode_v2';

export const DEFAULT_FALLBACK_CONTENT: Record<string, string> = {
  // Brand & Header
  'site.title': 'MATH PERFECT',
  'site.tagline': 'Curriculum Intelligence',
  'site.badge': 'PRO',
  'site.nav.home': 'HOME',
  'site.nav.worksheets': 'WORKSHEETS',
  'site.nav.activities': 'ACTIVITIES',
  'site.nav.simulations': 'SIMULATIONS',
  'site.nav.solvers': 'SOLVERS',
  'site.nav.questionbank': 'QUESTION BANK',
  'site.nav.exampaper': 'EXAM PAPERS',
  'site.nav.videos': 'VIDEOS',
  'site.header.cta': 'AI WORKSHEET',

  // Home Hero
  'home.hero.pillText': 'Pure Mathematical Intelligence',
  'home.hero.pillBadge': '8K Fidelity',
  'home.hero.title1': 'Precision Mathematics.',
  'home.hero.title2': 'Mastered With Absolute Clarity.',
  'home.hero.description': 'Institutional-grade mathematical intelligence crafted for educators, students, and institutions. Unifying generative AI worksheets, dynamic visual simulations, multi-step symbolic solvers, and authentic examination blueprints.',
  'home.hero.ctaWorksheet': 'Launch Worksheet Engine',
  'home.hero.ctaSimulations': 'Explore 3D Simulations',

  // Interactive Teaser
  'home.teaser.heading': 'Parabolic Trajectory & Roots Live Engine',
  'home.teaser.subheading': 'Adjust coefficients a, b, and c in real-time to compute the discriminant Δ and inspect parabolic vertex geometry.',

  // Home Features Heading
  'home.features.heading': 'Institutional Mathematical Architecture',
  'home.features.subheading': 'Seven integrated computational pillars powering curriculum mastery from elementary foundational concepts to international Olympiad rigor.',

  // Feature Cards
  'home.card.worksheets.title': 'Worksheet Generator',
  'home.card.worksheets.desc': 'Generate customized, pedagogical printable worksheets with instant answer keys, full step-by-step solutions, and native DOCX / vector PDF export.',
  'home.card.worksheets.cta': 'Generate Worksheet',

  'home.card.activities.title': 'Hands-on Activities',
  'home.card.activities.desc': 'Interactive discovery laboratories featuring dynamic geometry, projectile physics, Pythagorean visual proofs, and polynomial graphers.',
  'home.card.activities.cta': 'Open Activities',

  'home.card.simulations.title': '3D Interactive Simulations',
  'home.card.simulations.desc': 'Visual interactive sandboxes for calculus tangents, Riemann sums, unit circle trigonometry, and linear algebra matrices.',
  'home.card.simulations.cta': 'Enter Lab',

  'home.card.solvers.title': 'Step-by-Step Solvers',
  'home.card.solvers.desc': 'Deconstruct complex problems with rigorous step-by-step proofs, intermediate formula steps, parabola geometry analyses, and linear system matrices.',
  'home.card.solvers.cta': 'Solve Problem',

  'home.card.questionbank.title': 'Question Bank',
  'home.card.questionbank.desc': 'Search and filter thousands of academic math questions by topic, grade level, difficulty, and question format with progressive hints and complete solutions.',
  'home.card.questionbank.cta': 'Browse Bank',

  'home.card.exampaper.title': 'Exam Papers & Guessing',
  'home.card.exampaper.desc': 'Standardized assessment builder with balanced cognitive sections (MCQ, short, extended proof), point rubrics, and predictive topic frequency analysis.',
  'home.card.exampaper.cta': 'Generate Exam',

  'home.card.videos.title': 'Curated Video Lessons',
  'home.card.videos.desc': 'High-yield video lectures covering geometric intuition, calculus insights, contest heuristics, and deep fundamental proofs.',
  'home.card.videos.cta': 'Watch Lessons',

  // Audience Section
  'home.audience.heading': 'Engineered for Every Mathematical Stakeholder',
  'home.audience.subheading': 'Empowering learners, guiding mentors, reassuring parents, and scaling institutional academic excellence.',

  // Footer & Institutional
  'footer.brandDesc': 'Empowering educators, students, and curriculum directors worldwide with state-of-the-art computational pedagogy, generative assessment tooling, and interactive visualization.',
  'footer.copyright': '© 2026 MATH PERFECT Education Inc. All mathematical rights reserved.'
};

interface CmsContextType {
  content: Record<string, string>;
  defaultContent: Record<string, string>;
  currentUser: AdminUser | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  canEdit: boolean;
  isMasterEditMode: boolean;
  isAdminConsoleOpen: boolean;
  isLoading: boolean;
  isSaving: boolean;
  activeEditingKey: string | null;
  getText: (key: string, fallback?: string) => string;
  setText: (key: string, val: string) => Promise<boolean>;
  resetText: (key: string) => Promise<boolean>;
  resetAllText: () => Promise<boolean>;
  resetSectionText: (prefix: string) => Promise<boolean>;
  isModified: (key: string) => boolean;
  toggleMasterEditMode: () => void;
  setIsAdminConsoleOpen: (open: boolean) => void;
  setActiveEditingKey: (key: string | null) => void;
  users: AdminUser[];
  refreshUsers: () => Promise<void>;
  addUser: (userData: { email: string; name: string; role: AdminUser['role']; status?: AdminUser['status']; notes?: string }) => Promise<{ success: boolean; error?: string }>;
  updateUserRole: (id: string, role: AdminUser['role']) => Promise<boolean>;
  setUserStatus: (id: string, status: 'active' | 'revoked') => Promise<boolean>;
  deleteUser: (id: string) => Promise<boolean>;
  loginAs: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const CmsContext = createContext<CmsContextType | undefined>(undefined);

export const CmsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<Record<string, string>>(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_CMS_KEY);
      if (cached) return { ...DEFAULT_FALLBACK_CONTENT, ...JSON.parse(cached) };
    } catch {
      // ignore
    }
    return { ...DEFAULT_FALLBACK_CONTENT };
  });

  const [defaultContent, setDefaultContent] = useState<Record<string, string>>(DEFAULT_FALLBACK_CONTENT);

  // Current session admin user (defaults to webmaster session for immediate convenience)
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_ADMIN_USER_KEY);
      if (cached) return JSON.parse(cached);
    } catch {
      // ignore
    }
    // Default logged in as Webmaster
    return {
      id: 'usr-superadmin-1',
      email: ROOT_WEBMASTER_EMAIL,
      name: 'Rajasekhar Eda',
      role: 'super_admin',
      status: 'active',
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      notes: 'Primary Master Webmaster & Platform Owner'
    };
  });

  const [isMasterEditMode, setIsMasterEditMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem(LOCAL_STORAGE_MASTER_EDIT_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [isAdminConsoleOpen, setIsAdminConsoleOpen] = useState(false);
  const [activeEditingKey, setActiveEditingKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);

  // Permissions
  const isAdmin = currentUser !== null && currentUser.status === 'active' && ['super_admin', 'admin'].includes(currentUser.role);
  const isSuperAdmin = currentUser !== null && currentUser.status === 'active' && currentUser.role === 'super_admin';
  const canEdit = currentUser !== null && currentUser.status === 'active' && ['super_admin', 'admin', 'editor'].includes(currentUser.role);

  // Fetch CMS content from backend on mount
  const fetchContent = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/cms/content');
      if (res.ok) {
        const data = await res.json();
        if (data.content) {
          setContent(prev => ({ ...prev, ...data.content }));
          try {
            localStorage.setItem(LOCAL_STORAGE_CMS_KEY, JSON.stringify(data.content));
          } catch {
            // ignore
          }
        }
        if (data.defaultContent) {
          setDefaultContent(data.defaultContent);
        }
      }
    } catch (err) {
      console.warn('Could not sync CMS from server API, using local store:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch users from backend
  const refreshUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.users)) {
          setUsers(data.users);
        }
      }
    } catch (err) {
      console.warn('Could not fetch admin users:', err);
    }
  }, []);

  useEffect(() => {
    fetchContent();
    refreshUsers();
  }, [fetchContent, refreshUsers]);

  // Read content helper
  const getText = useCallback((key: string, fallback?: string): string => {
    if (content[key] !== undefined && content[key] !== '') {
      return content[key];
    }
    if (defaultContent[key] !== undefined && defaultContent[key] !== '') {
      return defaultContent[key];
    }
    return fallback || DEFAULT_FALLBACK_CONTENT[key] || '';
  }, [content, defaultContent]);

  const isModified = useCallback((key: string): boolean => {
    const currentVal = content[key];
    const defVal = defaultContent[key] || DEFAULT_FALLBACK_CONTENT[key];
    if (currentVal === undefined) return false;
    return currentVal !== defVal;
  }, [content, defaultContent]);

  // Save single key
  const setText = async (key: string, val: string): Promise<boolean> => {
    if (!canEdit) {
      alert('Unauthorized: You must have an active editor or admin role to edit website text.');
      return false;
    }

    const updated = { ...content, [key]: val };
    setContent(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_CMS_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/cms/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: val })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.content) {
          setContent(data.content);
        }
        return true;
      }
    } catch (err) {
      console.error('Server save error, saved locally:', err);
    } finally {
      setIsSaving(false);
    }
    return true;
  };

  // Reset single key to default
  const resetText = async (key: string): Promise<boolean> => {
    if (!canEdit) return false;
    const defVal = defaultContent[key] || DEFAULT_FALLBACK_CONTENT[key] || '';
    const updated = { ...content, [key]: defVal };
    setContent(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_CMS_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }

    try {
      await fetch('/api/cms/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key })
      });
      return true;
    } catch (err) {
      console.warn('Reset sync failed, applied locally:', err);
      return true;
    }
  };

  // Reset section text
  const resetSectionText = async (prefix: string): Promise<boolean> => {
    if (!canEdit) return false;
    const updated = { ...content };
    for (const key of Object.keys(DEFAULT_FALLBACK_CONTENT)) {
      if (key.startsWith(prefix)) {
        updated[key] = defaultContent[key] || DEFAULT_FALLBACK_CONTENT[key];
      }
    }
    setContent(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_CMS_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }

    try {
      await fetch('/api/cms/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: updated })
      });
    } catch {
      // ignore
    }
    return true;
  };

  // Reset all site text to factory defaults
  const resetAllText = async (): Promise<boolean> => {
    if (!isAdmin) {
      alert('Only Admins or Super Admins can reset the entire website.');
      return false;
    }
    const fresh = { ...DEFAULT_FALLBACK_CONTENT, ...defaultContent };
    setContent(fresh);
    try {
      localStorage.removeItem(LOCAL_STORAGE_CMS_KEY);
    } catch {
      // ignore
    }

    try {
      await fetch('/api/cms/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true })
      });
    } catch (err) {
      console.warn('Reset all sync failed:', err);
    }
    return true;
  };

  const toggleMasterEditMode = () => {
    if (!canEdit) {
      alert('Only authenticated administrators or editors can enable Live Master Edit Mode.');
      return;
    }
    setIsMasterEditMode(prev => {
      const next = !prev;
      try {
        localStorage.setItem(LOCAL_STORAGE_MASTER_EDIT_KEY, String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // User access management functions
  const addUser = async (userData: {
    email: string;
    name: string;
    role: AdminUser['role'];
    status?: AdminUser['status'];
    notes?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    if (!isAdmin) return { success: false, error: 'Unauthorized' };
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Failed to add user' };
      await refreshUsers();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const updateUserRole = async (id: string, role: AdminUser['role']): Promise<boolean> => {
    if (!isSuperAdmin) {
      alert('Only Super Admin / Webmaster can change user roles.');
      return false;
    }
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      if (res.ok) {
        await refreshUsers();
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  const setUserStatus = async (id: string, status: 'active' | 'revoked'): Promise<boolean> => {
    if (!isAdmin) {
      alert('Unauthorized to change user access status.');
      return false;
    }
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        await refreshUsers();
        // If current user is revoked, update session
        if (currentUser && currentUser.id === id && status === 'revoked') {
          setCurrentUser({ ...currentUser, status: 'revoked' });
        }
        return true;
      }
      const data = await res.json();
      alert(data.error || 'Failed to update user status');
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  const deleteUser = async (id: string): Promise<boolean> => {
    if (!isSuperAdmin) {
      alert('Only Webmaster can permanently remove user accounts.');
      return false;
    }
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await refreshUsers();
        return true;
      }
      const data = await res.json();
      alert(data.error || 'Failed to delete user');
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  const loginAs = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Authentication failed' };
      }
      setCurrentUser(data.user);
      try {
        localStorage.setItem(LOCAL_STORAGE_ADMIN_USER_KEY, JSON.stringify(data.user));
      } catch {
        // ignore
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setIsMasterEditMode(false);
    try {
      localStorage.removeItem(LOCAL_STORAGE_ADMIN_USER_KEY);
      localStorage.setItem(LOCAL_STORAGE_MASTER_EDIT_KEY, 'false');
    } catch {
      // ignore
    }
  };

  return (
    <CmsContext.Provider
      value={{
        content,
        defaultContent,
        currentUser,
        isAdmin,
        isSuperAdmin,
        canEdit,
        isMasterEditMode,
        isAdminConsoleOpen,
        isLoading,
        isSaving,
        activeEditingKey,
        getText,
        setText,
        resetText,
        resetAllText,
        resetSectionText,
        isModified,
        toggleMasterEditMode,
        setIsAdminConsoleOpen,
        setActiveEditingKey,
        users,
        refreshUsers,
        addUser,
        updateUserRole,
        setUserStatus,
        deleteUser,
        loginAs,
        logout
      }}
    >
      {children}
    </CmsContext.Provider>
  );
};

export const useCms = (): CmsContextType => {
  const context = useContext(CmsContext);
  if (!context) {
    throw new Error('useCms must be used within a CmsProvider');
  }
  return context;
};
