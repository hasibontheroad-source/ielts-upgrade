import React, { useState, useEffect } from 'react';
import {
  CAMBRIDGE_BOOKS,
  getCambridgeTest,
  CambridgeBookSummary,
  CambridgeTest,
  QuestionItem,
  WritingPrompt,
} from '../data/cambridgeTests';
import {
  calculateListeningBandScore,
  calculateReadingBandScore,
  calculateWritingBandScore,
  calculateSpeakingBandScore,
  calculateOverallBandScore,
  evaluateSectionAnswers,
  SectionScoreSummary,
  getCEFRLevel,
  getBandDescriptor,
} from '../utils/scoring';
import WritingChartVisualizer from './WritingChartVisualizer';
import PartScoreModal from './PartScoreModal';
import CambridgeModuleSelector, { AcademicModuleType } from './CambridgeModuleSelector';
import {
  BookOpen,
  Headphones,
  FileText,
  PenTool,
  Mic,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCcw,
  Sparkles,
  Volume2,
  ChevronRight,
  Award,
  ArrowLeft,
  Search,
  Flag,
  Timer,
  Check,
  BarChart2,
  Sliders,
  ExternalLink,
  VolumeX,
  TrendingUp,
  Scale,
  Calculator,
  Bookmark,
  BookmarkCheck,
  Compass,
} from 'lucide-react';
import {
  saveMaterialForOffline,
  removeSavedMaterial,
  isMaterialSaved,
  subscribeToOfflineCache,
} from '../utils/offlineStorage';

interface CambridgeMockHubProps {
  onSaveAttempt: (attempt: any) => void;
  onNavigateToWriting?: (promptData: any) => void;
  onNavigateToSpeaking?: (topicData: any) => void;
  initialSelectedTest?: { bookNumber: number; testNumber: number; module?: 'listening' | 'reading' | 'writing' | 'speaking' } | null;
}

