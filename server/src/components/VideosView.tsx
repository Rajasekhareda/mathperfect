import React, { useState } from 'react';
import { VideoItem, NavTab } from '../types';
import {
  PlaySquare,
  Play,
  Clock,
  BookOpen,
  Sparkles,
  CheckCircle2,
  FileText,
  X,
  Search,
  ExternalLink,
  Award
} from 'lucide-react';

const VIDEO_LESSONS: VideoItem[] = [
  {
    id: 'vid-calc-intuition',
    title: 'Visual Intuition Behind Differential & Integral Calculus',
    topic: 'Calculus',
    category: 'Analysis',
    duration: '18:45',
    grade: 'High School & College',
    thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80',
    instructor: 'Dr. Elena Rostova',
    description: 'Explore the geometric essence of derivatives as local linear approximations and integrals as continuous accumulation through smooth visual transformations.',
    keyTakeaways: [
      'The derivative is the instantaneous magnification factor of an input nudge dx.',
      'The Fundamental Theorem of Calculus proves differentiation and integration are inverse operations.',
      'Area under a rate-of-change curve naturally calculates total accumulated change.'
    ],
    embedId: 'WUvTyaaNkzM'
  },
  {
    id: 'vid-quadratic-mastery',
    title: 'Mastering Quadratic Equations: Derivation, Vertex, & Graphing',
    topic: 'Algebra',
    category: 'Algebra',
    duration: '22:15',
    grade: 'Grade 9 - 11',
    thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop&q=80',
    instructor: 'Prof. Marcus Vance',
    description: 'A comprehensive walkthrough from algebraic completing-the-square to deriving the full quadratic formula, finding symmetry lines, and parabola turning points.',
    keyTakeaways: [
      'Completing the square bridges the gap between geometry and algebraic equations.',
      'The discriminant Δ = b² - 4ac determines whether roots are real, equal, or complex.',
      'The vertex (-b/2a, f(-b/2a)) always lies on the vertical axis of bilateral symmetry.'
    ],
    embedId: 'ZBalWWHYFQc'
  },
  {
    id: 'vid-trig-unit-circle',
    title: 'The Trigonometric Unit Circle: Sine, Cosine, & Radians Naturally',
    topic: 'Trigonometry',
    category: 'Geometry',
    duration: '16:30',
    grade: 'Grade 10 - 12',
    thumbnail: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=600&auto=format&fit=crop&q=80',
    instructor: 'Sarah Jenkins, M.Ed.',
    description: 'Stop memorizing arbitrary tables. See how coordinates on the unit circle directly parameterize sinusoidal waves and why 2π radians is the purest angle measure.',
    keyTakeaways: [
      'A radian measures arc length along a circle divided by radius (s = rθ).',
      'The x-coordinate equals cos(θ) while the y-coordinate equals sin(θ).',
      'Special angles (30°, 45°, 60°) arise directly from equilateral and isosceles right triangles.'
    ],
    embedId: 'cIVpemcoRqY'
  },
  {
    id: 'vid-linear-algebra-determinants',
    title: 'Linear Systems & The Geometric Meaning of Determinants',
    topic: 'Linear Algebra',
    category: 'Algebra',
    duration: '20:10',
    grade: 'Grade 11 - College',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    instructor: 'Dr. Arthur Pendelton',
    description: 'Discover how 2x2 and 3x3 matrices represent coordinate transformations and how the determinant measures the area scaling factor of the transformation.',
    keyTakeaways: [
      'A matrix transformation maps the basis vectors i-hat and j-hat to new vector coordinates.',
      'The determinant of a 2x2 matrix represents the signed area of the transformed unit square.',
      'If the determinant equals zero, space is squished into a line and the system has no unique inverse.'
    ],
    embedId: 'Ip3X9LOh2dk'
  },
  {
    id: 'vid-pythagoras-dimensions',
    title: 'Pythagorean Theorem In Higher Dimensions & Euclidean Norms',
    topic: 'Geometry',
    category: 'Geometry',
    duration: '14:40',
    grade: 'Grade 8 - 12',
    thumbnail: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    instructor: 'Prof. Marcus Vance',
    description: 'Generalize the classic a² + b² = c² theorem to calculate 3-dimensional diagonals (x² + y² + z² = d²) and vector Euclidean norms in modern physics.',
    keyTakeaways: [
      'Repeated application of Pythagoras in perpendicular planes proves 3D distance.',
      'The distance formula in Cartesian coordinates is a direct algebraic restatement of Pythagoras.',
      'Forms the foundation of metric tensor geometry and vector spaces.'
    ],
    embedId: 'CAkMUdeB06o'
  },
  {
    id: 'vid-probability-combinatorics',
    title: 'Permutations, Combinations, & The Art of Counting',
    topic: 'Probability',
    category: 'Discrete Math',
    duration: '19:20',
    grade: 'Grade 9 - 12',
    thumbnail: 'https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?w=600&auto=format&fit=crop&q=80',
    instructor: 'Dr. Elena Rostova',
    description: 'Clear up the confusion between permutations (order matters) and combinations (grouping matters) through intuitive tree diagrams and Pascal triangle connections.',
    keyTakeaways: [
      'Multiplication principle: If task A has m ways and task B has n ways, together there are m × n ways.',
      'Permutations nPr = n! / (n-r)! counts sequences where order is distinguishing.',
      'Combinations nCr = n! / (r! (n-r)!) divides out the internal permutations of the selected group.'
    ],
    embedId: 'XqQTXW7XfNY'
  }
];

