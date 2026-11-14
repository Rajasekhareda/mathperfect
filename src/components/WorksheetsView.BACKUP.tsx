import React, { useState, useEffect } from 'react';
import { WorksheetItem, WorksheetQuestion } from '../types';
import {
  FileText,
  Sparkles,
  Download,
  Printer,
  Eye,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  School,
  FileDown,
  Layers,
  Clock,
  RefreshCw,
  FolderOpen
} from 'lucide-react';

const TOPIC_PRESETS = [
  'Quadratic Equations & Roots',
  'Systems of Linear Equations',
  'Pythagorean Theorem & Triangles',
  'Differential Calculus & Power Rule',
  'Trigonometric Identities & Ratios',
  'Probability & Permutations',
  'Polynomial Factorization',
  'Fraction & Decimal Operations',
  'Coordinate Geometry & Lines',
  'Definite & Indefinite Integrals'
];

const GRADE_PRESETS = [
  'Grade 6 - Middle School',
  'Grade 7 - Middle School',
  'Grade 8 - Middle School',
  'Grade 9 - High School',
  'Grade 10 - High School',
  'Grade 11 - Senior Secondary',
  'Grade 12 - Senior Secondary',
  'College / University Prep'
];

export const WorksheetsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'create' | 'library'>('create');

  // 7-step wizard state
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [topic, setTopic] = useState<string>('Quadratic Equations & Roots');
  const [customTopic, setCustomTopic] = useState<string>('');
  const [grade, setGrade] = useState<string>('Grade 10 - High School');
  const [difficulty, setDifficulty] = useState<'Foundational' | 'Standard' | 'Advanced' | 'Olympiad'>('Standard');
  const [questionType, setQuestionType] = useState<'multiple-choice' | 'free-response' | 'word-problems' | 'mixed'>('mixed');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [schoolName, setSchoolName] = useState<string>('MATH PERFECT EDUCATION');
  const [customInstructions, setCustomInstructions] = useState<string>('Show all intermediate mathematical working steps clearly.');

  // Generation & result state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentWorksheet, setCurrentWorksheet] = useState<WorksheetItem | null>(null);
  const [previewMode, setPreviewMode] = useState<'student' | 'teacher'>('student');
  const [isExportingDocx, setIsExportingDocx] = useState<boolean>(false);

  // Saved worksheets library
  const [savedWorksheets, setSavedWorksheets] = useState<WorksheetItem[]>([]);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState<boolean>(false);

  const effectiveTopic = customTopic.trim() ? customTopic.trim() : topic;

  // Load saved worksheets on mount or tab change
  useEffect(() => {
    fetchSavedWorksheets();
  }, []);

  const fetchSavedWorksheets = async () => {
    try {
      setIsLoadingLibrary(true);
      const res = await fetch('/api/worksheets');
      const data = await res.json();
      if (data.worksheets) {
        setSavedWorksheets(data.worksheets);
      }
    } catch (err) {
      console.error('Failed to load saved worksheets:', err);
    } finally {
      setIsLoadingLibrary(false);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setCurrentStep(5);

    try {
      const payload = {
        topic: effectiveTopic,
        grade,
        difficulty,
        questionType,
        questionCount,
        schoolName,
        instructions: customInstructions,
        customInstructions
      };

      const res = await fetch('/api/worksheets/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${res.status}`);
      }

      const data = await res.json();
      if (data.worksheet) {
        setCurrentWorksheet(data.worksheet);
        setCurrentStep(6); // Move to Preview
        fetchSavedWorksheets();
      } else {
        throw new Error('No worksheet data returned from server');
      }
    } catch (err: any) {
      console.error('Worksheet generation failed:', err);
      setError(err.message || 'Failed to generate worksheet. Please verify network connectivity.');
      setCurrentStep(4);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportDocx = async (worksheetToExport?: WorksheetItem) => {
    const target = worksheetToExport || currentWorksheet;
    if (!target) return;

    try {
      setIsExportingDocx(true);
      const res = await fetch('/api/worksheets/export/docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ worksheet: target })
      });

      if (!res.ok) {
        throw new Error('Server failed to generate Word document');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `MathPerfect_${target.topic.replace(/[^a-zA-Z0-9]/g, '_')}_Worksheet.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(`DOCX export error: ${err.message}`);
    } finally {
      setIsExportingDocx(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header & Mode Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6 no-print">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-cyan-300" />
            <span>AI Curriculum Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Mathematics Worksheet <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">Generator</span>
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Build rigorous, curriculum-aligned printable practice sets with automated answer keys and native DOCX/PDF export.
          </p>
        </div>

        <div className="flex items-center bg-white/[0.06] p-1 rounded-xl border border-white/10 text-xs font-semibold backdrop-blur-md">
          <button
            id="ws-tab-create"
            onClick={() => setActiveTab('create')}
            aria-selected={activeTab === 'create'}
            data-selected={activeTab === 'create'}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all ${
              activeTab === 'create'
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(20,184,166,0.4)]'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generator Studio</span>
          </button>
          <button
            id="ws-tab-library"
            onClick={() => setActiveTab('library')}
            aria-selected={activeTab === 'library'}
            data-selected={activeTab === 'library'}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all ${
              activeTab === 'library'
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(20,184,166,0.4)]'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Saved Worksheets ({savedWorksheets.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'library' ? (
        /* Saved Worksheets Library */
        <div className="space-y-6 no-print">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Archived & Curated Worksheets</h3>
            <button
              onClick={fetchSavedWorksheets}
              className="flex items-center gap-1.5 text-xs font-semibold text-teal-300 hover:text-white bg-teal-950/60 border border-teal-500/30 px-3 py-1.5 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLibrary ? 'animate-spin' : ''}`} />
              <span>Refresh Library</span>
            </button>
          </div>

          {savedWorksheets.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
              <BookOpen className="w-12 h-12 text-slate-500 mx-auto mb-3" />
              <h4 className="text-base font-bold text-white">No saved worksheets found</h4>
              <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
                Generate your first worksheet using the 7-step builder to save and manage worksheets here.
              </p>
              <button
                onClick={() => setActiveTab('create')}
                className="mt-4 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 rounded-xl text-xs font-bold hover:opacity-95 shadow-md shadow-teal-500/20"
              >
                Create First Worksheet
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {savedWorksheets.map((ws) => (
                <div
                  key={ws.id}
                  className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-5 border border-white/10 hover:border-cyan-400/40 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
                        {ws.grade}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {new Date(ws.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white leading-snug">
                      {ws.title}
                    </h4>

                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <span className="font-medium text-teal-300">{ws.topic}</span>
                      <span>•</span>
                      <span>{ws.questions.length} Questions</span>
                      <span>•</span>
                      <span className="text-amber-300 font-medium">{ws.difficulty}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center gap-2 mt-4">
                    <button
                      onClick={() => {
                        setCurrentWorksheet(ws);
                        setActiveTab('create');
                        setCurrentStep(6);
                      }}
                      className="flex-1 py-2 px-3 text-xs font-semibold text-cyan-300 bg-cyan-950/50 hover:bg-cyan-900/50 border border-cyan-500/30 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>
                    <button
                      onClick={() => handleExportDocx(ws)}
                      className="py-2 px-3 text-xs font-semibold text-slate-200 bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                      title="Download DOCX"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>DOCX</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* 7-Step Generator Studio */
        <div className="space-y-8">
          {/* Step Breadcrumbs Tracker */}
          <div className="no-print bg-slate-900/80 backdrop-blur-xl rounded-2xl p-4 border border-white/10 shadow-lg">
            <div className="flex items-center justify-between overflow-x-auto pb-2 sm:pb-0 gap-2">
              {[
                { step: 1, label: 'Topic' },
                { step: 2, label: 'Grade' },
                { step: 3, label: 'Difficulty' },
                { step: 4, label: 'Format' },
                { step: 5, label: 'Generate' },
                { step: 6, label: 'Preview' },
                { step: 7, label: 'Export' }
              ].map((s) => {
                const isActive = currentStep === s.step;
                const isCompleted = currentStep > s.step;
                return (
                  <button
                    key={s.step}
                    onClick={() => {
                      if (currentStep >= s.step || currentWorksheet) {
                        setCurrentStep(s.step);
                      }
                    }}
                    aria-selected={isActive}
                    data-selected={isActive}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(20,184,166,0.4)]'
                        : isCompleted
                        ? 'text-teal-300 bg-teal-950/40 border border-teal-500/30'
                        : 'text-slate-400 bg-white/[0.03] border border-white/5 hover:text-slate-200'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isActive
                          ? 'bg-slate-950 text-teal-300'
                          : isCompleted
                          ? 'bg-teal-500 text-slate-950 font-bold'
                          : 'bg-white/10 text-slate-400'
                      }`}
                    >
                      {s.step}
                    </span>
                    <span>{s.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 1: Select Subject & Topic */}
          {currentStep === 1 && (
            <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/10 shadow-xl space-y-6 animate-in fade-in-50 duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">Step 1 of 7</span>
                  <h3 className="text-xl font-bold text-white mt-0.5">Select Subject & Curriculum Topic</h3>
                  <p className="text-sm text-slate-300">Pick a syllabus chapter or enter a customized mathematical subtopic.</p>
                </div>
              </div>

              {/* Topic Chips */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Curriculum Chapters
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {TOPIC_PRESETS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setTopic(t);
                        setCustomTopic('');
                      }}
                      aria-selected={topic === t && !customTopic}
                      data-selected={topic === t && !customTopic}
                      className={`p-3 text-left rounded-xl text-xs sm:text-sm font-medium border transition-all ${
                        topic === t && !customTopic
                          ? 'bg-teal-500/20 border-teal-400 text-teal-200 font-semibold ring-1 ring-teal-400/40 shadow-[0_0_20px_rgba(20,184,166,0.4)]'
                          : 'bg-white/[0.04] border-white/10 text-slate-300 hover:bg-white/[0.08] hover:border-white/20 hover:text-white'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Topic Input */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Or specify custom topic / sub-discipline:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Binomial Theorem, Polar Coordinates, Matrix Inverses..."
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/70 border border-white/15 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 font-sans"
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-white/10">
                <button
                  id="step1-next-btn"
                  onClick={() => setCurrentStep(2)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-slate-950 bg-gradient-to-r from-teal-500 via-cyan-500 to-indigo-500 hover:opacity-95 transition-all shadow-[0_0_20px_rgba(20,184,166,0.35)]"
                >
                  <span>Continue to Grade & Level</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Select Grade / Level */}
          {currentStep === 2 && (
            <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/10 shadow-xl space-y-6 animate-in fade-in-50 duration-200">
              <div>
                <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">Step 2 of 7</span>
                <h3 className="text-xl font-bold text-white mt-0.5">Select Grade & Academic Level</h3>
                <p className="text-sm text-slate-300">Adapts problem depth, cognitive taxonomy, and prerequisite expectations.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {GRADE_PRESETS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGrade(g)}
                    aria-selected={grade === g}
                    data-selected={grade === g}
                    className={`p-4 text-left rounded-xl border text-sm font-medium transition-all ${
                      grade === g
                        ? 'bg-teal-500/20 border-teal-400 text-teal-200 font-semibold ring-1 ring-teal-400/40 shadow-[0_0_20px_rgba(20,184,166,0.4)]'
                        : 'bg-white/[0.04] border-white/10 text-slate-300 hover:bg-white/[0.08] hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{g}</span>
                      {grade === g && <CheckCircle2 className="w-4 h-4 text-teal-400" />}
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex justify-between pt-4 border-t border-white/10">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:bg-white/[0.08] hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  id="step2-next-btn"
                  onClick={() => setCurrentStep(3)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-slate-950 bg-gradient-to-r from-teal-500 via-cyan-500 to-indigo-500 hover:opacity-95 transition-all shadow-[0_0_20px_rgba(20,184,166,0.35)]"
                >
                  <span>Continue to Difficulty</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Select Difficulty */}
          {currentStep === 3 && (
            <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/10 shadow-xl space-y-6 animate-in fade-in-50 duration-200">
              <div>
                <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">Step 3 of 7</span>
                <h3 className="text-xl font-bold text-white mt-0.5">Select Rigor & Difficulty</h3>
                <p className="text-sm text-slate-300">Fine-tunes the algebraic complexity and multi-step reasoning thresholds.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    level: 'Foundational',
                    desc: 'Core definitions, single-step numerical computations, foundational mechanics.',
                    badge: 'Knowledge',
                    color: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30'
                  },
                  {
                    level: 'Standard',
                    desc: 'Curriculum-aligned multi-step problems with standard algebraic manipulations.',
                    badge: 'Application',
                    color: 'text-cyan-400 bg-cyan-950/60 border-cyan-500/30'
                  },
                  {
                    level: 'Advanced',
                    desc: 'Non-routine word problems, parameter derivations, and rigorous proof steps.',
                    badge: 'Analysis',
                    color: 'text-amber-400 bg-amber-950/60 border-amber-500/30'
                  },
                  {
                    level: 'Olympiad',
                    desc: 'Contest-level inquiries requiring creative problem-solving and mathematical synthesis.',
                    badge: 'Challenge',
                    color: 'text-rose-400 bg-rose-950/60 border-rose-500/30'
                  }
                ].map((d) => (
                  <button
                    key={d.level}
                    type="button"
                    onClick={() => setDifficulty(d.level as any)}
                    aria-selected={difficulty === d.level}
                    data-selected={difficulty === d.level}
                    className={`p-5 text-left rounded-2xl border transition-all flex flex-col justify-between ${
                      difficulty === d.level
                        ? 'bg-teal-500/20 border-teal-400 text-teal-200 font-semibold ring-1 ring-teal-400/40 shadow-[0_0_20px_rgba(20,184,166,0.4)]'
                        : 'bg-white/[0.04] border-white/10 text-slate-300 hover:bg-white/[0.08] hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-base text-white">{d.level}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${d.color}`}>
                          {d.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-normal">
                        {d.desc}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex justify-between pt-4 border-t border-white/10">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:bg-white/[0.08] hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  id="step3-next-btn"
                  onClick={() => setCurrentStep(4)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-slate-950 bg-gradient-to-r from-teal-500 via-cyan-500 to-indigo-500 hover:opacity-95 transition-all shadow-[0_0_20px_rgba(20,184,166,0.35)]"
                >
                  <span>Continue to Format</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Select Question Type & Document Options */}
          {currentStep === 4 && (
            <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/10 shadow-xl space-y-6 animate-in fade-in-50 duration-200">
              <div>
                <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">Step 4 of 7</span>
                <h3 className="text-xl font-bold text-white mt-0.5">Format & Structure Options</h3>
                <p className="text-sm text-slate-300">Configure question types, problem count, and worksheet header branding.</p>
              </div>

              {/* Question Type */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Question Format
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'mixed', label: 'Balanced Mixed' },
                    { id: 'multiple-choice', label: 'Multiple Choice (MCQ)' },
                    { id: 'free-response', label: 'Free Response / Steps' },
                    { id: 'word-problems', label: 'Real-World Modeling' }
                  ].map((fmt) => (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => setQuestionType(fmt.id as any)}
                      aria-selected={questionType === fmt.id}
                      data-selected={questionType === fmt.id}
                      className={`p-3 text-center rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                        questionType === fmt.id
                          ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(20,184,166,0.4)]'
                          : 'bg-white/[0.04] border-white/10 text-slate-300 hover:bg-white/[0.08] hover:border-white/20 hover:text-white'
                      }`}
                    >
                      {fmt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Count */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Number of Problems
                </label>
                <div className="flex items-center gap-3">
                  {[5, 10, 15, 20].map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setQuestionCount(cnt)}
                      aria-selected={questionCount === cnt}
                      data-selected={questionCount === cnt}
                      className={`w-14 h-12 rounded-xl text-sm font-bold border transition-all ${
                        questionCount === cnt
                          ? 'bg-teal-500/25 border-teal-400 text-teal-200 ring-2 ring-teal-400/40 shadow-[0_0_20px_rgba(20,184,166,0.4)]'
                          : 'bg-white/[0.04] border-white/10 text-slate-300 hover:bg-white/[0.08] hover:border-white/20 hover:text-white'
                      }`}
                    >
                      {cnt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Header Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                    School / Institution Banner Name
                  </label>
                  <input
                    type="text"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-white/15 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 font-sans"
                    placeholder="e.g. MATH PERFECT EDUCATION"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                    Custom Student Instructions
                  </label>
                  <input
                    type="text"
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-white/15 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 font-sans"
                    placeholder="e.g. Show all working steps clearly."
                  />
                </div>
              </div>

              {/* Summary of Configuration */}
              <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-slate-300 flex flex-wrap gap-x-6 gap-y-2">
                <div><strong className="text-teal-400">Topic:</strong> {effectiveTopic}</div>
                <div><strong className="text-cyan-400">Level:</strong> {grade}</div>
                <div><strong className="text-amber-400">Difficulty:</strong> {difficulty}</div>
                <div><strong className="text-emerald-400">Format:</strong> {questionType}</div>
                <div><strong className="text-indigo-400">Count:</strong> {questionCount} Problems</div>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-rose-950/70 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex justify-between pt-4 border-t border-white/10">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:bg-white/[0.08] hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  id="start-generate-btn"
                  onClick={handleGenerate}
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-bold text-slate-950 bg-gradient-to-r from-teal-500 via-cyan-500 to-indigo-500 hover:opacity-95 active:scale-98 transition-all shadow-[0_0_25px_rgba(20,184,166,0.4)]"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>Generate Worksheet</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Generating Animation */}
          {currentStep === 5 && (
            <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-12 text-center border border-white/10 shadow-xl space-y-4 animate-in fade-in-50 duration-200">
              <div className="w-16 h-16 rounded-2xl bg-teal-500/20 border border-teal-500/30 text-teal-300 flex items-center justify-center mx-auto animate-bounce shadow-[0_0_20px_rgba(20,184,166,0.3)]">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Synthesizing Mathematics Curriculum...
              </h3>
              <p className="text-sm text-slate-300 max-w-md mx-auto">
                Validating algebraic formulations, checking discriminant values, calibrating point weights, and compiling answer keys for {effectiveTopic}.
              </p>
              <div className="w-48 h-1.5 bg-white/10 rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full animate-pulse w-3/4"></div>
              </div>
            </div>
          )}

          {/* Step 6 & 7: Interactive Preview & Document Download */}
          {(currentStep === 6 || currentStep === 7) && currentWorksheet && (
            <div className="space-y-6 animate-in fade-in-50 duration-200">
              {/* Action Toolbar */}
              <div className="no-print bg-slate-900/90 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-white/10 shadow-xl flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">
                    View Mode:
                  </span>
                  <button
                    onClick={() => setPreviewMode('student')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      previewMode === 'student'
                        ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(20,184,166,0.35)]'
                        : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white'
                    }`}
                  >
                    Student Practice View
                  </button>
                  <button
                    onClick={() => setPreviewMode('teacher')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      previewMode === 'teacher'
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(16,185,129,0.35)]'
                        : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white'
                    }`}
                  >
                    Teacher Answer Key
                  </button>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    id="export-docx-btn"
                    onClick={() => handleExportDocx()}
                    disabled={isExportingDocx}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-200 bg-white/[0.06] border border-white/10 hover:bg-white/[0.12] transition-colors shadow-xs"
                  >
                    <Download className="w-4 h-4 text-cyan-400" />
                    <span>{isExportingDocx ? 'Exporting...' : 'Export Word (.DOCX)'}</span>
                  </button>

                  <button
                    id="print-pdf-btn"
                    onClick={handlePrint}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-teal-500 via-cyan-500 to-indigo-500 hover:opacity-95 transition-all shadow-[0_0_15px_rgba(20,184,166,0.35)]"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print / Save to PDF</span>
                  </button>

                  <button
                    onClick={() => setCurrentStep(1)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/[0.08] hover:text-white transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>New Worksheet</span>
                  </button>
                </div>
              </div>

              {/* Printable Worksheet Sheet Document */}
              <div className="bg-white rounded-2xl p-6 sm:p-12 border border-slate-200 shadow-md print:border-none print:shadow-none print:p-0 max-w-4xl mx-auto">
                {/* Academic Header Banner */}
                <div className="text-center border-b-2 border-slate-900 pb-5 mb-6">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-wide">
                    {currentWorksheet.schoolName || 'MATH PERFECT EDUCATION'}
                  </h2>
                  <h3 className="text-lg sm:text-xl font-bold text-indigo-900 mt-1">
                    {currentWorksheet.title}
                  </h3>
                  <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-xs text-slate-600 mt-2">
                    <span><strong>Topic:</strong> {currentWorksheet.topic}</span>
                    <span>•</span>
                    <span><strong>Grade:</strong> {currentWorksheet.grade}</span>
                    <span>•</span>
                    <span><strong>Difficulty:</strong> {currentWorksheet.difficulty}</span>
                    <span>•</span>
                    <span><strong>Total Questions:</strong> {currentWorksheet.questions.length}</span>
                  </div>
                </div>

                {/* Student Info Box */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 border border-slate-300 rounded-xl mb-6 text-xs text-slate-800">
                  <div>
                    <span className="font-bold">Student Name:</span> ______________________
                  </div>
                  <div>
                    <span className="font-bold">Date:</span> ________________
                  </div>
                  <div>
                    <span className="font-bold">Score:</span> _____ / _____
                  </div>
                </div>

                {/* Instructions */}
                <div className="text-xs text-slate-700 mb-8 p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                  <span className="font-bold text-indigo-900">Instructions: </span>
                  {currentWorksheet.instructions || 'Show all mathematical derivations clearly in the space provided below each problem. Work methodically.'}
                </div>

                {/* Questions List */}
                <div className="space-y-8">
                  {currentWorksheet.questions.map((q, idx) => (
                    <div key={q.id} className="space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="text-sm sm:text-base font-semibold text-slate-900">
                          <span className="text-indigo-600 font-bold mr-2">Q{idx + 1}.</span>
                          <span>{q.question}</span>
                        </div>
                        <span className="text-xs font-mono font-semibold text-slate-500 whitespace-nowrap bg-slate-100 px-2 py-0.5 rounded">
                          [{q.marks || 3} Marks]
                        </span>
                      </div>

                      {/* Multiple choice options if present */}
                      {q.options && q.options.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-6 pt-1">
                          {q.options.map((opt, optIdx) => {
                            const labels = ['A', 'B', 'C', 'D'];
                            const isCorrect = previewMode === 'teacher' && opt === q.correctAnswer;
                            return (
                              <div
                                key={optIdx}
                                className={`p-2.5 rounded-lg border text-xs sm:text-sm font-medium ${
                                  isCorrect
                                    ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold'
                                    : 'bg-slate-50/60 border-slate-200 text-slate-800'
                                }`}
                              >
                                <span className="font-bold text-indigo-600 mr-2">({labels[optIdx]})</span>
                                <span>{opt}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Teacher View: Answer & Derivation */}
                      {previewMode === 'teacher' ? (
                        <div className="mt-3 p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs sm:text-sm space-y-2">
                          <div className="flex items-center gap-2 text-emerald-800 font-bold">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Correct Answer: {q.correctAnswer}</span>
                          </div>
                          <div className="text-slate-700 leading-relaxed pl-6">
                            <span className="font-bold text-slate-900">Detailed Solution: </span>
                            {q.solution}
                          </div>
                          {q.hint && (
                            <div className="text-amber-800 pl-6 text-xs flex items-center gap-1.5">
                              <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                              <span>Pedagogical Hint: {q.hint}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Student View: Ruled scratchwork lines */
                        <div className="pt-2 pb-6 border-b border-dashed border-slate-200">
                          <div className="text-[11px] text-slate-400 italic mb-2">
                            Working space:
                          </div>
                          <div className="space-y-4">
                            <div className="h-0.5 border-b border-slate-200/80"></div>
                            <div className="h-0.5 border-b border-slate-200/80"></div>
                            <div className="h-0.5 border-b border-slate-200/80"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Print Only Teacher Key Page Break */}
                <div className="hidden print:block print:break-before-page pt-10">
                  <div className="text-center border-b-2 border-slate-900 pb-3 mb-6">
                    <h3 className="text-lg font-bold text-slate-900">
                      TEACHER MARKING SCHEME & COMPLETE ANSWER KEY
                    </h3>
                    <p className="text-xs text-slate-500">
                      Worksheet: {currentWorksheet.title} ({currentWorksheet.topic})
                    </p>
                  </div>

                  <div className="space-y-4 text-xs">
                    {currentWorksheet.questions.map((q, idx) => (
                      <div key={q.id} className="p-3 border border-slate-200 rounded">
                        <div className="font-bold text-slate-900">
                          Q{idx + 1}: {q.correctAnswer}
                        </div>
                        <div className="text-slate-700 mt-1">
                          <strong>Solution: </strong>{q.solution}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
