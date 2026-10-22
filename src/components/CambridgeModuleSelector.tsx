import React, { useState } from 'react';
import {
  CAMBRIDGE_BOOKS,
  getCambridgeTest,
  CambridgeTest,
  WritingChartData,
} from '../data/cambridgeTests';
import {
  Headphones,
  BookOpen,
  PenTool,
  Mic,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  ArrowRight,
  Clock,
  Award,
  Sliders,
  CheckCircle2,
  FileText,
  TrendingUp,
  BarChart2,
  Sparkles,
  Search,
} from 'lucide-react';
import WritingChartVisualizer from './WritingChartVisualizer';

export type AcademicModuleType = 'listening' | 'reading' | 'writing' | 'speaking';

interface CambridgeModuleSelectorProps {
  selectedBook: number;
  onSelectBook: (bookNumber: number) => void;
  selectedTestNum: number;
  onSelectTestNum: (testNumber: number) => void;
  onStartModuleTest: (bookNumber: number, testNumber: number, module: AcademicModuleType) => void;
  savedMap: Record<string, boolean>;
  onToggleSaveTest: (bookNumber: number, testNumber: number) => void;
}

const MODULE_DEFINITIONS: {
  id: AcademicModuleType;
  title: string;
  badge: string;
  duration: string;
  structure: string;
  icon: typeof Headphones;
  accentColor: string;
  borderColor: string;
  bgLight: string;
  description: string;
}[] = [
  {
    id: 'listening',
    title: 'Listening',
    badge: '4 Sections · 40 Qs',
    duration: '30 mins (+10m transfer)',
    structure: 'Sections 1 to 4 (Monologues & Academic Dialogues)',
    icon: Headphones,
    accentColor: 'text-sky-400',
    borderColor: 'border-sky-500/40',
    bgLight: 'bg-sky-500/10',
    description: 'Listen once only to 4 recorded texts. Social dialogues, community monologues, and university lectures with British and international accents.',
  },
  {
    id: 'reading',
    title: 'Reading',
    badge: '3 Passages · 40 Qs',
    duration: '60 minutes',
    structure: 'Passages 1 to 3 (Scientific, Historical & Analytical)',
    icon: BookOpen,
    accentColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/40',
    bgLight: 'bg-emerald-500/10',
    description: 'Three authentic academic texts of increasing difficulty, sourced from academic journals, books, and analytical publications with instant passage scoring.',
  },
  {
    id: 'writing',
    title: 'Writing',
    badge: 'Task 1 & Task 2',
    duration: '60 minutes',
    structure: 'Task 1 (Report/Chart, 33%) + Task 2 (Discursive Essay, 67%)',
    icon: PenTool,
    accentColor: 'text-amber-400',
    borderColor: 'border-amber-500/40',
    bgLight: 'bg-amber-500/10',
    description: 'Task 1 visual data report (150 words) with interactive charts plus Task 2 academic essay (250 words) evaluated using the official 1:2 band weighting.',
  },
  {
    id: 'speaking',
    title: 'Speaking',
    badge: 'Parts 1, 2 & 3',
    duration: '11-14 minutes',
    structure: 'Introduction, Cue Card Long Turn & Analytical Discussion',
    icon: Mic,
    accentColor: 'text-purple-400',
    borderColor: 'border-purple-500/40',
    bgLight: 'bg-purple-500/10',
    description: 'Real-time face-to-face simulation assessed on Fluency & Coherence, Lexical Resource, Grammatical Range & Accuracy, and Pronunciation.',
  },
];

