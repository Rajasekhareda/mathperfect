import React, { useState, useEffect, useRef } from 'react';
import { SimulationItem } from '../types';
import {
  Layers,
  Play,
  RotateCcw,
  Sliders,
  Sparkles,
  BookOpen,
  HelpCircle,
  TrendingUp,
  Maximize2
} from 'lucide-react';

const SIMULATIONS_DATA: SimulationItem[] = [
  {
    id: 'sim-calc',
    title: 'Differential Calculus: Tangent Slope & Instantaneous Rate of Change',
    category: 'Calculus',
    description: 'Investigate how the secant line between (x, f(x)) and (x+h, f(x+h)) converges into the exact tangent line as h → 0. Discover the geometric definition of the derivative.',
    theoreticalConcept: 'f\'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}',
    interactiveFeatures: ['Adjust point x', 'Shrink delta h towards 0', 'Toggle tangent line', 'View derivative graph'],
    simType: 'calculus-derivative'
  },
  {
    id: 'sim-pythagoras',
    title: 'Pythagorean Theorem: Geometric Square Conservation Proof',
    category: 'Geometry',
    description: 'Manipulate right triangle legs a and b to dynamically observe how the geometric area of the squares on legs (a² + b²) perfectly conserves into the square on the hypotenuse c².',
    theoreticalConcept: 'a^2 + b^2 = c^2 \\implies c = \\sqrt{a^2 + b^2}',
    interactiveFeatures: ['Vary leg length a', 'Vary leg length b', 'Compute exact hypotenuse', 'Live area balance breakdown'],
    simType: 'pythagoras-visual'
  },
  {
    id: 'sim-unit-circle',
    title: 'Trigonometric Unit Circle & Continuous Sine Wave Unfolder',
    category: 'Trigonometry',
    description: 'Rotate the unit radial vector on the coordinate circle and watch the vertical sine projection trace out the continuous sinusoidal wave across angles in radians and degrees.',
    theoreticalConcept: '(x, y) = (\\cos \\theta, \\sin \\theta), \\quad \\tan \\theta = \\frac{\\sin \\theta}{\\cos \\theta}',
    interactiveFeatures: ['Rotate angle θ', 'Inspect cos/sin/tan values', 'Real-time wave generator', 'Special angles snapping'],
    simType: 'unit-circle'
  },
  {
    id: 'sim-monte-carlo',
    title: 'Monte Carlo Method: Stochastic Estimation of Pi (π)',
    category: 'Statistics',
    description: 'Sample thousands of uniform random coordinates (x, y) within a unit square. By computing the proportion of points falling inside the inscribed quarter circle, estimate π.',
    theoreticalConcept: '\\frac{Area(Circle)}{Area(Square)} = \\frac{\\pi r^2}{4 r^2} = \\frac{\\pi}{4} \\implies \\pi \\approx 4 \\times \\frac{N_{inside}}{N_{total}}',
    interactiveFeatures: ['Add batch of random points', 'Real-time π convergence', 'Absolute error tracking', 'Speed controls'],
    simType: 'monte-carlo-pi'
  }
];

