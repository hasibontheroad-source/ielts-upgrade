# Official IELTS 9-Band Scoring System & Part-by-Part Assessment Architecture

A precision-engineered assessment framework bringing exact official IELTS examination scoring rules across all four skills—Listening, Reading, Writing, and Speaking—with instant score card modals appearing immediately upon completing every single test section/part, cumulative band score tracking, and end-to-end verification of all interactive tools.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following scoring behaviors and UX architectures were aligned with user preferences:
> - **Score Card Modals**: An instant, high-contrast Score Card modal triggers immediately after completing each part/section of a test, displaying section raw score, cumulative tally, CEFR tier, and projected IELTS band.
> - **Writing Band Calculation**: Strict adherence to the official British Council / IDP standard: `Writing Band = roundToHalf((Task 1 + 2 × Task 2) / 3)` across the 4 official criteria (TR/TA, CC, LR, GRA).
> - **Speaking Breakdown**: Distinct individual score cards for Part 1, Part 2, and Part 3 evaluated across the 4 official descriptors: Fluency & Coherence (FC), Lexical Resource (LR), Grammatical Range & Accuracy (GRA), and Pronunciation (PR).
> - **Tool Verification**: Full operational audit and hardening across Audio Synthesis (TTS), Live Speaking Examiner, Search Grounding, and Firestore synchronization.

---

### 1. Overview & Core Concept

- **What It Does**: Implements the official British Council / IDP Cambridge IELTS 9-Band score calculation engine with micro-feedback after every test phase:
  - **Listening**: 4 distinct parts (10 questions each = 40 total). After Part 1, Part 2, Part 3, and Part 4, a modal pops up showing the score for that part (e.g. 9/10), cumulative score to date (e.g. 27/30), and current projected band score with detailed answer breakdowns.
  - **Reading**: 3 authentic passages (Passage 1: 13 Qs, Passage 2: 13 Qs, Passage 3: 14 Qs = 40 total). After each passage, an instant score card modal reveals performance, accuracy, and projected band.
  - **Writing**: Task 1 scored on TA, CC, LR, GRA (Band 0–9.0). Task 2 scored on TR, CC, LR, GRA (Band 0–9.0). Overall Writing calculated using official 1:2 weighting with standard IELTS half-band rounding.
  - **Speaking**: Parts 1, 2, and 3 scored on FC, LR, GRA, PR, with individual part feedback and model responses.
- **Official Rounding Rule**:
  $$\text{Average} = \frac{L + R + W + S}{4}$$
  - Fractional part $< 0.25 \implies$ round down to whole band.
  - $0.25 \le \text{Fractional part} < 0.75 \implies$ round to nearest $0.5$.
  - Fractional part $\ge 0.75 \implies$ round up to next whole band.

---

### 2. User Experience & Visual Design

#### Key User Flows
1. **Taking a Listening Section**:
   - Candidate answers Section 1 questions and clicks "Submit Section 1".
   - The **Instant Part Score Card Modal** appears with:
     - Part 1 Score (e.g., 9 / 10 · 90% Accuracy).
     - Projected Overall Listening Band (e.g., Band 8.5).
     - CEFR Equivalent badge (`C2 Mastery`).
     - List of correct answers and explanations.
     - Two action buttons: "Review Answers" or "Proceed to Section 2".
2. **Taking a Reading Passage**:
   - Candidate reads Passage 1, completes True/False/Not Given and Multiple Choice, then submits.
   - Instant score modal displays Passage 1 results and updates the running test band tally.
3. **Completing Writing Tasks**:
   - Task 1 submitted $\to$ scored on TA, CC, LR, GRA $\to$ Task 1 Band card displayed.
   - Task 2 submitted $\to$ scored on TR, CC, LR, GRA $\to$ Task 2 Band card displayed.
   - Master Writing Band Card combines Task 1 (33.3%) and Task 2 (66.7%) using official IELTS 1:2 weighting.
4. **Speaking Evaluation**:
   - After recording or transcribing Part 1, Part 2 cue card, or Part 3 discussion, a 4-criteria feedback card renders with specific grammatical and lexical upgrades.

