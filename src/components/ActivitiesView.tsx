import React, { useState } from 'react';
import { ActivityItem } from '../types';
import {
  Activity,
  Search,
  Sliders,
  Play,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Layers,
  HelpCircle,
  X,
  Plus,
  Minus
} from 'lucide-react';

const ACTIVITIES_DATA: ActivityItem[] = [
  {
    id: 'act-1',
    title: 'Fraction Strips & Visual Equivalence Lab',
    category: 'Arithmetic',
    gradeLevel: 'Grades 3-7',
    difficulty: 'Foundational',
    description: 'Compare fractional lengths using interactive parallel fraction tiles. Discover equivalent fractions (e.g. 2/4 = 1/2) and visualize common denominators.',
    learningOutcome: 'Understand fractional parts of a whole and visual equivalence.',
    durationMinutes: 15,
    toolType: 'fraction-strips'
  },
  {
    id: 'act-2',
    title: 'Algebra Balance Scale & Equation Balancer',
    category: 'Algebra',
    gradeLevel: 'Grades 6-9',
    difficulty: 'Intermediate',
    description: 'Solve one-step and two-step linear equations (e.g. 2x + 4 = 12) using a physical balance scale where maintaining equilibrium isolates x.',
    learningOutcome: 'Master the concept that operations must be applied equally to both sides of an equation.',
    durationMinutes: 20,
    toolType: 'algebra-balance'
  },
  {
    id: 'act-3',
    title: 'Coordinate Geometry & Slope Vector Plotter',
    category: 'Geometry',
    gradeLevel: 'Grades 8-11',
    difficulty: 'Intermediate',
    description: 'Plot coordinates on a dynamic Cartesian plane, drag control points, and observe real-time calculations of slope (m = Δy/Δx), distance, and midpoint.',
    learningOutcome: 'Internalize the geometric meaning of slope, intercept, and linear vectors.',
    durationMinutes: 25,
    toolType: 'coordinate-plane'
  },
  {
    id: 'act-4',
    title: 'Angle Explorer & Protractor Manipulative',
    category: 'Geometry',
    gradeLevel: 'Grades 4-8',
    difficulty: 'Foundational',
    description: 'Drag the rotating ray to generate angles from 0° to 360°. Classify acute, right, obtuse, reflex, and compute complementary and supplementary pairs.',
    learningOutcome: 'Accurately classify and calculate angle pairs and trigonometric rotations.',
    durationMinutes: 15,
    toolType: 'angle-protractor'
  },
  {
    id: 'act-5',
    title: 'Empirical Probability Multi-Trial Spinner',
    category: 'Probability',
    gradeLevel: 'Grades 6-12',
    difficulty: 'Intermediate',
    description: 'Spin a segmented probability wheel across 10 to 200 trials. Observe how experimental frequency converges toward theoretical expectation via Law of Large Numbers.',
    learningOutcome: 'Understand the difference between theoretical and experimental probability.',
    durationMinutes: 20,
    toolType: 'probability-spinner'
  },
  {
    id: 'act-6',
    title: 'Sieve of Eratosthenes Prime Explorer',
    category: 'Logic',
    gradeLevel: 'Grades 5-9',
    difficulty: 'Foundational',
    description: 'Systematically filter composites from 1 to 100 by eliminating multiples of 2, 3, 5, and 7 to discover the distribution of prime numbers.',
    learningOutcome: 'Appreciate fundamental theorem of arithmetic and prime distribution patterns.',
    durationMinutes: 15,
    toolType: 'prime-sieve'
  }
];

