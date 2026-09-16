import React, { useState } from 'react';
import { NavTab } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useCms } from '../context/CmsContext';
import { EditableText } from './EditableText';
import {
  FileText,
  Activity,
  Layers,
  Calculator,
  Database,
  GraduationCap,
  PlaySquare,
  Sparkles,
  Menu,
  X,
  Compass,
  ChevronRight,
  Palette,
  Sliders,
  Shield,
  Edit3
} from 'lucide-react';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentPalette, menuSettings, setIsCustomizerOpen } = useTheme();
  const {
    getText,
    isMasterEditMode,
    toggleMasterEditMode,
    setIsAdminConsoleOpen,
    currentUser,
    canEdit,
    isAdmin
  } = useCms();

  const navItems: Array<{ tab: NavTab; fallbackLabel: string; icon: React.ReactNode; badge?: string }> = [
    { tab: 'home', fallbackLabel: 'HOME', icon: <Compass className="w-5 h-5 shrink-0" /> },
    { tab: 'worksheets', fallbackLabel: 'WORKSHEETS', icon: <FileText className="w-5 h-5 shrink-0" />, badge: 'AI' },
    { tab: 'activities', fallbackLabel: 'ACTIVITIES', icon: <Activity className="w-5 h-5 shrink-0" /> },
    { tab: 'simulations', fallbackLabel: 'SIMULATIONS', icon: <Layers className="w-5 h-5 shrink-0" />, badge: 'Lab' },
    { tab: 'solvers', fallbackLabel: 'SOLVERS', icon: <Calculator className="w-5 h-5 shrink-0" /> },
    { tab: 'questionbank', fallbackLabel: 'QUESTION BANK', icon: <Database className="w-5 h-5 shrink-0" /> },
    { tab: 'exampaper', fallbackLabel: 'EXAM PAPERS', icon: <GraduationCap className="w-5 h-5 shrink-0" /> },
    { tab: 'videos', fallbackLabel: 'VIDEOS', icon: <PlaySquare className="w-5 h-5 shrink-0" /> }
  ];

  const handleNavClick = (tab: NavTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  // Compute font size class based on user customization
  const getFontSizeClass = () => {
    switch (menuSettings.fontSize) {
      case 'sm':
        return 'text-[11px] sm:text-xs';
      case 'md':
        return 'text-xs sm:text-xs lg:text-[13px]';
      case 'lg':
        return 'text-xs sm:text-sm lg:text-[14px]'; // High visibility crisp & balanced for 8-column ribbon
      case 'xl':
        return 'text-sm sm:text-base lg:text-[16px]';
      case '2xl':
        return 'text-base sm:text-lg lg:text-[18px]';
      default:
        return 'text-xs sm:text-sm lg:text-[14px]';
    }
  };

  // Compute font weight class
  const getFontWeightClass = () => {
    switch (menuSettings.fontWeight) {
      case 'semibold':
        return 'font-semibold';
      case 'bold':
        return 'font-bold';
      case 'extrabold':
        return 'font-extrabold';
      case 'black':
        return 'font-black';
      default:
        return 'font-extrabold';
    }
  };

  // Compute text transform class
  const getTextTransformClass = () => {
    switch (menuSettings.textTransform) {
      case 'uppercase':
        return 'uppercase';
      case 'capitalize':
        return 'capitalize';
      case 'none':
        return 'normal-case';
      default:
        return 'uppercase';
    }
  };

  // Compute letter spacing class
  const getLetterSpacingClass = () => {
    switch (menuSettings.letterSpacing) {
      case 'tight':
        return 'tracking-tight';
      case 'normal':
        return 'tracking-normal';
      case 'wide':
        return 'tracking-wide';
      case 'wider':
        return 'tracking-wider';
      case 'widest':
        return 'tracking-widest';
      default:
        return 'tracking-wider';
    }
  };

  // Compute pill padding
  const getPaddingClass = () => {
    switch (menuSettings.pillPadding) {
      case 'compact':
        return 'px-2 sm:px-2.5 py-1.5';
      case 'comfortable':
        return 'px-2 sm:px-3 py-2';
      case 'spacious':
        return 'px-3 sm:px-4 py-2.5';
      default:
        return 'px-2 sm:px-3 py-2';
    }
  };

  const navFontClasses = `${getFontSizeClass()} ${getFontWeightClass()} ${getTextTransformClass()} ${getLetterSpacingClass()} ${getPaddingClass()}`;

  return (
    <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-2xl border-b border-white/10 shadow-[0_6px_35px_rgba(0,0,0,0.7)] transition-all no-print">
      {/* Top Header Row: Brand Logo, Titles, Webmaster & Palettes on Left, Action CTA on Right */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          {/* Left Section: Brand Logo + Titles + Webmaster Console & Palettes Tools */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0 flex-wrap sm:flex-nowrap">
            {/* Brand Logo & Title */}
            <button
              id="brand-logo-btn"
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-2.5 sm:gap-3 group text-left focus:outline-none rounded-xl p-1 shrink-0"
              title="Return to Home"
            >
              <div className="relative">
                <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-cyan-400 via-indigo-500 to-pink-500 opacity-80 blur-xs group-hover:opacity-100 transition-opacity" />
                <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 flex items-center justify-center text-white font-bold shadow-lg border border-white/25 group-hover:scale-105 transition-transform">
                  <span className="font-mono text-base sm:text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-white to-pink-300">
                    ∑π
                  </span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <EditableText
                    contentKey="site.title"
                    defaultText="MATH PERFECT"
                    as="span"
                    label="Site Brand Title"
                    className="text-base sm:text-2xl font-black tracking-tight text-white font-display"
                  />
                  <EditableText
                    contentKey="site.badge"
                    defaultText="PRO"
                    as="span"
                    label="Header Badge"
                    className="hidden xs:inline-block px-2 py-0.5 text-[9px] font-black tracking-widest text-cyan-300 bg-cyan-950/70 border border-cyan-400/40 rounded-full uppercase shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                  />
                </div>
                <EditableText
                  contentKey="site.tagline"
                  defaultText="Curriculum Intelligence"
                  as="p"
                  label="Site Tagline"
                  className="text-[10px] text-slate-400 font-bold tracking-widest uppercase hidden sm:block"
                />
              </div>
            </button>

            {/* Subtle Divider */}
            <div className="hidden md:block h-8 w-px bg-white/15 mx-1" />

            {/* Left-Side Utility Tools: Webmaster Console & Palettes/Edit */}
            <div className="flex items-center gap-2">
              {/* Dedicated Webmaster Admin Console Button */}
              <button
                id="header-webmaster-console-btn"
                onClick={() => setIsAdminConsoleOpen(true)}
                className={`relative group flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                  isMasterEditMode
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.5)] font-black'
                    : 'text-amber-300 bg-amber-950/40 hover:bg-amber-900/50 border-amber-500/40 hover:border-amber-400/70 shadow-sm'
                }`}
                title="Webmaster Admin Console: Manage text, roles, access & resets"
              >
                <Shield className={`w-4 h-4 ${isMasterEditMode ? 'text-slate-950' : 'text-amber-400'}`} />
                <span className="hidden sm:inline font-extrabold tracking-wide">
                  {currentUser ? 'Admin Console' : 'Webmaster'}
                </span>
                {isMasterEditMode && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-950 text-amber-300 font-mono font-black">
                    EDIT ON
                  </span>
                )}
              </button>

              {/* Direct Palette & Menu Size Customizer Button */}
              <button
                id="header-palette-customizer-btn"
                onClick={() => setIsCustomizerOpen(true)}
                className="relative group flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-slate-900/90 hover:bg-slate-800/90 border border-white/15 hover:border-cyan-400/50 shadow-md transition-all"
                title="Change Color Palettes & Menu Typography"
              >
                <div className="flex items-center gap-1">
                  <Palette className="w-4 h-4 text-cyan-300 group-hover:rotate-12 transition-transform" />
                  <Sliders className="w-3.5 h-3.5 text-pink-300" />
                </div>
                <span className="hidden sm:inline font-black tracking-wide bg-gradient-to-r from-cyan-300 via-white to-pink-300 bg-clip-text text-transparent">
                  Palettes & Edit
                </span>
                <span
                  className="w-2.5 h-2.5 rounded-full border border-white/30 shadow-xs"
                  style={{ backgroundColor: currentPalette.primary }}
                />
              </button>
            </div>
          </div>

          {/* Right Section: Quick AI Worksheet Button & Mobile Trigger */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Quick Create Worksheet CTA */}
            <button
              id="header-cta-generate"
              onClick={() => handleNavClick('worksheets')}
              className="relative group overflow-hidden rounded-xl p-[1px] focus:outline-none"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-indigo-500 to-pink-500 rounded-xl transition-all duration-300 group-hover:opacity-100 opacity-90 blur-xs" />
              <span className="relative flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-[11px] text-xs sm:text-sm font-black text-white bg-slate-950 group-hover:bg-slate-900 transition-colors">
                <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
                <EditableText
                  contentKey="site.header.cta"
                  defaultText="AI WORKSHEET"
                  as="span"
                  label="Header Button CTA"
                  className="whitespace-nowrap uppercase tracking-wider"
                />
              </span>
            </button>

            {/* Mobile Drawer Trigger */}
            <button
              id="mobile-menu-trigger"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
              className="lg:hidden p-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 border border-white/15 focus:outline-none"
              title="Toggle Menu Drawer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
            </button>
          </div>
        </div>
      </div>

      {/* Dedicated Stretched Navigation Ribbon: Directly Down of Logo & Titles */}
      <div className="w-full bg-gradient-to-r from-slate-950 via-slate-900/95 to-slate-950 border-t border-b border-white/[0.12] shadow-inner backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <nav
            className="flex items-center justify-between w-full gap-1 sm:gap-2 py-2 overflow-x-auto scrollbar-none"
            aria-label="Institutional Main Navigation"
          >
            {navItems.map((item) => {
              const isActive = currentTab === item.tab;
              const defaultLabel = menuSettings.customLabels[item.tab] || item.fallbackLabel;

              return (
                <button
                  key={item.tab}
                  id={`nav-link-${item.tab}`}
                  onClick={() => handleNavClick(item.tab)}
                  aria-selected={isActive}
                  data-selected={isActive}
                  className={`flex-1 min-w-max lg:min-w-0 flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl transition-all duration-200 relative group cursor-pointer ${navFontClasses} ${
                    isActive
                      ? `bg-gradient-to-r ${currentPalette.activeMenuGradient} ${currentPalette.activeText} shadow-[0_0_12px_rgba(6,182,212,0.45)] border border-white/80 ring-1 ring-cyan-400/40 font-black`
                      : 'text-slate-200 hover:text-white hover:bg-white/[0.08] hover:border-white/15 border border-transparent'
                  }`}
                >
                  {menuSettings.showIcons && (
                    <span
                      className={`transition-transform duration-200 group-hover:scale-110 ${
                        isActive ? 'text-inherit opacity-95' : 'text-slate-400 group-hover:text-cyan-300'
                      }`}
                    >
                      {item.icon}
                    </span>
                  )}
                  <EditableText
                    contentKey={`site.nav.${item.tab}`}
                    defaultText={defaultLabel}
                    as="span"
                    label={`Nav Menu Label: ${item.tab}`}
                    className="leading-tight whitespace-nowrap"
                  />
                  {item.badge && (
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                        isActive
                          ? 'bg-black/35 text-white shadow-xs border border-white/20'
                          : 'bg-cyan-950/70 text-cyan-300 border border-cyan-400/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {/* Subtle active glow indicator underline */}
                  {isActive && (
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Drawer Navigation with Custom Labels and Size */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-white/10 bg-slate-950/98 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-2 shadow-2xl animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between px-3 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-white/10">
            <span>Navigation Modules</span>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsCustomizerOpen(true);
              }}
              className="text-cyan-300 hover:text-cyan-200 flex items-center gap-1 normal-case text-xs font-bold"
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Customize Menu & Palettes</span>
            </button>
          </div>

          <div className="space-y-1 pt-1">
            {navItems.map((item) => {
              const isActive = currentTab === item.tab;
              const displayLabel = menuSettings.customLabels[item.tab] || item.fallbackLabel;

              return (
                <button
                  key={item.tab}
                  id={`mobile-nav-${item.tab}`}
                  onClick={() => handleNavClick(item.tab)}
                  aria-selected={isActive}
                  data-selected={isActive}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? `bg-gradient-to-r ${currentPalette.activeMenuGradient} ${currentPalette.activeText} shadow-[0_0_12px_rgba(6,182,212,0.5)] border border-white/80 ring-1 ring-cyan-400/40 font-black`
                      : 'text-slate-200 hover:bg-white/10 hover:text-white font-bold'
                  } ${getTextTransformClass()} ${getLetterSpacingClass()} text-base`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{displayLabel}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight className={`w-4 h-4 ${isActive ? 'text-inherit' : 'text-slate-500'}`} />
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-white/10 space-y-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsAdminConsoleOpen(true);
              }}
              className="w-full py-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black text-sm flex items-center justify-center gap-2 hover:bg-amber-500/30"
            >
              <Shield className="w-4 h-4 text-amber-400" />
              <span>Webmaster Admin Console</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsCustomizerOpen(true);
              }}
              className="w-full py-3 rounded-xl bg-slate-900 border border-white/15 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800"
            >
              <Sliders className="w-4 h-4 text-cyan-300" />
              <span>Open Theme & Menu Font Customizer</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