#### Visual Aesthetics
- **Score Card Modal**: Focused, dark slate backdrop (`bg-slate-900/95` with subtle blue halo), single-line header, big tabular numerals for bands (`tabular-nums font-mono text-3xl font-black`), color-coded criterion meters (Emerald for $\ge 7.0$, Amber for $5.5\text{--}6.5$, Rose for $< 5.5$).
- **Anti-Slop Discipline**: No decorative pulsing dots; clean metadata with `·` separators; accessible WCAG AA contrast.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Section-by-Section Score Card Modal vs Inline Tally**
  - *Chosen Approach*: Instant modal overlay after each part with a cumulative tally strip.
  - *Why*: Provides explicit, celebratory, and motivating milestone feedback without disorienting the user or requiring them to scroll through long test papers.
- **Decision 2: 1:2 Writing Weighting Engine**
  - *Chosen Approach*: Official Cambridge formula `(Task 1 + 2 * Task 2) / 3` with `.25` and `.75` rounding boundaries.
  - *Why*: Matches real exam results where Task 2 carries double the weighting of Task 1.
- **Decision 3: Complete Tool Health & Resiliency**
  - *Chosen Approach*: Validate and harden all backend endpoints:
    - `/api/gemini/tts`: Reliable British Council examiner voice synthesis with fallback.
    - `/api/gemini/score-writing`: Thinking mode with fallback to flash, structured JSON schema.
    - `/api/gemini/score-speaking`: 4-descriptor evaluation with actionable corrections.
    - `/api/gemini/search-trends`: Google Search grounding for latest exam intel.
    - Firestore integration: Safe offline guest mode + cloud authenticated persistence.

---

### 4. Technical Architecture & Component Mapping

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CambridgeMockHub                                  │
│  ┌───────────────────────┐  ┌─────────────────────┐  ┌───────────────────┐  │
│  │ Section 1-4 Player    │  │ Passage 1-3 Reader  │  │ Writing & Spk     │  │
│  └───────────┬───────────┘  └──────────┬──────────┘  └─────────┬─────────┘  │
└──────────────┼─────────────────────────┼───────────────────────┼────────────┘
               ▼                         ▼                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       PartScoreModal (New Component)                         │
│  - Section Raw Score & Accuracy Percentage (e.g. 10/10 - 100%)              │
│  - Projected IELTS Band (e.g. Band 8.5) & CEFR Level (e.g. C2 Mastery)      │
│  - Cumulative Test Score Tracker (e.g. Part 1 + Part 2 = 18/20)             │
│  - Immediate Question-by-Question Review with Explanations                  │
│  - "Review Current Part" or "Advance to Next Part" Buttons                  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     Official IELTS Scoring Core (scoring.ts)                │
│  - calculateListeningBandScore(0-40) -> 1.0-9.0                             │
│  - calculateReadingBandScore(0-40) -> 1.0-9.0                               │
│  - calculateWritingBandScore(task1Band, task2Band) -> 1:2 Weighted Band     │
│  - calculateSpeakingBandScore(fc, lr, gra, pr) -> Official 4-criteria Band  │
│  - calculateOverallBandScore(L, R, W, S) -> Official IELTS Rounding         │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Files to Create & Update:
1. `src/utils/scoring.ts`: Add official Writing weighted formula `(T1 + 2*T2)/3`, Speaking 4-criteria calculator, part-by-part projection helpers, and scoring unit tests.
2. `src/components/PartScoreModal.tsx`: Create a polished, reusable modal component displaying section score, cumulative band projection, criteria breakdown, and transition controls.
3. `src/components/CambridgeMockHub.tsx`: Connect `PartScoreModal` to trigger after every Listening Section (1-4) and Reading Passage (1-3), with cumulative tracking and combined exam cards.
4. `src/components/WritingEvaluator.tsx`: Support dual Task 1 + Task 2 workflow with official 1:2 combined Writing Band calculation.
5. `src/components/SpeakingStudio.tsx`: Display official 4-criteria score meters (FC, LR, GRA, PR) with Part 1, 2, and 3 breakdowns.
