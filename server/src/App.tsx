import React, { useState, useEffect } from 'react';
import { WorksheetsView } from './components/WorksheetsView';
import { NavTab } from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomeView } from './components/HomeView';
import { ActivitiesView } from './components/ActivitiesView';
import { SimulationsView } from './components/SimulationsView';
import { SolversView } from './components/SolversView';
import { QuestionBankView } from './components/QuestionBankView';
import { ExamPaperView } from './components/ExamPaperView';
import { VideosView } from './components/VideosView';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ThemeCustomizerModal } from './components/ThemeCustomizerModal';
import { CmsProvider, useCms } from './context/CmsContext';
import { AdminConsoleModal } from './components/AdminConsoleModal';
import { Palette, Sliders, Shield, Edit3, X, Check } from 'lucide-react';

function AppContent() {
  const getTabFromUrl = (): NavTab => {
    const path = window.location.pathname.toLowerCase();
    const search = new URLSearchParams(window.location.search);
    const tabParam = search.get('tab') as NavTab | null;

    if (
      tabParam &&
      ['home', 'worksheets', 'activities', 'simulations', 'solvers', 'questionbank', 'exampaper', 'videos'].includes(
        tabParam
      )
    ) {
      return tabParam;
    }

    if (path.includes('worksheets')) return 'worksheets';
    if (path.includes('activities')) return 'activities';
    if (path.includes('simulations')) return 'simulations';
    if (path.includes('solvers')) return 'solvers';
    if (path.includes('questionbank')) return 'questionbank';
    if (path.includes('exampaper')) return 'exampaper';
    if (path.includes('videos')) return 'videos';

    const hash = window.location.hash.replace('#', '').toLowerCase() as NavTab;
    if (['home', 'worksheets', 'activities', 'simulations', 'solvers', 'questionbank', 'exampaper', 'videos'].includes(hash)) {
      return hash;
    }

    return 'home';
  };

  const [currentTab, setCurrentTab] = useState<NavTab>(getTabFromUrl);
  const { currentPalette, setIsCustomizerOpen } = useTheme();
  const {
    isAdminConsoleOpen,
    setIsAdminConsoleOpen,
    isMasterEditMode,
    toggleMasterEditMode,
    currentUser,
    canEdit
  } = useCms();

  // Sync route on popstate
  useEffect(() => {
    const handlePopState = () => {
      setCurrentTab(getTabFromUrl());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Universal button click glow animation trigger
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const btn = target.closest(
        'button, [role="button"], a[role="button"], input[type="button"], input[type="submit"]'
      ) as HTMLElement | null;

      if (btn) {
        btn.classList.remove('btn-click-glow');
        // Trigger browser reflow to restart keyframe animation on quick successive clicks
        void btn.offsetWidth;
        btn.classList.add('btn-click-glow');
        setTimeout(() => {
          btn.classList.remove('btn-click-glow');
        }, 650);
      }
    };

    window.addEventListener('click', handleGlobalClick, { capture: true });
    return () => window.removeEventListener('click', handleGlobalClick, { capture: true });
  }, []);

  const handleSelectTab = (tab: NavTab) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Update browser URL seamlessly preserving legacy route compatibility
    const targetPath = tab === 'home' ? '/' : `/${tab}.html`;
    try {
      window.history.pushState(null, '', targetPath);
    } catch {
      window.location.hash = tab;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-white antialiased relative overflow-x-hidden">
      {/* Dynamic Ambient Aurora Lighting adapting to page and active palette */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Palette primary ambient glow */}
        <div
          className={`absolute -top-32 -left-32 w-[600px] h-[600px] ${currentPalette.aurora.primary} rounded-full blur-[140px] animate-aurora`}
        />
        <div
          className={`absolute top-1/3 -right-32 w-[550px] h-[550px] ${currentPalette.aurora.secondary} rounded-full blur-[135px] animate-aurora`}
          style={{ animationDelay: '3s' }}
        />
        <div
          className={`absolute bottom-1/4 left-1/4 w-[600px] h-[600px] ${currentPalette.aurora.tertiary} rounded-full blur-[150px] animate-aurora`}
          style={{ animationDelay: '6s' }}
        />

        {/* Page specific secondary aura accent */}
        {currentTab === 'worksheets' && (
          <div className="absolute top-10 right-1/4 w-[450px] h-[450px] bg-indigo-500/15 rounded-full blur-[130px]" />
        )}
        {currentTab === 'simulations' && (
          <div className="absolute top-10 right-1/4 w-[450px] h-[450px] bg-cyan-500/15 rounded-full blur-[130px]" />
        )}
        {currentTab === 'exampaper' && (
          <div className="absolute top-10 right-1/4 w-[450px] h-[450px] bg-rose-500/15 rounded-full blur-[130px]" />
        )}

        {/* Subtle coordinate grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      {/* Master Edit Mode Sticky Notification Banner */}
      {isMasterEditMode && (
        <aside aria-label="Webmaster Status" className="sticky top-0 z-[60] bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 text-slate-950 px-4 py-2.5 text-xs font-black shadow-xl flex flex-wrap items-center justify-between gap-3 no-print border-b border-amber-600">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-950 animate-ping" />
            <Shield className="w-4 h-4 text-slate-950" />
            <span className="tracking-wide">
              WEBMASTER EDIT MODE ACTIVE: Any outlined text block on the live website can be clicked and edited directly. Changes persist to the backend!
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsAdminConsoleOpen(true)}
              className="px-3 py-1 rounded-lg bg-slate-950 text-amber-300 font-mono text-xs font-bold hover:bg-slate-900 shadow-sm transition-all"
            >
              Open Webmaster Console
            </button>
            <button
              onClick={toggleMasterEditMode}
              className="px-3 py-1 rounded-lg bg-slate-900/20 hover:bg-slate-900/30 text-slate-950 font-bold text-xs flex items-center gap-1 transition-all border border-slate-950/20"
            >
              <X className="w-3.5 h-3.5" />
              <span>Turn Off Edit Mode</span>
            </button>
          </div>
        </aside>
      )}

      {/* Universal Institutional Header Navigation */}
      <Navbar currentTab={currentTab} onSelectTab={handleSelectTab} />

      {/* Primary Dynamic Content Area */}
      <main className="flex-1 relative z-10">
        {currentTab === 'home' && <HomeView onNavigate={handleSelectTab} />}
        {currentTab === 'worksheets' && <WorksheetsView />}
        {currentTab === 'activities' && <ActivitiesView />}
        {currentTab === 'simulations' && <SimulationsView />}
        {currentTab === 'solvers' && <SolversView />}
        {currentTab === 'questionbank' && <QuestionBankView />}
        {currentTab === 'exampaper' && <ExamPaperView />}
        {currentTab === 'videos' && <VideosView onNavigate={handleSelectTab} />}
      </main>

      {/* Floating Quick Customizer & Webmaster Dock */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 no-print">
        {/* Webmaster Admin Console Floating Trigger */}
        <button
          onClick={() => setIsAdminConsoleOpen(true)}
          className={`group flex items-center gap-2 px-3.5 py-3 rounded-2xl backdrop-blur-xl border shadow-[0_8px_30px_rgba(0,0,0,0.6)] text-xs sm:text-sm font-bold transition-all hover:scale-105 ${
            isMasterEditMode
              ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-[0_0_25px_rgba(245,158,11,0.5)]'
              : 'bg-slate-900/90 hover:bg-slate-800 text-amber-300 border-amber-500/30 hover:border-amber-400/60'
          }`}
          title="Open Webmaster Console (User access, live content editor, resets)"
        >
          <Shield className={`w-4 h-4 ${isMasterEditMode ? 'text-slate-950' : 'text-amber-400'}`} />
          <span className="font-extrabold tracking-wide hidden sm:inline">
            {isMasterEditMode ? 'Master Edit ON' : 'Webmaster'}
          </span>
        </button>

        {/* Theme & Menu Customizer Button */}
        <button
          onClick={() => setIsCustomizerOpen(true)}
          className="group flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 backdrop-blur-xl border border-white/20 hover:border-cyan-400/60 shadow-[0_8px_30px_rgba(0,0,0,0.6)] text-white text-xs sm:text-sm font-bold transition-all hover:scale-105"
          title="Open Color Palettes & Menu Font Customizer"
        >
          <div className="relative">
            <span
              className="absolute -inset-1 rounded-full opacity-70 blur-xs"
              style={{ backgroundColor: currentPalette.primary }}
            />
            <div className="relative w-6 h-6 rounded-lg flex items-center justify-center bg-slate-950 border border-white/20">
              <Palette className="w-3.5 h-3.5 text-cyan-300 group-hover:rotate-12 transition-transform" />
            </div>
          </div>
          <span className="font-extrabold tracking-wide hidden sm:inline">Palettes & Sizes</span>
          <Sliders className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-300" />
        </button>
      </div>

      {/* Theme & Menu Customizer Modal */}
      <ThemeCustomizerModal />

      {/* Webmaster Admin Console Modal */}
      <AdminConsoleModal
        isOpen={isAdminConsoleOpen}
        onClose={() => setIsAdminConsoleOpen(false)}
        onOpenThemeCustomizer={() => setIsCustomizerOpen(true)}
      />

      {/* Universal Institutional Footer */}
      <Footer onSelectTab={handleSelectTab} />
    </div>
  );
}

export default function App() {
  return (
    <CmsProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </CmsProvider>
  );
}