export const SimulationsView: React.FC = () => {
  const [selectedSim, setSelectedSim] = useState<SimulationItem>(SIMULATIONS_DATA[0]);

  // 1. Calculus State
  const [calcX0, setCalcX0] = useState<number>(1.5);
  const [calcH, setCalcH] = useState<number>(0.8);

  // 2. Pythagoras State
  const [pythA, setPythA] = useState<number>(3);
  const [pythB, setPythB] = useState<number>(4);

  // 3. Unit Circle State
  const [circleAngle, setCircleAngle] = useState<number>(45);

  // 4. Monte Carlo State
  const [mcPoints, setMcPoints] = useState<{ x: number; y: number; inside: boolean }[]>([]);
  const [mcInside, setMcInside] = useState<number>(0);
  const [mcTotal, setMcTotal] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Run Monte Carlo batch
  const addMonteCarloPoints = (count: number) => {
    let newInside = mcInside;
    const newPoints = [...mcPoints];
    for (let i = 0; i < count; i++) {
      const x = Math.random();
      const y = Math.random();
      const inside = x * x + y * y <= 1.0;
      if (inside) newInside++;
      if (newPoints.length < 500) {
        newPoints.push({ x, y, inside });
      }
    }
    setMcPoints(newPoints);
    setMcInside(newInside);
    setMcTotal(mcTotal + count);
  };

  const resetMonteCarlo = () => {
    setMcPoints([]);
    setMcInside(0);
    setMcTotal(0);
  };

  // Canvas drawing for Calculus Sim
  useEffect(() => {
    if (selectedSim.simType !== 'calculus-derivative' || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Coordinate mapping: center origin at (width * 0.2, height * 0.8)
    const originX = width * 0.25;
    const originY = height * 0.75;
    const scale = 50;

    // Grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += scale) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += scale) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(width, originY);
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, height);
    ctx.stroke();

    // Function f(x) = 0.5 * x^2
    const f = (x: number) => 0.5 * x * x;
    const df = (x: number) => x;

    // Draw curve
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let px = 0; px < width; px += 2) {
      const xVal = (px - originX) / scale;
      const yVal = f(xVal);
      const py = originY - yVal * scale;
      if (px === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Point P(x0, f(x0))
    const pX = originX + calcX0 * scale;
    const pY = originY - f(calcX0) * scale;
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(pX, pY, 6, 0, 2 * Math.PI);
    ctx.fill();

    // Point Q(x0 + h, f(x0 + h))
    const qX0 = calcX0 + calcH;
    const qX = originX + qX0 * scale;
    const qY = originY - f(qX0) * scale;
    ctx.fillStyle = '#34d399';
    ctx.beginPath();
    ctx.arc(qX, qY, 5, 0, 2 * Math.PI);
    ctx.fill();

    // Secant Line
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    const secantSlope = (f(qX0) - f(calcX0)) / calcH;
    const xLeft = (0 - originX) / scale;
    const xRight = (width - originX) / scale;
    ctx.moveTo(0, originY - (f(calcX0) + secantSlope * (xLeft - calcX0)) * scale);
    ctx.lineTo(width, originY - (f(calcX0) + secantSlope * (xRight - calcX0)) * scale);
    ctx.stroke();
    ctx.setLineDash([]);

    // True Tangent Line
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const tanSlope = df(calcX0);
    ctx.moveTo(0, originY - (f(calcX0) + tanSlope * (xLeft - calcX0)) * scale);
    ctx.lineTo(width, originY - (f(calcX0) + tanSlope * (xRight - calcX0)) * scale);
    ctx.stroke();
  }, [calcX0, calcH, selectedSim]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-wider">
          <Layers className="w-4 h-4 text-sky-300" />
          <span>Interactive Modeling Laboratories</span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight mt-1">
          Dynamic Simulations & <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-teal-300 to-indigo-300">Physics Lab</span>
        </h1>
        <p className="text-sm text-slate-300 mt-1 max-w-3xl">
          Observe abstract mathematical formulas come alive with live coordinate canvases, geometric conservation demonstrations, and stochastic convergence engines.
        </p>
      </div>

      {/* Simulation Selector Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {SIMULATIONS_DATA.map((sim) => {
          const isSelected = selectedSim.id === sim.id;
          return (
            <button
              key={sim.id}
              onClick={() => setSelectedSim(sim)}
              aria-selected={isSelected}
              data-selected={isSelected}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-800/90 border-sky-400 text-white font-semibold ring-1 ring-sky-400/40 shadow-[0_0_25px_rgba(56,189,248,0.4)]'
                  : 'bg-slate-900/80 backdrop-blur-xl border-white/10 text-slate-300 hover:bg-slate-800/60 hover:text-white hover:border-sky-400/30'
              }`}
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-950/60 text-sky-300 border border-sky-500/30">
                  {sim.category}
                </span>
                <h4 className="text-sm font-bold text-white mt-2 line-clamp-2">
                  {sim.title}
                </h4>
              </div>
              <div className="mt-3 text-[11px] text-sky-400 font-semibold flex items-center gap-1">
                <span>{isSelected ? 'Active Lab' : 'Launch Simulation'}</span>
                <Play className="w-3 h-3 fill-sky-400" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Simulation Lab Workspace */}
      <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-8 text-slate-200">
        {/* Lab Top Info */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sky-950/60 text-sky-300 border border-sky-500/30">
                {selectedSim.category}
              </span>
              <span className="text-xs text-slate-400 font-medium">Real-Time Interactive Lab</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              {selectedSim.title}
            </h2>
          </div>

          <div className="p-3 bg-slate-950/80 border border-white/10 rounded-xl font-mono text-xs text-sky-300">
            <span className="text-slate-400 block text-[10px] uppercase font-sans font-bold">Governing Formula</span>
            {selectedSim.theoreticalConcept}
          </div>
        </div>

        {/* 1. Calculus Tangent Sim */}
        {selectedSim.simType === 'calculus-derivative' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 bg-slate-950/70 rounded-2xl p-4 border border-white/10">
              <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
                <span>Curve: f(x) = 0.5x²</span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <span className="w-3 h-0.5 bg-emerald-400"></span> Secant Line (h = {calcH.toFixed(2)})
                  </span>
                  <span className="flex items-center gap-1 text-rose-400 font-semibold">
                    <span className="w-3 h-0.5 bg-rose-400"></span> True Tangent Line
                  </span>
                </div>
              </div>
              <canvas
                ref={canvasRef}
                width={600}
                height={360}
                className="w-full h-80 bg-slate-950 rounded-xl border border-white/10 shadow-inner"
              />
            </div>

            <div className="lg:col-span-4 space-y-5">
              <div className="bg-slate-950/70 p-5 rounded-2xl border border-white/10 space-y-4 text-xs">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  <span>Control Parameters</span>
                </h4>

                <div>
                  <div className="flex justify-between text-slate-300 font-medium mb-1">
                    <span>Target Point x₀:</span>
                    <span className="font-mono font-bold text-sky-400">{calcX0.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="3.5"
                    step="0.1"
                    value={calcX0}
                    onChange={(e) => setCalcX0(Number(e.target.value))}
                    className="w-full accent-sky-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 font-medium mb-1">
                    <span>Step Increment Δh:</span>
                    <span className="font-mono font-bold text-emerald-400">{calcH.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="2.0"
                    step="0.05"
                    value={calcH}
                    onChange={(e) => setCalcH(Number(e.target.value))}
                    className="w-full accent-emerald-400"
                  />
                </div>

                {/* Mathematical Convergence Comparison */}
                {(() => {
                  const f = (x: number) => 0.5 * x * x;
                  const secantSlope = (f(calcX0 + calcH) - f(calcX0)) / calcH;
                  const trueSlope = calcX0; // f'(x) = x
                  const error = Math.abs(secantSlope - trueSlope);
                  return (
                    <div className="p-3 bg-white/[0.04] rounded-xl border border-white/10 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Secant Slope [Δy/Δh]:</span>
                        <span className="font-mono font-bold text-emerald-400">{secantSlope.toFixed(4)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">True Derivative f'(x₀):</span>
                        <span className="font-mono font-bold text-rose-400">{trueSlope.toFixed(4)}</span>
                      </div>
                      <div className="flex justify-between border-t border-white/10 pt-1 text-[11px]">
                        <span className="text-slate-400">Limit Discrepancy:</span>
                        <span className="font-mono text-cyan-300">{error.toFixed(4)}</span>
                      </div>
                    </div>
                  );
                })()}

                <button
                  onClick={() => setCalcH(0.05)}
                  className="w-full py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 rounded-xl font-bold transition-all text-xs flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(20,184,166,0.3)]"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Snap h → 0 (Instant Convergence)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. Pythagoras Geometric Proof Sim */}
        {selectedSim.simType === 'pythagoras-visual' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-slate-950/70 p-5 rounded-2xl border border-white/10 space-y-4">
                <h4 className="font-bold text-white text-sm">Configure Triangle Legs</h4>
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                    <span>Leg a:</span>
                    <span className="font-mono text-cyan-400">{pythA} units</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={pythA}
                    onChange={(e) => setPythA(Number(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                    <span>Leg b:</span>
                    <span className="font-mono text-emerald-400">{pythB} units</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={pythB}
                    onChange={(e) => setPythB(Number(e.target.value))}
                    className="w-full accent-emerald-400"
                  />
                </div>

                <div className="pt-2 border-t border-white/10 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Square Area a²:</span>
                    <span className="font-mono font-bold text-cyan-300">{pythA * pythA} sq units</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Square Area b²:</span>
                    <span className="font-mono font-bold text-emerald-400">{pythB * pythB} sq units</span>
                  </div>
                  <div className="flex justify-between font-bold text-white border-t border-white/10 pt-1">
                    <span>Hypotenuse Area c²:</span>
                    <span className="font-mono text-rose-400">{pythA * pythA + pythB * pythB} sq units</span>
                  </div>
                  <div className="flex justify-between font-bold text-white">
                    <span>Length c = √(a² + b²):</span>
                    <span className="font-mono text-rose-400">{Math.sqrt(pythA * pythA + pythB * pythB).toFixed(2)} units</span>
                  </div>
                </div>
              </div>

              {/* Visual geometric area representation */}
              <div className="lg:col-span-2 bg-slate-950/70 rounded-2xl p-6 border border-white/10 flex flex-col justify-center items-center">
                <div className="flex flex-wrap items-center justify-center gap-6">
                  {/* Square a */}
                  <div className="text-center">
                    <div
                      style={{ width: `${pythA * 18}px`, height: `${pythA * 18}px` }}
                      className="bg-cyan-500/20 border-2 border-cyan-400 rounded-lg flex items-center justify-center font-mono font-bold text-cyan-300 mx-auto transition-all"
                    >
                      a² = {pythA * pythA}
                    </div>
                    <span className="text-xs text-slate-400 mt-1 block">Leg a ({pythA})</span>
                  </div>

                  <span className="text-2xl font-bold text-slate-400">+</span>

                  {/* Square b */}
                  <div className="text-center">
                    <div
                      style={{ width: `${pythB * 18}px`, height: `${pythB * 18}px` }}
                      className="bg-emerald-500/20 border-2 border-emerald-400 rounded-lg flex items-center justify-center font-mono font-bold text-emerald-300 mx-auto transition-all"
                    >
                      b² = {pythB * pythB}
                    </div>
                    <span className="text-xs text-slate-400 mt-1 block">Leg b ({pythB})</span>
                  </div>

                  <span className="text-2xl font-bold text-slate-400">=</span>

                  {/* Square c */}
                  <div className="text-center">
                    <div
                      style={{
                        width: `${Math.sqrt(pythA * pythA + pythB * pythB) * 18}px`,
                        height: `${Math.sqrt(pythA * pythA + pythB * pythB) * 18}px`
                      }}
                      className="bg-rose-500/20 border-2 border-rose-400 rounded-lg flex items-center justify-center font-mono font-bold text-rose-300 mx-auto transition-all"
                    >
                      c² = {pythA * pythA + pythB * pythB}
                    </div>
                    <span className="text-xs text-slate-400 mt-1 block">Hypotenuse c ({Math.sqrt(pythA * pythA + pythB * pythB).toFixed(1)})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. Unit Circle Sim */}
        {selectedSim.simType === 'unit-circle' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 bg-slate-950/70 p-6 rounded-2xl border border-white/10 flex flex-col items-center justify-center relative min-h-[340px]">
                {/* SVG Unit Circle */}
                <svg width="280" height="280" viewBox="-140 -140 280 280" className="bg-slate-900 rounded-2xl shadow-inner border border-white/10">
                  {/* Axes */}
                  <line x1="-130" y1="0" x2="130" y2="0" stroke="#334155" strokeWidth="1.5" />
                  <line x1="0" y1="-130" x2="0" y2="130" stroke="#334155" strokeWidth="1.5" />

                  {/* Circle */}
                  <circle cx="0" cy="0" r="100" fill="none" stroke="#64748b" strokeWidth="2" />

                  {/* Radial vector */}
                  {(() => {
                    const rad = (circleAngle * Math.PI) / 180;
                    const px = 100 * Math.cos(rad);
                    const py = -100 * Math.sin(rad); // invert for SVG
                    return (
                      <>
                        {/* Cosine projection (horizontal) */}
                        <line x1="0" y1="0" x2={px} y2="0" stroke="#38bdf8" strokeWidth="3" />
                        {/* Sine projection (vertical) */}
                        <line x1={px} y1="0" x2={px} y2={py} stroke="#34d399" strokeWidth="3" strokeDasharray="3 3" />
                        {/* Hypotenuse radius */}
                        <line x1="0" y1="0" x2={px} y2={py} stroke="#818cf8" strokeWidth="2.5" />
                        <circle cx={px} cy={py} r="5" fill="#f43f5e" />
                      </>
                    );
                  })()}
                </svg>
              </div>

              <div className="lg:col-span-4 space-y-4">
                <div className="bg-slate-950/70 p-5 rounded-2xl border border-white/10 space-y-4 text-xs">
                  <div className="flex justify-between text-slate-300 font-bold">
                    <span>Angle θ (Degrees):</span>
                    <span className="font-mono text-base text-cyan-400">{circleAngle}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={circleAngle}
                    onChange={(e) => setCircleAngle(Number(e.target.value))}
                    className="w-full accent-cyan-400"
                  />

                  {/* Quick Preset Buttons */}
                  <div className="grid grid-cols-4 gap-1.5 pt-1">
                    {[0, 30, 45, 60, 90, 180, 270, 360].map((deg) => (
                      <button
                        key={deg}
                        onClick={() => setCircleAngle(deg)}
                        className={`py-1 rounded text-[11px] font-mono font-bold border transition-colors ${
                          circleAngle === deg ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 border-teal-400' : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {deg}°
                      </button>
                    ))}
                  </div>

                  {(() => {
                    const rad = (circleAngle * Math.PI) / 180;
                    const sin = Math.sin(rad).toFixed(3);
                    const cos = Math.cos(rad).toFixed(3);
                    const tan = Math.abs(Math.cos(rad)) < 0.001 ? 'Undefined' : Math.tan(rad).toFixed(3);
                    return (
                      <div className="space-y-2 pt-3 border-t border-white/10">
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-medium">Radians (rad):</span>
                          <span className="font-mono font-bold text-white">{rad.toFixed(3)} rad</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sky-400 font-bold">cos θ (x-coordinate):</span>
                          <span className="font-mono font-bold text-sky-300">{cos}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-emerald-400 font-bold">sin θ (y-coordinate):</span>
                          <span className="font-mono font-bold text-emerald-300">{sin}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-indigo-400 font-bold">tan θ (slope):</span>
                          <span className="font-mono font-bold text-indigo-300">{tan}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. Monte Carlo Pi Sim */}
        {selectedSim.simType === 'monte-carlo-pi' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 bg-slate-950/70 p-6 rounded-2xl border border-white/10 flex flex-col items-center justify-center">
                <div className="relative w-64 h-64 bg-slate-900 rounded-2xl border-2 border-white/15 overflow-hidden shadow-inner">
                  {/* Inscribed Quarter Circle Arc */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                    <path d="M 0 100 A 100 100 0 0 0 100 0 L 0 0 Z" fill="rgba(56, 189, 248, 0.15)" stroke="#38bdf8" strokeWidth="1.5" />
                  </svg>
                  {/* Points */}
                  {mcPoints.map((pt, i) => (
                    <div
                      key={i}
                      style={{ left: `${pt.x * 100}%`, top: `${(1 - pt.y) * 100}%` }}
                      className={`absolute w-1.5 h-1.5 rounded-full transform -translate-x-1/2 -translate-y-1/2 ${
                        pt.inside ? 'bg-cyan-400' : 'bg-rose-500'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="lg:col-span-4 space-y-4">
                <div className="bg-slate-950/70 p-5 rounded-2xl border border-white/10 space-y-4 text-xs">
                  <h4 className="font-bold text-white text-sm">Stochastic Statistics</h4>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Points Inside Circle:</span>
                      <span className="font-mono font-bold text-cyan-400">{mcInside}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Random Darts:</span>
                      <span className="font-mono font-bold text-white">{mcTotal}</span>
                    </div>
                    <div className="flex justify-between border-t border-white/10 pt-2 font-bold text-sm">
                      <span className="text-white">Estimated π:</span>
                      <span className="font-mono text-cyan-300">
                        {mcTotal > 0 ? ((4 * mcInside) / mcTotal).toFixed(4) : '0.0000'}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Exact Constant π:</span>
                      <span className="font-mono text-slate-300">3.14159...</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Error Percentage:</span>
                      <span className="font-mono text-rose-400">
                        {mcTotal > 0
                          ? `${Math.abs((((4 * mcInside) / mcTotal - Math.PI) / Math.PI) * 100).toFixed(2)}%`
                          : 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => addMonteCarloPoints(100)}
                        className="flex-1 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 rounded-xl font-bold hover:opacity-95 text-xs shadow-[0_0_12px_rgba(20,184,166,0.3)]"
                      >
                        +100 Darts
                      </button>
                      <button
                        onClick={() => addMonteCarloPoints(1000)}
                        className="flex-1 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 rounded-xl font-bold hover:opacity-95 text-xs shadow-[0_0_12px_rgba(20,184,166,0.3)]"
                      >
                        +1,000 Darts
                      </button>
                    </div>
                    <button
                      onClick={resetMonteCarlo}
                      className="w-full py-2 bg-white/10 text-slate-300 rounded-xl font-semibold hover:bg-white/20 text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Experiment</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
