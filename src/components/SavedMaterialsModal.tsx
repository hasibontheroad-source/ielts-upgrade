import React, { useState, useEffect } from 'react';
import {
  getSavedMaterials,
  removeSavedMaterial,
  subscribeToOfflineCache,
  type SavedMaterial,
} from '../utils/offlineStorage';
import {
  Bookmark,
  Trash2,
  Play,
  X,
  Headphones,
  BookOpen,
  PenTool,
  Mic,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

interface SavedMaterialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTest: (bookNumber: number, testNumber: number, module: string) => void;
}

export const SavedMaterialsModal: React.FC<SavedMaterialsModalProps> = ({
  isOpen,
  onClose,
  onSelectTest,
}) => {
  const [materials, setMaterials] = useState<SavedMaterial[]>(getSavedMaterials());
  const [selectedModule, setSelectedModule] = useState<string>('all');

  useEffect(() => {
    const unsub = subscribeToOfflineCache(() => {
      setMaterials(getSavedMaterials());
    });
    return () => unsub();
  }, []);

  if (!isOpen) return null;

  const filtered = materials.filter(
    (m) => selectedModule === 'all' || m.module === selectedModule
  );

  const getModuleIcon = (mod: string) => {
    switch (mod) {
      case 'listening':
        return <Headphones className="h-4 w-4 text-sky-400" />;
      case 'reading':
        return <BookOpen className="h-4 w-4 text-emerald-400" />;
      case 'writing':
        return <PenTool className="h-4 w-4 text-amber-400" />;
      case 'speaking':
        return <Mic className="h-4 w-4 text-purple-400" />;
      default:
        return <Bookmark className="h-4 w-4 text-red-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative flex max-h-[85vh] w-full max-w-3xl flex-col rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600/10 border border-red-500/20 text-red-400">
              <Bookmark className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Saved Offline Test Materials
                <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-300">
                  {materials.length} cached
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Study Cambridge test questions and prompts anytime without an internet connection.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 border-b border-slate-800/80 px-6 py-3 bg-slate-900/50 overflow-x-auto">
          {[
            { id: 'all', label: 'All Modules' },
            { id: 'listening', label: 'Listening' },
            { id: 'reading', label: 'Reading' },
            { id: 'writing', label: 'Writing' },
            { id: 'speaking', label: 'Speaking' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedModule(tab.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                selectedModule === tab.id
                  ? 'bg-red-600 text-white shadow'
                  : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800/80 text-slate-500 mb-3">
                <Bookmark className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-300">No saved materials in this category</h3>
              <p className="mt-1 max-w-sm text-xs text-slate-500">
                You can save any Cambridge test from Books 1 to 21 by tapping the "Save for Offline" bookmark button in the Cambridge Mock Hub.
              </p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4 hover:border-slate-700 transition"
              >
                <div className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 border border-slate-700/60">
                    {getModuleIcon(item.module)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-300">
                        Book {item.bookNumber} • Test {item.testNumber}
                      </span>
                      <span className="capitalize text-xs font-semibold text-slate-400">
                        {item.module}
                      </span>
                    </div>
                    <h4 className="mt-1 text-sm font-semibold text-white group-hover:text-red-400 transition">
                      {item.title}
                    </h4>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
                      <Calendar className="h-3 w-3" />
                      <span>Saved {new Date(item.savedAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" /> Available Offline
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => {
                      onSelectTest(item.bookNumber, item.testNumber, item.module);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-red-500 transition shadow"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Practice</span>
                  </button>
                  <button
                    onClick={() => removeSavedMaterial(item.id)}
                    className="rounded-lg p-2 text-slate-500 hover:bg-rose-950/40 hover:text-rose-400 transition"
                    title="Remove from offline cache"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="border-t border-slate-800 px-6 py-3 bg-slate-950 text-xs text-slate-400 flex items-center justify-between">
          <span>All saved materials stay on your device and load instantly without WiFi or cellular data.</span>
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-3 py-1 text-xs font-medium text-slate-200 hover:bg-slate-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
