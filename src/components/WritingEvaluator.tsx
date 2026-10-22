import React, { useState, useEffect } from 'react';
import {
  PenTool,
  Sparkles,
  Award,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Copy,
  Image as ImageIcon,
  Loader2,
  TrendingUp,
  RefreshCw,
  Sliders,
  ChevronRight,
  BarChart3
} from 'lucide-react';
import WritingChartVisualizer from './WritingChartVisualizer';
import { WritingChartData } from '../data/cambridgeTests';
import { calculateWritingBandScore, getCEFRLevel } from '../utils/scoring';

interface WritingEvaluatorProps {
  initialPrompt?: any;
  onSaveSubmission: (submission: any) => void;
}

const defaultTask1Chart: WritingChartData = {
  type: 'line',
  title: 'Global Renewable Energy Adoption vs Fossil Fuel Consumption (2010 - 2026)',
  subtitle: 'Share of total electricity generation across selected European economies',
  unit: '%',
  categories: ['2010', '2014', '2018', '2022', '2026'],
  series: [
    { name: 'Renewables (Solar/Wind)', color: '#0284c7', data: [15, 24, 38, 52, 68] },
    { name: 'Coal & Gas', color: '#dc2626', data: [75, 68, 55, 42, 28] },
    { name: 'Nuclear Energy', color: '#10b981', data: [22, 21, 19, 18, 17] },
  ],
};

