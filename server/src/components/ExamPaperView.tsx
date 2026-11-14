import React, { useState, useEffect } from 'react';
import { ExamPaperItem, ExamSection } from '../types';
import {
  GraduationCap,
  Sparkles,
  TrendingUp,
  Clock,
  Award,
  Printer,
  Download,
  Eye,
  CheckCircle2,
  FileText,
  HelpCircle,
  BarChart3,
  Calendar,
  AlertCircle
} from 'lucide-react';

export const ExamPaperView: React.FC = () => {
  const [examPapers, setExamPapers] = useState<ExamPaperItem[]>([]);
  const [selectedPaper, setSelectedPaper] = useState<ExamPaperItem | null>(null);
  const [activeTab, setActiveTab] = useState<'paper' | 'guessing' | 'builder'>('paper');
  const [showMarkingScheme, setShowMarkingScheme] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Builder form state
  const [newTitle, setNewTitle] = useState<string>('Standard Mathematics Comprehensive Examination');
  const [newGrade, setNewGrade] = useState<string>('Grade 10 / High School');
  const [newMarks, setNewMarks] = useState<number>(80);
  const [newDuration, setNewDuration] = useState<number>(180);

  useEffect(() => {
    fetchExamPapers();
  }, []);

  const fetchExamPapers = async () => {
    try {
      const res = await fetch('/api/exampapers');
      const data = await res.json();
      if (data.examPapers && data.examPapers.length > 0) {
        setExamPapers(data.examPapers);
        setSelectedPaper(data.examPapers[0]);
      }
    } catch (err) {
      console.error('Failed to load exam papers:', err);
    }
  };

  const handleGenerateExamPaper = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsGenerating(true);
      const res = await fetch('/api/exampaper/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          grade: newGrade,
          totalMarks: newMarks,
          timeMinutes: newDuration
        })
      });

      const data = await res.json();
      if (data.examPaper) {
        setSelectedPaper(data.examPaper);
        setExamPapers((prev) => [data.examPaper, ...prev]);
        setActiveTab('paper');
      }
    } catch (err) {
      console.error('Failed to generate exam paper:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6 no-print">
        <div>
          <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
            <GraduationCap className="w-4 h-4 text-rose-300" />
            <span>Standardized Assessment Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight mt-1">
            Exam Papers & <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-300 to-orange-300">Predictive Analytics</span>
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Authoritative, formally formatted examination papers with multi-tier sections, rigorous marking rubrics, and predictive blueprint frequency statistics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-900/90 p-1.5 rounded-xl border border-white/10 text-xs font-bold flex gap-1">
            <button
              onClick={() => setActiveTab('paper')}
              aria-selected={activeTab === 'paper'}
              data-selected={activeTab === 'paper'}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'paper'
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-slate-950 font-extrabold shadow-[0_0_10px_rgba(244,63,94,0.4)]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Exam Paper View
            </button>
            <button
              onClick={() => setActiveTab('guessing')}
              aria-selected={activeTab === 'guessing'}
              data-selected={activeTab === 'guessing'}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'guessing'
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-slate-950 font-extrabold shadow-[0_0_10px_rgba(244,63,94,0.4)]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Guessing Analytics
            </button>
            <button
              onClick={() => setActiveTab('builder')}
              aria-selected={activeTab === 'builder'}
              data-selected={activeTab === 'builder'}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'builder'
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-slate-950 font-extrabold shadow-[0_0_10px_rgba(244,63,94,0.4)]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Generate Exam
            </button>
          </div>
        </div>
      </div>

      {/* View 1: Formal Authoritative Exam Paper Document */}
      {activeTab === 'paper' && selectedPaper && (
        <div className="space-y-6">
          {/* Action Toolbar */}
          <div className="no-print bg-slate-900/90 backdrop-blur-xl rounded-2xl p-4 border border-white/10 shadow-xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400 uppercase">Select Paper:</span>
              <select
                value={selectedPaper.id}
                onChange={(e) => {
                  const p = examPapers.find((item) => item.id === e.target.value);
                  if (p) setSelectedPaper(p);
                }}
                className="px-3 py-1.5 rounded-lg border border-white/15 text-xs font-semibold text-white bg-slate-950"
              >
                {examPapers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.grade})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowMarkingScheme(!showMarkingScheme)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  showMarkingScheme
                    ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                    : 'bg-white/10 text-slate-200 hover:bg-white/20 border border-white/10'
                }`}
              >
                {showMarkingScheme ? 'Hide Marking Rubric' : 'Show Marking Scheme'}
              </button>

              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-rose-400 via-pink-400 to-orange-400 hover:opacity-95 shadow-[0_0_15px_rgba(244,63,94,0.3)] transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Exam Paper</span>
              </button>
            </div>
          </div>

          {/* Paper Sheet Rendering */}
          <div className="bg-white rounded-2xl p-8 sm:p-14 border border-slate-200 shadow-xl max-w-4xl mx-auto print:border-none print:shadow-none print:p-0 text-slate-900">
            {/* Board Header */}
            <div className="text-center border-b-2 border-slate-900 pb-5 mb-6">
              <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                ACADEMIC EXAMINATION BOARD • MATHEMATICS DIVISION
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-wide">
                {selectedPaper.title}
              </h2>
              <div className="text-sm font-bold text-indigo-900 mt-1">
                {selectedPaper.grade} • {selectedPaper.subject}
              </div>

              <div className="flex items-center justify-between max-w-lg mx-auto pt-4 text-xs font-bold text-slate-700 border-t border-slate-200 mt-3">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span>Time Allowed: {selectedPaper.timeMinutes} Minutes</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-slate-500" />
                  <span>Maximum Marks: {selectedPaper.totalMarks}</span>
                </div>
              </div>
            </div>

            {/* Candidate Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 border border-slate-400 rounded-lg text-xs mb-8 bg-slate-50/50">
              <div><strong>Candidate Name:</strong> ________________________________</div>
              <div><strong>Roll / Index Number:</strong> ____________________</div>
              <div><strong>Center Code:</strong> ____________</div>
              <div><strong>Invigilator Signature:</strong> _________________</div>
            </div>

            {/* General Instructions */}
            <div className="mb-8 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                General Instructions for Candidates:
              </div>
              <ol className="list-decimal list-inside space-y-1 text-slate-700 leading-relaxed">
                {selectedPaper.instructions.map((inst, idx) => (
                  <li key={idx}>{inst}</li>
                ))}
              </ol>
            </div>

            {/* Examination Sections */}
            <div className="space-y-10">
              {selectedPaper.sections.map((sec, secIdx) => (
                <div key={secIdx} className="space-y-6">
                  <div className="border-b border-slate-900 pb-2 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">
                        {sec.name}
                      </h3>
                      <p className="text-xs text-slate-500 italic mt-0.5">
                        {sec.description}
                      </p>
                    </div>
                  </div>

                  {/* Section Questions */}
                  <div className="space-y-6">
                    {sec.questions.map((q) => (
                      <div key={q.id} className="space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="text-sm font-semibold text-slate-900 leading-relaxed">
                            <span className="font-bold text-indigo-700 mr-2">Q{q.id}.</span>
                            <span>{q.question}</span>
                          </div>
                          <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded whitespace-nowrap">
                            [{q.marks} {q.marks === 1 ? 'Mark' : 'Marks'}]
                          </span>
                        </div>

                        {/* MCQ choices */}
                        {q.options && q.options.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-6">
                            {q.options.map((opt, optIdx) => (
                              <div key={optIdx} className="text-xs text-slate-800 p-2 rounded border border-slate-200 bg-slate-50/50">
                                <span className="font-bold mr-2 text-indigo-700">({String.fromCharCode(65 + optIdx)})</span>
                                <span>{opt}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Ruled lines for answer space */}
                        {!showMarkingScheme && (
                          <div className="pt-2 pb-4 border-b border-dashed border-slate-200">
                            <div className="space-y-3">
                              {Array.from({ length: Math.min(q.marks * 2, 6) }).map((_, i) => (
                                <div key={i} className="h-0.5 border-b border-slate-200"></div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Marking Scheme View */}
                        {showMarkingScheme && (
                          <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs space-y-1.5">
                            <div className="font-bold text-emerald-900">
                              Solution: {q.solution}
                            </div>
                            <div className="space-y-1 text-slate-700 pl-4 border-l-2 border-emerald-500">
                              <span className="font-bold text-slate-800 text-[11px] block">
                                Marking Scheme Rubric:
                              </span>
                              {q.markingScheme.map((item, mIdx) => (
                                <div key={mIdx}>• {item}</div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* View 2: Exam Paper Guessing & Topic Weightage Analytics */}
      {activeTab === 'guessing' && selectedPaper && selectedPaper.guessAnalysis && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-rose-950/80 via-slate-900 to-pink-950/80 text-white rounded-3xl p-6 sm:p-10 shadow-xl space-y-4 border border-rose-500/30">
            <div className="flex items-center gap-2 text-rose-300 text-xs font-bold uppercase tracking-widest">
              <TrendingUp className="w-4 h-4 text-rose-400" />
              <span>Predictive Blueprint Frequency Engine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Exam Paper Guessing & High-Yield Blueprint Analytics
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Derived from historic examination trends, syllabus weightage matrices, and recurrence probability scores for {selectedPaper.grade}.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Probability Weight Table */}
            <div className="lg:col-span-7 bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-xl space-y-4 text-slate-200">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-bold text-white text-base">
                  High Probability Exam Topics (Calculated Weight %)
                </h3>
                <span className="text-xs font-bold text-rose-300 bg-rose-950/60 border border-rose-500/30 px-2.5 py-0.5 rounded-full">
                  Verified Analysis
                </span>
              </div>

              <div className="space-y-4">
                {selectedPaper.guessAnalysis.highProbabilityTopics.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-white/10 bg-slate-950/70 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-white text-sm">{item.topic}</span>
                      <span className="text-rose-400 font-mono text-sm">{item.weight}% Probability</span>
                    </div>

                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${item.weight * 4}%` }}
                        className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full"
                      ></div>
                    </div>

                    <p className="text-xs text-slate-400 italic">
                      {item.rationale}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Strategy & Recommended Pace */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-xl space-y-4 text-xs text-slate-200">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Clock className="w-4 h-4 text-rose-400" />
                  <span>Strategic Time Management Plan</span>
                </h3>

                <ul className="space-y-2.5 text-slate-300">
                  {selectedPaper.guessAnalysis.examStrategy.map((strat, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{strat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-xl space-y-3 text-xs text-slate-200">
                <h4 className="font-bold text-white text-sm">
                  Trending Question Patterns
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedPaper.guessAnalysis.trendingTopics.map((trend, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-lg bg-rose-950/50 text-rose-300 border border-rose-500/30 font-medium"
                    >
                      {trend}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View 3: Generate New Customized Exam Paper */}
      {activeTab === 'builder' && (
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/10 shadow-xl max-w-2xl mx-auto space-y-6 text-slate-200">
          <div>
            <h3 className="text-xl font-bold text-white">
              Configure Standardized Examination Paper
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Specify the exam title, target grade tier, marks threshold, and cognitive section distribution.
            </p>
          </div>

          <form onSubmit={handleGenerateExamPaper} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-300 block mb-1">Examination Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/15 text-white font-sans text-sm focus:border-rose-400 outline-hidden"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Target Grade</label>
                <input
                  type="text"
                  value={newGrade}
                  onChange={(e) => setNewGrade(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/15 text-white focus:border-rose-400 outline-hidden"
                  required
                />
              </div>
              <div>
                <label className="font-bold text-slate-300 block mb-1">Total Marks</label>
                <select
                  value={newMarks}
                  onChange={(e) => setNewMarks(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/15 text-white focus:border-rose-400 outline-hidden"
                >
                  <option value={50}>50 Marks</option>
                  <option value={80}>80 Marks (Standard)</option>
                  <option value={100}>100 Marks</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-300 block mb-1">Duration (Mins)</label>
                <select
                  value={newDuration}
                  onChange={(e) => setNewDuration(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/15 text-white focus:border-rose-400 outline-hidden"
                >
                  <option value={60}>60 Mins (1 hr)</option>
                  <option value={90}>90 Mins (1.5 hrs)</option>
                  <option value={120}>120 Mins (2 hrs)</option>
                  <option value={180}>180 Mins (3 hrs)</option>
                </select>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-white/10 text-slate-300 space-y-1.5">
              <span className="font-bold text-rose-300 block">Standard Structure Generated:</span>
              <div>• Section A: 1-Mark Multiple Choice & Recall (Objective)</div>
              <div>• Section B: 2 to 3-Mark Analytical Mechanics (Structured)</div>
              <div>• Section C: 4 to 5-Mark Extended Proofs & Word Problem Modeling</div>
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-3 bg-gradient-to-r from-rose-500 via-pink-500 to-orange-500 text-slate-950 font-black rounded-xl text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:opacity-95"
            >
              <Sparkles className="w-4 h-4 text-slate-950 fill-slate-950" />
              <span>{isGenerating ? 'Synthesizing Exam Paper...' : 'Generate Standardized Exam Paper'}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
