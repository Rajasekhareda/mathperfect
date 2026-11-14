import React, { useState, useEffect } from 'react';
import { QuestionBankItem } from '../types';
import {
  Database,
  Search,
  Sliders,
  Eye,
  EyeOff,
  HelpCircle,
  CheckCircle2,
  Copy,
  Plus,
  Filter,
  Check,
  Sparkles,
  BookOpen
} from 'lucide-react';

export const QuestionBankView: React.FC = () => {
  const [questions, setQuestions] = useState<QuestionBankItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [selectedGrade, setSelectedGrade] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');

  // Expanded toggles for hints and answers
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});
  const [revealedHints, setRevealedHints] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Add Question Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newTopic, setNewTopic] = useState<string>('Algebra');
  const [newSubtopic, setNewSubtopic] = useState<string>('Polynomials');
  const [newGrade, setNewGrade] = useState<string>('Grade 10');
  const [newDifficulty, setNewDifficulty] = useState<'Easy' | 'Medium' | 'Hard' | 'Challenge'>('Medium');
  const [newType, setNewType] = useState<'mcq' | 'short-answer' | 'extended' | 'proof'>('short-answer');
  const [newQuestion, setNewQuestion] = useState<string>('');
  const [newAnswer, setNewAnswer] = useState<string>('');
  const [newExplanation, setNewExplanation] = useState<string>('');

  useEffect(() => {
    fetchQuestions();
  }, [selectedTopic, selectedGrade, selectedDifficulty, selectedType]);

  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (selectedTopic !== 'All') params.append('topic', selectedTopic);
      if (selectedGrade !== 'All') params.append('grade', selectedGrade);
      if (selectedDifficulty !== 'All') params.append('difficulty', selectedDifficulty);
      if (selectedType !== 'All') params.append('type', selectedType);
      if (search) params.append('search', search);

      const res = await fetch(`/api/questionbank?${params.toString()}`);
      const data = await res.json();
      if (data.questions) {
        setQuestions(data.questions);
      }
    } catch (err) {
      console.error('Failed to fetch questions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchQuestions();
  };

  const toggleAnswer = (id: string) => {
    setRevealedAnswers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleHint = (id: string) => {
    setRevealedHints((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyQuestion = (q: QuestionBankItem) => {
    const text = `${q.question}\n\nAnswer: ${q.answer}\nExplanation: ${q.explanation}`;
    navigator.clipboard.writeText(text);
    setCopiedId(q.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveCustomQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) return;

    try {
      const payload = {
        topic: newTopic,
        subtopic: newSubtopic,
        grade: newGrade,
        difficulty: newDifficulty,
        type: newType,
        question: newQuestion,
        answer: newAnswer,
        explanation: newExplanation || 'Direct algorithmic solution.',
        hint: 'Review the underlying fundamental definition.',
        tags: [newTopic.toLowerCase(), 'custom']
      };

      const res = await fetch('/api/questionbank/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsAddModalOpen(false);
        setNewQuestion('');
        setNewAnswer('');
        setNewExplanation('');
        fetchQuestions();
      }
    } catch (err) {
      console.error('Failed to save question:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-fuchsia-400 font-bold text-xs uppercase tracking-wider">
            <Database className="w-4 h-4 text-fuchsia-300" />
            <span>Academic Item Repository</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight mt-1">
            Mathematics <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-pink-300 to-purple-300">Question Bank</span>
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Search, filter, and inspect thousands of curriculum problems with progressive hints, verified solutions, and export capabilities.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-950 bg-gradient-to-r from-fuchsia-400 via-pink-400 to-purple-400 hover:opacity-95 transition-all shadow-[0_0_20px_rgba(217,70,239,0.3)]"
        >
          <Plus className="w-4 h-4" />
          <span>Contribute Question</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-white/10 shadow-xl space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by mathematical term, keyword, theorem, or question text..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-fuchsia-400 font-sans"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-950 bg-gradient-to-r from-fuchsia-400 to-pink-400 hover:opacity-95 transition-colors shadow-[0_0_15px_rgba(217,70,239,0.25)]"
          >
            Search
          </button>
        </form>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-white/10 text-xs font-semibold text-slate-300">
          <div className="flex items-center gap-1.5">
            <span>Topic:</span>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-white/15 bg-slate-950 text-slate-200 text-xs focus:ring-1 focus:ring-fuchsia-400"
            >
              <option value="All">All Topics</option>
              <option value="Algebra">Algebra</option>
              <option value="Geometry">Geometry</option>
              <option value="Calculus">Calculus</option>
              <option value="Trigonometry">Trigonometry</option>
              <option value="Probability">Probability</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span>Grade:</span>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-white/15 bg-slate-950 text-slate-200 text-xs focus:ring-1 focus:ring-fuchsia-400"
            >
              <option value="All">All Grades</option>
              <option value="Grade 8">Grade 8</option>
              <option value="Grade 9">Grade 9</option>
              <option value="Grade 10">Grade 10</option>
              <option value="Grade 11">Grade 11</option>
              <option value="Grade 12">Grade 12</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span>Difficulty:</span>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-white/15 bg-slate-950 text-slate-200 text-xs focus:ring-1 focus:ring-fuchsia-400"
            >
              <option value="All">All Levels</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
              <option value="Challenge">Challenge</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span>Format:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-white/15 bg-slate-950 text-slate-200 text-xs focus:ring-1 focus:ring-fuchsia-400"
            >
              <option value="All">All Formats</option>
              <option value="mcq">Multiple Choice</option>
              <option value="short-answer">Short Answer</option>
              <option value="extended">Extended Proof</option>
            </select>
          </div>

          <span className="ml-auto text-slate-400 font-normal">
            Showing {questions.length} questions
          </span>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-12 text-center border border-white/10 text-slate-400">
            <BookOpen className="w-10 h-10 text-slate-500 mx-auto mb-2" />
            <h4 className="text-base font-bold text-white">No matching questions found</h4>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Try adjusting your search terms or filter combinations.
            </p>
          </div>
        ) : (
          questions.map((q, idx) => {
            const isAnswerRevealed = !!revealedAnswers[q.id];
            const isHintRevealed = !!revealedHints[q.id];
            return (
              <div
                key={q.id}
                className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-5 sm:p-6 border border-white/10 shadow-lg hover:border-fuchsia-400/40 hover:shadow-[0_0_20px_rgba(217,70,239,0.15)] transition-all space-y-4 text-slate-200"
              >
                {/* Meta Pills */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-fuchsia-950/60 text-fuchsia-300 border border-fuchsia-500/30">
                      {q.topic} • {q.subtopic}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-slate-300 border border-white/10">
                      {q.grade}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        q.difficulty === 'Challenge'
                          ? 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
                          : q.difficulty === 'Hard'
                          ? 'bg-amber-950/60 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {q.difficulty}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 uppercase">
                      [{q.type}]
                    </span>
                  </div>

                  <button
                    onClick={() => handleCopyQuestion(q)}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 transition-colors"
                  >
                    {copiedId === q.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300 font-semibold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Problem</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Question Body */}
                <div className="text-sm sm:text-base font-semibold text-white leading-relaxed">
                  <span className="text-fuchsia-400 font-bold mr-2">#{idx + 1}.</span>
                  <span>{q.question}</span>
                </div>

                {/* MCQ Options */}
                {q.options && q.options.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 pl-4">
                    {q.options.map((opt, optIdx) => (
                      <div
                        key={optIdx}
                        className="p-2.5 rounded-xl border border-white/10 text-xs sm:text-sm font-medium bg-slate-950/70 text-slate-200"
                      >
                        <span className="font-bold text-fuchsia-400 mr-2">({String.fromCharCode(65 + optIdx)})</span>
                        <span>{opt}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Hint & Answer Action Bar */}
                <div className="pt-3 border-t border-white/10 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => toggleHint(q.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-300 bg-amber-950/40 hover:bg-amber-950/70 border border-amber-500/30 transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>{isHintRevealed ? 'Hide Hint' : 'Reveal Pedagogical Hint'}</span>
                  </button>

                  <button
                    onClick={() => toggleAnswer(q.id)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-fuchsia-300 bg-fuchsia-950/40 hover:bg-fuchsia-950/70 border border-fuchsia-500/30 transition-colors"
                  >
                    {isAnswerRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{isAnswerRevealed ? 'Hide Solution' : 'Reveal Verified Solution'}</span>
                  </button>
                </div>

                {/* Pedagogical Hint Callout */}
                {isHintRevealed && q.hint && (
                  <div className="p-3.5 bg-amber-950/50 border border-amber-500/30 rounded-xl text-xs text-amber-200 leading-relaxed animate-in fade-in-50 duration-150">
                    <span className="font-bold text-amber-300">Hint: </span>
                    {q.hint}
                  </div>
                )}

                {/* Verified Solution & Explanation */}
                {isAnswerRevealed && (
                  <div className="p-4 bg-emerald-950/50 border border-emerald-500/30 rounded-xl text-xs sm:text-sm space-y-2 animate-in fade-in-50 duration-150 text-slate-200">
                    <div className="flex items-center gap-2 font-bold text-emerald-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Answer: {q.answer}</span>
                    </div>
                    <div className="text-slate-300 leading-relaxed pl-6">
                      <span className="font-bold text-emerald-200">Derivation & Steps: </span>
                      {q.explanation}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add Custom Question Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in-50 duration-150">
          <div className="bg-slate-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 border border-white/15 shadow-2xl space-y-5 text-slate-200">
            <h3 className="text-xl font-bold text-white">
              Contribute Question to Bank
            </h3>
            <form onSubmit={handleSaveCustomQuestion} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Topic</label>
                  <input type="text" value={newTopic} onChange={(e) => setNewTopic(e.target.value)} className="w-full p-2.5 bg-slate-950 border border-white/15 text-white rounded-lg" required />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Subtopic</label>
                  <input type="text" value={newSubtopic} onChange={(e) => setNewSubtopic(e.target.value)} className="w-full p-2.5 bg-slate-950 border border-white/15 text-white rounded-lg" required />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Grade</label>
                  <input type="text" value={newGrade} onChange={(e) => setNewGrade(e.target.value)} className="w-full p-2.5 bg-slate-950 border border-white/15 text-white rounded-lg" />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Difficulty</label>
                  <select value={newDifficulty} onChange={(e) => setNewDifficulty(e.target.value as any)} className="w-full p-2.5 bg-slate-950 border border-white/15 text-white rounded-lg">
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                    <option value="Challenge">Challenge</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Format</label>
                  <select value={newType} onChange={(e) => setNewType(e.target.value as any)} className="w-full p-2.5 bg-slate-950 border border-white/15 text-white rounded-lg">
                    <option value="short-answer">Short Answer</option>
                    <option value="mcq">MCQ</option>
                    <option value="extended">Extended</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Question Statement</label>
                <textarea rows={3} value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)} className="w-full p-2.5 bg-slate-950 border border-white/15 text-white rounded-lg font-sans" required placeholder="State problem clearly..." />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Exact Final Answer</label>
                <input type="text" value={newAnswer} onChange={(e) => setNewAnswer(e.target.value)} className="w-full p-2.5 bg-slate-950 border border-white/15 text-white rounded-lg" required placeholder="e.g. x = 4 or 42 m²" />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Full Pedagogical Explanation</label>
                <textarea rows={2} value={newExplanation} onChange={(e) => setNewExplanation(e.target.value)} className="w-full p-2.5 bg-slate-950 border border-white/15 text-white rounded-lg" placeholder="Detail the step-by-step reasoning..." />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-fuchsia-400 to-pink-400 text-slate-950 font-bold hover:opacity-95 shadow-[0_0_15px_rgba(217,70,239,0.3)]"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
