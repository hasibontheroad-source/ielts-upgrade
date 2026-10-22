/**
 * IELTS Official Band Score Calculation and Conversion Utilities
 * Calibrated against British Council, IDP, and Cambridge Assessment English official standards.
 */

import type { QuestionItem } from '../data/cambridgeTests.ts';

/**
 * Official IELTS Half-Band Rounding Rules:
 * - If average fraction is < 0.25 -> round down to whole band (e.g. 6.125 -> 6.0)
 * - If average fraction is >= 0.25 and < 0.75 -> round to 0.5 (e.g. 6.25 -> 6.5, 6.375 -> 6.5, 6.625 -> 6.5)
 * - If average fraction is >= 0.75 -> round up to next whole band (e.g. 6.75 -> 7.0, 6.875 -> 7.0)
 */
export function roundToIELTSBand(val: number): number {
  if (val <= 0) return 0.0;
  if (val >= 9.0) return 9.0;

  const whole = Math.floor(val);
  const frac = val - whole;

  if (frac < 0.25) {
    return whole;
  } else if (frac < 0.75) {
    return whole + 0.5;
  } else {
    return whole + 1.0;
  }
}

/**
 * Official Cambridge Academic Listening Conversion Table (0 - 40 raw score -> 1.0 - 9.0 band)
 */
export function calculateListeningBandScore(rawScore: number): number {
  const score = Math.max(0, Math.min(40, Math.round(rawScore)));
  if (score >= 39) return 9.0;
  if (score >= 37) return 8.5;
  if (score >= 35) return 8.0;
  if (score >= 32) return 7.5;
  if (score >= 30) return 7.0;
  if (score >= 26) return 6.5;
  if (score >= 23) return 6.0;
  if (score >= 18) return 5.5;
  if (score >= 16) return 5.0;
  if (score >= 13) return 4.5;
  if (score >= 10) return 4.0;
  if (score >= 8) return 3.5;
  if (score >= 6) return 3.0;
  if (score >= 4) return 2.5;
  if (score >= 2) return 2.0;
  if (score >= 1) return 1.0;
  return 0.0;
}

/**
 * Official Cambridge Academic Reading Conversion Table (0 - 40 raw score -> 1.0 - 9.0 band)
 */
export function calculateReadingBandScore(rawScore: number): number {
  const score = Math.max(0, Math.min(40, Math.round(rawScore)));
  if (score >= 39) return 9.0;
  if (score >= 37) return 8.5;
  if (score >= 35) return 8.0;
  if (score >= 33) return 7.5;
  if (score >= 30) return 7.0;
  if (score >= 27) return 6.5;
  if (score >= 23) return 6.0;
  if (score >= 19) return 5.5;
  if (score >= 15) return 5.0;
  if (score >= 13) return 4.5;
  if (score >= 10) return 4.0;
  if (score >= 8) return 3.5;
  if (score >= 6) return 3.0;
  if (score >= 4) return 2.5;
  if (score >= 2) return 2.0;
  if (score >= 1) return 1.0;
  return 0.0;
}

/**
 * Official IELTS Writing Band Score Calculation:
 * Task 2 carries DOUBLE the weight of Task 1:
 * Total Writing Band = (Task 1 + 2 * Task 2) / 3, rounded to nearest 0.5 per official IELTS rules.
 */
export function calculateWritingBandScore(task1Band: number, task2Band: number): number {
  const raw = (task1Band + 2 * task2Band) / 3;
  return roundToIELTSBand(raw);
}

/**
 * Official IELTS Speaking Band Score Calculation:
 * Arithmetic average of the 4 official criteria:
 * 1. Fluency & Coherence (FC)
 * 2. Lexical Resource (LR)
 * 3. Grammatical Range & Accuracy (GRA)
 * 4. Pronunciation (PR)
 * Rounded to nearest 0.5.
 */
export function calculateSpeakingBandScore(fc: number, lr: number, gra: number, pr: number): number {
  const raw = (fc + lr + gra + pr) / 4;
  return roundToIELTSBand(raw);
}

/**
 * Calculates the overall IELTS band score following the official IELTS rounding rule across 4 skills:
 */
export function calculateOverallBandScore(
  listening: number,
  reading: number,
  writing: number,
  speaking: number
): number {
  const avg = (listening + reading + writing + speaking) / 4;
  return roundToIELTSBand(avg);
}

/**
 * Projects a Listening Band Score when only a portion of the test has been completed
 * (e.g. after Section 1, Section 2, etc.) by scaling proportionally to the full 40 questions.
 */