export const CambridgeModuleSelector: React.FC<CambridgeModuleSelectorProps> = ({
  selectedBook,
  onSelectBook,
  selectedTestNum,
  onSelectTestNum,
  onStartModuleTest,
  savedMap,
  onToggleSaveTest,
}) => {
  const [activeModule, setActiveModule] = useState<AcademicModuleType>('listening');
  const [eraFilter, setEraFilter] = useState<'all' | 'modern' | 'established' | 'classic'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showChartPreview, setShowChartPreview] = useState<number | null>(null);

  // Quick jump state for direct 1-click launcher
  const [quickModule, setQuickModule] = useState<AcademicModuleType>('listening');
  const [quickBook, setQuickBook] = useState<number>(selectedBook);
  const [quickTest, setQuickTest] = useState<number>(selectedTestNum);

  const filteredBooks = CAMBRIDGE_BOOKS.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.bookNumber.toString().includes(searchQuery) ||
      b.highlight.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.year.toString().includes(searchQuery);

    if (!matchesSearch) return false;

    if (eraFilter === 'modern') return b.bookNumber >= 18;
    if (eraFilter === 'established') return b.bookNumber >= 10 && b.bookNumber <= 17;
    if (eraFilter === 'classic') return b.bookNumber <= 9;
    return true;
  });

  const activeModuleMeta = MODULE_DEFINITIONS.find((m) => m.id === activeModule)!;
  const currentTest = getCambridgeTest(selectedBook, selectedTestNum);

  return (
    <div className="space-y-6">
      {/* SECTION HEADER & QUICK LAUNCH BAR */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">
              Official Cambridge Academic Examination System
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Granular Module & Test Navigator</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Select the exact module (Listening, Reading, Writing, or Speaking), choose any Cambridge book (1 to 21),
              and launch straight into that specific test paper.
            </p>
          </div>

          {/* Quick Direct 1-Click Launch Bar */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-wrap items-center gap-2 shrink-0">
            <div className="text-[11px] font-semibold text-slate-400 px-1">Quick Jump:</div>
            
            {/* Module Picker */}
            <select
              value={quickModule}
              onChange={(e) => setQuickModule(e.target.value as AcademicModuleType)}
              className="bg-slate-900 border border-slate-700 text-xs font-semibold text-white px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="listening">Listening (4 Sec)</option>
              <option value="reading">Reading (3 Pass)</option>
              <option value="writing">Writing (Task 1 & 2)</option>
              <option value="speaking">Speaking (3 Parts)</option>
            </select>

            {/* Book Picker */}
            <select
              value={quickBook}
              onChange={(e) => setQuickBook(Number(e.target.value))}
              className="bg-slate-900 border border-slate-700 text-xs font-semibold text-white px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              {Array.from({ length: 21 }, (_, i) => 21 - i).map((b) => (
                <option key={b} value={b}>
                  Book {b} ({2005 + b > 2026 ? 2026 : 2005 + b})
                </option>
              ))}
            </select>

            {/* Test Picker */}
            <select
              value={quickTest}
              onChange={(e) => setQuickTest(Number(e.target.value))}
              className="bg-slate-900 border border-slate-700 text-xs font-semibold text-white px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value={1}>Test 1</option>
              <option value={2}>Test 2</option>
              <option value={3}>Test 3</option>
              <option value={4}>Test 4</option>
            </select>

            {/* Immediate Go Button */}
            <button
              onClick={() => {
                onSelectBook(quickBook);
                onSelectTestNum(quickTest);
                onStartModuleTest(quickBook, quickTest, quickModule);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-red-600/30 cursor-pointer"
            >
              <span>Launch</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 1. PRIMARY MODULE SELECTOR TABS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {MODULE_DEFINITIONS.map((mod) => {
            const Icon = mod.icon;
            const isSelected = activeModule === mod.id;
            return (
              <button
                key={mod.id}
                onClick={() => {
                  setActiveModule(mod.id);
                  setQuickModule(mod.id);
                }}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-800/90 border-blue-500 ring-1 ring-blue-500/50 shadow-lg'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${mod.bgLight}`}>
                        <Icon className={`w-4 h-4 ${mod.accentColor}`} />
                      </div>
                      <span className="font-bold text-sm text-white">{mod.title} Module</span>
                    </div>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    )}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-300">
                    {mod.badge} · {mod.duration}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                    {mod.structure}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className={isSelected ? 'text-blue-400 font-bold' : 'text-slate-400'}>
                    {isSelected ? 'Active Module' : 'Select Module'}
                  </span>
                  <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-400' : 'text-slate-500'}`} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. BOOK SELECTOR CAROUSEL & FILTERS */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              Step 2 · Pick Cambridge Academic Book (1 to 21)
            </div>
            <div className="text-sm font-bold text-white mt-0.5">
              Selected: Cambridge IELTS {selectedBook} Academic ({CAMBRIDGE_BOOKS.find((b) => b.bookNumber === selectedBook)?.year})
            </div>
          </div>

          {/* Era Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setEraFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                eraFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              All 21 Books
            </button>
            <button
              onClick={() => setEraFilter('modern')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                eraFilter === 'modern'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Modern (18-21)
            </button>
            <button
              onClick={() => setEraFilter('established')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                eraFilter === 'established'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Established (10-17)
            </button>
            <button
              onClick={() => setEraFilter('classic')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                eraFilter === 'classic'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Classic (1-9)
            </button>
          </div>
        </div>

        {/* Book Selector Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 pt-1 scrollbar-thin">
          {filteredBooks.map((b) => {
            const isCurrent = selectedBook === b.bookNumber;
            return (
              <button
                key={b.bookNumber}
                onClick={() => {
                  onSelectBook(b.bookNumber);
                  setQuickBook(b.bookNumber);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 cursor-pointer flex flex-col items-center min-w-[76px] ${
                  isCurrent
                    ? 'bg-gradient-to-b from-blue-600 to-indigo-700 text-white shadow-md shadow-blue-900/50 border border-blue-400/30'
                    : 'bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span>Book {b.bookNumber}</span>
                <span className={`text-[10px] font-mono mt-0.5 ${isCurrent ? 'text-blue-100' : 'text-slate-500'}`}>
                  {b.year}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. TEST PAPERS SELECTION MATRIX (TESTS 1, 2, 3, 4) FOR THE SELECTED MODULE & BOOK */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Cambridge {selectedBook} Academic · Choose {activeModuleMeta.title} Test Paper</span>
            </h3>
            <p className="text-xs text-slate-400">
              Each test contains authentic examination questions with instant score feedback after every section.
            </p>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span>Official Scoring:</span>
            <span className="font-semibold text-emerald-400">Band 0–9.0 Scaled</span>
            <span>·</span>
            <span>4 Tests Available</span>
          </div>
        </div>

        {/* 4 Tests Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((tNum) => {
            const testData = getCambridgeTest(selectedBook, tNum);
            const isCurrentSelected = selectedTestNum === tNum;
            const isSaved = Boolean(savedMap[`b${selectedBook}-t${tNum}`]);

            return (
              <div
                key={tNum}
                onClick={() => onSelectTestNum(tNum)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isCurrentSelected
                    ? 'bg-slate-900/90 border-blue-500/80 ring-1 ring-blue-500/40 shadow-xl'
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                }`}
              >
                <div className="space-y-4">
                  {/* Top Bar of Card */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 font-mono text-xs font-black text-blue-400">
                        TEST 0{tNum}
                      </span>
                      <span className="text-xs font-bold text-white">
                        Cambridge {selectedBook} · {activeModuleMeta.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isSaved && (
                        <span className="text-[11px] font-semibold text-red-400 bg-red-950/60 border border-red-800/40 px-2 py-0.5 rounded flex items-center gap-1">
                          <BookmarkCheck className="w-3.5 h-3.5" />
                          <span>Saved Offline</span>
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleSaveTest(selectedBook, tNum);
                        }}
                        className={`p-1.5 rounded-lg border transition cursor-pointer ${
                          isSaved
                            ? 'border-red-500/60 bg-red-950/50 text-red-400'
                            : 'border-slate-800 bg-slate-950 text-slate-500 hover:text-slate-300 hover:border-slate-700'
                        }`}
                        title={isSaved ? 'Saved offline. Click to remove' : 'Save for offline practice'}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* MODULE SPECIFIC CONTENT BREAKDOWN */}
                  {activeModule === 'listening' && (
                    <div className="space-y-2.5">
                      <div className="text-xs font-semibold text-slate-300">
                        4 Audio Sections (40 Academic Questions):
                      </div>
                      <div className="space-y-1.5">
                        {testData.listeningSections.map((sec, idx) => (
                          <div
                            key={sec.id}
                            className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className="font-mono text-sky-400 font-bold shrink-0">
                                Part {sec.sectionNumber}
                              </span>
                              <span className="text-slate-300 truncate">{sec.title}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono shrink-0 pl-2">
                              10 Qs
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-1">
                        <Clock className="w-3 h-3 text-sky-400" />
                        <span>30 minutes listening · 10 minutes answer transfer simulation</span>
                      </div>
                    </div>
                  )}

                  {activeModule === 'reading' && (
                    <div className="space-y-2.5">
                      <div className="text-xs font-semibold text-slate-300">
                        3 Authentic Academic Reading Passages:
                      </div>
                      <div className="space-y-1.5">
                        {testData.readingPassages.map((pass, idx) => (
                          <div
                            key={pass.id}
                            className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className="font-mono text-emerald-400 font-bold shrink-0">
                                Passage {pass.id}
                              </span>
                              <span className="text-slate-300 truncate">{pass.title}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono shrink-0 pl-2">
                              {pass.questions.length} Qs
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-1">
                        <Clock className="w-3 h-3 text-emerald-400" />
                        <span>60 minutes total · Instant score cards after each passage</span>
                      </div>
                    </div>
                  )}

                  {activeModule === 'writing' && (
                    <div className="space-y-3">
                      {/* Task 1 preview */}
                      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-amber-400">Writing Task 1 (33% Weight)</span>
                          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] uppercase font-mono text-slate-300">
                            {testData.writingPrompts.task1.chartData?.type || 'Chart'}
                          </span>
                        </div>
                        <p className="text-xs text-white font-medium line-clamp-1">
                          {testData.writingPrompts.task1.title}
                        </p>
                        <p className="text-[11px] text-slate-400 line-clamp-2">
                          {testData.writingPrompts.task1.question}
                        </p>
                      </div>

                      {/* Task 2 preview */}
                      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-amber-400">Writing Task 2 (67% Weight)</span>
                          <span className="text-[10px] text-slate-400 font-mono">Min 250 Words</span>
                        </div>
                        <p className="text-xs text-white font-medium line-clamp-1">
                          {testData.writingPrompts.task2.title}
                        </p>
                        <p className="text-[11px] text-slate-400 line-clamp-2">
                          {testData.writingPrompts.task2.question}
                        </p>
                      </div>
                    </div>
                  )}

                  {activeModule === 'speaking' && (
                    <div className="space-y-2.5">
                      <div className="text-xs font-semibold text-slate-300">
                        3-Part Examiner Assessment:
                      </div>
                      <div className="space-y-1.5">
                        {testData.speakingParts.map((sp) => (
                          <div
                            key={sp.part}
                            className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-purple-400 font-bold">
                                Part {sp.part}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {sp.part === 1 ? '4-5 mins' : sp.part === 2 ? '3-4 mins' : '4-5 mins'}
                              </span>
                            </div>
                            <p className="text-slate-200 line-clamp-1 font-medium">{sp.title}</p>
                            {sp.cueCard && (
                              <p className="text-[11px] text-slate-400 line-clamp-1 italic">
                                Cue Card: "{sp.cueCard.topic}"
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-1">
                        <Award className="w-3 h-3 text-purple-400" />
                        <span>Graded on Fluency, Lexical Resource, Grammar, Pronunciation</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Action Area */}
                <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                  <div className="text-xs text-slate-400">
                    <span className="font-semibold text-white">Cambridge {selectedBook}</span> · Test {tNum}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTestNum(tNum);
                      onStartModuleTest(selectedBook, tNum, activeModule);
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-blue-600/30 cursor-pointer"
                  >
                    <span>Start {activeModuleMeta.title} Test</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CambridgeModuleSelector;