export const ActivitiesView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [activeActivity, setActiveActivity] = useState<ActivityItem | null>(null);

  // --- Interactive Manipulative States ---
  // 1. Fraction Strips
  const [stripFractions, setStripFractions] = useState<{ num: number; den: number }[]>([
    { num: 1, den: 2 },
    { num: 2, den: 4 },
    { num: 3, den: 6 }
  ]);

  // 2. Algebra Balance Scale (2x + b = c)
  const [balanceXCoeff, setBalanceXCoeff] = useState<number>(2);
  const [balanceConstLeft, setBalanceConstLeft] = useState<number>(4);
  const [balanceRight, setBalanceRight] = useState<number>(10);
  const [userGuessX, setUserGuessX] = useState<number>(3);

  // 3. Coordinate Plotter
  const [coordP1, setCoordP1] = useState<{ x: number; y: number }>({ x: 1, y: 2 });
  const [coordP2, setCoordP2] = useState<{ x: number; y: number }>({ x: 5, y: 6 });

  // 4. Angle Explorer
  const [angleVal, setAngleVal] = useState<number>(65);

  // 5. Probability Spinner
  const [spinnerResults, setSpinnerResults] = useState<{ red: number; blue: number; green: number; gold: number }>({
    red: 0,
    blue: 0,
    green: 0,
    gold: 0
  });
  const [totalSpins, setTotalSpins] = useState<number>(0);

  // 6. Prime Sieve
  const [eliminatedMultiples, setEliminatedMultiples] = useState<number[]>([]);

  // Filter activities
  const filteredActivities = ACTIVITIES_DATA.filter((act) => {
    const matchesSearch =
      act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || act.category === selectedCategory;
    const matchesDiff = selectedDifficulty === 'All' || act.difficulty === selectedDifficulty;
    return matchesSearch && matchesCat && matchesDiff;
  });

  const runSpinTrials = (trials: number) => {
    // 4 sectors: Red 40%, Blue 30%, Green 20%, Gold 10%
    const newResults = { ...spinnerResults };
    for (let i = 0; i < trials; i++) {
      const rand = Math.random();
      if (rand < 0.4) newResults.red++;
      else if (rand < 0.7) newResults.blue++;
      else if (rand < 0.9) newResults.green++;
      else newResults.gold++;
    }
    setSpinnerResults(newResults);
    setTotalSpins(totalSpins + trials);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
          <Activity className="w-4 h-4 text-emerald-300" />
          <span>Tactile Math Laboratories</span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight mt-1">
          Interactive Manipulatives & <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">Exploration</span>
        </h1>
        <p className="text-sm text-slate-300 mt-1 max-w-3xl">
          Transform abstract mathematical concepts into intuitive physical interactions. Balance algebraic scales, explore fractional equivalences, plot dynamic vectors, and simulate real-time probability.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-white/10 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search activities by title, category, or skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/70 border border-white/15 text-white placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <span>Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-lg border border-white/15 bg-slate-950/80 text-slate-200 text-xs focus:ring-1 focus:ring-emerald-400"
            >
              <option value="All">All Categories</option>
              <option value="Arithmetic">Arithmetic</option>
              <option value="Algebra">Algebra</option>
              <option value="Geometry">Geometry</option>
              <option value="Probability">Probability</option>
              <option value="Logic">Logic</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <span>Rigor:</span>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 rounded-lg border border-white/15 bg-slate-950/80 text-slate-200 text-xs focus:ring-1 focus:ring-emerald-400"
            >
              <option value="All">All Levels</option>
              <option value="Foundational">Foundational</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredActivities.map((act) => (
          <div
            key={act.id}
            className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-emerald-500/40 hover:shadow-[0_0_25px_rgba(16,185,129,0.18)] transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                  {act.category}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {act.durationMinutes} mins
                </span>
              </div>

              <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                {act.title}
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                {act.description}
              </p>

              <div className="mt-4 pt-3 border-t border-white/10 text-xs text-slate-400 space-y-1">
                <div><span className="font-semibold text-slate-200">Target Level:</span> {act.gradeLevel}</div>
                <div><span className="font-semibold text-slate-200">Outcome:</span> {act.learningOutcome}</div>
              </div>
            </div>

            <button
              onClick={() => setActiveActivity(act)}
              className="mt-6 w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-slate-950 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Launch Interactive Lab</span>
            </button>
          </div>
        ))}
      </div>

      {/* Modal / In-Page Interactive Manipulative Lab */}
      {activeActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in-50 duration-150">
          <div className="bg-slate-900/95 backdrop-blur-2xl rounded-3xl max-w-3xl w-full p-6 sm:p-8 border border-white/15 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6 text-slate-100">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                    {activeActivity.category}
                  </span>
                  <span className="text-xs text-slate-400">• {activeActivity.gradeLevel}</span>
                </div>
                <h3 className="text-xl font-bold text-white mt-1">
                  {activeActivity.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveActivity(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Interactive Manipulative Component Switcher */}
            <div className="p-4 sm:p-6 bg-slate-950/70 rounded-2xl border border-white/10 space-y-6">
              {/* 1. Fraction Strips Tool */}
              {activeActivity.toolType === 'fraction-strips' && (
                <div className="space-y-5">
                  <div className="text-xs text-slate-300">
                    Adjust numerator and denominator to compare the physical width of each strip:
                  </div>

                  <div className="space-y-3">
                    {stripFractions.map((f, idx) => {
                      const percentage = (f.num / f.den) * 100;
                      return (
                        <div key={idx} className="bg-white/[0.04] p-3.5 rounded-xl border border-white/10 space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-cyan-300 font-mono text-sm">
                              Strip #{idx + 1}: {f.num}/{f.den} ({percentage.toFixed(1)}%)
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-400 text-[11px]">Denom:</span>
                              <button
                                onClick={() => {
                                  const updated = [...stripFractions];
                                  if (updated[idx].den > 1) updated[idx].den--;
                                  setStripFractions(updated);
                                }}
                                className="w-5 h-5 bg-white/10 hover:bg-white/20 text-white rounded flex items-center justify-center font-bold"
                              >
                                -
                              </button>
                              <span className="font-mono text-white">{f.den}</span>
                              <button
                                onClick={() => {
                                  const updated = [...stripFractions];
                                  if (updated[idx].den < 12) updated[idx].den++;
                                  setStripFractions(updated);
                                }}
                                className="w-5 h-5 bg-white/10 hover:bg-white/20 text-white rounded flex items-center justify-center font-bold"
                              >
                                +
                              </button>

                              <span className="text-slate-400 text-[11px] ml-2">Num:</span>
                              <button
                                onClick={() => {
                                  const updated = [...stripFractions];
                                  if (updated[idx].num > 1) updated[idx].num--;
                                  setStripFractions(updated);
                                }}
                                className="w-5 h-5 bg-white/10 hover:bg-white/20 text-white rounded flex items-center justify-center font-bold"
                              >
                                -
                              </button>
                              <span className="font-mono text-white">{f.num}</span>
                              <button
                                onClick={() => {
                                  const updated = [...stripFractions];
                                  if (updated[idx].num < updated[idx].den) updated[idx].num++;
                                  setStripFractions(updated);
                                }}
                                className="w-5 h-5 bg-white/10 hover:bg-white/20 text-white rounded flex items-center justify-center font-bold"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Visual Segment Bar */}
                          <div className="h-7 w-full bg-slate-900 rounded-lg overflow-hidden border border-white/10 flex">
                            <div
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                              className="h-full bg-gradient-to-r from-teal-500 via-cyan-500 to-indigo-500 flex items-center justify-center text-slate-950 text-[11px] font-bold shadow-[0_0_15px_rgba(20,184,166,0.3)]"
                            >
                              {f.num}/{f.den}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-3 bg-teal-950/60 border border-teal-500/30 rounded-xl text-xs text-teal-200">
                    <strong>Discovery Tip:</strong> Notice that when 1/2 and 2/4 and 3/6 have equal percentage lengths (50%), they represent mathematically identical points on the real number line!
                  </div>
                </div>
              )}

              {/* 2. Algebra Balance Scale */}
              {activeActivity.toolType === 'algebra-balance' && (
                <div className="space-y-4">
                  <div className="text-center font-mono text-base font-bold text-white bg-white/[0.04] p-3 rounded-xl border border-white/10">
                    Equation: {balanceXCoeff}x + {balanceConstLeft} = {balanceRight}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-white/[0.04] p-4 rounded-xl border border-white/10">
                      <span className="text-xs text-slate-400 font-bold uppercase block mb-1">Left Pan Weight</span>
                      <div className="text-xl font-bold font-mono text-cyan-300">
                        {balanceXCoeff * userGuessX + balanceConstLeft}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        ({balanceXCoeff} × {userGuessX} + {balanceConstLeft})
                      </div>
                    </div>

                    <div className="bg-white/[0.04] p-4 rounded-xl border border-white/10">
                      <span className="text-xs text-slate-400 font-bold uppercase block mb-1">Right Pan Weight</span>
                      <div className="text-xl font-bold font-mono text-emerald-400">
                        {balanceRight}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        (Target Equilibrium)
                      </div>
                    </div>
                  </div>

                  {/* Balance Status */}
                  <div className="text-center py-3">
                    {balanceXCoeff * userGuessX + balanceConstLeft === balanceRight ? (
                      <div className="inline-flex items-center gap-2 text-emerald-300 bg-emerald-950/60 px-4 py-2 rounded-xl text-sm font-bold border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Perfect Equilibrium! x = {userGuessX} solves the equation.</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 text-amber-300 bg-amber-950/60 px-4 py-2 rounded-xl text-xs font-semibold border border-amber-500/40">
                        <span>The scale is tilted! Adjust x to level the pans.</span>
                      </div>
                    )}
                  </div>

                  {/* Guess slider */}
                  <div className="bg-white/[0.04] p-4 rounded-xl border border-white/10 space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-300">
                      <span>Test value for x:</span>
                      <span className="font-mono text-base text-cyan-300 font-bold">{userGuessX}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={userGuessX}
                      onChange={(e) => setUserGuessX(Number(e.target.value))}
                      className="w-full accent-cyan-400"
                    />
                  </div>
                </div>
              )}

              {/* 3. Coordinate Plane Plotter */}
              {activeActivity.toolType === 'coordinate-plane' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/[0.04] p-3 rounded-xl border border-white/10 text-xs space-y-2">
                      <div className="font-bold text-cyan-300">Point 1 (P1): ({coordP1.x}, {coordP1.y})</div>
                      <div className="flex gap-2">
                        <label className="text-slate-300">x: <input type="number" value={coordP1.x} onChange={(e) => setCoordP1({ ...coordP1, x: Number(e.target.value) })} className="w-12 bg-slate-900 border border-white/15 p-1 rounded font-mono text-white" /></label>
                        <label className="text-slate-300">y: <input type="number" value={coordP1.y} onChange={(e) => setCoordP1({ ...coordP1, y: Number(e.target.value) })} className="w-12 bg-slate-900 border border-white/15 p-1 rounded font-mono text-white" /></label>
                      </div>
                    </div>
                    <div className="bg-white/[0.04] p-3 rounded-xl border border-white/10 text-xs space-y-2">
                      <div className="font-bold text-emerald-400">Point 2 (P2): ({coordP2.x}, {coordP2.y})</div>
                      <div className="flex gap-2">
                        <label className="text-slate-300">x: <input type="number" value={coordP2.x} onChange={(e) => setCoordP2({ ...coordP2, x: Number(e.target.value) })} className="w-12 bg-slate-900 border border-white/15 p-1 rounded font-mono text-white" /></label>
                        <label className="text-slate-300">y: <input type="number" value={coordP2.y} onChange={(e) => setCoordP2({ ...coordP2, y: Number(e.target.value) })} className="w-12 bg-slate-900 border border-white/15 p-1 rounded font-mono text-white" /></label>
                      </div>
                    </div>
                  </div>

                  {/* Calculations */}
                  {(() => {
                    const dx = coordP2.x - coordP1.x;
                    const dy = coordP2.y - coordP1.y;
                    const slope = dx !== 0 ? (dy / dx).toFixed(2) : 'Undefined (Vertical)';
                    const dist = Math.sqrt(dx * dx + dy * dy).toFixed(2);
                    const midX = ((coordP1.x + coordP2.x) / 2).toFixed(1);
                    const midY = ((coordP1.y + coordP2.y) / 2).toFixed(1);
                    return (
                      <div className="p-4 bg-white/[0.04] rounded-xl border border-white/10 grid grid-cols-3 gap-2 text-center text-xs">
                        <div>
                          <span className="text-slate-400 block mb-0.5">Slope (m = Δy/Δx)</span>
                          <span className="font-mono font-bold text-white text-sm">{slope}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block mb-0.5">Euclidean Distance</span>
                          <span className="font-mono font-bold text-teal-300 text-sm">{dist} units</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block mb-0.5">Midpoint</span>
                          <span className="font-mono font-bold text-cyan-300 text-sm">({midX}, {midY})</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* 4. Angle Explorer */}
              {activeActivity.toolType === 'angle-protractor' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                    <span>Rotational Angle θ:</span>
                    <span className="font-mono text-lg text-emerald-400">{angleVal}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={angleVal}
                    onChange={(e) => setAngleVal(Number(e.target.value))}
                    className="w-full accent-emerald-400"
                  />

                  {/* Visual classification card */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                    <div className="bg-white/[0.04] p-3 rounded-xl border border-white/10">
                      <span className="text-slate-400 block mb-1">Classification</span>
                      <span className="font-bold text-white">
                        {angleVal < 90
                          ? 'Acute'
                          : angleVal === 90
                          ? 'Right Angle'
                          : angleVal < 180
                          ? 'Obtuse'
                          : angleVal === 180
                          ? 'Straight'
                          : 'Reflex'}
                      </span>
                    </div>
                    <div className="bg-white/[0.04] p-3 rounded-xl border border-white/10">
                      <span className="text-slate-400 block mb-1">Complementary</span>
                      <span className="font-mono font-bold text-cyan-300">
                        {angleVal <= 90 ? `${90 - angleVal}°` : 'None (>90°)'}
                      </span>
                    </div>
                    <div className="bg-white/[0.04] p-3 rounded-xl border border-white/10">
                      <span className="text-slate-400 block mb-1">Supplementary</span>
                      <span className="font-mono font-bold text-teal-300">
                        {angleVal <= 180 ? `${180 - angleVal}°` : 'None (>180°)'}
                      </span>
                    </div>
                    <div className="bg-white/[0.04] p-3 rounded-xl border border-white/10">
                      <span className="text-slate-400 block mb-1">Radians (rad)</span>
                      <span className="font-mono font-bold text-amber-300">
                        {((angleVal * Math.PI) / 180).toFixed(3)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. Probability Spinner */}
              {activeActivity.toolType === 'probability-spinner' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">Theoretical: Red 40%, Blue 30%, Green 20%, Gold 10%</span>
                    <span className="font-bold text-white">Total Trials: {totalSpins}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                    <div className="bg-rose-950/60 p-3 rounded-xl border border-rose-500/30">
                      <div className="font-bold text-rose-300">Red (40%)</div>
                      <div className="text-lg font-mono font-bold text-rose-200">{spinnerResults.red}</div>
                      <div className="text-[10px] text-rose-400">
                        {totalSpins > 0 ? ((spinnerResults.red / totalSpins) * 100).toFixed(1) : 0}%
                      </div>
                    </div>
                    <div className="bg-blue-950/60 p-3 rounded-xl border border-blue-500/30">
                      <div className="font-bold text-blue-300">Blue (30%)</div>
                      <div className="text-lg font-mono font-bold text-blue-200">{spinnerResults.blue}</div>
                      <div className="text-[10px] text-blue-400">
                        {totalSpins > 0 ? ((spinnerResults.blue / totalSpins) * 100).toFixed(1) : 0}%
                      </div>
                    </div>
                    <div className="bg-emerald-950/60 p-3 rounded-xl border border-emerald-500/30">
                      <div className="font-bold text-emerald-300">Green (20%)</div>
                      <div className="text-lg font-mono font-bold text-emerald-200">{spinnerResults.green}</div>
                      <div className="text-[10px] text-emerald-400">
                        {totalSpins > 0 ? ((spinnerResults.green / totalSpins) * 100).toFixed(1) : 0}%
                      </div>
                    </div>
                    <div className="bg-amber-950/60 p-3 rounded-xl border border-amber-500/30">
                      <div className="font-bold text-amber-300">Gold (10%)</div>
                      <div className="text-lg font-mono font-bold text-amber-200">{spinnerResults.gold}</div>
                      <div className="text-[10px] text-amber-400">
                        {totalSpins > 0 ? ((spinnerResults.gold / totalSpins) * 100).toFixed(1) : 0}%
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <button
                      onClick={() => runSpinTrials(1)}
                      className="px-3.5 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 rounded-lg text-xs font-bold hover:opacity-95"
                    >
                      +1 Spin
                    </button>
                    <button
                      onClick={() => runSpinTrials(10)}
                      className="px-3.5 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 rounded-lg text-xs font-bold hover:opacity-95"
                    >
                      +10 Spins
                    </button>
                    <button
                      onClick={() => runSpinTrials(50)}
                      className="px-3.5 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 rounded-lg text-xs font-bold hover:opacity-95"
                    >
                      +50 Spins
                    </button>
                    <button
                      onClick={() => {
                        setSpinnerResults({ red: 0, blue: 0, green: 0, gold: 0 });
                        setTotalSpins(0);
                      }}
                      className="px-3 py-2 bg-white/10 text-slate-300 rounded-lg text-xs font-semibold hover:bg-white/20 ml-auto"
                    >
                      Reset Trials
                    </button>
                  </div>
                </div>
              )}

              {/* 6. Prime Sieve */}
              {activeActivity.toolType === 'prime-sieve' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-slate-300">Filter composite multiples:</span>
                    <div className="flex gap-1.5">
                      {[2, 3, 5, 7].map((p) => {
                        const isEliminated = eliminatedMultiples.includes(p);
                        return (
                          <button
                            key={p}
                            onClick={() => {
                              if (isEliminated) {
                                setEliminatedMultiples(eliminatedMultiples.filter((x) => x !== p));
                              } else {
                                setEliminatedMultiples([...eliminatedMultiples, p]);
                              }
                            }}
                            className={`px-3 py-1 rounded-lg font-mono font-bold border transition-colors ${
                              isEliminated
                                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 border-teal-400'
                                : 'bg-white/5 text-slate-300 border-white/15 hover:bg-white/10'
                            }`}
                          >
                            Eliminate Multiples of {p}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Grid 1 to 50 preview */}
                  <div className="grid grid-cols-10 gap-1.5 p-3 bg-slate-900 rounded-xl border border-white/10 font-mono text-xs text-center">
                    {Array.from({ length: 50 }, (_, i) => i + 1).map((n) => {
                      const isOne = n === 1;
                      const isComposite = eliminatedMultiples.some((p) => n !== p && n % p === 0);
                      return (
                        <div
                          key={n}
                          className={`p-1.5 rounded text-[11px] font-semibold ${
                            isOne
                              ? 'bg-white/5 text-slate-500'
                              : isComposite
                              ? 'bg-rose-950/40 text-rose-400/50 line-through'
                              : 'bg-emerald-950/60 text-emerald-300 font-bold border border-emerald-500/40'
                          }`}
                        >
                          {n}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setActiveActivity(null)}
                className="px-5 py-2.5 bg-white/10 text-white rounded-xl text-xs font-semibold hover:bg-white/20 transition-colors"
              >
                Close Manipulative
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
