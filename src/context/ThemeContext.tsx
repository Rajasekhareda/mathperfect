import React, { createContext, useContext, useState, useEffect } from 'react';
import { NavTab } from '../types';

export interface ColorPalette {
  id: string;
  name: string;
  category: string;
  description: string;
  swatches: string[];
  primary: string;
  secondary: string;
  accent: string;
  activeMenuGradient: string;
  activeText: string;
  activeShadow: string;
  badgeGradient: string;
  aurora: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
}

export const PRESET_PALETTES: ColorPalette[] = [
  {
    id: 'neon-aurora',
    name: 'Electric Neon Aurora',
    category: 'Vibrant Cyber',
    description: 'Vivid Cyan & Electric Indigo with Mint highlights for high-tech brilliance.',
    swatches: ['#06b6d4', '#6366f1', '#10b981', '#f43f5e'],
    primary: '#06b6d4',
    secondary: '#6366f1',
    accent: '#10b981',
    activeMenuGradient: 'from-cyan-400 via-indigo-500 to-emerald-400',
    activeText: 'text-slate-950',
    activeShadow: 'shadow-[0_0_12px_rgba(6,182,212,0.4)]',
    badgeGradient: 'from-cyan-400 to-indigo-400',
    aurora: {
      primary: 'bg-cyan-500/20',
      secondary: 'bg-indigo-600/20',
      tertiary: 'bg-emerald-500/18'
    }
  },
  {
    id: 'cyber-violet',
    name: 'Cyberpunk Fuchsia & Violet',
    category: 'Ultraviolet Glow',
    description: 'Hot Neon Pink, Laser Fuchsia, and Deep Cosmic Violet with glowing jewel tones.',
    swatches: ['#ec4899', '#a855f7', '#8b5cf6', '#3b82f6'],
    primary: '#ec4899',
    secondary: '#a855f7',
    accent: '#8b5cf6',
    activeMenuGradient: 'from-pink-500 via-purple-500 to-violet-600',
    activeText: 'text-white',
    activeShadow: 'shadow-[0_0_12px_rgba(236,72,153,0.4)]',
    badgeGradient: 'from-pink-400 to-purple-400',
    aurora: {
      primary: 'bg-pink-600/22',
      secondary: 'bg-purple-600/22',
      tertiary: 'bg-indigo-600/18'
    }
  },
  {
    id: 'emerald-matrix',
    name: 'Emerald Jade Matrix',
    category: 'Bio-Luminescent',
    description: 'Luminous Emerald, Bright Lime, and Crystalline Seafoam Teal.',
    swatches: ['#10b981', '#22c55e', '#14b8a6', '#84cc16'],
    primary: '#10b981',
    secondary: '#14b8a6',
    accent: '#84cc16',
    activeMenuGradient: 'from-emerald-400 via-teal-400 to-lime-400',
    activeText: 'text-slate-950',
    activeShadow: 'shadow-[0_0_12px_rgba(16,185,129,0.4)]',
    badgeGradient: 'from-emerald-400 to-teal-400',
    aurora: {
      primary: 'bg-emerald-500/22',
      secondary: 'bg-teal-500/20',
      tertiary: 'bg-lime-500/15'
    }
  },
  {
    id: 'solar-sunset',
    name: 'Solar Amber & Coral Flame',
    category: 'Warm Jewel',
    description: 'Radiant Amber, Fiery Tangerine, Golden Sunburst, and Deep Crimson.',
    swatches: ['#f59e0b', '#f97316', '#ef4444', '#fbbf24'],
    primary: '#f59e0b',
    secondary: '#f97316',
    accent: '#ef4444',
    activeMenuGradient: 'from-amber-400 via-orange-500 to-rose-500',
    activeText: 'text-slate-950',
    activeShadow: 'shadow-[0_0_12px_rgba(245,158,11,0.4)]',
    badgeGradient: 'from-amber-400 to-rose-400',
    aurora: {
      primary: 'bg-amber-500/22',
      secondary: 'bg-orange-600/20',
      tertiary: 'bg-rose-600/18'
    }
  },
  {
    id: 'royal-sapphire',
    name: 'Royal Sapphire & Azure',
    category: 'Oceanic Prestige',
    description: 'Electric Sky Blue, Cobalt Sapphire, and Deep Oceanic Indigo.',
    swatches: ['#38bdf8', '#2563eb', '#4f46e5', '#67e8f9'],
    primary: '#38bdf8',
    secondary: '#2563eb',
    accent: '#4f46e5',
    activeMenuGradient: 'from-sky-400 via-blue-500 to-indigo-600',
    activeText: 'text-slate-950',
    activeShadow: 'shadow-[0_0_12px_rgba(56,189,248,0.4)]',
    badgeGradient: 'from-sky-400 to-blue-500',
    aurora: {
      primary: 'bg-sky-500/22',
      secondary: 'bg-blue-600/20',
      tertiary: 'bg-indigo-600/18'
    }
  },
  {
    id: 'high-contrast-titanium',
    name: 'Titanium Ultra-Contrast',
    category: 'Maximum Clarity',
    description: 'Pure Stark White on Deep Obsidian with Electric Cyan precision highlights.',
    swatches: ['#ffffff', '#e2e8f0', '#38bdf8', '#64748b'],
    primary: '#ffffff',
    secondary: '#e2e8f0',
    accent: '#38bdf8',
    activeMenuGradient: 'from-white via-slate-100 to-slate-200',
    activeText: 'text-slate-950',
    activeShadow: 'shadow-[0_0_12px_rgba(255,255,255,0.4)]',
    badgeGradient: 'from-white to-slate-300',
    aurora: {
      primary: 'bg-white/10',
      secondary: 'bg-cyan-500/15',
      tertiary: 'bg-slate-400/10'
    }
  }
];

