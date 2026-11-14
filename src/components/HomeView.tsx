import React, { useState } from 'react';
import { NavTab } from '../types';
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
  ArrowRight,
  CheckCircle2,
  Users,
  BookOpen,
  School,
  BrainCircuit,
  Compass,
  Infinity as InfinityIcon,
  Flame,
  Zap,
  TrendingUp,
  Cpu,
  Star
} from 'lucide-react';

// Worksheet generator is now embedded inline in the 'worksheets' tab


interface HomeViewProps {
  onNavigate: (tab: NavTab) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  const [activeAudience, setActiveAudience] = useState<'students' | 'teachers' | 'parents' | 'organizations'>('teachers');
  const [activeMasterpiece, setActiveMasterpiece] = useState<'euler' | 'golden' | 'calculus' | 'pythagoras'>('euler');

  const [teaserCoeffA, setTeaserCoeffA] = useState(1);
  const [teaserCoeffB, setTeaserCoeffB] = useState(-5);
  const [teaserCoeffC, setTeaserCoeffC] = useState(6);

  const teaserDisc = teaserCoeffB * teaserCoeffB - 4 * teaserCoeffA * teaserCoeffC;
  const vertexX = -teaserCoeffB / (2 * teaserCoeffA);
  const vertexY = teaserCoeffA * vertexX * vertexX + teaserCoeffB * vertexX + teaserCoeffC;

  let root1: number | null = null;
  let root2: number | null = null;
  if (teaserDisc > 0) {
    root1 = (-teaserCoeffB + Math.sqrt(teaserDisc)) / (2 * teaserCoeffA);
    root2 = (-teaserCoeffB - Math.sqrt(teaserDisc)) / (2 * teaserCoeffA);
  } else if (teaserDisc === 0) {
    root1 = -teaserCoeffB / (2 * teaserCoeffA);
    root2 = root1;
  }

  const svgWidth = 320;
  const svgHeight = 150;
  const mapX = (x: number) => ((x + 6) / 12) * svgWidth;
  const mapY = (y: number) => svgHeight - ((y + 10) / 25) * svgHeight;

  const curvePoints: string[] = [];
  for (let x = -6; x <= 6; x += 0.3) {
    const y = teaserCoeffA * x * x + teaserCoeffB * x + teaserCoeffC;
    const clampedY = Math.max(-10, Math.min(15, y));
    curvePoints.push(`${mapX(x).toFixed(1)},${mapY(clampedY).toFixed(1)}`);
  }
  const curvePathD = curvePoints.length > 0 ? `M ${curvePoints.join(' L ')}` : '';