interface VideosViewProps {
  onNavigate: (tab: NavTab) => void;
}

export const VideosView: React.FC<VideosViewProps> = ({ onNavigate }) => {
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredVideos = VIDEO_LESSONS.filter((vid) => {
    const matchesTopic = selectedTopic === 'All' || vid.topic === selectedTopic;
    const matchesSearch =
      vid.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vid.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vid.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTopic && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-wider">
          <PlaySquare className="w-4 h-4 text-sky-300" />
          <span>Curated Video Masterclasses</span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight mt-1">
          High-Yield <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-300">Video Masterclasses</span>
        </h1>
        <p className="text-sm text-slate-300 mt-1 max-w-3xl">
          Develop visual intuition and conceptual breakthroughs with carefully structured masterclasses covering algebra, calculus, trigonometry, and discrete probability.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-white/10 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search lessons by title, concept, or instructor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-sky-400 font-sans"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {['All', 'Algebra', 'Calculus', 'Trigonometry', 'Geometry', 'Probability'].map((topic) => (
            <button
              key={topic}
              onClick={() => setSelectedTopic(topic)}
              aria-selected={selectedTopic === topic}
              data-selected={selectedTopic === topic}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedTopic === topic
                  ? 'bg-gradient-to-r from-sky-400 to-blue-500 text-slate-950 shadow-[0_0_10px_rgba(56,189,248,0.4)]'
                  : 'bg-slate-950 text-slate-300 hover:bg-slate-800 hover:text-white border border-white/10'
              }`}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map((vid) => (
          <div
            key={vid.id}
            className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/10 hover:border-sky-400/40 hover:shadow-[0_0_25px_rgba(56,189,248,0.2)] transition-all overflow-hidden flex flex-col justify-between group text-slate-200"
          >
            <div>
              {/* Thumbnail Container */}
              <div
                onClick={() => setSelectedVideo(vid)}
                className="relative h-48 w-full bg-slate-950 cursor-pointer overflow-hidden"
              >
                <img
                  src={vid.thumbnail}
                  alt={vid.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-slate-900/90 group-hover:bg-gradient-to-r group-hover:from-sky-400 group-hover:to-blue-500 group-hover:text-slate-950 text-sky-400 flex items-center justify-center shadow-xl transition-all group-hover:scale-110 border border-white/20">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>

                <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-slate-950/90 text-slate-200 text-[11px] font-mono font-semibold border border-white/10">
                  {vid.duration}
                </div>

                <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-sky-500/90 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-md">
                  {vid.topic}
                </div>
              </div>

              {/* Text Info */}
              <div className="p-5 space-y-2">
                <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
                  <span>{vid.instructor}</span>
                  <span className="text-sky-300 font-semibold">{vid.grade}</span>
                </div>

                <h3
                  onClick={() => setSelectedVideo(vid)}
                  className="text-base font-bold text-white group-hover:text-sky-300 transition-colors line-clamp-2 cursor-pointer leading-snug"
                >
                  {vid.title}
                </h3>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {vid.description}
                </p>
              </div>
            </div>

            <div className="p-5 pt-0">
              <button
                onClick={() => setSelectedVideo(vid)}
                className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-sky-300 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-sky-400/40 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Watch Lesson & Key Takeaways</span>
                <Play className="w-3.5 h-3.5 fill-sky-300" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Video Masterclass Player Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in-50 duration-150">
          <div className="bg-slate-900 rounded-3xl max-w-4xl w-full p-6 sm:p-8 border border-white/15 shadow-2xl max-h-[92vh] overflow-y-auto space-y-6 text-slate-200">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sky-950/60 text-sky-300 border border-sky-500/30">
                    {selectedVideo.topic}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">• {selectedVideo.duration}</span>
                  <span className="text-xs text-slate-400 font-medium">• Instructor: {selectedVideo.instructor}</span>
                </div>
                <h3 className="text-xl font-bold text-white mt-1">
                  {selectedVideo.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedVideo(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Embedded Player Frame */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 shadow-inner border border-white/10">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube-nocookie.com/embed/${selectedVideo.embedId}?autoplay=1&rel=0`}
                title={selectedVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* High-Yield Key Takeaways */}
            <div className="bg-slate-950/80 p-5 rounded-2xl border border-white/10 space-y-3">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <span>High-Yield Conceptual Takeaways</span>
              </h4>

              <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
                {selectedVideo.keyTakeaways.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer Action to Practice on Worksheets */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-white/10">
              <div className="text-xs text-slate-400">
                Ready to reinforce this concept? Generate a customized practice worksheet.
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    setSelectedVideo(null);
                    onNavigate('worksheets');
                  }}
                  className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-sky-400 via-cyan-400 to-indigo-400 hover:opacity-95 text-slate-950 rounded-xl text-xs font-bold transition-opacity flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(56,189,248,0.3)]"
                >
                  <FileText className="w-4 h-4" />
                  <span>Practice with Worksheet</span>
                </button>
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
