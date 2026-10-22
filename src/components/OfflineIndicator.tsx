import React, { useState, useEffect } from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { getOfflineCacheStats, subscribeToOfflineCache } from '../utils/offlineStorage';
import { WifiOff, Database, CheckCircle2, ChevronUp, ChevronDown } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [stats, setStats] = useState(getOfflineCacheStats());
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const unsub = subscribeToOfflineCache(() => {
      setStats(getOfflineCacheStats());
    });
    return () => unsub();
  }, []);

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-sm rounded-xl border border-amber-500/40 bg-slate-900/95 p-3.5 shadow-2xl backdrop-blur-md text-slate-200 animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-500" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400">
              <WifiOff className="h-3.5 w-3.5" />
              Offline Mode Active
            </div>
            <p className="text-[11px] text-slate-400">
              Cached attempts & test materials are accessible.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
          aria-label="Toggle cache details"
        >
          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-slate-800 text-xs space-y-1.5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5">
              <Database className="h-3 w-3 text-sky-400" />
              Saved Test Attempts:
            </span>
            <span className="font-semibold text-white">{stats.totalAttempts}</span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              Offline Test Materials:
            </span>
            <span className="font-semibold text-white">{stats.savedMaterialsCount}</span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span>Writing & Speaking Submissions:</span>
            <span className="font-semibold text-white">{stats.writingCount + stats.speakingCount}</span>
          </div>
          <p className="pt-1 text-[10px] text-slate-400 leading-tight">
            New test scores are saved to local storage immediately and will sync with your cloud profile once internet reconnects.
          </p>
        </div>
      )}
    </div>
  );
};
