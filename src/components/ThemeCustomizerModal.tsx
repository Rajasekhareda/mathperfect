import React, { useState } from 'react';
import {
  useTheme,
  PRESET_PALETTES,
  MenuFontSize,
  MenuFontWeight,
  MenuLetterSpacing,
  MenuTransform,
  DEFAULT_MENU_LABELS
} from '../context/ThemeContext';
import { NavTab } from '../types';
import {
  Palette,
  Type,
  Edit3,
  X,
  Check,
  RotateCcw,
  Sparkles,
  Eye,
  Sliders,
  Copy,
  CheckCheck
} from 'lucide-react';

export const ThemeCustomizerModal: React.FC = () => {
  const {
    currentPalette,
    paletteId,
    setPaletteId,
    menuSettings,
    updateMenuSettings,
    updateMenuLabel,
    resetToDefaults,
    isCustomizerOpen,
    setIsCustomizerOpen
  } = useTheme();

  const [activeSubTab, setActiveSubTab] = useState<'palettes' | 'typography' | 'manual'>('palettes');
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  if (!isCustomizerOpen) return null;

  const handleCopyHex = (hex: string) => {
    navigator.clipboard?.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const navTabKeys: NavTab[] = [
    'home',
    'worksheets',
    'activities',
    'simulations',
    'solvers',
    'questionbank',
    'exampaper',
    'videos'
  ];

  // Helper to get preview font class
  const getPreviewFontClass = () => {
    let sizeClass = 'text-base';
    if (menuSettings.fontSize === 'sm') sizeClass = 'text-xs';
    if (menuSettings.fontSize === 'md') sizeClass = 'text-sm';
    if (menuSettings.fontSize === 'lg') sizeClass = 'text-base';
    if (menuSettings.fontSize === 'xl') sizeClass = 'text-lg';
    if (menuSettings.fontSize === '2xl') sizeClass = 'text-xl';

    let weightClass = 'font-bold';
    if (menuSettings.fontWeight === 'semibold') weightClass = 'font-semibold';
    if (menuSettings.fontWeight === 'bold') weightClass = 'font-bold';
    if (menuSettings.fontWeight === 'extrabold') weightClass = 'font-extrabold';
    if (menuSettings.fontWeight === 'black') weightClass = 'font-black';

    let transformClass = 'uppercase';
    if (menuSettings.textTransform === 'capitalize') transformClass = 'capitalize';
    if (menuSettings.textTransform === 'none') transformClass = 'normal-case';

    let spacingClass = 'tracking-wider';
    if (menuSettings.letterSpacing === 'tight') spacingClass = 'tracking-tight';
    if (menuSettings.letterSpacing === 'normal') spacingClass = 'tracking-normal';
    if (menuSettings.letterSpacing === 'wide') spacingClass = 'tracking-wide';
    if (menuSettings.letterSpacing === 'wider') spacingClass = 'tracking-wider';
    if (menuSettings.letterSpacing === 'widest') spacingClass = 'tracking-widest';

    return `${sizeClass} ${weightClass} ${transformClass} ${spacingClass}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in-50 duration-150 no-print">
      <div className="bg-slate-900 rounded-3xl max-w-4xl w-full border border-white/15 shadow-[0_0_60px_rgba(0,0,0,0.8)] max-h-[92vh] flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between gap-4 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-pink-500 p-0.5 shadow-lg">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                <Sliders className="w-5 h-5 text-cyan-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Display & Palette Studio
                </h2>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 text-slate-950 uppercase tracking-wider">
                  Live Customizer
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Scale menu fonts, personalize colors, and manually edit menu tab names.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCustomizerOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Preview Strip */}
        <div className="bg-slate-950/80 px-6 py-3.5 border-b border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <Eye className="w-4 h-4 text-cyan-400" />
            <span>Live Menu Item Preview:</span>
          </div>

          {/* Rendered Live Menu Items */}
          <div className="flex items-center gap-2 flex-wrap">
            <div
              className={`px-4 py-2 rounded-xl bg-gradient-to-r ${currentPalette.activeMenuGradient} ${currentPalette.activeText} ${currentPalette.activeShadow} ${getPreviewFontClass()} transition-all flex items-center gap-2 border border-white/20`}
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>{menuSettings.customLabels.home || 'HOME'}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/25 uppercase font-black">
                Active
              </span>
            </div>

            <div
              className={`px-4 py-2 rounded-xl bg-white/[0.06] text-slate-200 border border-white/10 ${getPreviewFontClass()} transition-all flex items-center gap-2`}
            >
              <span>{menuSettings.customLabels.worksheets || 'WORKSHEETS'}</span>
            </div>

            <div
              className={`px-4 py-2 rounded-xl bg-white/[0.06] text-slate-200 border border-white/10 ${getPreviewFontClass()} transition-all hidden md:flex items-center gap-2`}
            >
              <span>{menuSettings.customLabels.activities || 'ACTIVITIES'}</span>
            </div>
          </div>
        </div>

        {/* Segmented SubTabs */}
        <div className="px-6 pt-4 pb-2 border-b border-white/10 bg-slate-900/50 flex gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('palettes')}
            aria-selected={activeSubTab === 'palettes'}
            data-selected={activeSubTab === 'palettes'}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeSubTab === 'palettes'
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 font-black shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Color Palettes ({PRESET_PALETTES.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('typography')}
            aria-selected={activeSubTab === 'typography'}
            data-selected={activeSubTab === 'typography'}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeSubTab === 'typography'
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 font-black shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            <Type className="w-4 h-4" />
            <span>Menu Size & Typography</span>
          </button>

          <button
            onClick={() => setActiveSubTab('manual')}
            aria-selected={activeSubTab === 'manual'}
            data-selected={activeSubTab === 'manual'}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeSubTab === 'manual'
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 font-black shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>Manual Menu Text Edit</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: COLOR PALETTES */}
          {activeSubTab === 'palettes' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Palette className="w-4 h-4 text-cyan-400" />
                  <span>Choose Your Preferred Color Palette</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click any palette to immediately apply it across all top navigation tabs, buttons, glowing auroras, and platform highlights.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PRESET_PALETTES.map((pal) => {
                  const isSelected = pal.id === paletteId;
                  return (
                    <div
                      key={pal.id}
                      role="button"
                      tabIndex={0}
                      aria-selected={isSelected}
                      data-selected={isSelected}
                      onClick={() => setPaletteId(pal.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between gap-3 ${
                        isSelected
                          ? 'bg-slate-950/90 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)] ring-1 ring-cyan-400/50'
                          : 'bg-slate-950/50 border-white/10 hover:border-white/25 hover:bg-slate-950/80'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                            {pal.category}
                          </span>
                          {isSelected && (
                            <span className="flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-cyan-400 text-slate-950">
                              <Check className="w-3 h-3" /> Active
                            </span>
                          )}
                        </div>
                        <h4 className="text-base font-bold text-white mt-1">{pal.name}</h4>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          {pal.description}
                        </p>
                      </div>

                      {/* Swatches strip */}
                      <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {pal.swatches.map((hex, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyHex(hex);
                              }}
                              title={`Copy ${hex}`}
                              className="group relative w-7 h-7 rounded-lg border border-white/20 shadow-md transition-transform hover:scale-115 flex items-center justify-center cursor-pointer"
                              style={{ backgroundColor: hex }}
                            >
                              <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-7 bg-slate-900 text-white text-[9px] font-mono px-1.5 py-0.5 rounded shadow whitespace-nowrap z-20">
                                {copiedHex === hex ? 'Copied!' : hex}
                              </span>
                            </button>
                          ))}
                        </div>

                        <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                          <span>{pal.primary}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: MENU SIZE & TYPOGRAPHY */}
          {activeSubTab === 'typography' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Type className="w-4 h-4 text-cyan-400" />
                  <span>Menu Visibility & Font Sizing Controls</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Directly adjust how large, bold, and visible the top navigation items are on your screen.
                </p>
              </div>

              {/* Font Size Selector */}
              <div className="bg-slate-950/70 p-5 rounded-2xl border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Menu Font Size
                  </label>
                  <span className="text-xs font-mono text-cyan-300 font-bold">
                    {menuSettings.fontSize === 'sm' && '14px (Standard)'}
                    {menuSettings.fontSize === 'md' && '16px (Medium)'}
                    {menuSettings.fontSize === 'lg' && '18px (Large - Recommended)'}
                    {menuSettings.fontSize === 'xl' && '20px (Extra Large)'}
                    {menuSettings.fontSize === '2xl' && '22px (Jumbo Oversize)'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {(
                    [
                      { key: 'sm', label: '14px Normal' },
                      { key: 'md', label: '16px Medium' },
                      { key: 'lg', label: '18px Large' },
                      { key: 'xl', label: '20px XL' },
                      { key: '2xl', label: '22px Jumbo' }
                    ] as Array<{ key: MenuFontSize; label: string }>
                  ).map((item) => (
                    <button
                      key={item.key}
                      onClick={() => updateMenuSettings({ fontSize: item.key })}
                      aria-selected={menuSettings.fontSize === item.key}
                      data-selected={menuSettings.fontSize === item.key}
                      className={`p-2.5 rounded-xl text-xs font-bold transition-all border ${
                        menuSettings.fontSize === item.key
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.35)]'
                          : 'bg-slate-900 text-slate-300 border-white/10 hover:border-white/25 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Transform (Uppercase vs Capitalize) */}
              <div className="bg-slate-950/70 p-5 rounded-2xl border border-white/10 space-y-3">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Text Capitalization Style
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {(
                    [
                      { key: 'uppercase', label: 'UPPERCASE (HOME, WORKSHEETS)' },
                      { key: 'capitalize', label: 'Title Case (Home, Worksheets)' },
                      { key: 'none', label: 'Standard Normal' }
                    ] as Array<{ key: MenuTransform; label: string }>
                  ).map((item) => (
                    <button
                      key={item.key}
                      onClick={() => updateMenuSettings({ textTransform: item.key })}
                      aria-selected={menuSettings.textTransform === item.key}
                      data-selected={menuSettings.textTransform === item.key}
                      className={`p-2.5 rounded-xl text-xs font-bold transition-all border ${
                        menuSettings.textTransform === item.key
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.35)]'
                          : 'bg-slate-900 text-slate-300 border-white/10 hover:border-white/25 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Weight & Letter Spacing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Weight */}
                <div className="bg-slate-950/70 p-5 rounded-2xl border border-white/10 space-y-3">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Font Weight
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        { key: 'semibold', label: 'Semibold (600)' },
                        { key: 'bold', label: 'Bold (700)' },
                        { key: 'extrabold', label: 'Extra Bold (800)' },
                        { key: 'black', label: 'Ultra Black (900)' }
                      ] as Array<{ key: MenuFontWeight; label: string }>
                    ).map((item) => (
                      <button
                        key={item.key}
                        onClick={() => updateMenuSettings({ fontWeight: item.key })}
                        aria-selected={menuSettings.fontWeight === item.key}
                        data-selected={menuSettings.fontWeight === item.key}
                        className={`p-2 rounded-xl text-xs font-bold transition-all border ${
                          menuSettings.fontWeight === item.key
                            ? 'bg-indigo-500 text-white border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.35)]'
                            : 'bg-slate-900 text-slate-300 border-white/10 hover:border-white/25 hover:text-white'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Letter Spacing */}
                <div className="bg-slate-950/70 p-5 rounded-2xl border border-white/10 space-y-3">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Letter Spacing
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        { key: 'normal', label: 'Normal' },
                        { key: 'wide', label: 'Wide' },
                        { key: 'wider', label: 'Wider' },
                        { key: 'widest', label: 'Ultra Widest' }
                      ] as Array<{ key: MenuLetterSpacing; label: string }>
                    ).map((item) => (
                      <button
                        key={item.key}
                        onClick={() => updateMenuSettings({ letterSpacing: item.key })}
                        aria-selected={menuSettings.letterSpacing === item.key}
                        data-selected={menuSettings.letterSpacing === item.key}
                        className={`p-2 rounded-xl text-xs font-bold transition-all border ${
                          menuSettings.letterSpacing === item.key
                            ? 'bg-indigo-500 text-white border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.35)]'
                            : 'bg-slate-900 text-slate-300 border-white/10 hover:border-white/25 hover:text-white'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Icon visibility & padding */}
              <div className="bg-slate-950/70 p-5 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateMenuSettings({ showIcons: !menuSettings.showIcons })}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                      menuSettings.showIcons
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-sm'
                        : 'bg-slate-900 text-slate-400 border-white/10'
                    }`}
                  >
                    {menuSettings.showIcons ? '✓ Icons Visible' : '✗ Text Only (No Icons)'}
                  </button>

                  <button
                    onClick={() =>
                      updateMenuSettings({
                        pillPadding:
                          menuSettings.pillPadding === 'compact'
                            ? 'comfortable'
                            : menuSettings.pillPadding === 'comfortable'
                            ? 'spacious'
                            : 'compact'
                      })
                    }
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/10"
                  >
                    Padding: {menuSettings.pillPadding.toUpperCase()}
                  </button>
                </div>

                <div className="text-xs text-slate-400">
                  Settings are immediately saved to your browser cache.
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MANUAL MENU TEXT EDIT ("allow me to fix mannuel edit so that I can fix myself") */}
          {activeSubTab === 'manual' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-cyan-400" />
                  <span>Manual Menu Tab Renaming</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Type your custom wording for any menu item below. Changes take effect instantaneously on the navigation bar.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {navTabKeys.map((tabKey) => {
                  const defaultVal = DEFAULT_MENU_LABELS[tabKey];
                  const currentVal = menuSettings.customLabels[tabKey] ?? defaultVal;
                  return (
                    <div
                      key={tabKey}
                      className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-400 uppercase">
                          Tab ID: <span className="text-cyan-400">{tabKey}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => updateMenuLabel(tabKey, defaultVal)}
                          className="text-[11px] text-slate-500 hover:text-slate-300"
                        >
                          Reset to default ({defaultVal})
                        </button>
                      </div>

                      <div className="relative">
                        <input
                          type="text"
                          value={currentVal}
                          onChange={(e) => updateMenuLabel(tabKey, e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/15 text-white font-bold text-sm focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                          placeholder={defaultVal}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Want to reset all custom menu text back to standard?
                </span>
                <button
                  type="button"
                  onClick={() => updateMenuSettings({ customLabels: { ...DEFAULT_MENU_LABELS } })}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-rose-300 bg-rose-950/40 border border-rose-500/30 hover:bg-rose-900/40 transition-colors"
                >
                  Reset All Labels
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-5 border-t border-white/10 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={resetToDefaults}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Everything to Defaults</span>
          </button>

          <button
            onClick={() => setIsCustomizerOpen(false)}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-cyan-400 via-indigo-400 to-pink-400 hover:opacity-95 shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center gap-2"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Done & Apply to Navigation</span>
          </button>
        </div>
      </div>
    </div>
  );
};