export default function WritingEvaluator({
  initialPrompt,
  onSaveSubmission,
}: WritingEvaluatorProps) {
  const [taskType, setTaskType] = useState<'task1' | 'task2'>('task2');
  const [promptTitle, setPromptTitle] = useState<string>(
    initialPrompt?.task2?.title ||
    'Academic Writing Task 2: Artificial Intelligence and Higher Education'
  );
  const [promptQuestion, setPromptQuestion] = useState<string>(
    initialPrompt?.task2?.question ||
    'In many countries, artificial intelligence tools are becoming widely integrated into university learning and research. Some people argue that this impairs students critical thinking skills, while others believe it is an essential preparation for modern employment. Discuss both views and give your own opinion. Write at least 250 words.'
  );

  const [currentChartData, setCurrentChartData] = useState<WritingChartData>(
    initialPrompt?.task1?.chartData || defaultTask1Chart
  );

  useEffect(() => {
    if (initialPrompt) {
      if (initialPrompt.task1) {
        setTaskType('task1');
        setPromptTitle(initialPrompt.task1.title);
        setPromptQuestion(initialPrompt.task1.question);
        if (initialPrompt.task1.chartData) {
          setCurrentChartData(initialPrompt.task1.chartData);
        }
      } else if (initialPrompt.task2) {
        setTaskType('task2');
        setPromptTitle(initialPrompt.task2.title);
        setPromptQuestion(initialPrompt.task2.question);
      }
    }
  }, [initialPrompt]);

  const [essayText, setEssayText] = useState<string>('');
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Image Generation for Task 1 Charts & Diagrams (with aspect ratios and 1K/2K/4K sizing)
  const [showImageGenerator, setShowImageGenerator] = useState<boolean>(false);
  const [chartPrompt, setChartPrompt] = useState<string>(
    'Clean Cambridge IELTS Academic Writing Task 1 infographic bar chart and line graph comparing renewable energy output vs coal in European nations 2010 to 2024, clear labels, percentages and legend.'
  );
  const [aspectRatio, setAspectRatio] = useState<string>('16:9');
  const [imageSize, setImageSize] = useState<string>('1K');
  const [isGeneratingChart, setIsGeneratingChart] = useState<boolean>(false);
  const [generatedChartUrl, setGeneratedChartUrl] = useState<string | null>(null);

  // Word counter calculation
  const words = essayText.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const targetMinWords = taskType === 'task1' ? 150 : 250;
  const isWordCountMet = wordCount >= targetMinWords;

  const handleGenerateChart = async () => {
    setIsGeneratingChart(true);
    try {
      const res = await fetch('/api/gemini/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: chartPrompt,
          aspectRatio,
          imageSize,
        }),
      });
      const data = await res.json();
      if (data.imageUrl) {
        setGeneratedChartUrl(data.imageUrl);
      } else {
        alert(data.error || 'Could not generate chart image.');
      }
    } catch (err: any) {
      console.error('Failed to generate chart:', err);
      alert('Error generating visual chart image.');
    } finally {
      setIsGeneratingChart(false);
    }
  };

  const handleEvaluateEssay = async () => {
    if (wordCount < 20) {
      setErrorMsg('Please write at least 20 words to receive an accurate IELTS evaluation.');
      return;
    }

    setErrorMsg(null);
    setIsEvaluating(true);
    setEvaluationResult(null);

    try {
      const res = await fetch('/api/gemini/score-writing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType,
          promptTitle,
          promptQuestion,
          essayText,
        }),
      });

      const data = await res.json();
      if (res.ok && data.overallBand !== undefined) {
        setEvaluationResult(data);
        onSaveSubmission({
          taskType,
          promptTitle,
          promptQuestion,
          essayText,
          wordCount,
          overallBand: data.overallBand,
          feedback: data.summary || '',
          criteriaScores: {
            taskResponse: data.taskResponse,
            coherenceCohesion: data.coherenceCohesion,
            lexicalResource: data.lexicalResource,
            grammaticalRangeAccuracy: data.grammaticalRangeAccuracy,
          },
          createdAt: new Date().toISOString(),
        });
      } else {
        setErrorMsg(data.error || 'Failed to complete evaluation. Please try again.');
      }
    } catch (err: any) {
      console.error('Essay evaluation failed:', err);
      setErrorMsg('Network error evaluating essay. Please retry.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const loadSampleEssay = () => {
    if (taskType === 'task2') {
      setEssayText(
        `The exponential integration of generative artificial intelligence into higher education has sparked contentious discourse regarding pedagogy and student cognitive development. While critics contend that algorithmic dependence atrophies essential critical reasoning, proponents argue that synthetic intelligence literacy constitutes an indispensable competency for the contemporary workforce. In my view, while uncritical reliance presents genuine cognitive hazards, disciplined AI adoption cultivates higher-order analytical faculties required in modern professional landscapes.\n\nOn the one hand, detractors legitimately highlight the danger of cognitive disengagement when students outsource analytical and synthesis tasks to machine learning models. Traditional university scholarship compels undergraduates to synthesize dense empirical literature, identify methodological limitations, and formulate coherent original arguments. If students routinely rely on automated summaries and syntax generators, the intellectual discipline required to deconstruct nuance and detect bias is inevitably diminished.\n\nOn the other hand, the global knowledge economy increasingly demands professionals who can orchestrate and critique autonomous systems rather than execute mechanical information retrieval. Artificial intelligence automates repetitive data collation, allowing researchers and students to dedicate their cognitive bandwidth to higher-tier evaluative challenges—such as ethical governance, experimental hypothesis design, and cross-disciplinary lateral thinking.\n\nIn conclusion, while passive reliance on artificial intelligence poses a verifiable threat to foundational scholarly rigor, tertiary institutions should transform their evaluative frameworks to reward critical verification, thereby preparing students for an AI-augmented professional future.`
      );
    } else {
      setEssayText(
        `The bar chart delineates the proportion of electricity produced from four distinct energy sources—Renewables, Natural Gas, Nuclear, and Coal—in a specific European country across the years 2010 and 2024.\n\nOverall, it is immediately apparent that a dramatic transition towards decarbonisation occurred over the 14-year period. While coal was overwhelmingly the predominant energy source in 2010, renewable energy experienced exponential expansion to become the leading contributor by 2024. Conversely, fossil fuel dependence witnessed a pronounced contraction.\n\nIn 2010, coal accounted for the largest share of national electricity output at 42%, followed by natural gas at 31%. By 2024, renewable power generation surged nearly fivefold to reach 44%, surpassing all alternatives.`
      );
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-700 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Deep Thinking Evaluation (gemini-4-argon with ThinkingLevel.HIGH)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              AI Academic Writing Evaluator
            </h1>
            <p className="mt-2 text-sm text-slate-300 max-w-2xl">
              Submit your Task 1 Academic Report or Task 2 Essay for instant 4-pillar band scoring:
              Task Response, Coherence & Cohesion, Lexical Resource, and Grammatical Range & Accuracy.
            </p>
          </div>

          {/* Task Type Switcher */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-950 border border-slate-800">
            <button
              onClick={() => {
                setTaskType('task1');
                setPromptTitle('Academic Task 1: Comparative Energy Generation (2010 vs 2024)');
                setPromptQuestion(
                  'Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.'
                );
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                taskType === 'task1'
                  ? 'bg-amber-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Task 1 (Report - 150w)
            </button>
            <button
              onClick={() => {
                setTaskType('task2');
                setPromptTitle('Academic Task 2: Artificial Intelligence and Higher Education');
                setPromptQuestion(
                  'Discuss both views and give your own opinion. Write at least 250 words.'
                );
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                taskType === 'task2'
                  ? 'bg-amber-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Task 2 (Essay - 250w)
            </button>
          </div>
        </div>
      </div>

      {/* Task 1 Visual Chart Presentation */}
      {taskType === 'task1' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
          {/* Interactive Vector Chart Visualizer */}
          <WritingChartVisualizer chartData={currentChartData} />

          {/* Optional Custom AI Chart Studio Toggle */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-bold text-slate-300">
                Want to generate a custom visual prompt?
              </span>
            </div>
            <button
              onClick={() => setShowImageGenerator(!showImageGenerator)}
              className="text-xs font-bold text-sky-400 hover:text-sky-300 cursor-pointer"
            >
              {showImageGenerator ? 'Close Studio' : 'Open AI Chart Studio'}
            </button>
          </div>

          {showImageGenerator && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Chart / Diagram Prompt Description:
                </label>
                <textarea
                  value={chartPrompt}
                  onChange={(e) => setChartPrompt(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Aspect Ratio and Resolution Affordances */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1">
                    <Sliders className="w-3.5 h-3.5 text-sky-400" />
                    <span>Aspect Ratio:</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {['1:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9', '21:9'].map((ratio) => (
                      <button
                        key={ratio}
                        type="button"
                        onClick={() => setAspectRatio(ratio)}
                        className={`px-2 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                          aspectRatio === ratio
                            ? 'bg-sky-600 text-white border-sky-500'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        {ratio}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">
                    Resolution Quality:
                  </label>
                  <div className="flex gap-2">
                    {['1K', '2K', '4K'].map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setImageSize(size)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                          imageSize === size
                            ? 'bg-sky-600 text-white border-sky-500'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handleGenerateChart}
                disabled={isGeneratingChart}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                {isGeneratingChart ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{isGeneratingChart ? 'Generating Visual Chart...' : 'Generate Academic Chart'}</span>
              </button>
            </div>
          )}

          {generatedChartUrl && (
            <div className="rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 text-center p-3">
              <img
                src={generatedChartUrl}
                alt="Generated IELTS Academic Chart"
                className="max-h-72 mx-auto rounded-xl object-contain shadow-lg"
              />
              <span className="text-[11px] text-slate-400 block mt-2 font-medium">
                Generated {imageSize} resolution ({aspectRatio}) Task 1 Academic Visual Prompt
              </span>
            </div>
          )}
        </div>
      )}

      {/* Essay Editor and Prompt */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Prompt & Guidelines */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-extrabold text-sm text-white">Prompt Details</h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
              {taskType.toUpperCase()}
            </span>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1">Title:</label>
            <p className="text-xs sm:text-sm font-bold text-white">{promptTitle}</p>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1">Question / Instruction:</label>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-serif p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              {promptQuestion}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-2 text-xs text-slate-400">
            <p className="font-bold text-slate-200">Official Exam Criteria:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li><strong className="text-slate-300">TR:</strong> Task Response (Min {targetMinWords} words)</li>
              <li><strong className="text-slate-300">CC:</strong> Coherence & Paragraph Linking</li>
              <li><strong className="text-slate-300">LR:</strong> Sophisticated Collocations</li>
              <li><strong className="text-slate-300">GRA:</strong> Complex Sentence Variety</li>
            </ul>
          </div>

          <button
            onClick={loadSampleEssay}
            className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Load Band 9 Sample Essay</span>
          </button>
        </div>

        {/* Right 2 Columns: Rich Interactive Essay Editor */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <PenTool className="w-4 h-4 text-amber-400" />
                <h3 className="font-extrabold text-sm text-white">Essay Composition Space</h3>
              </div>

              {/* Dynamic Word Counter */}
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                    isWordCountMet
                      ? 'bg-emerald-950 border border-emerald-700/60 text-emerald-300'
                      : 'bg-amber-950 border border-amber-700/60 text-amber-300'
                  }`}
                >
                  {wordCount} / {targetMinWords} words
                </span>
              </div>
            </div>

            <textarea
              value={essayText}
              onChange={(e) => setEssayText(e.target.value)}
              placeholder={`Type or paste your ${taskType === 'task1' ? 'Task 1 report' : 'Task 2 essay'} here. Ensure accurate paragraph structure, introduction, body paragraphs, and conclusion...`}
              rows={16}
              className="mt-4 w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 font-serif leading-relaxed focus:outline-none focus:border-amber-500 transition-colors resize-y"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <span className="text-xs text-slate-400">
              {wordCount >= targetMinWords
                ? '✓ Meets official word count requirements'
                : `Need ${targetMinWords - wordCount} more words to avoid underlength penalty`}
            </span>

            <button
              onClick={handleEvaluateEssay}
              disabled={isEvaluating || wordCount < 20}
              className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 hover:from-amber-500 hover:to-red-500 disabled:opacity-50 text-white font-black text-sm shadow-xl shadow-amber-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isEvaluating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Thinking & Grading with gemini-4-argon...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Score Essay & Get Band Feedback</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* AI Detailed Band Score Feedback & Diagnostic Breakdown */}
      {evaluationResult && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6 animate-fadeIn">
          {/* Overall Band Card */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border border-slate-700">
            <div>
              <div className="flex items-center gap-2">
                <Award className="w-6 h-6 text-amber-400" />
                <h3 className="text-lg font-black text-white">Official IELTS Band Evaluation</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                {evaluationResult.summary}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-center px-6 py-3 rounded-2xl bg-red-600/20 border border-red-500/40">
                <span className="block text-3xl font-black text-red-400">
                  Band {Number(evaluationResult.overallBand).toFixed(1)}
                </span>
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Overall Score
                </span>
              </div>
            </div>
          </div>

          {/* 4 Official Component Criteria Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Task Response</span>
                <span className="text-sm font-black text-sky-400 px-2.5 py-0.5 rounded-lg bg-sky-950 border border-sky-800">
                  {Number(evaluationResult.taskResponse).toFixed(1)}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {evaluationResult.criterionFeedback?.tr || 'Fully addresses all parts of the task.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Coherence & Cohesion</span>
                <span className="text-sm font-black text-emerald-400 px-2.5 py-0.5 rounded-lg bg-emerald-950 border border-emerald-800">
                  {Number(evaluationResult.coherenceCohesion).toFixed(1)}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {evaluationResult.criterionFeedback?.cc || 'Logical sequence of ideas and paragraphing.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Lexical Resource</span>
                <span className="text-sm font-black text-amber-400 px-2.5 py-0.5 rounded-lg bg-amber-950 border border-amber-800">
                  {Number(evaluationResult.lexicalResource).toFixed(1)}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {evaluationResult.criterionFeedback?.lr || 'Use of less common vocabulary and collocations.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Grammar & Accuracy</span>
                <span className="text-sm font-black text-rose-400 px-2.5 py-0.5 rounded-lg bg-rose-950 border border-rose-800">
                  {Number(evaluationResult.grammaticalRangeAccuracy).toFixed(1)}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {evaluationResult.criterionFeedback?.gra || 'Wide range of structures with accurate punctuation.'}
              </p>
            </div>
          </div>

          {/* Lexical Resource Upgrades */}
          {evaluationResult.vocabularyUpgrades && evaluationResult.vocabularyUpgrades.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Band 8.0 - 9.0 Vocabulary Enhancements</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {evaluationResult.vocabularyUpgrades.map((item: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-rose-400 line-through">{item.original}</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        → {item.improved}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">{item.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Corrected Model Paragraph */}
          {evaluationResult.correctedModelParagraph && (
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-indigo-900/60 space-y-2">
              <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Examiner Band 9 Model Rewrite</span>
              </h4>
              <p className="text-xs sm:text-sm text-slate-200 font-serif leading-relaxed italic">
                "{evaluationResult.correctedModelParagraph}"
              </p>
            </div>
          )}

          {/* Official Combined IELTS Writing Band Matrix */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/50 via-slate-950 to-indigo-950/50 border border-slate-700 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 font-mono">
                  Official Cambridge Writing Formula: (Task 1 + 2 × Task 2) ÷ 3
                </span>
                <h4 className="text-sm font-bold text-white mt-0.5">
                  Your {taskType === 'task1' ? 'Task 1 (33.3% Weight)' : 'Task 2 (66.7% Double Weight)'} Result: Band {Number(evaluationResult.overallBand).toFixed(1)}
                </h4>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-right">
                <span className="text-[10px] text-slate-400 block font-medium">CEFR Level:</span>
                <span className="text-xs font-bold text-emerald-400 font-mono">
                  {getCEFRLevel(Number(evaluationResult.overallBand))}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              In the official IELTS exam, Task 2 is weighted at exactly twice the value of Task 1. Complete both tasks to attain your certified overall Writing Band score with official half-band rounding.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