  const featureCards = [
    {
      tab: 'worksheets' as NavTab,
      title: 'Worksheet Generator',
      badge: 'Curriculum AI',
      theme: 'sapphire',
      gradient: 'from-indigo-950/70 via-slate-900/80 to-slate-950/90',
      border: 'border-indigo-500/30 hover:border-indigo-400/70',
      glow: 'shadow-[0_0_35px_rgba(99,102,241,0.2)]',
      iconGlow: 'bg-indigo-600/30 text-indigo-300 border-indigo-400/40',
      badgeClass: 'bg-indigo-950/80 text-indigo-300 border border-indigo-500/40',
      description: 'Generate customized, pedagogical printable worksheets with instant answer keys, full step-by-step solutions, and native DOCX / vector PDF export.',
      icon: <FileText className="w-6 h-6" />,
      cta: 'Open Full Generator'
    },
    {
      tab: 'activities' as NavTab,
      title: 'Interactive Activities',
      badge: 'Visual Manipulatives',
      theme: 'emerald',
      gradient: 'from-emerald-950/70 via-slate-900/80 to-slate-950/90',
      border: 'border-emerald-500/30 hover:border-emerald-400/70',
      glow: 'shadow-[0_0_35px_rgba(16,185,129,0.2)]',
      iconGlow: 'bg-emerald-600/30 text-emerald-300 border-emerald-400/40',
      badgeClass: 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40',
      description: 'Hands-on digital math manipulatives: fraction strip balances, coordinate geometry plotters, equation balance scales, and probability spinners.',
      icon: <Activity className="w-6 h-6" />,
      cta: 'Launch Activities'
    },
    {
      tab: 'simulations' as NavTab,
      title: 'Simulations Lab',
      badge: 'Dynamic Modeling',
      theme: 'cyan',
      gradient: 'from-cyan-950/70 via-slate-900/80 to-slate-950/90',
      border: 'border-cyan-500/30 hover:border-cyan-400/70',
      glow: 'shadow-[0_0_35px_rgba(6,182,212,0.2)]',
      iconGlow: 'bg-cyan-600/30 text-cyan-300 border-cyan-400/40',
      badgeClass: 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40',
      description: 'Dynamic mathematical laboratories: Calculus tangent slopes, Pythagorean geometric proofs, unit circle wave generators, and Monte Carlo π approximations.',
      icon: <Layers className="w-6 h-6" />,
      cta: 'Enter Lab'
    },
    {
      tab: 'solvers' as NavTab,
      title: 'Step-by-Step Solvers',
      badge: 'Symbolic Engine',
      theme: 'amber',
      gradient: 'from-amber-950/70 via-slate-900/80 to-slate-950/90',
      border: 'border-amber-500/30 hover:border-amber-400/70',
      glow: 'shadow-[0_0_35px_rgba(245,158,11,0.2)]',
      iconGlow: 'bg-amber-600/30 text-amber-300 border-amber-400/40',
      badgeClass: 'bg-amber-950/80 text-amber-300 border border-amber-500/40',
      description: 'Deconstruct complex problems with rigorous step-by-step proofs, intermediate formula steps, parabola geometry analyses, and linear system matrices.',
      icon: <Calculator className="w-6 h-6" />,
      cta: 'Solve Problem'
    },
    {
      tab: 'questionbank' as NavTab,
      title: 'Question Bank',
      badge: 'Curated Repository',
      theme: 'amethyst',
      gradient: 'from-purple-950/70 via-slate-900/80 to-slate-950/90',
      border: 'border-purple-500/30 hover:border-purple-400/70',
      glow: 'shadow-[0_0_35px_rgba(168,85,247,0.2)]',
      iconGlow: 'bg-purple-600/30 text-purple-300 border-purple-400/40',
      badgeClass: 'bg-purple-950/80 text-purple-300 border border-purple-500/40',
      description: 'Search and filter thousands of academic math questions by topic, grade level, difficulty, and question format with progressive hints and complete solutions.',
      icon: <Database className="w-6 h-6" />,
      cta: 'Browse Bank'
    },
    {
      tab: 'exampaper' as NavTab,
      title: 'Exam Papers & Guessing',
      badge: 'Blueprint Analytics',
      theme: 'ruby',
      gradient: 'from-rose-950/70 via-slate-900/80 to-slate-950/90',
      border: 'border-rose-500/30 hover:border-rose-400/70',
      glow: 'shadow-[0_0_35px_rgba(244,63,94,0.2)]',
      iconGlow: 'bg-rose-600/30 text-rose-300 border-rose-400/40',
      badgeClass: 'bg-rose-950/80 text-rose-300 border border-rose-500/40',
      description: 'Standardized assessment builder with balanced cognitive sections (MCQ, short, extended proof), point rubrics, and predictive topic frequency analysis.',
      icon: <GraduationCap className="w-6 h-6" />,
      cta: 'Generate Exam'
    },
    {
      tab: 'videos' as NavTab,
      title: 'Curated Video Lessons',
      badge: 'Masterclasses',
      theme: 'cobalt',
      gradient: 'from-blue-950/70 via-slate-900/80 to-slate-950/90',
      border: 'border-blue-500/30 hover:border-blue-400/70',
      glow: 'shadow-[0_0_35px_rgba(59,130,246,0.2)]',
      iconGlow: 'bg-blue-600/30 text-blue-300 border-blue-400/40',
      badgeClass: 'bg-blue-950/80 text-blue-300 border border-blue-500/40',
      description: 'High-yield video lectures covering geometric intuition, calculus insights, contest heuristics, and deep fundamental proofs.',
      icon: <PlaySquare className="w-6 h-6" />,
      cta: 'Watch Lessons'
    }
  ];

  return (
    <div className="relative min-h-screen text-slate-100 overflow-hidden space-y-24 sm:space-y-32 pb-24">

      {/* Background auras */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[140px] pointer-events-none animate-aurora" />
      <div className="absolute top-1/4 -right-40 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[130px] pointer-events-none animate-aurora" style={{ animationDelay: '3s' }} />
      <div className="absolute top-2/3 left-1/3 w-[600px] h-[600px] bg-cyan-600/12 rounded-full blur-[150px] pointer-events-none animate-aurora" style={{ animationDelay: '5s' }} />
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: '48px 48px'
        }}
      />

      {/* ============ QUICK LINK BAR ============ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <button
          onClick={() => onNavigate('worksheets')}
          className="group flex items-center justify-between gap-3 w-full rounded-2xl border border-cyan-500/30 bg-cyan-950/30 hover:bg-cyan-900/40 px-5 py-3.5 backdrop-blur-xl shadow-[0_0_25px_rgba(6,182,212,0.18)] transition-all"
        >
          <span className="flex items-center gap-2.5 text-sm font-bold text-cyan-200">
            <Sparkles className="w-4 h-4 text-cyan-300" />
            Open the Full Worksheet Generator (AI-powered · CBSE / ICSE / IGCSE)
          </span>
          <ArrowRight className="w-4 h-4 text-cyan-300 group-hover:translate-x-1 transition-transform" />
        </button>
      </section>

      {/* ============ HERO ============ */}
      <section className="relative pt-8 sm:pt-16 lg:pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
            <div className="lg:col-span-7 space-y-8 text-left">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full backdrop-blur-xl bg-white/[0.05] border border-white/15 shadow-[0_0_25px_rgba(99,102,241,0.25)]">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.9)] animate-pulse" />
                <EditableText contentKey="home.hero.pillText" defaultText="Pure Mathematical Intelligence" as="span" label="Hero Badge Text" className="text-[11px] font-extrabold tracking-widest text-slate-200 uppercase font-mono" />
                <EditableText contentKey="home.hero.pillBadge" defaultText="8K Fidelity" as="span" label="Hero Badge Pill" className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-500/40" />
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-display leading-[1.18] text-white">
                  <EditableText contentKey="home.hero.title1" defaultText="Precision Mathematics." as="span" label="Hero Main Title Line 1" />
                  <br />
                  <EditableText contentKey="home.hero.title2" defaultText="Mastered With Absolute Clarity." as="span" label="Hero Main Title Line 2" className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 drop-shadow-[0_0_25px_rgba(45,212,191,0.35)]" />
                </h1>
                <EditableText contentKey="home.hero.description" defaultText="Institutional-grade mathematical intelligence crafted for educators, students, and institutions. Unifying generative AI worksheets, dynamic visual simulations, multi-step symbolic solvers, and authentic examination blueprints." as="p" label="Hero Subtitle & Description" multiline={true} className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl pt-1" />
              </div>

