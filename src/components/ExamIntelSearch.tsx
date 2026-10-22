import React, { useState } from 'react';
import { Search, Globe, ExternalLink, Sparkles, BookOpen, Clock, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

export default function ExamIntelSearch() {
  const [query, setQuery] = useState('latest IELTS Academic exam questions 2025 speaking cue cards and writing task 2 topics');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const popularQueries = [
    '2025 Q1 IELTS Speaking Cue Cards recently asked in exams',
    'Most frequent Cambridge Academic Writing Task 2 topics 2024 2025',
    'IELTS computer-delivered vs paper test scoring comparison 2025',
    'Cambridge IELTS 19 Academic exam question trends',
  ];

  const handleSearch = async (searchQuery?: string) => {
    const q = searchQuery || query;
    if (!q) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/gemini/search-trends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error('Search grounding error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-sky-950/60 to-slate-900 border border-slate-700 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-500/40 text-sky-300 text-xs font-bold mb-3">
          <Globe className="w-3.5 h-3.5 text-sky-400" />
          <span>Real-Time Google Search Grounding (gemini-3.8-flash with googleSearch)</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Live IELTS Exam Intelligence & Trends
        </h1>
        <p className="mt-2 text-sm text-slate-300 max-w-2xl leading-relaxed">
          Access grounded web intelligence on recently reported IELTS Academic exam topics, current speaking cue cards,
          and official Cambridge Assessment announcements verified against real-time Google Search.
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search latest IELTS topics, recent cue cards, or test updates..."
              className="w-full px-4 py-3.5 pl-11 rounded-2xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
          </div>

          <button
            onClick={() => handleSearch()}
            disabled={isLoading}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{isLoading ? 'Searching Google...' : 'Search Exam Intel'}</span>
          </button>
        </div>

        {/* Popular Query Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-slate-400 font-semibold mr-1">Trending Topics:</span>
          {popularQueries.map((pq, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuery(pq);
                handleSearch(pq);
              }}
              className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-500/50 text-[11px] text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              {pq}
            </button>
          ))}
        </div>
      </div>

      {/* Grounded Search Results */}
      {result && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-sky-400" />
              <span>Grounded Intelligence Summary</span>
            </h3>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/50">
              Verified by Google Search
            </span>
          </div>

          {/* Formatted Content */}
          <div className="text-xs sm:text-sm text-slate-200 leading-relaxed space-y-4 whitespace-pre-line font-serif">
            {result.content}
          </div>

          {/* Sources and Citations */}
          {result.sources && result.sources.length > 0 && (
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Grounded Web Citations & Sources:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.sources.map((src: any, index: number) => {
                  const web = src.web;
                  if (!web) return null;
                  return (
                    <a
                      key={index}
                      href={web.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-500/50 transition-colors flex items-center justify-between text-xs text-sky-400 group"
                    >
                      <span className="truncate max-w-[280px] font-medium text-slate-300 group-hover:text-white">
                        {web.title || web.uri}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 text-slate-500 group-hover:text-sky-400" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
