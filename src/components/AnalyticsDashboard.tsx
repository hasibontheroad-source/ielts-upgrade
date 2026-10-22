import React, { useState } from 'react';
import {
  BarChart3,
  Award,
  TrendingUp,
  Target,
  CheckCircle2,
  Clock,
  BookOpen,
  Headphones,
  FileText,
  PenTool,
  Mic,
  Calendar,
  AlertCircle,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { calculateOverallBandScore, getCEFRLevel, getBandDescriptor } from '../utils/scoring';

interface AnalyticsDashboardProps {
  attempts: any[];
  writingSubmissions: any[];
  speakingSessions: any[];
  targetBand: number;
  onUpdateTargetBand: (band: number) => void;
  onNavigateToTab: (tab: string) => void;
}

export default function AnalyticsDashboard({
  attempts,
  writingSubmissions,
  speakingSessions,
  targetBand,
  onUpdateTargetBand,
  onNavigateToTab,
}: AnalyticsDashboardProps) {
  const [editingTarget, setEditingTarget] = useState(false);
  const [newTarget, setNewTarget] = useState(targetBand);

  // Compute Module Averages
  const listeningAttempts = attempts.filter((a) => a.module === 'listening');
  const readingAttempts = attempts.filter((a) => a.module === 'reading');

  const avgListeningBand =
    listeningAttempts.length > 0
      ? listeningAttempts.reduce((acc, curr) => acc + (curr.bandScore || 0), 0) / listeningAttempts.length
      : 7.5; // Default baseline benchmark

  const avgReadingBand =
    readingAttempts.length > 0
      ? readingAttempts.reduce((acc, curr) => acc + (curr.bandScore || 0), 0) / readingAttempts.length
      : 7.0;

  const avgWritingBand =
    writingSubmissions.length > 0
      ? writingSubmissions.reduce((acc, curr) => acc + (curr.overallBand || 0), 0) / writingSubmissions.length
      : 7.0;

  const avgSpeakingBand =
    speakingSessions.length > 0
      ? speakingSessions.reduce((acc, curr) => acc + (curr.overallBand || 0), 0) / speakingSessions.length
      : 7.5;

  const currentOverallBand = calculateOverallBandScore(
    avgListeningBand,
    avgReadingBand,
    avgWritingBand,
    avgSpeakingBand
  );

  const cefr = getCEFRLevel(currentOverallBand);
  const bandDescriptor = getBandDescriptor(currentOverallBand);
  const distanceToTarget = Math.max(0, targetBand - currentOverallBand);

  const handleSaveTarget = () => {
    onUpdateTargetBand(newTarget);
    setEditingTarget(false);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner with Overall Band Score and Target Progress */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-700 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold mb-3">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Official IELTS 9-Band Instant Performance Analytics</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Progress & Mastery Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-300 max-w-xl">
              Track your calibrated IELTS performance across Cambridge Academic Books 1-21,
              identify skill gaps, and achieve your university or immigration admissions target.
            </p>
            <div className="flex items-center gap-2 mt-3 text-xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Offline Cached: <strong className="text-white">{attempts.length}</strong> Mock Tests • <strong className="text-white">{writingSubmissions.length}</strong> Writing • <strong className="text-white">{speakingSessions.length}</strong> Speaking</span>
              </span>
            </div>
          </div>

          {/* Current Band & Target Band Showcase */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Current Estimated Score */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center min-w-[140px] shadow-lg">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Current Band
              </span>
              <span className="text-3xl sm:text-4xl font-black text-emerald-400 mt-1 block">
                {currentOverallBand.toFixed(1)}
              </span>
              <span className="text-[11px] font-semibold text-emerald-300/80 mt-0.5 block">
                {cefr.split(' ')[0]} Level
              </span>
            </div>

            {/* Target Band Card with Edit */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-amber-500/30 text-center min-w-[140px] shadow-lg relative">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Target Band
              </span>
              {editingTarget ? (
                <div className="flex items-center justify-center gap-1 mt-2">
                  <select
                    value={newTarget}
                    onChange={(e) => setNewTarget(parseFloat(e.target.value))}
                    className="bg-slate-900 border border-amber-500 text-amber-300 text-base font-bold rounded p-1"
                  >
                    {[6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0].map((b) => (
                      <option key={b} value={b}>
                        {b.toFixed(1)}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleSaveTarget}
                    className="px-2 py-1 rounded bg-amber-600 text-white text-xs font-bold"
                  >
                    Set
                  </button>
                </div>
              ) : (
                <div onClick={() => setEditingTarget(true)} className="cursor-pointer group">
                  <span className="text-3xl sm:text-4xl font-black text-amber-400 mt-1 block group-hover:scale-105 transition-transform">
                    {targetBand.toFixed(1)}
                  </span>
                  <span className="text-[10px] text-slate-400 underline block mt-0.5">
                    Click to change
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress Bar towards Target */}
        <div className="mt-6 pt-6 border-t border-slate-800">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-2">
            <span>Overall Roadmap to Band {targetBand.toFixed(1)}</span>
            <span>
              {distanceToTarget === 0
                ? 'Target Achieved! Ready for Official Test'
                : `${distanceToTarget.toFixed(1)} Band gap to close`}
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-400 rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(100, (currentOverallBand / targetBand) * 100)}%`,
              }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-2 font-medium italic">{bandDescriptor}</p>
        </div>
      </div>

      {/* 4 Core Module Score Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Listening */}
        <div
          onClick={() => onNavigateToTab('cambridge')}
          className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-sky-500/50 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <Headphones className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black text-white group-hover:text-sky-400 transition-colors">
                {avgListeningBand.toFixed(1)}
              </span>
            </div>
            <h3 className="font-extrabold text-sm text-white mt-3">Listening Module</h3>
            <p className="text-xs text-slate-400 mt-1">
              {listeningAttempts.length} mock tests logged
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-sky-400 font-bold">
            <span>Practice Sections</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Reading */}
        <div
          onClick={() => onNavigateToTab('cambridge')}
          className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black text-white group-hover:text-emerald-400 transition-colors">
                {avgReadingBand.toFixed(1)}
              </span>
            </div>
            <h3 className="font-extrabold text-sm text-white mt-3">Reading Module</h3>
            <p className="text-xs text-slate-400 mt-1">
              {readingAttempts.length} academic passages scored
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-emerald-400 font-bold">
            <span>Practice Reading</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Writing */}
        <div
          onClick={() => onNavigateToTab('writing')}
          className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <PenTool className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black text-white group-hover:text-amber-400 transition-colors">
                {avgWritingBand.toFixed(1)}
              </span>
            </div>
            <h3 className="font-extrabold text-sm text-white mt-3">Writing Module</h3>
            <p className="text-xs text-slate-400 mt-1">
              {writingSubmissions.length} essays evaluated
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-amber-400 font-bold">
            <span>Submit New Essay</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Speaking */}
        <div
          onClick={() => onNavigateToTab('speaking')}
          className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <Mic className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black text-white group-hover:text-rose-400 transition-colors">
                {avgSpeakingBand.toFixed(1)}
              </span>
            </div>
            <h3 className="font-extrabold text-sm text-white mt-3">Speaking Module</h3>
            <p className="text-xs text-slate-400 mt-1">
              {speakingSessions.length} interviews completed
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-rose-400 font-bold">
            <span>Practice Speaking</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Diagnostic Strengths & Growth Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Demonstrated Band 8.0+ Strengths</span>
          </h3>
          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
              <span className="font-bold text-white block mb-0.5">High Listening Accuracy:</span>
              Consistently scoring 35+ / 40 on Cambridge Section 1 & Section 2 conversations.
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
              <span className="font-bold text-white block mb-0.5">Complex Lexical Range:</span>
              Demonstrating natural use of academic collocations and disciplinary terminology in Writing Task 2 essays.
            </div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span>Recommended Priority Focus Areas</span>
          </h3>
          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
              <span className="font-bold text-amber-300 block mb-0.5">Passage 3 Speed Management:</span>
              Dedicate at least 22 minutes to Reading Passage 3 for True/False/Not Given verification.
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
              <span className="font-bold text-amber-300 block mb-0.5">Speaking Part 2 Structuring:</span>
              Utilize the full 60-second cue card preparation time to sketch bullet points for each prompt branch.
            </div>
          </div>
        </div>
      </div>

      {/* Historical Attempts Table */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-base font-extrabold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-sky-400" />
          <span>Recent Practice Sessions & Mock Attempts</span>
        </h3>

        {attempts.length === 0 && writingSubmissions.length === 0 && speakingSessions.length === 0 ? (
          <div className="text-center py-10 bg-slate-950/40 rounded-2xl border border-dashed border-slate-800">
            <BookOpen className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-xs text-slate-400">No mock attempts logged yet.</p>
            <button
              onClick={() => onNavigateToTab('cambridge')}
              className="mt-3 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Start Cambridge Book 19 Mock Test
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3">Test / Paper</th>
                  <th className="p-3">Module</th>
                  <th className="p-3">Score / Band</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {attempts.slice(-5).reverse().map((att, i) => (
                  <tr key={`att-${i}`} className="hover:bg-slate-800/30">
                    <td className="p-3 text-white font-bold">
                      Cambridge {att.bookNumber} - Test {att.testNumber}
                    </td>
                    <td className="p-3 uppercase text-sky-400">{att.module}</td>
                    <td className="p-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-extrabold border border-emerald-800">
                        Band {Number(att.bandScore).toFixed(1)}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">Completed</td>
                    <td className="p-3 text-slate-500">{new Date(att.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {writingSubmissions.slice(-3).reverse().map((sub, i) => (
                  <tr key={`sub-${i}`} className="hover:bg-slate-800/30">
                    <td className="p-3 text-white font-bold">{sub.promptTitle || 'Academic Writing'}</td>
                    <td className="p-3 uppercase text-amber-400">{sub.taskType}</td>
                    <td className="p-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 font-extrabold border border-amber-800">
                        Band {Number(sub.overallBand).toFixed(1)}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">AI Evaluated</td>
                    <td className="p-3 text-slate-500">{new Date(sub.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
