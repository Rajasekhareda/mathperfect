import React, { useState } from 'react';
import { SolverResult } from '../types';
import {
  Calculator,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  BookOpen,
  RotateCcw,
  Zap
} from 'lucide-react';

export const SolversView: React.FC = () => {
  const [solverType, setSolverType] = useState<'quadratic' | 'linearSystem' | 'polynomialCalculus' | 'fraction'>('quadratic');

  // Quadratic inputs: ax² + bx + c = 0
  const [quadA, setQuadA] = useState<string>('1');
  const [quadB, setQuadB] = useState<string>('-5');
  const [quadC, setQuadC] = useState<string>('6');

  // Linear system inputs: a1 x + b1 y = c1; a2 x + b2 y = c2
  const [linA1, setLinA1] = useState<string>('2');
  const [linB1, setLinB1] = useState<string>('3');
  const [linC1, setLinC1] = useState<string>('12');
  const [linA2, setLinA2] = useState<string>('1');
  const [linB2, setLinB2] = useState<string>('-1');
  const [linC2, setLinC2] = useState<string>('1');

  // Calculus inputs
  const [calcCoeffs, setCalcCoeffs] = useState<string>('3, 2, -5, 4');

  // Fraction inputs: n1/d1 op n2/d2
  const [fracN1, setFracN1] = useState<string>('3');
  const [fracD1, setFracD1] = useState<string>('4');
  const [fracOp, setFracOp] = useState<string>('+');
  const [fracN2, setFracN2] = useState<string>('2');
  const [fracD2, setFracD2] = useState<string>('5');

  // Solution state
  const [isSolving, setIsSolving] = useState<boolean>(false);
  const [result, setResult] = useState<SolverResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSolve = async () => {
    setIsSolving(true);
    setErrorMessage(null);
    try {
      let params: Record<string, any> = {};

      if (solverType === 'quadratic') {
        params = { a: quadA, b: quadB, c: quadC };
      } else if (solverType === 'linearSystem') {
        params = {
          a1: linA1,
          b1: linB1,
          c1: linC1,
          a2: linA2,
          b2: linB2,
          c2: linC2
        };
      } else if (solverType === 'polynomialCalculus') {
        params = { coefficients: calcCoeffs };
      } else if (solverType === 'fraction') {
        params = {
          n1: fracN1,
          d1: fracD1,
          op: fracOp,
          n2: fracN2,
          d2: fracD2
        };
      }

      const res = await fetch('/api/solvers/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: solverType, params })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server returned error ${res.status}`);
      }

      const data = await res.json();
      if (data.result) {
        setResult(data.result);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to solve problem.');
    } finally {
      setIsSolving(false);
    }
  };

  // Load sample problems
  const loadPreset = (preset: string) => {
    if (solverType === 'quadratic') {
      if (preset === '1') { setQuadA('1'); setQuadB('-5'); setQuadC('6'); }
      if (preset === '2') { setQuadA('2'); setQuadB('4'); setQuadC('-6'); }
      if (preset === '3') { setQuadA('1'); setQuadB('-4'); setQuadC('4'); }
    } else if (solverType === 'linearSystem') {
      if (preset === '1') {
        setLinA1('2'); setLinB1('3'); setLinC1('12');
        setLinA2('1'); setLinB2('-1'); setLinC2('1');
      } else if (preset === '2') {
        setLinA1('5'); setLinB1('-2'); setLinC1('19');
        setLinA2('3'); setLinB2('4'); setLinC2('6');
      }
    } else if (solverType === 'polynomialCalculus') {
      if (preset === '1') setCalcCoeffs('4, 0, -3, 7');
      if (preset === '2') setCalcCoeffs('1, -6, 11, -6');
    } else if (solverType === 'fraction') {
      if (preset === '1') { setFracN1('5'); setFracD1('6'); setFracOp('-'); setFracN2('1'); setFracD2('4'); }
      if (preset === '2') { setFracN1('3'); setFracD1('7'); setFracOp('*'); setFracN2('14'); setFracD2('9'); }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
          <Calculator className="w-4 h-4 text-amber-300" />
          <span>Symbolic Computation Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight mt-1">
          Step-by-Step <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-300 to-rose-300">Math Solvers</span>
        </h1>
        <p className="text-sm text-slate-300 mt-1 max-w-3xl">
          Deconstruct algebraic equations, systems of linear matrices, calculus polynomial derivatives, and rational fractions with exhaustive, mathematically sound derivations.
        </p>
      </div>

      {/* Solver Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
        {[
          { id: 'quadratic', label: 'Quadratic Equations (ax² + bx + c = 0)' },
          { id: 'linearSystem', label: 'Systems of 2 Linear Equations' },
          { id: 'polynomialCalculus', label: 'Polynomial Calculus (d/dx & ∫)' },
          { id: 'fraction', label: 'Fraction Arithmetic & LCD' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setSolverType(tab.id as any);
              setResult(null);
              setErrorMessage(null);
            }}
            aria-selected={solverType === tab.id}
            data-selected={solverType === tab.id}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              solverType === tab.id
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800/80 hover:text-white border border-white/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Input Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-xl space-y-5 text-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                Problem Input Parameters
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span>Presets:</span>
                <button onClick={() => loadPreset('1')} className="px-2 py-0.5 bg-white/10 hover:bg-white/20 rounded font-mono text-white border border-white/10">#1</button>
                <button onClick={() => loadPreset('2')} className="px-2 py-0.5 bg-white/10 hover:bg-white/20 rounded font-mono text-white border border-white/10">#2</button>
              </div>
            </div>

            {/* Quadratic Form */}
            {solverType === 'quadratic' && (
              <div className="space-y-4">
                <div className="p-3 bg-slate-950/80 rounded-xl border border-white/10 text-center font-mono text-sm font-bold text-amber-300">
                  {quadA}x² + ({quadB})x + ({quadC}) = 0
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Coeff a</label>
                    <input
                      type="number"
                      value={quadA}
                      onChange={(e) => setQuadA(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/15 text-white font-mono text-center text-sm focus:border-amber-400 outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Coeff b</label>
                    <input
                      type="number"
                      value={quadB}
                      onChange={(e) => setQuadB(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/15 text-white font-mono text-center text-sm focus:border-amber-400 outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Coeff c</label>
                    <input
                      type="number"
                      value={quadC}
                      onChange={(e) => setQuadC(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/15 text-white font-mono text-center text-sm focus:border-amber-400 outline-hidden"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Linear System Form */}
            {solverType === 'linearSystem' && (
              <div className="space-y-4">
                <div className="p-3 bg-slate-950/80 rounded-xl border border-white/10 text-center font-mono text-xs font-bold text-amber-300 space-y-1">
                  <div>Eq 1: {linA1}x + {linB1}y = {linC1}</div>
                  <div>Eq 2: {linA2}x + {linB2}y = {linC2}</div>
                </div>

                <div className="space-y-3">
                  <div className="text-xs font-bold text-amber-400">Equation 1 (a₁x + b₁y = c₁)</div>
                  <div className="grid grid-cols-3 gap-2">
                    <input type="number" placeholder="a1" value={linA1} onChange={(e) => setLinA1(e.target.value)} className="p-2 bg-slate-950 border border-white/15 text-white rounded-lg font-mono text-center text-xs" />
                    <input type="number" placeholder="b1" value={linB1} onChange={(e) => setLinB1(e.target.value)} className="p-2 bg-slate-950 border border-white/15 text-white rounded-lg font-mono text-center text-xs" />
                    <input type="number" placeholder="c1" value={linC1} onChange={(e) => setLinC1(e.target.value)} className="p-2 bg-slate-950 border border-white/15 text-white rounded-lg font-mono text-center text-xs" />
                  </div>

                  <div className="text-xs font-bold text-amber-400 pt-2">Equation 2 (a₂x + b₂y = c₂)</div>
                  <div className="grid grid-cols-3 gap-2">
                    <input type="number" placeholder="a2" value={linA2} onChange={(e) => setLinA2(e.target.value)} className="p-2 bg-slate-950 border border-white/15 text-white rounded-lg font-mono text-center text-xs" />
                    <input type="number" placeholder="b2" value={linB2} onChange={(e) => setLinB2(e.target.value)} className="p-2 bg-slate-950 border border-white/15 text-white rounded-lg font-mono text-center text-xs" />
                    <input type="number" placeholder="c2" value={linC2} onChange={(e) => setLinC2(e.target.value)} className="p-2 bg-slate-950 border border-white/15 text-white rounded-lg font-mono text-center text-xs" />
                  </div>
                </div>
              </div>
            )}

            {/* Polynomial Calculus Form */}
            {solverType === 'polynomialCalculus' && (
              <div className="space-y-4">
                <div className="text-xs text-slate-400">
                  Enter polynomial coefficients from highest power to constant term (comma separated):
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Coefficients [a_n, ..., a_0]</label>
                  <input
                    type="text"
                    value={calcCoeffs}
                    onChange={(e) => setCalcCoeffs(e.target.value)}
                    placeholder="e.g. 3, 2, -5, 4 (stands for 3x³ + 2x² - 5x + 4)"
                    className="w-full p-2.5 bg-slate-950 border border-white/15 text-white rounded-xl font-mono text-sm focus:border-amber-400 outline-hidden"
                  />
                </div>
              </div>
            )}

            {/* Fraction Arithmetic Form */}
            {solverType === 'fraction' && (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3">
                  {/* Fraction 1 */}
                  <div className="flex flex-col items-center">
                    <input type="number" value={fracN1} onChange={(e) => setFracN1(e.target.value)} className="w-14 p-1.5 bg-slate-950 border border-white/15 text-white rounded text-center font-mono text-sm" />
                    <div className="w-14 h-0.5 bg-slate-600 my-1"></div>
                    <input type="number" value={fracD1} onChange={(e) => setFracD1(e.target.value)} className="w-14 p-1.5 bg-slate-950 border border-white/15 text-white rounded text-center font-mono text-sm" />
                  </div>

                  {/* Operator */}
                  <select
                    value={fracOp}
                    onChange={(e) => setFracOp(e.target.value)}
                    className="p-2 rounded-lg border border-white/15 font-bold text-base bg-slate-950 text-white"
                  >
                    <option value="+">+</option>
                    <option value="-">−</option>
                    <option value="*">×</option>
                    <option value="/">÷</option>
                  </select>

                  {/* Fraction 2 */}
                  <div className="flex flex-col items-center">
                    <input type="number" value={fracN2} onChange={(e) => setFracN2(e.target.value)} className="w-14 p-1.5 bg-slate-950 border border-white/15 text-white rounded text-center font-mono text-sm" />
                    <div className="w-14 h-0.5 bg-slate-600 my-1"></div>
                    <input type="number" value={fracD2} onChange={(e) => setFracD2(e.target.value)} className="w-14 p-1.5 bg-slate-950 border border-white/15 text-white rounded text-center font-mono text-sm" />
                  </div>
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="p-3 bg-rose-950/70 border border-rose-500/40 rounded-xl text-rose-300 text-xs">
                {errorMessage}
              </div>
            )}

            <button
              id="execute-solver-btn"
              onClick={handleSolve}
              disabled={isSolving}
              className="w-full py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-slate-950 hover:opacity-95 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.3)] active:scale-98 transition-all"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>{isSolving ? 'Computing Derivation...' : 'Solve Step-by-Step'}</span>
            </button>
          </div>
        </div>

        {/* Right: Detailed Solution & Steps Display */}
        <div className="lg:col-span-7">
          {result ? (
            <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/10 shadow-xl space-y-6 animate-in fade-in-50 duration-200 text-slate-200">
              {/* Solution Summary Banner */}
              <div className="bg-gradient-to-br from-amber-950/80 via-slate-900 to-orange-950/80 border border-amber-500/30 rounded-2xl p-6 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-widest text-amber-300">
                  {result.title}
                </span>
                <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-amber-200">
                  {result.solution}
                </div>
                <div className="text-xs text-slate-400 pt-1">
                  Input Form: {result.inputSummary}
                </div>
              </div>

              {/* Governing Formulas Box */}
              {result.keyFormulas && result.keyFormulas.length > 0 && (
                <div className="p-4 bg-slate-950/70 rounded-xl border border-white/10 space-y-1.5 text-xs">
                  <span className="font-bold text-amber-300 uppercase tracking-wider block">
                    Core Mathematical Theorems & Formulas Applied:
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 font-mono">
                    {result.keyFormulas.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Step by Step Breakdown */}
              <div className="space-y-4">
                <h4 className="font-extrabold text-white text-base">
                  Sequential Step-by-Step Derivation
                </h4>

                <div className="space-y-3">
                  {result.steps.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-white/10 bg-slate-950/70 hover:border-amber-400/40 transition-colors space-y-1.5"
                    >
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                        <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px] text-amber-300 border border-amber-400/40">
                          {idx + 1}
                        </span>
                        <span>{step.title}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-300 pl-7 leading-relaxed">
                        {step.explanation}
                      </p>
                      {step.math && (
                        <div className="pl-7 pt-1 font-mono text-xs font-semibold text-amber-200">
                          {step.math}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-12 border border-white/10 text-center space-y-3 h-full flex flex-col items-center justify-center text-slate-400">
              <Calculator className="w-12 h-12 text-slate-600 mx-auto" />
              <h4 className="text-base font-bold text-white">
                Ready to Compute Solution
              </h4>
              <p className="text-xs sm:text-sm text-slate-400 max-w-sm">
                Set your parameters on the left panel and click &quot;Solve Step-by-Step&quot; to reveal full algebraic derivations.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
