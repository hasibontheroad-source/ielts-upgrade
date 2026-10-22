import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronRight,
  RotateCcw,
  TrendingUp,
  FileText,
  Headphones,
  Check,
  Eye,
  ArrowRight
} from 'lucide-react';
import { SectionScoreSummary, getBandDescriptor } from '../utils/scoring';

interface PartScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedNext: () => void;
  summary: SectionScoreSummary | null;
  bookNumber: number;
  testNumber: number;
  hasNextPart: boolean;
  nextPartLabel?: string;
}

export default function PartScoreModal({
  isOpen,
  onClose,
  onProceedNext,
  summary,
  bookNumber,
  testNumber,
  hasNextPart,
  nextPartLabel = 'Next Part',
}: PartScoreModalProps) {
  const [showDetailedReview, setShowDetailedReview] = useState<boolean>(false);

  if (!isOpen || !summary) return null;

  const bandDescriptor = getBandDescriptor(summary.cumulativeBand);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-750 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Official Header Strip */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300">
              <Award className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300 font-mono">
                Official IELTS Academic Scoring Engine
              </span>
              <h3 className="text-lg font-black text-white">
                Cambridge {bookNumber} · Test {testNumber} · {summary.partTitle}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto scrollbar-thin">
          {/* Main Band Score & Raw Score Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Section Immediate Score */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 block mb-1">
                  Section Raw Score:
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white font-mono tabular-nums">
                    {summary.correctCount}
                  </span>
                  <span className="text-sm font-bold text-slate-400 font-mono">
                    / {summary.totalQuestions} ({summary.accuracyPercentage}%)
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-850 flex items-center justify-between text-xs">
                <span className="text-slate-400">Section Band:</span>
                <span className="font-mono font-bold text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-800">
                  Band {summary.partBand.toFixed(1)}
                </span>
              </div>
            </div>

            {/* Cumulative Projected Overall Band */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-950/60 to-slate-950 border border-blue-800/80 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-blue-300 block mb-1 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Cumulative Projected Band:</span>
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-blue-400 font-mono tabular-nums">
                    {summary.cumulativeBand.toFixed(1)}
                  </span>
                  <span className="text-xs text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800">
                    {summary.cefrLevel}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-blue-900/60 flex items-center justify-between text-xs text-slate-300">
                <span>Total Answered So Far:</span>
                <span className="font-mono font-bold text-white">
                  {summary.cumulativeCorrect} / {summary.cumulativeTotal} Correct
                </span>
              </div>
            </div>
          </div>

          {/* Official Band Descriptor Card */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            <span className="font-bold text-slate-200 block mb-1">IELTS Performance Descriptor:</span>
            <p>{bandDescriptor}</p>
          </div>

          {/* Toggle Detailed Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Question-by-Question Diagnostics
              </span>
              <button
                onClick={() => setShowDetailedReview(!showDetailedReview)}
                className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
              >
                <span>{showDetailedReview ? 'Hide Review' : 'Inspect All Questions'}</span>
                <Eye className="w-3.5 h-3.5" />
              </button>
            </div>

            {showDetailedReview && (
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {summary.results.map((res) => (
                  <div
                    key={res.questionNumber}
                    className={`p-3 rounded-xl border text-xs flex flex-col gap-1.5 ${
                      res.isCorrect
                        ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
                        : 'bg-rose-950/30 border-rose-800/40 text-rose-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {res.isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        )}
                        <span className="font-mono font-bold text-white">Q{res.questionNumber}:</span>
                        <span className="text-slate-200 font-medium line-clamp-1">{res.questionText}</span>
                      </div>
                      <span className="font-mono font-bold shrink-0">
                        {res.isCorrect ? '1 / 1' : '0 / 1'}
                      </span>
                    </div>

                    <div className="pl-6 text-[11px] space-y-0.5 text-slate-300">
                      <div>
                        Your Answer: <strong className={res.isCorrect ? 'text-emerald-300' : 'text-rose-300'}>"{res.userAnswer}"</strong>
                        {!res.isCorrect && (
                          <span> · Correct: <strong className="text-emerald-300">"{res.correctAnswer}"</strong></span>
                        )}
                      </div>
                      <p className="text-slate-400">{res.explanation}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer with Action Buttons */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
          >
            Stay & Review Answers
          </button>

          {hasNextPart ? (
            <button
              onClick={() => {
                onClose();
                onProceedNext();
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              <span>{nextPartLabel}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
            >
              Finish Module
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