              {/* CTAs — worksheet button now navigates to embedded generator tab */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  id="hero-cta-worksheet"
                  onClick={() => onNavigate('worksheets')}
                  className="group relative overflow-hidden rounded-2xl p-[1px] focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-indigo-500 to-fuchsia-500 rounded-2xl transition-all duration-300 group-hover:scale-105 group-hover:opacity-100 opacity-90 blur-xs" />
                  <span className="relative flex items-center gap-3 px-7 py-4 rounded-[15px] bg-slate-950 text-white font-bold text-sm sm:text-base transition-all group-hover:bg-slate-900 shadow-xl">
                    <Sparkles className="w-5 h-5 text-cyan-300 group-hover:rotate-12 transition-transform duration-300" />
                    <span>Launch Worksheet Engine</span>
                    <ArrowRight className="w-4 h-4 text-indigo-300 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>

                <button
                  id="hero-cta-simulations"
                  onClick={() => onNavigate('simulations')}
                  className="px-7 py-4 rounded-2xl backdrop-blur-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/20 text-white font-bold text-sm sm:text-base flex items-center gap-2.5 shadow-lg hover:border-cyan-400/40 hover:shadow-[0_0_25px_rgba(6,182,212,0.25)] transition-all"
                >
                  <Layers className="w-5 h-5 text-cyan-300" />
                  <EditableText contentKey="home.hero.ctaSimulations" defaultText="Explore 3D Simulations" as="span" label="Hero CTA 2 Label" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 pt-4 border-t border-white/10 text-xs sm:text-sm text-slate-300">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-400/40"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /></div>
                  <span>Native DOCX & Vector PDF</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-400/40"><CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /></div>
                  <span>Algorithmic Step Proofs</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-400/40"><CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /></div>
                  <span>K-12 & College Aligned</span>
                </div>
              </div>
            </div>

            {/* Interactive Parabola Widget */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl p-[1px] bg-gradient-to-b from-white/20 via-white/10 to-transparent shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_50px_rgba(99,102,241,0.25)]">
                <div className="relative rounded-[23px] backdrop-blur-2xl bg-slate-950/80 p-6 sm:p-7 overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-center justify-between pb-4 border-b border-white/10">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                      <span className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">Symbolic Parabola Engine</span>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">Live Interactive</span>
                  </div>

                  <div className="py-4 space-y-3">
                    <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 text-center shadow-inner">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1">Form: ax² + bx + c = 0</span>
                      <div className="text-2xl sm:text-3xl font-mono font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-pink-300">
                        {teaserCoeffA}x² {teaserCoeffB >= 0 ? `+ ${teaserCoeffB}` : `- ${Math.abs(teaserCoeffB)}`}x {teaserCoeffC >= 0 ? `+ ${teaserCoeffC}` : `- ${Math.abs(teaserCoeffC)}`} = 0
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-400 font-mono mr-1">Presets:</span>
                      {[
                        { label: 'x = 2, 3', a: 1, b: -5, c: 6 },
                        { label: 'Vertex Root', a: 1, b: -6, c: 9 },
                        { label: 'Golden φ', a: 1, b: -1, c: -1 },
                        { label: 'Complex', a: 1, b: 2, c: 5 }
                      ].map((preset, idx) => (
                        <button key={idx} onClick={() => { setTeaserCoeffA(preset.a); setTeaserCoeffB(preset.b); setTeaserCoeffC(preset.c); }} className="px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono bg-white/[0.05] hover:bg-indigo-600/30 text-slate-300 hover:text-white border border-white/10 hover:border-indigo-400/40 transition-all">
                          {preset.label}
                        </button>
                      ))}
                    </div>

                    <div className="relative rounded-xl bg-slate-950/90 border border-white/10 p-2 overflow-hidden shadow-inner">
                      <div className="absolute top-2 left-2 text-[9px] font-mono text-slate-500">Vertex: ({vertexX.toFixed(1)}, {vertexY.toFixed(1)})</div>
                      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-28 overflow-visible">
                        <line x1={0} y1={mapY(0)} x2={svgWidth} y2={mapY(0)} stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="3 3" />
                        <line x1={mapX(0)} y1={0} x2={mapX(0)} y2={svgHeight} stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="3 3" />
                        {curvePathD && (<path d={curvePathD} fill="none" stroke="url(#parabolaGrad)" strokeWidth="2.5" strokeLinecap="round" />)}
                        {vertexX >= -6 && vertexX <= 6 && vertexY >= -10 && vertexY <= 15 && (<circle cx={mapX(vertexX)} cy={mapY(vertexY)} r="4" fill="#f43f5e" />)}
                        {root1 !== null && root1 >= -6 && root1 <= 6 && (<circle cx={mapX(root1)} cy={mapY(0)} r="4.5" fill="#06b6d4" />)}
                        {root2 !== null && root2 !== root1 && root2 >= -6 && root2 <= 6 && (<circle cx={mapX(root2)} cy={mapY(0)} r="4.5" fill="#06b6d4" />)}
                        <defs><linearGradient id="parabolaGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#06b6d4" /><stop offset="50%" stopColor="#818cf8" /><stop offset="100%" stopColor="#f43f5e" /></linearGradient></defs>
                      </svg>
                    </div>

                    <div className="space-y-2 pt-1 text-xs">
                      <div>
                        <div className="flex justify-between font-mono text-[11px] text-slate-300 mb-1"><span>Coefficient a:</span><span className="font-bold text-cyan-300">{teaserCoeffA}</span></div>
                        <input type="range" min="1" max="5" value={teaserCoeffA} onChange={(e) => setTeaserCoeffA(Number(e.target.value))} className="w-full accent-cyan-400 h-1.5 bg-white/10 rounded-lg cursor-pointer" />
                      </div>
                      <div>
                        <div className="flex justify-between font-mono text-[11px] text-slate-300 mb-1"><span>Coefficient b:</span><span className="font-bold text-indigo-300">{teaserCoeffB}</span></div>
                        <input type="range" min="-10" max="10" value={teaserCoeffB} onChange={(e) => setTeaserCoeffB(Number(e.target.value))} className="w-full accent-indigo-400 h-1.5 bg-white/10 rounded-lg cursor-pointer" />
                      </div>
                      <div>
                        <div className="flex justify-between font-mono text-[11px] text-slate-300 mb-1"><span>Coefficient c:</span><span className="font-bold text-fuchsia-300">{teaserCoeffC}</span></div>
                        <input type="range" min="-10" max="10" value={teaserCoeffC} onChange={(e) => setTeaserCoeffC(Number(e.target.value))} className="w-full accent-fuchsia-400 h-1.5 bg-white/10 rounded-lg cursor-pointer" />
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white/[0.05] border border-white/10 space-y-2 text-xs font-mono">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Discriminant Δ (b² - 4ac):</span>
                        <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${teaserDisc > 0 ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : teaserDisc === 0 ? 'bg-amber-950 text-amber-300 border border-amber-500/40' : 'bg-purple-950 text-purple-300 border border-purple-500/40'}`}>
                          Δ = {teaserDisc} ({teaserDisc > 0 ? '2 Real' : teaserDisc === 0 ? '1 Repeated' : 'Complex'})
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-t border-white/10 pt-2">
                        <span className="text-slate-400">Calculated Roots:</span>
                        <span className="font-bold text-cyan-300">
                          {teaserDisc >= 0 && root1 !== null ? (teaserDisc === 0 ? `x = ${root1.toFixed(2)}` : `x = ${root1.toFixed(2)},  ${root2?.toFixed(2)}`) : 'x = a ± bi (Complex)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button onClick={() => onNavigate('solvers')} className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all flex items-center justify-center gap-2 group">
                    <span>Open Comprehensive Symbolic Solver</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ STATS ============ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            { metric: '10,000+', label: 'Verified Academic Problems', sub: 'Across all major curricula', theme: 'from-indigo-500/20 to-transparent', border: 'border-indigo-500/30', textCol: 'text-indigo-400' },
            { metric: '100%', label: 'Step-by-Step Derivations', sub: 'Zero unexplained leaps', theme: 'from-emerald-500/20 to-transparent', border: 'border-emerald-500/30', textCol: 'text-emerald-400' },
            { metric: 'K-12 → Univ', label: 'Complete Academic Span', sub: 'Elementary to Higher Calc', theme: 'from-purple-500/20 to-transparent', border: 'border-purple-500/30', textCol: 'text-purple-400' },
            { metric: '0.4s', label: 'Document Synthesis', sub: 'Native Word & Vector PDF', theme: 'from-cyan-500/20 to-transparent', border: 'border-cyan-500/30', textCol: 'text-cyan-400' }
          ].map((pillar, idx) => (
            <div key={idx} className={`relative rounded-2xl p-6 sm:p-7 backdrop-blur-xl bg-gradient-to-b ${pillar.theme} bg-slate-900/60 border ${pillar.border} shadow-lg transition-all duration-300 hover:-translate-y-1`}>
              <div className={`text-3xl sm:text-4xl font-extrabold font-display ${pillar.textCol} tracking-tight`}>{pillar.metric}</div>
              <div className="text-sm font-bold text-white mt-1.5 font-display">{pillar.label}</div>
              <div className="text-xs text-slate-400 mt-0.5">{pillar.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ MODULE CARDS ============ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <EditableText contentKey="home.modules.eyebrow" defaultText="Academic Ecosystem" as="span" label="Modules Eyebrow" />
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-display text-white">
            <EditableText contentKey="home.modules.heading" defaultText="Integrated Mathematical Modules" as="span" label="Modules Main Heading" />
          </h2>
          <EditableText contentKey="home.modules.subtitle" defaultText="Every module is crafted to work harmoniously together. Generate practice sets, experiment with interactive proofs, solve complex expressions, and assess academic mastery." as="p" label="Modules Subtitle" multiline={true} className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {featureCards.map((feat) => (
            <div key={feat.tab} className={`group relative rounded-3xl p-7 bg-gradient-to-b ${feat.gradient} backdrop-blur-2xl border ${feat.border} ${feat.glow} flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5`}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`p-3.5 rounded-2xl border ${feat.iconGlow} shadow-lg group-hover:scale-105 transition-transform`}>{feat.icon}</div>
                  <EditableText contentKey={`module.${feat.tab}.badge`} defaultText={feat.badge} as="span" label={`${feat.title} Badge`} className={`text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider font-mono ${feat.badgeClass}`} />
                </div>
                <h3 className="text-xl font-bold text-white font-display pt-1 group-hover:text-cyan-200 transition-colors">
                  <EditableText contentKey={`module.${feat.tab}.title`} defaultText={feat.title} as="span" label={`${feat.title} Title`} />
                </h3>
                <EditableText contentKey={`module.${feat.tab}.desc`} defaultText={feat.description} as="p" label={`${feat.title} Description`} multiline={true} className="text-sm text-slate-300/90 leading-relaxed" />
              </div>

              {/* All cards navigate internally — worksheet generator is now embedded */}
              <div className="pt-8">
                <button onClick={() => onNavigate(feat.tab)} className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-slate-200 bg-white/[0.05] hover:bg-white/[0.12] hover:text-white border border-white/15 hover:border-white/30 transition-all flex items-center justify-center gap-2">
                  <span>{feat.cta}</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </button>
              </div>

            </div>
          ))}
        </div>
      </section>

      {/* ============ MASTERPIECES ============ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl p-[1px] bg-gradient-to-r from-indigo-500/40 via-purple-500/40 to-cyan-500/40 shadow-2xl">
          <div className="relative rounded-[23px] backdrop-blur-2xl bg-slate-950/90 p-8 sm:p-12 overflow-hidden">
            <div className="max-w-3xl mx-auto text-center space-y-3 mb-10">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-300">Aesthetics of Rigor</span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-display tracking-tight">The Invariant Beauty of Mathematical Truth</h2>
              <p className="text-sm sm:text-base text-slate-300">Mathematics is not merely computation; it is an architectural art form uniting geometry, symmetry, and logic.</p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-10">
              {[
                { id: 'euler', label: "Euler's Identity", badge: 'e^(iπ) + 1 = 0' },
                { id: 'golden', label: 'Golden Ratio (φ)', badge: '1.618033...' },
                { id: 'calculus', label: 'Fundamental Theorem', badge: "∫ f'(x)dx" },
                { id: 'pythagoras', label: 'Pythagorean Metric', badge: 'a² + b² = c²' }
              ].map((item) => (
                <button key={item.id} onClick={() => setActiveMasterpiece(item.id as any)} className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${activeMasterpiece === item.id ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-[0_0_25px_rgba(99,102,241,0.4)] border border-indigo-400/40' : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white border border-white/10'}`}>
                  <span>{item.label}</span>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-black/40 text-cyan-300 border border-white/10">{item.badge}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white/[0.03] rounded-2xl p-6 sm:p-8 border border-white/10">
              {activeMasterpiece === 'euler' && (
                <>
                  <div className="lg:col-span-7 space-y-4 text-left">
                    <div className="inline-block text-xs font-bold text-indigo-400 font-mono tracking-wider uppercase">Complex Plane Rotations</div>
                    <h3 className="text-2xl font-extrabold text-white font-display">Euler's Identity: e^(iπ) + 1 = 0</h3>
                    <p className="text-sm sm:text-base text-slate-300 leading-relaxed">Revered as the single most profound equation in mathematical history, Euler's Identity unifies the five fundamental mathematical constants (0, 1, e, i, π) through simple geometric rotation on the Argand complex plane.</p>
                    <div className="grid grid-cols-3 gap-3 pt-2 text-xs font-mono">
                      <div className="p-3 rounded-xl bg-slate-900 border border-white/10"><span className="text-slate-400 block text-[10px]">Real Axis</span><span className="text-cyan-300 font-bold">cos(π) = -1</span></div>
                      <div className="p-3 rounded-xl bg-slate-900 border border-white/10"><span className="text-slate-400 block text-[10px]">Imaginary</span><span className="text-fuchsia-300 font-bold">i·sin(π) = 0</span></div>
                      <div className="p-3 rounded-xl bg-slate-900 border border-white/10"><span className="text-slate-400 block text-[10px]">Radius</span><span className="text-emerald-300 font-bold">|z| = 1</span></div>
                    </div>
                  </div>
                  <div className="lg:col-span-5 flex justify-center">
                    <svg viewBox="0 0 240 240" className="w-56 h-56">
                      <circle cx="120" cy="120" r="80" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeDasharray="4 4" />
                      <line x1="20" y1="120" x2="220" y2="120" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
                      <line x1="120" y1="20" x2="120" y2="220" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
                      <path d="M 200 120 A 80 80 0 0 0 40 120" fill="none" stroke="#06b6d4" strokeWidth="3" />
                      <circle cx="200" cy="120" r="5" fill="#818cf8" />
                      <circle cx="40" cy="120" r="6" fill="#f43f5e" />
                      <text x="205" y="115" fill="#818cf8" fontSize="11" fontFamily="JetBrains Mono">+1</text>
                      <text x="25" y="115" fill="#f43f5e" fontSize="11" fontFamily="JetBrains Mono">-1</text>
                      <text x="125" y="35" fill="#a78bfa" fontSize="11" fontFamily="JetBrains Mono">+i</text>
                      <text x="110" y="80" fill="#06b6d4" fontSize="12" fontWeight="bold" fontFamily="Outfit">θ = π rad</text>
                    </svg>
                  </div>
                </>
              )}
              {activeMasterpiece === 'golden' && (
                <>
                  <div className="lg:col-span-7 space-y-4 text-left">
                    <div className="inline-block text-xs font-bold text-amber-400 font-mono tracking-wider uppercase">Logarithmic Spiral Invariance</div>
                    <h3 className="text-2xl font-extrabold text-white font-display">The Golden Ratio: φ = (1 + √5)/2</h3>
                    <p className="text-sm sm:text-base text-slate-300 leading-relaxed">Representing divine geometric scaling, φ governs self-similar branching in phyllotaxis, galactic spirals, and harmonic musical overtone series.</p>
                    <div className="grid grid-cols-3 gap-3 pt-2 text-xs font-mono">
                      <div className="p-3 rounded-xl bg-slate-900 border border-white/10"><span className="text-slate-400 block text-[10px]">Decimal</span><span className="text-amber-300 font-bold">≈ 1.618033</span></div>
                      <div className="p-3 rounded-xl bg-slate-900 border border-white/10"><span className="text-slate-400 block text-[10px]">Continuous Frac</span><span className="text-cyan-300 font-bold">[1; 1, 1, 1...]</span></div>
                      <div className="p-3 rounded-xl bg-slate-900 border border-white/10"><span className="text-slate-400 block text-[10px]">Fibonacci Limit</span><span className="text-emerald-300 font-bold">F(n+1)/F(n)</span></div>
                    </div>
                  </div>
                  <div className="lg:col-span-5 flex justify-center">
                    <svg viewBox="0 0 240 160" className="w-64 h-44">
                      <rect x="10" y="10" width="220" height="136" fill="none" stroke="#f59e0b" strokeWidth="2" rx="4" />
                      <line x1="146" y1="10" x2="146" y2="146" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
                      <line x1="146" y1="94" x2="230" y2="94" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
                      <path d="M 146 146 A 136 136 0 0 1 10 10 A 136 136 0 0 1 146 10 A 84 84 0 0 1 230 94" fill="none" stroke="#fbbf24" strokeWidth="2.5" />
                      <text x="60" y="80" fill="#f59e0b" fontSize="18" fontWeight="bold" fontFamily="Outfit">1.0</text>
                      <text x="180" y="60" fill="#fbbf24" fontSize="14" fontWeight="bold" fontFamily="Outfit">0.618</text>
                    </svg>
                  </div>
                </>
              )}
              {activeMasterpiece === 'calculus' && (
                <>
                  <div className="lg:col-span-7 space-y-4 text-left">
                    <div className="inline-block text-xs font-bold text-cyan-400 font-mono tracking-wider uppercase">Continuum Analysis</div>
                    <h3 className="text-2xl font-extrabold text-white font-display">Fundamental Theorem of Calculus</h3>
                    <p className="text-sm sm:text-base text-slate-300 leading-relaxed">Linking the dual pillars of differentiation (instantaneous slope) and integration (cumulative accumulation), proving that the rate of area generation is equal to the bounding curve itself.</p>
                    <div className="p-3 rounded-xl bg-slate-900 border border-white/10 text-xs font-mono text-cyan-300">∫[a to b] f'(x) dx = f(b) - f(a)</div>
                  </div>
                  <div className="lg:col-span-5 flex justify-center">
                    <svg viewBox="0 0 240 160" className="w-64 h-44">
                      <path d="M 40 130 Q 120 40 200 130 Z" fill="rgba(6,182,212,0.2)" />
                      <path d="M 30 140 Q 120 20 210 140" fill="none" stroke="#06b6d4" strokeWidth="2.5" />
                      <line x1="70" y1="50" x2="170" y2="50" stroke="#f43f5e" strokeWidth="2" strokeDasharray="4 2" />
                      <circle cx="120" cy="50" r="4" fill="#f43f5e" />
                      <text x="128" y="44" fill="#f43f5e" fontSize="10" fontFamily="JetBrains Mono">f'(x) = 0</text>
                      <text x="95" y="110" fill="#06b6d4" fontSize="12" fontWeight="bold" fontFamily="JetBrains Mono">Area: ∫ f(x)dx</text>
                    </svg>
                  </div>
                </>
              )}
              {activeMasterpiece === 'pythagoras' && (
                <>
                  <div className="lg:col-span-7 space-y-4 text-left">
                    <div className="inline-block text-xs font-bold text-rose-400 font-mono tracking-wider uppercase">Euclidean Metric Invariance</div>
                    <h3 className="text-2xl font-extrabold text-white font-display">Pythagorean Metric: a² + b² = c²</h3>
                    <p className="text-sm sm:text-base text-slate-300 leading-relaxed">The bedrock invariant of flat space geometry and vector Hilbert spaces, establishing distance measures across infinite dimensional coordinate spaces.</p>
                    <div className="grid grid-cols-3 gap-3 pt-2 text-xs font-mono">
                      <div className="p-3 rounded-xl bg-slate-900 border border-white/10 text-emerald-300 font-bold">a² = 9</div>
                      <div className="p-3 rounded-xl bg-slate-900 border border-white/10 text-indigo-300 font-bold">b² = 16</div>
                      <div className="p-3 rounded-xl bg-slate-900 border border-white/10 text-rose-300 font-bold">c² = 25</div>
                    </div>
                  </div>
                  <div className="lg:col-span-5 flex justify-center">
                    <svg viewBox="0 0 240 180" className="w-64 h-48">
                      <polygon points="90,130 90,70 170,130" fill="rgba(255,255,255,0.08)" stroke="#ffffff" strokeWidth="2" />
                      <rect x="30" y="70" width="60" height="60" fill="rgba(16,185,129,0.2)" stroke="#10b981" strokeWidth="1.5" />
                      <rect x="90" y="130" width="80" height="40" fill="rgba(99,102,241,0.2)" stroke="#6366f1" strokeWidth="1.5" />
                      <text x="50" y="105" fill="#10b981" fontSize="12" fontWeight="bold" fontFamily="JetBrains Mono">a²</text>
                      <text x="125" y="155" fill="#6366f1" fontSize="12" fontWeight="bold" fontFamily="JetBrains Mono">b²</text>
                      <text x="135" y="90" fill="#f43f5e" fontSize="13" fontWeight="bold" fontFamily="JetBrains Mono">c²</text>
                    </svg>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ============ AUDIENCE ============ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 font-mono">User-Centric Architecture</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-display">Designed for the Entire Mathematics Community</h2>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {[
            { id: 'teachers', label: 'For Teachers', icon: <BookOpen className="w-4 h-4" /> },
            { id: 'students', label: 'For Students', icon: <BrainCircuit className="w-4 h-4" /> },
            { id: 'parents', label: 'For Parents', icon: <Users className="w-4 h-4" /> },
            { id: 'organizations', label: 'For Organizations', icon: <School className="w-4 h-4" /> }
          ].map((aud) => (
            <button key={aud.id} onClick={() => setActiveAudience(aud.id as any)} className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all ${activeAudience === aud.id ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-[0_0_25px_rgba(99,102,241,0.4)] border border-indigo-400/40' : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white border border-white/10'}`}>
              {aud.icon}<span>{aud.label}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {activeAudience === 'teachers' && (
            <>
              <div className="rounded-3xl p-7 bg-white/[0.04] backdrop-blur-xl border border-white/10 hover:border-indigo-400/40 transition-all">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-300 mb-4 border border-indigo-500/30"><Zap className="w-5 h-5" /></div>
                <h4 className="text-lg font-bold text-white mb-2 font-display">Instant Curriculum Generation</h4>
                <p className="text-sm text-slate-300 leading-relaxed">Eliminate hours of manual preparation. Generate customized 5 to 25 problem sets matching your weekly syllabus in seconds, complete with verified answer keys.</p>
              </div>
              <div className="rounded-3xl p-7 bg-white/[0.04] backdrop-blur-xl border border-white/10 hover:border-indigo-400/40 transition-all">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-300 mb-4 border border-indigo-500/30"><FileText className="w-5 h-5" /></div>
                <h4 className="text-lg font-bold text-white mb-2 font-display">Native Word (.docx) & Vector PDF</h4>
                <p className="text-sm text-slate-300 leading-relaxed">Export directly to formatted Microsoft Word files or vector printables, formatted with school banners, student score blocks, and ruled work areas.</p>
              </div>
              <div className="rounded-3xl p-7 bg-white/[0.04] backdrop-blur-xl border border-white/10 hover:border-indigo-400/40 transition-all">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-300 mb-4 border border-indigo-500/30"><TrendingUp className="w-5 h-5" /></div>
                <h4 className="text-lg font-bold text-white mb-2 font-display">Examination Blueprint Analytics</h4>
                <p className="text-sm text-slate-300 leading-relaxed">Build balanced assessments with cognitive-level distribution, automated rubrics, and predictive topic frequency analysis drawn from historical exam data.</p>
              </div>
            </>
          )}

          {activeAudience === 'students' && (
            <>
              <div className="rounded-3xl p-7 bg-white/[0.04] backdrop-blur-xl border border-white/10 hover:border-cyan-400/40 transition-all">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-300 mb-4 border border-cyan-500/30"><BrainCircuit className="w-5 h-5" /></div>
                <h4 className="text-lg font-bold text-white mb-2 font-display">Step-by-Step Guided Solutions</h4>
                <p className="text-sm text-slate-300 leading-relaxed">Never get stuck again. Every problem comes with full worked solutions and intermediate reasoning steps, building genuine mathematical intuition.</p>
              </div>
              <div className="rounded-3xl p-7 bg-white/[0.04] backdrop-blur-xl border border-white/10 hover:border-cyan-400/40 transition-all">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-300 mb-4 border border-cyan-500/30"><Compass className="w-5 h-5" /></div>
                <h4 className="text-lg font-bold text-white mb-2 font-display">Interactive Visual Simulations</h4>
                <p className="text-sm text-slate-300 leading-relaxed">See mathematics come alive through dynamic visual labs — explore parabolas, unit circles, Pythagorean proofs, and Monte Carlo approximations interactively.</p>
              </div>
              <div className="rounded-3xl p-7 bg-white/[0.04] backdrop-blur-xl border border-white/10 hover:border-cyan-400/40 transition-all">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-300 mb-4 border border-cyan-500/30"><Star className="w-5 h-5" /></div>
                <h4 className="text-lg font-bold text-white mb-2 font-display">Curated Practice by Difficulty</h4>
                <p className="text-sm text-slate-300 leading-relaxed">Filter thousands of problems by topic, grade, and difficulty. Practice at your own pace with progressive hints that guide without giving away the answer.</p>
              </div>
            </>
          )}

          {activeAudience === 'parents' && (
            <>
              <div className="rounded-3xl p-7 bg-white/[0.04] backdrop-blur-xl border border-white/10 hover:border-purple-400/40 transition-all">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-300 mb-4 border border-purple-500/30"><BookOpen className="w-5 h-5" /></div>
                <h4 className="text-lg font-bold text-white mb-2 font-display">Printable Home Practice Sets</h4>
                <p className="text-sm text-slate-300 leading-relaxed">Generate curriculum-aligned worksheets at the right difficulty for your child's grade in seconds, complete with answer keys for guided home revision.</p>
              </div>
              <div className="rounded-3xl p-7 bg-white/[0.04] backdrop-blur-xl border border-white/10 hover:border-purple-400/40 transition-all">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-300 mb-4 border border-purple-500/30"><InfinityIcon className="w-5 h-5" /></div>
                <h4 className="text-lg font-bold text-white mb-2 font-display">Clear Conceptual Explanations</h4>
                <p className="text-sm text-slate-300 leading-relaxed">Every topic includes plain-language conceptual introductions and visual diagrams so parents can confidently support and explain concepts to their children.</p>
              </div>
              <div className="rounded-3xl p-7 bg-white/[0.04] backdrop-blur-xl border border-white/10 hover:border-purple-400/40 transition-all">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-300 mb-4 border border-purple-500/30"><Flame className="w-5 h-5" /></div>
                <h4 className="text-lg font-bold text-white mb-2 font-display">Progress Through Curated Videos</h4>
                <p className="text-sm text-slate-300 leading-relaxed">Access handpicked masterclass video lessons that cover exactly the topics your child is studying, presented with clarity and rigour.</p>
              </div>
            </>
          )}

          {activeAudience === 'organizations' && (
            <>
              <div className="rounded-3xl p-7 bg-white/[0.04] backdrop-blur-xl border border-white/10 hover:border-rose-400/40 transition-all">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-300 mb-4 border border-rose-500/30"><School className="w-5 h-5" /></div>
                <h4 className="text-lg font-bold text-white mb-2 font-display">Institutional Assessment Builder</h4>
                <p className="text-sm text-slate-300 leading-relaxed">Generate fully formatted examination papers with balanced cognitive-level coverage, point rubrics, and answer schemes ready for institutional deployment.</p>
              </div>
              <div className="rounded-3xl p-7 bg-white/[0.04] backdrop-blur-xl border border-white/10 hover:border-rose-400/40 transition-all">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-300 mb-4 border border-rose-500/30"><Cpu className="w-5 h-5" /></div>
                <h4 className="text-lg font-bold text-white mb-2 font-display">Scalable Question Bank Access</h4>
                <p className="text-sm text-slate-300 leading-relaxed">Search and curate from thousands of verified academic questions, filtered by standard, topic, and difficulty — ideal for curriculum committees and test designers.</p>
              </div>
              <div className="rounded-3xl p-7 bg-white/[0.04] backdrop-blur-xl border border-white/10 hover:border-rose-400/40 transition-all">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-300 mb-4 border border-rose-500/30"><GraduationCap className="w-5 h-5" /></div>
                <h4 className="text-lg font-bold text-white mb-2 font-display">K-12 to University Coverage</h4>
                <p className="text-sm text-slate-300 leading-relaxed">Full academic span from elementary numeracy to university-level calculus and linear algebra, unified under one platform for district-wide or multi-campus deployment.</p>
              </div>
            </>
          )}
        </div>
      </section>

    </div>
  );
};
