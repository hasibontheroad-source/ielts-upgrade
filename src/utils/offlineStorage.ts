/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// LocalStorage Keys
const KEYS = {
  ATTEMPTS: 'ielts_cached_attempts',
  WRITING: 'ielts_cached_writing',
  SPEAKING: 'ielts_cached_speaking',
  TARGET_BAND: 'ielts_target_band',
  SAVED_MATERIALS: 'ielts_saved_materials',
  USER_PROFILE: 'ielts_cached_user',
  PENDING_SYNC: 'ielts_pending_sync_queue',
};

export interface SavedMaterial {
  id: string; // e.g., 'b19-t1-listening' or 'prompt-b19-t1-task2'
  bookNumber: number;
  testNumber: number;
  module: 'listening' | 'reading' | 'writing' | 'speaking';
  title: string;
  savedAt: string;
  data: any; // Full test data or prompt details
  notes?: string;
}

// Event system for real-time local cache changes across components
type CacheListener = () => void;
const listeners = new Set<CacheListener>();

function notifyListeners() {
  listeners.forEach((l) => {
    try {
      l();
    } catch (e) {
      console.error('Error notifying cache listener:', e);
    }
  });
}

export function subscribeToOfflineCache(listener: CacheListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// 1. Attempts Cache
export function getLocalAttempts(): any[] {
  try {
    const raw = localStorage.getItem(KEYS.ATTEMPTS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading attempts from localStorage:', e);
    return [];
  }
}

export function saveLocalAttempts(attempts: any[]): void {
  try {
    localStorage.setItem(KEYS.ATTEMPTS, JSON.stringify(attempts));
    notifyListeners();
  } catch (e) {
    console.error('Error saving attempts to localStorage:', e);
  }
}

export function appendLocalAttempt(attempt: any): any[] {
  const current = getLocalAttempts();
  // Deduplicate by id if present
  const updated = [attempt, ...current.filter((a) => a.id !== attempt.id)];
  saveLocalAttempts(updated);
  return updated;
}

// 2. Writing Submissions Cache
export function getLocalWritingSubmissions(): any[] {
  try {
    const raw = localStorage.getItem(KEYS.WRITING);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading writing submissions from localStorage:', e);
    return [];
  }
}

export function saveLocalWritingSubmissions(submissions: any[]): void {
  try {
    localStorage.setItem(KEYS.WRITING, JSON.stringify(submissions));
    notifyListeners();
  } catch (e) {
    console.error('Error saving writing submissions to localStorage:', e);
  }
}

export function appendLocalWritingSubmission(sub: any): any[] {
  const current = getLocalWritingSubmissions();
  const updated = [sub, ...current.filter((s) => s.id !== sub.id)];
  saveLocalWritingSubmissions(updated);
  return updated;
}

// 3. Speaking Sessions Cache
export function getLocalSpeakingSessions(): any[] {
  try {
    const raw = localStorage.getItem(KEYS.SPEAKING);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading speaking sessions from localStorage:', e);
    return [];
  }
}

export function saveLocalSpeakingSessions(sessions: any[]): void {
  try {
    localStorage.setItem(KEYS.SPEAKING, JSON.stringify(sessions));
    notifyListeners();
  } catch (e) {
    console.error('Error saving speaking sessions to localStorage:', e);
  }
}

export function appendLocalSpeakingSession(session: any): any[] {
  const current = getLocalSpeakingSessions();
  const updated = [session, ...current.filter((s) => s.id !== session.id)];
  saveLocalSpeakingSessions(updated);
  return updated;
}

// 4. Target Band
export function getLocalTargetBand(defaultBand = 7.5): number {
  try {
    const raw = localStorage.getItem(KEYS.TARGET_BAND);
    if (!raw) return defaultBand;
    const num = parseFloat(raw);
    return isNaN(num) ? defaultBand : num;
  } catch {
    return defaultBand;
  }
}

export function saveLocalTargetBand(band: number): void {
  try {
    localStorage.setItem(KEYS.TARGET_BAND, String(band));
    notifyListeners();
  } catch (e) {
    console.error('Error saving target band to localStorage:', e);
  }
}

// 5. Saved Test Materials for Offline Study
export function getSavedMaterials(): SavedMaterial[] {
  try {
    const raw = localStorage.getItem(KEYS.SAVED_MATERIALS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading saved materials:', e);
    return [];
  }
}

export function saveMaterialForOffline(material: SavedMaterial): SavedMaterial[] {
  const current = getSavedMaterials();
  const exists = current.some((m) => m.id === material.id);
  const updated = exists
    ? current.map((m) => (m.id === material.id ? material : m))
    : [material, ...current];
  try {
    localStorage.setItem(KEYS.SAVED_MATERIALS, JSON.stringify(updated));
    notifyListeners();
  } catch (e) {
    console.error('Error saving material for offline:', e);
  }
  return updated;
}

export function removeSavedMaterial(id: string): SavedMaterial[] {
  const current = getSavedMaterials();
  const updated = current.filter((m) => m.id !== id);
  try {
    localStorage.setItem(KEYS.SAVED_MATERIALS, JSON.stringify(updated));
    notifyListeners();
  } catch (e) {
    console.error('Error removing saved material:', e);
  }
  return updated;
}

export function isMaterialSaved(id: string): boolean {
  const current = getSavedMaterials();
  return current.some((m) => m.id === id);
}

// 6. Cache Stats
export function getOfflineCacheStats() {
  const attempts = getLocalAttempts();
  const writing = getLocalWritingSubmissions();
  const speaking = getLocalSpeakingSessions();
  const savedMaterials = getSavedMaterials();

  return {
    totalAttempts: attempts.length,
    writingCount: writing.length,
    speakingCount: speaking.length,
    savedMaterialsCount: savedMaterials.length,
    totalRecords: attempts.length + writing.length + speaking.length + savedMaterials.length,
  };
}
