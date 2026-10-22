import React from 'react';
import {
  BookOpen,
  BarChart3,
  Mic,
  PenTool,
  Sparkles,
  Globe,
  LogIn,
  LogOut,
  User,
  CheckCircle2,
  Bookmark,
  Layers,
} from 'lucide-react';
import type { FirebaseUser } from '../lib/firebase';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: FirebaseUser | null;
  onLogin: () => void;
  onLogout: () => void;
  targetBand: number;
  onOpenSavedMaterials?: () => void;
  savedMaterialsCount?: number;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  currentUser,
  onLogin,
  onLogout,
  targetBand,
  onOpenSavedMaterials,
  savedMaterialsCount = 0,
}: NavbarProps) {
  const navItems = [
    { id: 'cambridge', label: 'Cambridge 1–21', icon: BookOpen },
    { id: 'writing', label: 'AI Writing', icon: PenTool },
    { id: 'speaking', label: 'Speaking Studio', icon: Mic },
    { id: 'dashboard', label: 'Analytics', icon: BarChart3 },
    { id: 'intel', label: 'Exam Intel', icon: Globe },
    { id: '3d-hall', label: '3D Exam Hall', icon: Sparkles },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Identity */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setActiveTab('cambridge')}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 via-rose-600 to-amber-600 flex items-center justify-center shadow-lg shadow-red-600/20 font-black text-white text-base tracking-wider group-hover:scale-105 transition-transform">
              IR
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-lg text-white tracking-tight">
                  IELTS<span className="text-red-500">Ready</span>
                </span>
                <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 border-l border-slate-700 pl-1.5">
                  Academic
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Cambridge Authentic Exam Practice (Books 1–21)
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-800 text-white shadow-sm ring-1 ring-slate-700'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-red-500' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Saved Offline Materials */}
            {onOpenSavedMaterials && (
              <button
                onClick={onOpenSavedMaterials}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium transition cursor-pointer"
                title="View Saved Offline Test Materials"
              >
                <Bookmark className={`w-3.5 h-3.5 ${savedMaterialsCount > 0 ? 'text-red-400 fill-red-500/20' : 'text-slate-400'}`} />
                <span className="hidden sm:inline">Offline</span>
                {savedMaterialsCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-red-600/90 text-[10px] font-bold text-white font-mono">
                    {savedMaterialsCount}
                  </span>
                )}
              </button>
            )}

            {/* PWA Install Button */}
            <PWAInstallButton />

            {/* Target Band Indicator */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
              <span className="text-slate-400">Target</span>
              <span className="font-mono font-bold text-amber-400">{targetBand.toFixed(1)}</span>
            </div>

            {/* User Profile / Authentication */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-slate-900 pl-2 pr-3 py-1 rounded-lg border border-slate-800">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'User'}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-[10px] font-bold text-white">
                      {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs font-medium text-slate-200 max-w-[90px] truncate">
                    {currentUser.displayName || currentUser.email?.split('@')[0]}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onLogin}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-all shadow-sm shadow-red-600/20 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Sub-bar */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-800/80 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-red-500' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
