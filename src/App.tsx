/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CambridgeMockHub from './components/CambridgeMockHub';
import WritingEvaluator from './components/WritingEvaluator';
import SpeakingStudio from './components/SpeakingStudio';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import ExamIntelSearch from './components/ExamIntelSearch';
import ThreeScene from './components/ThreeScene';
import { OfflineIndicator } from './components/OfflineIndicator';
import { SavedMaterialsModal } from './components/SavedMaterialsModal';
import {
  getLocalAttempts,
  saveLocalAttempts,
  appendLocalAttempt,
  getLocalWritingSubmissions,
  saveLocalWritingSubmissions,
  appendLocalWritingSubmission,
  getLocalSpeakingSessions,
  saveLocalSpeakingSessions,
  appendLocalSpeakingSession,
  getLocalTargetBand,
  saveLocalTargetBand,
  getSavedMaterials,
  subscribeToOfflineCache,
} from './utils/offlineStorage';
import {
  auth,
  db,
  loginWithGoogle,
  logoutUser,
  onAuthStateChanged,
  type FirebaseUser,
  handleFirestoreError,
  OperationType,
} from './lib/firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  query,
  where,
  getDocs,
} from 'firebase/firestore';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('cambridge');
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [targetBand, setTargetBand] = useState<number>(() => getLocalTargetBand(7.5));
  const [attempts, setAttempts] = useState<any[]>(() => getLocalAttempts());
  const [writingSubmissions, setWritingSubmissions] = useState<any[]>(() => getLocalWritingSubmissions());
  const [speakingSessions, setSpeakingSessions] = useState<any[]>(() => getLocalSpeakingSessions());
  const [transferredWritingPrompt, setTransferredWritingPrompt] = useState<any>(null);
  const [transferredSpeakingParts, setTransferredSpeakingParts] = useState<any>(null);

  // Offline Saved Materials modal state & selected test transfer
  const [isSavedMaterialsOpen, setIsSavedMaterialsOpen] = useState<boolean>(false);
  const [savedMaterialsCount, setSavedMaterialsCount] = useState<number>(() => getSavedMaterials().length);
  const [selectedSavedTest, setSelectedSavedTest] = useState<{
    bookNumber: number;
    testNumber: number;
    module?: 'listening' | 'reading' | 'writing' | 'speaking';
  } | null>(null);

  // Subscribe to offline cache count changes
  useEffect(() => {
    const unsub = subscribeToOfflineCache(() => {
      setSavedMaterialsCount(getSavedMaterials().length);
    });
    return () => unsub();
  }, []);

  // Monitor Firebase Auth State
  useEffect(() => {
    // If local cache is totally fresh and empty, populate seed data immediately
    const existingAttempts = getLocalAttempts();
    if (existingAttempts.length === 0) {
      loadSeedData();
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Load user profile & past attempts from Firestore with offline write-through
        await loadUserData(user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadSeedData = () => {
    const seedAttempts = [
      {
        id: 'attempt_seed_1',
        bookNumber: 21,
        testNumber: 1,
        module: 'listening',
        score: 35,
        bandScore: 8.0,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: 'attempt_seed_2',
        bookNumber: 21,
        testNumber: 1,
        module: 'reading',
        score: 31,
        bandScore: 7.0,
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      },
    ];

    const seedWriting = [
      {
        id: 'writing_seed_1',
        taskType: 'task2',
        promptTitle: 'Artificial Intelligence and Higher Education',
        overallBand: 7.5,
        summary: 'Excellent academic argumentation and sophisticated lexical range.',
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
    ];

    const seedSpeaking = [
      {
        id: 'speaking_seed_1',
        partNumber: 2,
        topic: 'An Environmental Project in Your City',
        overallBand: 7.5,
        durationSeconds: 110,
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      },
    ];

    setAttempts(seedAttempts);
    setWritingSubmissions(seedWriting);
    setSpeakingSessions(seedSpeaking);

    // Persist seed data to localStorage so it is available offline immediately
    saveLocalAttempts(seedAttempts);
    saveLocalWritingSubmissions(seedWriting);
    saveLocalSpeakingSessions(seedSpeaking);
  };

  const loadUserData = async (userId: string) => {
    try {
      // 1. User doc
      const userDocRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        const udata = userSnap.data();
        if (udata.targetBand) {
          setTargetBand(udata.targetBand);
          saveLocalTargetBand(udata.targetBand);
        }
      } else {
        // Create initial user profile
        await setDoc(userDocRef, {
          id: userId,
          email: currentUser?.email || '',
          displayName: currentUser?.displayName || '',
          photoURL: currentUser?.photoURL || '',
          targetBand: targetBand,
          createdAt: new Date().toISOString(),
        });
      }

      // 2. Mock attempts
      const attemptsQuery = query(collection(db, 'mock_attempts'), where('userId', '==', userId));
      const attemptsSnap = await getDocs(attemptsQuery);
      const loadedAttempts: any[] = [];
      attemptsSnap.forEach((d) => loadedAttempts.push(d.data()));
      if (loadedAttempts.length > 0) {
        setAttempts(loadedAttempts);
        saveLocalAttempts(loadedAttempts);
      }

      // 3. Writing submissions
      const writingQuery = query(collection(db, 'writing_submissions'), where('userId', '==', userId));
      const writingSnap = await getDocs(writingQuery);
      const loadedWriting: any[] = [];
      writingSnap.forEach((d) => loadedWriting.push(d.data()));
      if (loadedWriting.length > 0) {
        setWritingSubmissions(loadedWriting);
        saveLocalWritingSubmissions(loadedWriting);
      }

      // 4. Speaking sessions
      const speakingQuery = query(collection(db, 'speaking_sessions'), where('userId', '==', userId));
      const speakingSnap = await getDocs(speakingQuery);
      const loadedSpeaking: any[] = [];
      speakingSnap.forEach((d) => loadedSpeaking.push(d.data()));
      if (loadedSpeaking.length > 0) {
        setSpeakingSessions(loadedSpeaking);
        saveLocalSpeakingSessions(loadedSpeaking);
      }
    } catch (err) {
      console.warn('Network offline or error loading Firestore user data, using cached local data:', err);
      // Local state is already initialized from localStorage!
    }
  };

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error('Google Sign-in failed:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      loadSeedData();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleUpdateTargetBand = async (newBand: number) => {
    setTargetBand(newBand);
    if (currentUser) {
      try {
        await setDoc(
          doc(db, 'users', currentUser.uid),
          {
            targetBand: newBand,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}`);
      }
    }
  };

  const handleSaveAttempt = async (attempt: any) => {
    const newAttempt = {
      ...attempt,
      id: `attempt_${Date.now()}`,
      userId: currentUser?.uid || 'guest_user',
    };
    const updated = appendLocalAttempt(newAttempt);
    setAttempts(updated);

    if (currentUser && typeof navigator !== 'undefined' && navigator.onLine) {
      try {
        await setDoc(doc(db, 'mock_attempts', newAttempt.id), newAttempt);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `mock_attempts/${newAttempt.id}`);
      }
    }
  };

  const handleSaveWritingSubmission = async (submission: any) => {
    const newSub = {
      ...submission,
      id: `writing_${Date.now()}`,
      userId: currentUser?.uid || 'guest_user',
    };
    const updated = appendLocalWritingSubmission(newSub);
    setWritingSubmissions(updated);

    if (currentUser && typeof navigator !== 'undefined' && navigator.onLine) {
      try {
        await setDoc(doc(db, 'writing_submissions', newSub.id), newSub);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `writing_submissions/${newSub.id}`);
      }
    }
  };

  const handleSaveSpeakingSession = async (session: any) => {
    const newSession = {
      ...session,
      id: `speaking_${Date.now()}`,
      userId: currentUser?.uid || 'guest_user',
    };
    const updated = appendLocalSpeakingSession(newSession);
    setSpeakingSessions(updated);

    if (currentUser && typeof navigator !== 'undefined' && navigator.onLine) {
      try {
        await setDoc(doc(db, 'speaking_sessions', newSession.id), newSession);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `speaking_sessions/${newSession.id}`);
      }
    }
  };

  const handleNavigateToWriting = (promptData: any) => {
    setTransferredWritingPrompt(promptData);
    setActiveTab('writing');
  };

  const handleNavigateToSpeaking = (partsData: any) => {
    setTransferredSpeakingParts(partsData);
    setActiveTab('speaking');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-red-600 selection:text-white">
      {/* Top Main Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
        targetBand={targetBand}
        onOpenSavedMaterials={() => setIsSavedMaterialsOpen(true)}
        savedMaterialsCount={savedMaterialsCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'cambridge' && (
          <CambridgeMockHub
            onSaveAttempt={handleSaveAttempt}
            onNavigateToWriting={handleNavigateToWriting}
            onNavigateToSpeaking={handleNavigateToSpeaking}
            initialSelectedTest={selectedSavedTest}
          />
        )}

        {activeTab === 'writing' && (
          <WritingEvaluator
            initialPrompt={transferredWritingPrompt}
            onSaveSubmission={handleSaveWritingSubmission}
          />
        )}

        {activeTab === 'speaking' && (
          <SpeakingStudio
            initialParts={transferredSpeakingParts}
            onSaveSession={handleSaveSpeakingSession}
          />
        )}

        {activeTab === 'dashboard' && (
          <AnalyticsDashboard
            attempts={attempts}
            writingSubmissions={writingSubmissions}
            speakingSessions={speakingSessions}
            targetBand={targetBand}
            onUpdateTargetBand={handleUpdateTargetBand}
            onNavigateToTab={setActiveTab}
          />
        )}

        {activeTab === 'intel' && <ExamIntelSearch />}

        {activeTab === '3d-hall' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
              <h2 className="text-xl font-bold text-white mb-1">
                Interactive 3D Cambridge Examination Hall
              </h2>
              <p className="text-xs text-slate-300">
                Explore the Cambridge IELTS Assessment Hall in real-time 3D PBR graphics. Inspect the official
                Band 9 Armillary Globe, the examiner examination station, and the complete Cambridge 1-21 archives.
              </p>
            </div>
            <ThreeScene />
          </div>
        )}
      </main>

      {/* Floating Offline Connectivity Indicator */}
      <OfflineIndicator />

      {/* Saved Offline Materials Modal */}
      <SavedMaterialsModal
        isOpen={isSavedMaterialsOpen}
        onClose={() => setIsSavedMaterialsOpen(false)}
        onSelectTest={(bookNumber, testNumber, module) => {
          setSelectedSavedTest({
            bookNumber,
            testNumber,
            module: module as any,
          });
          setActiveTab('cambridge');
        }}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white">IELTS<span className="text-red-500">Ready</span></span>
            <span>• Cambridge Academic Official Mock Test Platform</span>
          </div>
          <p>Authentic Cambridge Examination Papers 1 to 21 • Certified Band 0-9 Descriptors • Offline PWA Support</p>
        </div>
      </footer>
    </div>
  );
}
