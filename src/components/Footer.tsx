import React from 'react';
import { NavTab } from '../types';
import { useCms } from '../context/CmsContext';
import { EditableText } from './EditableText';
import { ShieldCheck, Award, Sparkles, ArrowUpRight, Shield } from 'lucide-react';

interface FooterProps {
  onSelectTab: (tab: NavTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab }) => {
  const { setIsAdminConsoleOpen } = useCms();
  return (
    <footer className="relative bg-slate-950 text-slate-300 border-t border-white/[0.08] no-print mt-24 overflow-hidden">
      {/* Ambient background glow aura */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute top-1/2 right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 opacity-60 blur-xs" />
                <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-slate-900 to-indigo-950 flex items-center justify-center text-white font-bold border border-white/20 shadow-xl">
                  <span className="font-mono text-lg bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-white to-pink-300">
                    ∑π
                  </span>
                </div>
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-white font-display">
                  MATH <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">PERFECT</span>
                </span>
                <span className="ml-2 px-2 py-0.5 text-[9px] font-bold tracking-widest text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 rounded-full uppercase">
                  Institutional
                </span>
              </div>
            </div>

            <EditableText
              contentKey="footer.brandDesc"
              defaultText="The premier mathematics intelligence ecosystem unifying curriculum-aligned AI worksheets, interactive simulations, multi-step symbolic solvers, and authentic examination blueprints."
              as="p"
              label="Footer Brand Description"
              multiline={true}
              className="text-sm text-slate-400 leading-relaxed max-w-sm"
            />

            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-400">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Pedagogically Verified</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-950/40 border border-amber-500/30 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                <Award className="w-4 h-4 text-amber-400" />
                <span>K-12 & College Standards</span>
              </div>
            </div>
          </div>

          {/* Academic Modules */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-200 mb-5 font-display flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
              Core Modules
            </h4>
            <ul className="space-y-3 text-sm">
              {[
                { tab: 'worksheets' as NavTab, label: 'Worksheet Generator' },
                { tab: 'activities' as NavTab, label: 'Interactive Activities' },
                { tab: 'simulations' as NavTab, label: 'Simulations Lab' },
                { tab: 'solvers' as NavTab, label: 'Step-by-Step Solvers' }
              ].map((item) => (
                <li key={item.tab}>
                  <button
                    onClick={() => onSelectTab(item.tab)}
                    className="group flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
                  >
                    <span>{item.label}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-indigo-400" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Assessment & Resources */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-200 mb-5 font-display flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
              Assessments & Media
            </h4>
            <ul className="space-y-3 text-sm">
              {[
                { tab: 'questionbank' as NavTab, label: 'Question Bank' },
                { tab: 'exampaper' as NavTab, label: 'Exam Paper Creator' },
                { tab: 'videos' as NavTab, label: 'Video Masterclasses' }
              ].map((item) => (
                <li key={item.label}>
                  <button
                    onClick={() => onSelectTab(item.tab)}
                    className="group flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
                  >
                    <span>{item.label}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-purple-400" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Grade Pathways */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-200 mb-5 font-display flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
              Audiences
            </h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                <span>For Students (Self-Paced)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>For Teachers (Curriculum Tools)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>For Parents (Practice Support)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                <span>For Schools & Academies</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar with Specular Divider */}
        <div className="border-t border-white/[0.08] mt-14 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <EditableText
            contentKey="footer.copyright"
            defaultText={`© ${new Date().getFullYear()} MATH PERFECT. Ultra-Premium Mathematics Education Platform.`}
            as="p"
            label="Footer Copyright"
            className="text-slate-500"
          />
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 font-mono text-[11px] text-slate-400">
            <button
              onClick={() => setIsAdminConsoleOpen(true)}
              className="flex items-center gap-1.5 text-amber-400/90 hover:text-amber-300 font-bold transition-colors cursor-pointer"
              title="Open Webmaster Admin Console"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Webmaster Console</span>
            </button>
            <span>•</span>
            <span className="text-cyan-300">e^(iπ) + 1 = 0</span>
            <span>•</span>
            <span>WCAG 2.1 AA Compliant</span>
            <span>•</span>
            <span>Zero Secret Leaks</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