export function projectListeningBand(correctCount: number, totalQuestions: number): number {
  if (totalQuestions <= 0) return 0.0;
  const scaledScore = Math.round((correctCount / totalQuestions) * 40);
  return calculateListeningBandScore(scaledScore);
}

/**
 * Projects a Reading Band Score when only a portion of the test has been completed
 * (e.g. after Passage 1, Passage 2, etc.) by scaling proportionally to the full 40 questions.
 */
export function projectReadingBand(correctCount: number, totalQuestions: number): number {
  if (totalQuestions <= 0) return 0.0;
  const scaledScore = Math.round((correctCount / totalQuestions) * 40);
  return calculateReadingBandScore(scaledScore);
}

/**
 * Computes granular score statistics for an individual test section/passage
 */
export interface SectionScoreSummary {
  partNumber: number;
  partTitle: string;
  moduleType: 'listening' | 'reading';
  correctCount: number;
  totalQuestions: number;
  accuracyPercentage: number;
  scaled40Score: number;
  partBand: number;
  cumulativeCorrect: number;
  cumulativeTotal: number;
  cumulativeBand: number;
  cefrLevel: string;
  results: {
    questionNumber: number;
    questionText: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanation: string;
  }[];
}

export function evaluateSectionAnswers(
  questions: QuestionItem[],
  userAnswers: Record<number, string>,
  partNumber: number,
  partTitle: string,
  moduleType: 'listening' | 'reading',
  priorCumulativeCorrect: number = 0,
  priorCumulativeTotal: number = 0
): SectionScoreSummary {
  let correctCount = 0;
  const results = questions.map((q) => {
    const rawUser = (userAnswers[q.id] || '').trim().toLowerCase();
    const rawCorrect = q.correctAnswer.trim().toLowerCase();
    const isCorrect = rawUser === rawCorrect;
    if (isCorrect) correctCount++;

    return {
      questionNumber: q.questionNumber,
      questionText: q.question,
      userAnswer: userAnswers[q.id] || '(No Answer)',
      correctAnswer: q.correctAnswer,
      isCorrect,
      explanation: q.explanation,
    };
  });

  const totalQuestions = questions.length;
  const accuracyPercentage = Math.round((correctCount / Math.max(1, totalQuestions)) * 100);
  const scaled40Score = Math.round((correctCount / Math.max(1, totalQuestions)) * 40);
  const partBand =
    moduleType === 'listening'
      ? calculateListeningBandScore(scaled40Score)
      : calculateReadingBandScore(scaled40Score);

  const cumulativeCorrect = priorCumulativeCorrect + correctCount;
  const cumulativeTotal = priorCumulativeTotal + totalQuestions;
  const cumulativeScaled = Math.round((cumulativeCorrect / Math.max(1, cumulativeTotal)) * 40);
  const cumulativeBand =
    moduleType === 'listening'
      ? calculateListeningBandScore(cumulativeScaled)
      : calculateReadingBandScore(cumulativeScaled);

  return {
    partNumber,
    partTitle,
    moduleType,
    correctCount,
    totalQuestions,
    accuracyPercentage,
    scaled40Score,
    partBand,
    cumulativeCorrect,
    cumulativeTotal,
    cumulativeBand,
    cefrLevel: getCEFRLevel(cumulativeBand),
    results,
  };
}

export function getCEFRLevel(band: number): string {
  if (band >= 8.5) return 'C2 (Mastery)';
  if (band >= 7.0) return 'C1 (Effective Operational Proficiency)';
  if (band >= 5.5) return 'B2 (Vantage)';
  if (band >= 4.0) return 'B1 (Threshold)';
  return 'A2 / A1 (Basic User)';
}

export function getBandDescriptor(band: number): string {
  if (band >= 9.0) return 'Expert User - Has fully operational command of the language: appropriate, accurate and fluent with complete understanding.';
  if (band >= 8.0) return 'Very Good User - Has fully operational command with only occasional unsystematic inaccuracies. Handles complex detailed argumentation well.';
  if (band >= 7.0) return 'Good User - Has operational command, though with occasional inaccuracies and misunderstandings. Generally handles complex language well.';
  if (band >= 6.0) return 'Competent User - Has generally effective command despite some inaccuracies, inappropriacies and misunderstandings. Can use and understand fairly complex language.';
  if (band >= 5.0) return 'Modest User - Has partial command of the language, coping with overall meaning in most situations, though is likely to make many mistakes.';
  return 'Limited User - Basic competence is limited to familiar situations. Has frequent problems in understanding and expression.';
}