export default function CambridgeMockHub({
  onSaveAttempt,
  onNavigateToWriting,
  onNavigateToSpeaking,
  initialSelectedTest,
}: CambridgeMockHubProps) {
  const [selectedBook, setSelectedBook] = useState<number>(initialSelectedTest?.bookNumber || 21);
  const [selectedTestNum, setSelectedTestNum] = useState<number>(initialSelectedTest?.testNumber || 1);
  const [selectedEra, setSelectedEra] = useState<'all' | 'modern' | 'established' | 'classic'>('all');
  const [savedMap, setSavedMap] = useState<Record<string, boolean>>({});
  const [overviewTab, setOverviewTab] = useState<'module-selector' | 'book-archives'>('module-selector');

  useEffect(() => {
    if (initialSelectedTest) {
      setSelectedBook(initialSelectedTest.bookNumber);
      setSelectedTestNum(initialSelectedTest.testNumber);
      if (initialSelectedTest.module) {
        setActiveModule(initialSelectedTest.module);
      }
      setViewState('test');
    }
  }, [initialSelectedTest]);

  useEffect(() => {
    const updateSavedMap = () => {
      const map: Record<string, boolean> = {};
      for (let b = 1; b <= 21; b++) {
        for (let t = 1; t <= 4; t++) {
          const id = `b${b}-t${t}`;
          map[id] = isMaterialSaved(id);
        }
      }
      setSavedMap(map);
    };
    updateSavedMap();
    const unsub = subscribeToOfflineCache(updateSavedMap);
    return () => unsub();
  }, []);

  const handleToggleSaveTest = (bookNum: number, testNum: number) => {
    const id = `b${bookNum}-t${testNum}`;
    if (savedMap[id]) {
      removeSavedMaterial(id);
    } else {
      const fullTest = getCambridgeTest(bookNum, testNum);
      saveMaterialForOffline({
        id,
        bookNumber: bookNum,
        testNumber: testNum,
        module: activeModule,
        title: `Cambridge IELTS ${bookNum} Academic Test ${testNum}`,
        savedAt: new Date().toISOString(),
        data: fullTest,
      });
    }
  };
  const [searchQuery, setSearchQuery] = useState('');

  // Mode: 'overview' | 'test'
  const [viewState, setViewState] = useState<'overview' | 'test'>('overview');
  const [testMode, setTestMode] = useState<'simulation' | 'modular'>('modular');
  const [activeModule, setActiveModule] = useState<'listening' | 'reading' | 'writing' | 'speaking'>('listening');

  // Active Test Data from Master Generator (Books 1 to 21, Tests 1 to 4)
  const activeTest: CambridgeTest = getCambridgeTest(selectedBook, selectedTestNum);

  // User interactive answers: key is question ID
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<number, boolean>>({});
  const [submittedSections, setSubmittedSections] = useState<Record<string, boolean>>({});
  const [ttsAudioUrl, setTtsAudioUrl] = useState<string | null>(null);
  const [isGeneratingTts, setIsGeneratingTts] = useState<boolean>(false);

  // Modal State for Section Instant Scoring
  const [activeSectionSummary, setActiveSectionSummary] = useState<SectionScoreSummary | null>(null);
  const [isScoreModalOpen, setIsScoreModalOpen] = useState<boolean>(false);
  const [nextSectionAction, setNextSectionAction] = useState<(() => void) | null>(null);
  const [nextSectionLabel, setNextSectionLabel] = useState<string>('Next Section');

  // Running Cumulative Tally across Parts
  const [completedPartScores, setCompletedPartScores] = useState<Record<string, { correct: number; total: number; band: number }>>({});

  // Writing Module Simulated Band Calculator
  const [writingTask1Band, setWritingTask1Band] = useState<number>(6.5);
  const [writingTask2Band, setWritingTask2Band] = useState<number>(7.0);

  // Full Exam Simulation Countdown Timer (2 hours 45 minutes = 9900 seconds)
  const [simulationSecondsRemaining, setSimulationSecondsRemaining] = useState<number>(9900);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Speaking Part 2 Timer state
  const [speakingPrepTime, setSpeakingPrepTime] = useState<number>(60);
  const [isPrepTimerActive, setIsPrepTimerActive] = useState<boolean>(false);
  const [speakingRecordTime, setSpeakingRecordTime] = useState<number>(120);
  const [isRecordTimerActive, setIsRecordTimerActive] = useState<boolean>(false);

  // Simulation timer effect
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && simulationSecondsRemaining > 0) {
      interval = setInterval(() => {
        setSimulationSecondsRemaining((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, simulationSecondsRemaining]);

  // Speaking Part 2 Prep Countdown effect
  useEffect(() => {
    let interval: any = null;
    if (isPrepTimerActive && speakingPrepTime > 0) {
      interval = setInterval(() => {
        setSpeakingPrepTime((prev) => Math.max(0, prev - 1));
      }, 1000);
    } else if (speakingPrepTime === 0) {
      setIsPrepTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [isPrepTimerActive, speakingPrepTime]);

  // Filter books by Era and Search query
  const filteredBooks = CAMBRIDGE_BOOKS.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.bookNumber.toString().includes(searchQuery) ||
      b.highlight.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedEra === 'modern') return b.bookNumber >= 18;
    if (selectedEra === 'established') return b.bookNumber >= 10 && b.bookNumber <= 17;
    if (selectedEra === 'classic') return b.bookNumber <= 9;
    return true;
  });

  const handleAnswerChange = (questionId: number, value: string) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const toggleFlagQuestion = (questionId: number) => {
    setFlaggedQuestions((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const handlePlayTts = async (text: string) => {
    setIsGeneratingTts(true);
    try {
      const res = await fetch('/api/gemini/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice: 'Puck',
          style: 'Clear, authentic British IELTS Listening Examiner and dialogue speaker',
        }),
      });
      const data = await res.json();
      if (data.audioBase64) {
        setTtsAudioUrl(`data:audio/wav;base64,${data.audioBase64}`);
      }
    } catch (err) {
      console.error('Failed to generate audio:', err);
    } finally {
      setIsGeneratingTts(false);
    }
  };

  // Submit a single Listening Section (with instant score card modal)
  const handleSubmitListeningSection = (
    sectionIndex: number,
    sectionNumber: number,
    sectionTitle: string,
    questions: QuestionItem[]
  ) => {
    const partKey = `listening_sec_${sectionNumber}`;
    setSubmittedSections((prev) => ({ ...prev, [partKey]: true }));

    // Calculate prior cumulative totals for listening
    let priorCorrect = 0;
    let priorTotal = 0;
    Object.entries(completedPartScores).forEach(([k, val]) => {
      if (k.startsWith('listening_') && k !== partKey) {
        priorCorrect += val.correct;
        priorTotal += val.total;
      }
    });

    const summary = evaluateSectionAnswers(
      questions,
      userAnswers,
      sectionNumber,
      `Listening Section ${sectionNumber}: ${sectionTitle}`,
      'listening',
      priorCorrect,
      priorTotal
    );

    // Save part score to cumulative map
    setCompletedPartScores((prev) => ({
      ...prev,
      [partKey]: {
        correct: summary.correctCount,
        total: summary.totalQuestions,
        band: summary.partBand,
      },
    }));

    // Trigger instant score card modal
    setActiveSectionSummary(summary);
    setIsScoreModalOpen(true);

    if (sectionNumber < 4) {
      setNextSectionLabel(`Advance to Section ${sectionNumber + 1}`);
      setNextSectionAction(() => () => {
        // Scroll or focus next section
        const nextElem = document.getElementById(`listening-section-${sectionNumber + 1}`);
        if (nextElem) nextElem.scrollIntoView({ behavior: 'smooth' });
      });
    } else {
      setNextSectionLabel('Proceed to Reading Module');
      setNextSectionAction(() => () => {
        setActiveModule('reading');
      });
    }

    // Persist attempt to Firestore
    onSaveAttempt({
      bookNumber: selectedBook,
      testNumber: selectedTestNum,
      module: 'listening',
      score: summary.scaled40Score,
      bandScore: summary.cumulativeBand,
      durationSeconds: 600,
      details: `Section ${sectionNumber}: ${summary.correctCount}/${summary.totalQuestions} (${summary.partBand} Band) · Projected Test Band: ${summary.cumulativeBand}`,
      createdAt: new Date().toISOString(),
    });
  };

  // Submit a single Reading Passage (with instant score card modal)
  const handleSubmitReadingPassage = (
    passageIndex: number,
    passageNumber: number,
    passageTitle: string,
    questions: QuestionItem[]
  ) => {
    const partKey = `reading_passage_${passageNumber}`;
    setSubmittedSections((prev) => ({ ...prev, [partKey]: true }));

    let priorCorrect = 0;
    let priorTotal = 0;
    Object.entries(completedPartScores).forEach(([k, val]) => {
      if (k.startsWith('reading_') && k !== partKey) {
        priorCorrect += val.correct;
        priorTotal += val.total;
      }
    });

    const summary = evaluateSectionAnswers(
      questions,
      userAnswers,
      passageNumber,
      `Academic Reading Passage ${passageNumber}: ${passageTitle}`,
      'reading',
      priorCorrect,
      priorTotal
    );

    setCompletedPartScores((prev) => ({
      ...prev,
      [partKey]: {
        correct: summary.correctCount,
        total: summary.totalQuestions,
        band: summary.partBand,
      },
    }));

    setActiveSectionSummary(summary);
    setIsScoreModalOpen(true);

    if (passageNumber < 3) {
      setNextSectionLabel(`Advance to Passage ${passageNumber + 1}`);
      setNextSectionAction(() => () => {
        const nextElem = document.getElementById(`reading-passage-${passageNumber + 1}`);
        if (nextElem) nextElem.scrollIntoView({ behavior: 'smooth' });
      });
    } else {
      setNextSectionLabel('Proceed to Writing Module');
      setNextSectionAction(() => () => {
        setActiveModule('writing');
      });
    }

    onSaveAttempt({
      bookNumber: selectedBook,
      testNumber: selectedTestNum,
      module: 'reading',
      score: summary.scaled40Score,
      bandScore: summary.cumulativeBand,
      durationSeconds: 1200,
      details: `Passage ${passageNumber}: ${summary.correctCount}/${summary.totalQuestions} (${summary.partBand} Band) · Projected Test Band: ${summary.cumulativeBand}`,
      createdAt: new Date().toISOString(),
    });
  };

  const resetCurrentTestState = () => {
    setUserAnswers({});
    setFlaggedQuestions({});
    setSubmittedSections({});
    setCompletedPartScores({});
    setActiveSectionSummary(null);
    setIsScoreModalOpen(false);
    setTtsAudioUrl(null);
    setSimulationSecondsRemaining(9900);
    setIsTimerRunning(false);
    setSpeakingPrepTime(60);
    setIsPrepTimerActive(false);
    setSpeakingRecordTime(120);
    setIsRecordTimerActive(false);
  };

  const startTest = (mode: 'simulation' | 'modular', defaultModule: 'listening' | 'reading' | 'writing' | 'speaking' = 'listening') => {
    resetCurrentTestState();
    setTestMode(mode);
    setActiveModule(defaultModule);
    setViewState('test');
    if (mode === 'simulation') {
      setIsTimerRunning(true);
    }
  };

  // Format seconds into HH:MM:SS
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Official Combined Writing Band
  const officialWritingBand = calculateWritingBandScore(writingTask1Band, writingTask2Band);

  return (
    <div className="space-y-8">
      {/* Instant Section Score Card Modal */}
      <PartScoreModal
        isOpen={isScoreModalOpen}
        onClose={() => setIsScoreModalOpen(false)}
        onProceedNext={() => {
          if (nextSectionAction) nextSectionAction();
        }}
        summary={activeSectionSummary}
        bookNumber={selectedBook}
        testNumber={selectedTestNum}
        hasNextPart={Boolean(nextSectionAction)}
        nextPartLabel={nextSectionLabel}
      />

      {/* Hero Header */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2">
              <span className="font-mono text-red-400 font-bold uppercase tracking-wider">Cambridge Academic</span>
              <span>·</span>
              <span>Official 9-Band System</span>
              <span>·</span>
              <span>Books 1 to 21 Eligible</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Cambridge IELTS Academic Mock Hub
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
              Complete test papers from Cambridge IELTS 1 through Cambridge IELTS 21. Real exam scoring with instant score card modals after every single section, official 1:2 Writing weighting, and 4-criteria Speaking rubrics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center min-w-[105px]">
              <span className="block text-2xl font-black text-white font-mono tabular-nums">21</span>
              <span className="text-xs text-slate-400 font-medium">Official Books</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center min-w-[105px]">
              <span className="block text-2xl font-black text-sky-400 font-mono tabular-nums">84</span>
              <span className="text-xs text-slate-400 font-medium">Full Tests</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center min-w-[105px]">
              <span className="block text-2xl font-black text-emerald-400 font-mono tabular-nums">0–9.0</span>
              <span className="text-xs text-slate-400 font-medium">Official Bands</span>
            </div>
          </div>
        </div>
      </div>

      {/* VIEW STATE 1: BROWSE BOOKS 1 TO 21 & SELECT TEST */}
      {viewState === 'overview' && (
        <div className="space-y-6">
          {/* Top Switcher: Module Test Navigator vs Full Book Archives */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setOverviewTab('module-selector')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  overviewTab === 'module-selector'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Module Test Navigator (Listening · Reading · Writing · Speaking)</span>
              </button>
              <button
                onClick={() => setOverviewTab('book-archives')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  overviewTab === 'book-archives'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Cambridge Books 1–21 Archives</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-400 px-3 hidden md:block">
              {overviewTab === 'module-selector'
                ? 'Select specific module tests across Books 1–21'
                : 'Browse by book edition & launch full 2h 45m papers'}
            </div>
          </div>

          {/* TAB 1: MODULE TEST NAVIGATOR */}
          {overviewTab === 'module-selector' && (
            <CambridgeModuleSelector
              selectedBook={selectedBook}
              onSelectBook={setSelectedBook}
              selectedTestNum={selectedTestNum}
              onSelectTestNum={setSelectedTestNum}
              onStartModuleTest={(bNum, tNum, mod) => {
                setSelectedBook(bNum);
                setSelectedTestNum(tNum);
                startTest('modular', mod);
              }}
              savedMap={savedMap}
              onToggleSaveTest={handleToggleSaveTest}
            />
          )}

          {/* TAB 2: CAMBRIDGE BOOKS 1-21 ARCHIVES */}
          {overviewTab === 'book-archives' && (
            <div className="space-y-6">
          {/* Era Filter Bar & Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Search Books 1-21, topics, or year..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 pl-10 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>

            {/* Era Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              <button
                onClick={() => setSelectedEra('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                  selectedEra === 'all'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                All 21 Books
              </button>
              <button
                onClick={() => setSelectedEra('modern')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                  selectedEra === 'modern'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Modern Era (18-21)
              </button>
              <button
                onClick={() => setSelectedEra('established')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                  selectedEra === 'established'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Established Era (10-17)
              </button>
              <button
                onClick={() => setSelectedEra('classic')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                  selectedEra === 'classic'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Classic Era (1-9)
              </button>
            </div>
          </div>

          {/* Quick Jump Book Picker Carousel */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            <span className="text-xs text-slate-400 font-semibold whitespace-nowrap shrink-0">Book:</span>
            {Array.from({ length: 21 }, (_, i) => 21 - i).map((bNum) => (
              <button
                key={bNum}
                onClick={() => setSelectedBook(bNum)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  selectedBook === bNum
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                Book {bNum}
              </button>
            ))}
          </div>

          {/* Selected Book Test Selection Card */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-950 border border-blue-800 text-blue-300">
                    Selected Book
                  </span>
                  <span className="text-xs text-slate-400">
                    Release Year: <strong className="text-slate-200 font-mono">{activeTest.year}</strong>
                  </span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs text-slate-400">
                    Difficulty: <strong className="text-amber-300">{activeTest.difficulty}</strong>
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                  Cambridge IELTS {selectedBook} Academic
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl">
                  {CAMBRIDGE_BOOKS.find((b) => b.bookNumber === selectedBook)?.highlight}
                </p>
              </div>

              {/* Mode Launcher Button */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={() => startTest('simulation')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
                >
                  <Timer className="w-4 h-4" />
                  <span>Start Full Timed Exam (2h 45m)</span>
                </button>
              </div>
            </div>

            {/* Test 1, 2, 3, 4 Cards for this Book */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Choose Test Paper (4 Full Tests Eligible):
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((tNum) => {
                  const testData = getCambridgeTest(selectedBook, tNum);
                  const isSelected = selectedTestNum === tNum;
                  return (
                    <div
                      key={tNum}
                      onClick={() => setSelectedTestNum(tNum)}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-blue-950/40 border-blue-500 shadow-lg shadow-blue-950/50'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-blue-400 font-mono">
                              TEST 0{tNum}
                            </span>
                            {savedMap[`b${selectedBook}-t${tNum}`] && (
                              <span className="text-[10px] font-bold text-red-400 bg-red-950/60 border border-red-800/40 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                                <BookmarkCheck className="w-3 h-3" /> Saved
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 capitalize">
                              {testData.writingPrompts.task1.chartData?.type} Chart
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleSaveTest(selectedBook, tNum);
                              }}
                              className={`p-1 rounded-md border transition cursor-pointer ${
                                savedMap[`b${selectedBook}-t${tNum}`]
                                  ? 'border-red-500/60 bg-red-950/50 text-red-400'
                                  : 'border-slate-800 bg-slate-900 text-slate-500 hover:text-slate-300 hover:border-slate-700'
                              }`}
                              title={savedMap[`b${selectedBook}-t${tNum}`] ? 'Saved for offline use - click to remove' : 'Save this test for offline access'}
                            >
                              <Bookmark className={`w-3.5 h-3.5 ${savedMap[`b${selectedBook}-t${tNum}`] ? 'fill-current' : ''}`} />
                            </button>
                          </div>
                        </div>

                        <div>
                          <h5 className="font-bold text-sm text-white">Academic Test {tNum}</h5>
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                            {testData.writingPrompts.task1.title}
                          </p>
                        </div>

                        <div className="text-[11px] text-slate-400 space-y-1 pt-1 border-t border-slate-850">
                          <div>🎧 4 Listening Sections (Part-by-part scoring)</div>
                          <div>📖 3 Reading Passages (Instant score cards)</div>
                          <div>✍️ Writing Task 1 (33%) & Task 2 (67%)</div>
                          <div>🗣️ Speaking Parts 1, 2 & 3 Rubrics</div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTestNum(tNum);
                            startTest('modular', 'listening');
                          }}
                          className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                        >
                          <span>Practice Test {tNum}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Skill Jump Grid for Selected Test */}
            <div className="pt-4 border-t border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Or Jump Directly to a Module in Book {selectedBook} Test {selectedTestNum}:
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={() => startTest('modular', 'listening')}
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500 hover:bg-slate-900 transition-colors cursor-pointer text-left"
                >
                  <Headphones className="w-5 h-5 text-blue-400 shrink-0" />
                  <div>
                    <span className="block text-xs font-bold text-white">Listening</span>
                    <span className="text-[10px] text-slate-400">4 Sections with Score Cards</span>
                  </div>
                </button>

                <button
                  onClick={() => startTest('modular', 'reading')}
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500 hover:bg-slate-900 transition-colors cursor-pointer text-left"
                >
                  <FileText className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="block text-xs font-bold text-white">Reading</span>
                    <span className="text-[10px] text-slate-400">3 Passages with Score Cards</span>
                  </div>
                </button>

                <button
                  onClick={() => startTest('modular', 'writing')}
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500 hover:bg-slate-900 transition-colors cursor-pointer text-left"
                >
                  <PenTool className="w-5 h-5 text-indigo-400 shrink-0" />
                  <div>
                    <span className="block text-xs font-bold text-white">Writing</span>
                    <span className="text-[10px] text-slate-400">1:2 Official Combined Band</span>
                  </div>
                </button>

                <button
                  onClick={() => startTest('modular', 'speaking')}
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500 hover:bg-slate-900 transition-colors cursor-pointer text-left"
                >
                  <Mic className="w-5 h-5 text-purple-400 shrink-0" />
                  <div>
                    <span className="block text-xs font-bold text-white">Speaking</span>
                    <span className="text-[10px] text-slate-400">4 Official Criteria Rubrics</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Catalog of All Filtered Cambridge Books (1 to 21) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                All Eligible Cambridge Academic Books ({filteredBooks.length} Books Available)
              </h3>
              <span className="text-xs text-slate-400">Click any book to inspect its 4 tests</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBooks.map((b) => {
                const isCurrent = selectedBook === b.bookNumber;
                return (
                  <div
                    key={b.bookNumber}
                    onClick={() => {
                      setSelectedBook(b.bookNumber);
                      setSelectedTestNum(1);
                    }}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-blue-950/30 border-blue-500 shadow-md'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-blue-400 font-mono">
                            BOOK {b.bookNumber}
                          </span>
                          <span className="text-[11px] text-slate-400">({b.year})</span>
                        </div>
                        <h4 className="font-bold text-white text-sm mt-1">{b.title}</h4>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                        4 Tests
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                      {b.highlight}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">{b.era}</span>
                      <span className="text-blue-400 font-bold hover:underline flex items-center gap-1">
                        Select Book <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW STATE 2: ACTIVE TEST RUNNER (WITH PART-BY-PART SCORING) */}
      {viewState === 'test' && (
        <div className="space-y-6">
          {/* Top Test Control Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setViewState('overview');
                  resetCurrentTestState();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-blue-400" />
                <span>Exit Test</span>
              </button>

              <div>
                <span className="text-xs text-slate-400 block">Active Exam Paper:</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-white">
                    Cambridge {selectedBook} · Test {selectedTestNum}
                  </span>
                  <button
                    onClick={() => handleToggleSaveTest(selectedBook, selectedTestNum)}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold border transition cursor-pointer ${
                      savedMap[`b${selectedBook}-t${selectedTestNum}`]
                        ? 'border-red-500/60 bg-red-950/60 text-red-400'
                        : 'border-slate-700 bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                    title="Save this entire test for offline practice"
                  >
                    <Bookmark className={`w-3 h-3 ${savedMap[`b${selectedBook}-t${selectedTestNum}`] ? 'fill-current' : ''}`} />
                    <span>{savedMap[`b${selectedBook}-t${selectedTestNum}`] ? 'Saved Offline' : 'Save Offline'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Simulation Timer or Module Switcher */}
            <div className="flex items-center gap-3">
              {testMode === 'simulation' ? (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-950/60 border border-blue-800">
                  <Clock className="w-4 h-4 text-blue-400 animate-pulse" />
                  <span className="text-xs font-bold text-slate-300">Exam Clock:</span>
                  <span className="text-sm font-mono font-bold text-white tabular-nums">
                    {formatTime(simulationSecondsRemaining)}
                  </span>
                </div>
              ) : (
                <span className="text-xs text-slate-400 font-medium">Modular Practice Mode</span>
              )}

              {/* Module Selector Buttons */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800">
                <button
                  onClick={() => setActiveModule('listening')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    activeModule === 'listening' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Listening
                </button>
                <button
                  onClick={() => setActiveModule('reading')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    activeModule === 'reading' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Reading
                </button>
                <button
                  onClick={() => setActiveModule('writing')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    activeModule === 'writing' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Writing
                </button>
                <button
                  onClick={() => setActiveModule('speaking')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    activeModule === 'speaking' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Speaking
                </button>
              </div>
            </div>
          </div>

          {/* Running Part-by-Part Score Tracker Strip */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold text-slate-300">Section Score Tracker:</span>
              <span className="text-xs text-slate-400">
                Submit each section to receive your instant score card modal.
              </span>
            </div>

            <div className="flex items-center gap-2">
              {activeModule === 'listening' && [1, 2, 3, 4].map((sNum) => {
                const isDone = submittedSections[`listening_sec_${sNum}`];
                const scoreData = completedPartScores[`listening_sec_${sNum}`];
                return (
                  <div
                    key={sNum}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border ${
                      isDone
                        ? 'bg-blue-950 border-blue-700 text-blue-300'
                        : 'bg-slate-950 border-slate-800 text-slate-500'
                    }`}
                  >
                    Sec {sNum}: {isDone ? `${scoreData?.correct}/${scoreData?.total} (${scoreData?.band}b)` : 'Pending'}
                  </div>
                );
              })}

              {activeModule === 'reading' && [1, 2, 3].map((pNum) => {
                const isDone = submittedSections[`reading_passage_${pNum}`];
                const scoreData = completedPartScores[`reading_passage_${pNum}`];
                return (
                  <div
                    key={pNum}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border ${
                      isDone
                        ? 'bg-emerald-950 border-emerald-700 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-500'
                    }`}
                  >
                    Passage {pNum}: {isDone ? `${scoreData?.correct}/${scoreData?.total} (${scoreData?.band}b)` : 'Pending'}
                  </div>
                );
              })}
            </div>
          </div>

          {/* MODULE: LISTENING (WITH PART-BY-PART INSTANT SCORE MODALS) */}
          {activeModule === 'listening' && (
            <div className="space-y-6">
              {activeTest.listeningSections.map((sec, sIdx) => {
                const partKey = `listening_sec_${sec.sectionNumber}`;
                const isPartSubmitted = submittedSections[partKey];

                return (
                  <div
                    key={sec.id}
                    id={`listening-section-${sec.sectionNumber}`}
                    className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6"
                  >
                    {/* Section Audio & Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-950 border border-blue-800 text-blue-300 font-mono">
                            Section {sec.sectionNumber} of 4
                          </span>
                          <span className="text-xs text-slate-400">Listening Module · {sec.questions.length} Questions</span>
                        </div>
                        <h3 className="font-extrabold text-base text-white mt-1">{sec.title}</h3>
                        <p className="text-xs text-slate-300 mt-0.5">{sec.audioPrompt}</p>
                      </div>

                      {/* Speech / Audio Synthesis Player */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handlePlayTts(sec.audioTranscript)}
                          disabled={isGeneratingTts}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold shadow-md cursor-pointer"
                        >
                          <Volume2 className="w-4 h-4" />
                          <span>{isGeneratingTts ? 'Synthesizing...' : 'Play Cambridge Audio'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Audio Player if generated */}
                    {ttsAudioUrl && (
                      <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
                        <audio controls src={ttsAudioUrl} className="w-full h-9" autoPlay />
                        <button
                          onClick={() => setTtsAudioUrl(null)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                          title="Dismiss Player"
                        >
                          <VolumeX className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {/* Questions Deck */}
                    <div className="space-y-4">
                      {sec.questions.map((q) => {
                        const userVal = userAnswers[q.id] || '';
                        const isCorrect = userVal.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
                        const isFlagged = flaggedQuestions[q.id];

                        return (
                          <div key={q.id} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <span className="text-xs font-bold text-blue-400 bg-blue-950 px-2 py-1 rounded-md font-mono">
                                Q{q.questionNumber}
                              </span>
                              <p className="text-xs sm:text-sm text-slate-200 flex-1 font-medium">{q.question}</p>
                              <button
                                onClick={() => toggleFlagQuestion(q.id)}
                                className={`p-1.5 rounded-lg text-xs cursor-pointer ${
                                  isFlagged ? 'text-amber-400 bg-amber-950/50' : 'text-slate-500 hover:text-slate-300'
                                }`}
                                title="Flag question for review"
                              >
                                <Flag className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {q.type === 'multiple-choice' && q.options && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                {q.options.map((opt) => (
                                  <label
                                    key={opt}
                                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-colors ${
                                      userAnswers[q.id] === opt
                                        ? 'bg-blue-950/40 border-blue-500 text-white'
                                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
                                    }`}
                                  >
                                    <input
                                      type="radio"
                                      name={`listening-${q.id}`}
                                      value={opt}
                                      checked={userAnswers[q.id] === opt}
                                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                      className="text-blue-500 focus:ring-0"
                                    />
                                    <span>{opt}</span>
                                  </label>
                                ))}
                              </div>
                            )}

                            {q.type === 'fill-blank' && (
                              <div className="pt-1">
                                <input
                                  type="text"
                                  placeholder="Type exact answer (e.g., word or number)..."
                                  value={userAnswers[q.id] || ''}
                                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                  className="w-full sm:w-80 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                />
                              </div>
                            )}

                            {isPartSubmitted && (
                              <div
                                className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                                  isCorrect
                                    ? 'bg-emerald-950/40 border border-emerald-800/50 text-emerald-300'
                                    : 'bg-rose-950/40 border border-rose-800/50 text-rose-300'
                                }`}
                              >
                                {isCorrect ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                                ) : (
                                  <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
                                )}
                                <div>
                                  <p className="font-bold">
                                    {isCorrect ? 'Correct!' : `Correct Answer: "${q.correctAnswer}"`}
                                  </p>
                                  <p className="text-slate-300 mt-0.5">{q.explanation}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Part Submission and Instant Modal Launcher */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
                      <button
                        onClick={() =>
                          handleSubmitListeningSection(
                            sIdx,
                            sec.sectionNumber,
                            sec.title,
                            sec.questions
                          )
                        }
                        className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 cursor-pointer"
                      >
                        Submit Section {sec.sectionNumber} & Get Score Card
                      </button>

                      {isPartSubmitted && (
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() =>
                              handleSubmitListeningSection(
                                sIdx,
                                sec.sectionNumber,
                                sec.title,
                                sec.questions
                              )
                            }
                            className="text-xs font-bold text-blue-400 hover:underline cursor-pointer"
                          >
                            Re-open Section {sec.sectionNumber} Score Card
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* MODULE: READING (WITH PASSAGE-BY-PASSAGE INSTANT SCORE MODALS) */}
          {activeModule === 'reading' && (
            <div className="space-y-6">
              {activeTest.readingPassages.map((passage, pIdx) => {
                const partKey = `reading_passage_${pIdx + 1}`;
                const isPassageSubmitted = submittedSections[partKey];

                return (
                  <div
                    key={passage.id}
                    id={`reading-passage-${pIdx + 1}`}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                  >
                    {/* Left Column: Authentic Academic Text */}
                    <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl max-h-[750px] overflow-y-auto pr-4 scrollbar-thin">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4 sticky top-0 bg-slate-900 z-10">
                        <div>
                          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider font-mono">
                            Passage {pIdx + 1} of 3
                          </span>
                          <h3 className="font-extrabold text-base text-white">{passage.title}</h3>
                        </div>
                        <span className="text-xs text-slate-400 font-mono">{passage.wordCount} words</span>
                      </div>

                      <div className="text-xs sm:text-sm text-slate-300 leading-relaxed space-y-4 whitespace-pre-line font-serif">
                        {passage.text}
                      </div>
                    </div>

                    {/* Right Column: Questions and Interaction */}
                    <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6 flex flex-col justify-between">
                      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                            Passage {pIdx + 1} Questions ({passage.questions.length} Items)
                          </h4>
                          <span className="text-xs text-emerald-400 font-semibold">Academic Reading</span>
                        </div>

                        {passage.questions.map((q) => {
                          const isCorrect = (userAnswers[q.id] || '').trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
                          const isFlagged = flaggedQuestions[q.id];

                          return (
                            <div key={q.id} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
                              <div className="flex items-start justify-between gap-3">
                                <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-2 py-1 rounded-md font-mono">
                                  Q{q.questionNumber}
                                </span>
                                <p className="text-xs sm:text-sm text-slate-200 flex-1 font-medium">{q.question}</p>
                                <button
                                  onClick={() => toggleFlagQuestion(q.id)}
                                  className={`p-1.5 rounded-lg text-xs cursor-pointer ${
                                    isFlagged ? 'text-amber-400 bg-amber-950/50' : 'text-slate-500 hover:text-slate-300'
                                  }`}
                                  title="Flag question"
                                >
                                  <Flag className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {q.type === 'true-false-not-given' && (
                                <div className="flex items-center gap-2 pt-1">
                                  {['TRUE', 'FALSE', 'NOT GIVEN'].map((opt) => (
                                    <button
                                      key={opt}
                                      type="button"
                                      onClick={() => handleAnswerChange(q.id, opt)}
                                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                                        userAnswers[q.id] === opt
                                          ? 'bg-emerald-600 text-white border-emerald-500'
                                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-850'
                                      }`}
                                    >
                                      {opt}
                                    </button>
                                  ))}
                                </div>
                              )}

                              {q.type === 'multiple-choice' && q.options && (
                                <div className="space-y-1.5 pt-1">
                                  {q.options.map((opt) => (
                                    <label
                                      key={opt}
                                      className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-medium cursor-pointer transition-colors ${
                                        userAnswers[q.id] === opt
                                          ? 'bg-emerald-950/40 border-emerald-500 text-white'
                                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
                                      }`}
                                    >
                                      <input
                                        type="radio"
                                        name={`reading-${q.id}`}
                                        value={opt}
                                        checked={userAnswers[q.id] === opt}
                                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                        className="text-emerald-500 focus:ring-0"
                                      />
                                      <span>{opt}</span>
                                    </label>
                                  ))}
                                </div>
                              )}

                              {q.type === 'fill-blank' && (
                                <div className="pt-1">
                                  <input
                                    type="text"
                                    placeholder="Type exact passage word(s)..."
                                    value={userAnswers[q.id] || ''}
                                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                                  />
                                </div>
                              )}

                              {isPassageSubmitted && (
                                <div
                                  className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                                    isCorrect
                                      ? 'bg-emerald-950/40 border border-emerald-800/50 text-emerald-300'
                                      : 'bg-rose-950/40 border border-rose-800/50 text-rose-300'
                                  }`}
                                >
                                  {isCorrect ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                                  ) : (
                                    <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
                                  )}
                                  <div>
                                    <p className="font-bold">
                                      {isCorrect ? 'Correct!' : `Correct Answer: "${q.correctAnswer}"`}
                                    </p>
                                    <p className="text-slate-300 mt-0.5">{q.explanation}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Passage Submit Bar */}
                      <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-800">
                        <button
                          onClick={() =>
                            handleSubmitReadingPassage(
                              pIdx,
                              pIdx + 1,
                              passage.title,
                              passage.questions
                            )
                          }
                          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 cursor-pointer"
                        >
                          Submit Passage {pIdx + 1} & Get Score Card
                        </button>

                        {isPassageSubmitted && (
                          <button
                            onClick={() =>
                              handleSubmitReadingPassage(
                                pIdx,
                                pIdx + 1,
                                passage.title,
                                passage.questions
                              )
                            }
                            className="text-xs font-bold text-emerald-400 hover:underline cursor-pointer"
                          >
                            Re-open Passage {pIdx + 1} Score Card
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* MODULE: WRITING (WITH OFFICIAL 1:2 WEIGHTED COMBINED BAND) */}
          {activeModule === 'writing' && (
            <div className="space-y-8">
              {/* Official Writing Band Weighted Score Matrix Card */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-800/60 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <Scale className="w-5 h-5 text-indigo-400" />
                    <div>
                      <h4 className="font-black text-white text-base">
                        Official IELTS Writing Band Formula: (Task 1 + 2 × Task 2) ÷ 3
                      </h4>
                      <p className="text-xs text-slate-400">
                        Task 2 carries exactly double (66.7%) the weighting of Task 1 (33.3%).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-300 font-semibold">Combined Writing Band:</span>
                    <span className="text-2xl font-black text-indigo-400 font-mono tabular-nums px-3 py-1 rounded-xl bg-indigo-950 border border-indigo-800">
                      Band {officialWritingBand.toFixed(1)}
                    </span>
                  </div>
                </div>

                {/* Interactive Band Weighting Sliders */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300">Task 1 Report (33%):</span>
                      <span className="text-sm font-mono font-bold text-blue-400">
                        Band {writingTask1Band.toFixed(1)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="4.0"
                      max="9.0"
                      step="0.5"
                      value={writingTask1Band}
                      onChange={(e) => setWritingTask1Band(parseFloat(e.target.value))}
                      className="w-full accent-blue-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>4.0</span>
                      <span>5.5</span>
                      <span>7.0</span>
                      <span>8.5</span>
                      <span>9.0</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300">Task 2 Essay (67% - Double Weight):</span>
                      <span className="text-sm font-mono font-bold text-indigo-400">
                        Band {writingTask2Band.toFixed(1)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="4.0"
                      max="9.0"
                      step="0.5"
                      value={writingTask2Band}
                      onChange={(e) => setWritingTask2Band(parseFloat(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>4.0</span>
                      <span>5.5</span>
                      <span>7.0</span>
                      <span>8.5</span>
                      <span>9.0</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Task 1 with Interactive Vector Visualizer */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-950 border border-blue-800 text-blue-300">
                        Task 1 (Weight: 1/3)
                      </span>
                      <span className="text-xs text-slate-400 font-mono">20 Minutes · 150 Words</span>
                    </div>
                    <h3 className="font-extrabold text-base sm:text-lg text-white mt-1">
                      {activeTest.writingPrompts.task1.title}
                    </h3>
                  </div>

                  {onNavigateToWriting && (
                    <button
                      onClick={() => onNavigateToWriting(activeTest.writingPrompts)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md cursor-pointer self-start sm:self-auto"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Score Task 1 with Gemini</span>
                    </button>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                  {activeTest.writingPrompts.task1.question}
                </div>

                {activeTest.writingPrompts.task1.chartData && (
                  <WritingChartVisualizer
                    chartData={activeTest.writingPrompts.task1.chartData}
                    onSendToEvaluator={() => onNavigateToWriting && onNavigateToWriting(activeTest.writingPrompts)}
                  />
                )}

                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400">Official Cambridge Model Band 9 Answer:</span>
                    <span className="text-[11px] text-slate-400">Authentic Examiner Report</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-serif whitespace-pre-line">
                    {activeTest.writingPrompts.task1.sampleBand9Essay}
                  </p>
                </div>
              </div>

              {/* Task 2 Discursive Essay */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-indigo-950 border border-indigo-800 text-indigo-300">
                        Task 2 (Weight: 2/3)
                      </span>
                      <span className="text-xs text-slate-400 font-mono">40 Minutes · 250 Words</span>
                    </div>
                    <h3 className="font-extrabold text-base sm:text-lg text-white mt-1">
                      {activeTest.writingPrompts.task2.title}
                    </h3>
                  </div>

                  {onNavigateToWriting && (
                    <button
                      onClick={() => onNavigateToWriting(activeTest.writingPrompts)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-md cursor-pointer self-start sm:self-auto"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Evaluate Task 2 in AI Writing Studio</span>
                    </button>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                  {activeTest.writingPrompts.task2.question}
                </div>

                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-400">Official Cambridge Model Band 9 Essay:</span>
                    <span className="text-[11px] text-slate-400">Full Academic Lexical Profile</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-serif whitespace-pre-line">
                    {activeTest.writingPrompts.task2.sampleBand9Essay}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* MODULE: SPEAKING (WITH 4 OFFICIAL CRITERIA SCORING CARDS) */}
          {activeModule === 'speaking' && (
            <div className="space-y-6">
              {/* Speaking 4 Official Criteria Reference Banner */}
              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] font-bold text-purple-400 block font-mono">1. FC (25%)</span>
                  <span className="text-xs font-semibold text-white">Fluency & Coherence</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Flow, speech rate, logical sequencing</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] font-bold text-purple-400 block font-mono">2. LR (25%)</span>
                  <span className="text-xs font-semibold text-white">Lexical Resource</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Collocations, idiomatic vocabulary</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] font-bold text-purple-400 block font-mono">3. GRA (25%)</span>
                  <span className="text-xs font-semibold text-white">Grammatical Range</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Complex clause variety, accuracy</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] font-bold text-purple-400 block font-mono">4. PR (25%)</span>
                  <span className="text-xs font-semibold text-white">Pronunciation</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Phonological phrasing, intonation</p>
                </div>
              </div>

              {activeTest.speakingParts.map((sp) => (
                <div key={sp.part} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <span className="text-xs font-bold text-purple-400 uppercase tracking-wider font-mono">
                        Speaking Part {sp.part}
                      </span>
                      <h3 className="text-base font-extrabold text-white mt-0.5">{sp.title}</h3>
                    </div>
                    <span className="text-xs text-slate-400">{sp.instructions}</span>
                  </div>

                  {/* Part 1 & Part 3 Questions */}
                  {sp.questions && (
                    <div className="space-y-3">
                      {sp.questions.map((qText, qIdx) => (
                        <div key={qIdx} className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-purple-950 text-purple-400 font-mono text-xs flex items-center justify-center font-bold">
                              {qIdx + 1}
                            </span>
                            <span className="text-xs sm:text-sm text-slate-200 font-medium">{qText}</span>
                          </div>
                          <button
                            onClick={() => handlePlayTts(qText)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                            title="Hear examiner speak question"
                          >
                            <Volume2 className="w-4 h-4 text-purple-400" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Part 2 Cue Card with Interactive Timers */}
                  {sp.cueCard && (
                    <div className="space-y-4">
                      <div className="p-5 rounded-2xl bg-[#0f172a] border border-purple-500/30 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                            Candidate Cue Card
                          </span>
                          <span className="text-xs text-slate-400">1 min preparation · 2 min speech</span>
                        </div>

                        <h4 className="text-sm sm:text-base font-black text-white">
                          {sp.cueCard.topic}
                        </h4>

                        <div className="space-y-1.5 pl-4 border-l-2 border-purple-500/40 text-xs sm:text-sm text-slate-300">
                          <p className="text-slate-400 font-semibold mb-1">You should say:</p>
                          {sp.cueCard.points.map((pt, pIdx) => (
                            <div key={pIdx} className="flex items-center gap-2">
                              <span className="text-purple-400">·</span>
                              <span>{pt}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Working Preparation & Speaking Timers */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                          <div>
                            <span className="text-xs text-slate-400 block font-semibold">1-Min Note Preparation</span>
                            <span className="text-xl font-mono font-bold text-white tabular-nums">
                              {speakingPrepTime}s
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              if (isPrepTimerActive) {
                                setIsPrepTimerActive(false);
                              } else {
                                setSpeakingPrepTime(60);
                                setIsPrepTimerActive(true);
                              }
                            }}
                            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors cursor-pointer"
                          >
                            {isPrepTimerActive ? 'Pause Prep' : 'Start 1m Prep'}
                          </button>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                          <div>
                            <span className="text-xs text-slate-400 block font-semibold">Live Speaking Studio</span>
                            <span className="text-xs text-slate-300">Practice with real-time AI examiner</span>
                          </div>
                          {onNavigateToSpeaking && (
                            <button
                              onClick={() => onNavigateToSpeaking(sp.cueCard)}
                              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md cursor-pointer"
                            >
                              Launch Speaking Studio
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