export type MenuFontSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type MenuFontWeight = 'semibold' | 'bold' | 'extrabold' | 'black';
export type MenuLetterSpacing = 'tight' | 'normal' | 'wide' | 'wider' | 'widest';
export type MenuTransform = 'uppercase' | 'capitalize' | 'none';

export interface MenuSettings {
  fontSize: MenuFontSize;
  fontWeight: MenuFontWeight;
  letterSpacing: MenuLetterSpacing;
  textTransform: MenuTransform;
  showIcons: boolean;
  iconSize: 'sm' | 'md' | 'lg';
  pillPadding: 'compact' | 'comfortable' | 'spacious';
  highContrast: boolean;
  glowIntensity: 'off' | 'low' | 'medium' | 'high';
  customLabels: Record<NavTab, string>;
}

export const DEFAULT_MENU_LABELS: Record<NavTab, string> = {
  home: 'HOME',
  worksheets: 'WORKSHEETS',
  activities: 'ACTIVITIES',
  simulations: 'SIMULATIONS',
  solvers: 'SOLVERS',
  questionbank: 'QUESTION BANK',
  exampaper: 'EXAM PAPERS',
  videos: 'VIDEOS'
};

export const DEFAULT_MENU_SETTINGS: MenuSettings = {
  fontSize: 'lg', // Prominently visible and large by default
  fontWeight: 'extrabold',
  letterSpacing: 'wider',
  textTransform: 'uppercase',
  showIcons: true,
  iconSize: 'md',
  pillPadding: 'comfortable',
  highContrast: true,
  glowIntensity: 'high',
  customLabels: { ...DEFAULT_MENU_LABELS }
};

interface ThemeContextType {
  currentPalette: ColorPalette;
  paletteId: string;
  setPaletteId: (id: string) => void;
  menuSettings: MenuSettings;
  updateMenuSettings: (settings: Partial<MenuSettings>) => void;
  updateMenuLabel: (tab: NavTab, label: string) => void;
  resetToDefaults: () => void;
  isCustomizerOpen: boolean;
  setIsCustomizerOpen: (open: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const LOCAL_STORAGE_PALETTE_KEY = 'math_perfect_palette_id_v2';
const LOCAL_STORAGE_MENU_KEY = 'math_perfect_menu_settings_v2';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [paletteId, setPaletteIdState] = useState<string>(() => {
    try {
      return localStorage.getItem(LOCAL_STORAGE_PALETTE_KEY) || 'neon-aurora';
    } catch {
      return 'neon-aurora';
    }
  });

  const [menuSettings, setMenuSettingsState] = useState<MenuSettings>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_MENU_KEY);
      if (saved) {
        return { ...DEFAULT_MENU_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      // ignore
    }
    return DEFAULT_MENU_SETTINGS;
  });

  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  const setPaletteId = (id: string) => {
    setPaletteIdState(id);
    try {
      localStorage.setItem(LOCAL_STORAGE_PALETTE_KEY, id);
    } catch {
      // ignore
    }
  };

  const updateMenuSettings = (newSettings: Partial<MenuSettings>) => {
    setMenuSettingsState((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem(LOCAL_STORAGE_MENU_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const updateMenuLabel = (tab: NavTab, label: string) => {
    setMenuSettingsState((prev) => {
      const updatedLabels = { ...prev.customLabels, [tab]: label };
      const updated = { ...prev, customLabels: updatedLabels };
      try {
        localStorage.setItem(LOCAL_STORAGE_MENU_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const resetToDefaults = () => {
    setPaletteIdState('neon-aurora');
    setMenuSettingsState(DEFAULT_MENU_SETTINGS);
    try {
      localStorage.removeItem(LOCAL_STORAGE_PALETTE_KEY);
      localStorage.removeItem(LOCAL_STORAGE_MENU_KEY);
    } catch {
      // ignore
    }
  };

  const currentPalette =
    PRESET_PALETTES.find((p) => p.id === paletteId) || PRESET_PALETTES[0];

  // Dynamically set CSS variables for button glows and highlights matching active palette
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.style.setProperty('--theme-primary', currentPalette.primary);
      root.style.setProperty('--theme-secondary', currentPalette.secondary);
      root.style.setProperty('--theme-accent', currentPalette.accent);
    }
  }, [currentPalette]);

  return (
    <ThemeContext.Provider
      value={{
        currentPalette,
        paletteId,
        setPaletteId,
        menuSettings,
        updateMenuSettings,
        updateMenuLabel,
        resetToDefaults,
        isCustomizerOpen,
        setIsCustomizerOpen
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
