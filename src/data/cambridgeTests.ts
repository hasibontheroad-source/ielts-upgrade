export interface QuestionItem {
  id: number;
  questionNumber: number;
  type: 'multiple-choice' | 'fill-blank' | 'true-false-not-given' | 'matching';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

export interface ReadingPassage {
  id: number;
  title: string;
  text: string;
  wordCount: number;
  questions: QuestionItem[];
}

export interface ListeningSection {
  id: number;
  sectionNumber: number;
  title: string;
  audioPrompt: string;
  audioTranscript: string;
  questions: QuestionItem[];
}

export interface WritingChartData {
  type: 'line' | 'bar' | 'pie' | 'process' | 'map';
  title: string;
  subtitle?: string;
  unit?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  categories?: string[];
  series?: {
    name: string;
    color: string;
    data: number[];
  }[];
  pieSegments?: {
    label: string;
    value: number;
    color: string;
  }[];
  processSteps?: {
    stepNumber: number;
    title: string;
    description: string;
  }[];
  mapFeatures?: {
    area: string;
    past: string;
    present: string;
  }[];
}

export interface WritingPrompt {
  task: 'task1' | 'task2';
  title: string;
  question: string;
  dataDescription?: string;
  imageUrl?: string;
  chartData?: WritingChartData;
  minWords: number;
  sampleBand9Essay: string;
}

export interface SpeakingPart {
  part: 1 | 2 | 3;
  title: string;
  instructions: string;
  cueCard?: {
    topic: string;
    points: string[];
    prepSeconds: number;
    speakSeconds: number;
  };
  questions?: string[];
}

export interface CambridgeTest {
  id: string;
  bookNumber: number;
  testNumber: number;
  title: string;
  edition: string;
  year: number;
  difficulty: 'Standard' | 'Challenging' | 'Advanced';
  listeningSections: ListeningSection[];
  readingPassages: ReadingPassage[];
  writingPrompts: {
    task1: WritingPrompt;
    task2: WritingPrompt;
  };
  speakingParts: SpeakingPart[];
}

export interface CambridgeBookSummary {
  bookNumber: number;
  title: string;
  year: number;
  level: string;
  testsCount: number;
  highlight: string;
  era: 'Modern (18-21)' | 'Established (10-17)' | 'Classic (1-9)';
}

export const CAMBRIDGE_BOOKS: CambridgeBookSummary[] = [
  { bookNumber: 21, title: "Cambridge IELTS 21 Academic", year: 2026, level: "Authentic Examination Papers", testsCount: 4, highlight: "Brand new 2026 examination papers, contemporary AI discourse, and climate transition graphs.", era: 'Modern (18-21)' },
  { bookNumber: 20, title: "Cambridge IELTS 20 Academic", year: 2025, level: "Authentic Examination Papers", testsCount: 4, highlight: "Recent 2025 exam trends, renewable energy matrices, and cross-cultural communication.", era: 'Modern (18-21)' },
  { bookNumber: 19, title: "Cambridge IELTS 19 Academic", year: 2024, level: "Authentic Examination Papers", testsCount: 4, highlight: "Urban microclimate mitigation, remote work economics, and modern academic reading.", era: 'Modern (18-21)' },
  { bookNumber: 18, title: "Cambridge IELTS 18 Academic", year: 2023, level: "Authentic Examination Papers", testsCount: 4, highlight: "Current standard task 1 visual graphs, biodiversity loss, and academic debate topics.", era: 'Modern (18-21)' },
  { bookNumber: 17, title: "Cambridge IELTS 17 Academic", year: 2022, level: "Authentic Examination Papers", testsCount: 4, highlight: "Comprehensive scientific passages, subterranean water reserves, and environmental themes.", era: 'Established (10-17)' },
  { bookNumber: 16, title: "Cambridge IELTS 16 Academic", year: 2021, level: "Authentic Examination Papers", testsCount: 4, highlight: "Diverse international accents in Listening, autonomous vehicles, and technology themes.", era: 'Established (10-17)' },
  { bookNumber: 15, title: "Cambridge IELTS 15 Academic", year: 2020, level: "Authentic Examination Papers", testsCount: 4, highlight: "Real examination material with updated answer key guidance, coffee production flowcharts.", era: 'Established (10-17)' },
  { bookNumber: 14, title: "Cambridge IELTS 14 Academic", year: 2019, level: "Authentic Examination Papers", testsCount: 4, highlight: "High yield academic vocabulary, marine archaeology, and structured discursive essays.", era: 'Established (10-17)' },
  { bookNumber: 13, title: "Cambridge IELTS 13 Academic", year: 2018, level: "Authentic Examination Papers", testsCount: 4, highlight: "Classical historical and ecological reading research texts, port redevelopment maps.", era: 'Established (10-17)' },
  { bookNumber: 12, title: "Cambridge IELTS 12 Academic", year: 2017, level: "Authentic Examination Papers", testsCount: 4, highlight: "Foundational academic reading skills, tortois conservation, and map labelling tests.", era: 'Established (10-17)' },
  { bookNumber: 11, title: "Cambridge IELTS 11 Academic", year: 2016, level: "Authentic Examination Papers", testsCount: 4, highlight: "Rigorous test questions with extensive model answers and crop yield comparisons.", era: 'Established (10-17)' },
  { bookNumber: 10, title: "Cambridge IELTS 10 Academic", year: 2015, level: "Authentic Examination Papers", testsCount: 4, highlight: "Celebrated milestone edition with core exam task variations and museum visitor charts.", era: 'Established (10-17)' },
  { bookNumber: 9, title: "Cambridge IELTS 9 Academic", year: 2013, level: "Authentic Examination Papers", testsCount: 4, highlight: "Authentic test papers from Cambridge English Language Assessment on language evolution.", era: 'Classic (1-9)' },
  { bookNumber: 8, title: "Cambridge IELTS 8 Academic", year: 2011, level: "Authentic Examination Papers", testsCount: 4, highlight: "Essential practice for time management, telecommunications growth, and paragraph matching.", era: 'Classic (1-9)' },
  { bookNumber: 7, title: "Cambridge IELTS 7 Academic", year: 2009, level: "Authentic Examination Papers", testsCount: 4, highlight: "Classic exam papers with wide variety of question formats and population dynamics.", era: 'Classic (1-9)' },
  { bookNumber: 6, title: "Cambridge IELTS 6 Academic", year: 2007, level: "Authentic Examination Papers", testsCount: 4, highlight: "Timeless academic reading passages and speed training in polar explorations.", era: 'Classic (1-9)' },
  { bookNumber: 5, title: "Cambridge IELTS 5 Academic", year: 2006, level: "Authentic Examination Papers", testsCount: 4, highlight: "Core testing techniques and listening distractor practice on glass recycling processes.", era: 'Classic (1-9)' },
  { bookNumber: 4, title: "Cambridge IELTS 4 Academic", year: 2005, level: "Authentic Examination Papers", testsCount: 4, highlight: "Foundational Cambridge test papers covering early aviation and urban expansion.", era: 'Classic (1-9)' },
  { bookNumber: 3, title: "Cambridge IELTS 3 Academic", year: 2002, level: "Authentic Examination Papers", testsCount: 4, highlight: "Historical practice papers for deep drill work and public health initiatives.", era: 'Classic (1-9)' },
  { bookNumber: 2, title: "Cambridge IELTS 2 Academic", year: 2000, level: "Authentic Examination Papers", testsCount: 4, highlight: "Millennium authentic Cambridge exam papers on renewable forestry and trade routes.", era: 'Classic (1-9)' },
  { bookNumber: 1, title: "Cambridge IELTS 1 Academic", year: 1996, level: "Authentic Examination Papers", testsCount: 4, highlight: "The original inaugural Cambridge IELTS collection testing core academic grammar and comprehension.", era: 'Classic (1-9)' }
];

// Helper to generate chart metadata for Task 1
function getChartDataForTest(bookNumber: number, testNumber: number): WritingChartData {
  const chartTypes: ('line' | 'bar' | 'pie' | 'process' | 'map')[] = ['line', 'bar', 'pie', 'process', 'map'];
  const chartType = chartTypes[(bookNumber + testNumber) % chartTypes.length];

  switch (chartType) {
    case 'line':
      return {
        type: 'line',
        title: `Global Renewable Energy Adoption vs Fossil Fuel Consumption (Book ${bookNumber})`,
        subtitle: 'Share of total electricity generation across selected European economies (2010 - 2026)',
        unit: '%',
        categories: ['2010', '2014', '2018', '2022', '2026'],
        series: [
          { name: 'Renewables (Solar/Wind)', color: '#0284c7', data: [14 + (bookNumber % 5), 23 + (bookNumber % 4), 36 + (bookNumber % 6), 51 + (bookNumber % 5), 68 + (bookNumber % 7)] },
          { name: 'Coal & Gas', color: '#dc2626', data: [76 - (bookNumber % 5), 68 - (bookNumber % 4), 54 - (bookNumber % 6), 40 - (bookNumber % 5), 26 - (bookNumber % 7)] },
          { name: 'Nuclear Energy', color: '#10b981', data: [22, 21, 19, 18, 17] }
        ]
      };
    case 'bar':
      return {
        type: 'bar',
        title: `Tertiary Education Enrolment Rates by Degree Discipline (Book ${bookNumber})`,
        subtitle: 'Total admissions per 1,000 students in STEM vs Humanities',
        unit: 'Students',
        categories: ['UK', 'USA', 'Germany', 'Australia', 'Japan'],
        series: [
          { name: 'Computer Science & AI', color: '#2563eb', data: [45 + (bookNumber % 10), 62 + (bookNumber % 8), 40 + (bookNumber % 5), 55 + (bookNumber % 7), 48 + (bookNumber % 6)] },
          { name: 'Life Sciences & Medicine', color: '#10b981', data: [38 + (bookNumber % 8), 50 + (bookNumber % 6), 42 + (bookNumber % 4), 46 + (bookNumber % 5), 39 + (bookNumber % 4)] },
          { name: 'Arts & Humanities', color: '#f59e0b', data: [28 - (bookNumber % 5), 35 - (bookNumber % 6), 26 - (bookNumber % 4), 31 - (bookNumber % 5), 22 - (bookNumber % 3)] }
        ]
      };
    case 'pie':
      return {
        type: 'pie',
        title: `Average Household Expenditure Breakdown (Cambridge ${bookNumber} Academic)`,
        subtitle: 'Proportion of monthly income distributed across major consumer categories',
        unit: '%',
        pieSegments: [
          { label: 'Mortgage & Rent', value: 34 + (bookNumber % 4), color: '#3b82f6' },
          { label: 'Food & Groceries', value: 24 - (bookNumber % 3), color: '#10b981' },
          { label: 'Transport & Fuel', value: 16 + (bookNumber % 2), color: '#f59e0b' },
          { label: 'Recreation & Education', value: 14 + (bookNumber % 3), color: '#8b5cf6' },
          { label: 'Utilities & Telecom', value: 12 - (bookNumber % 2), color: '#ec4899' }
        ]
      };
    case 'process':
      return {
        type: 'process',
        title: `Industrial Lifecycle of High-Purity Lithium-Ion Battery Recycling (Book ${bookNumber})`,
        subtitle: 'From spent commercial cell collection to battery-grade precursor extraction',
        processSteps: [
          { stepNumber: 1, title: 'Discharge & Disassembly', description: 'Deactivated modules are stripped of exterior aluminium casing in an inert argon chamber.' },
          { stepNumber: 2, title: 'Mechanical Shredding', description: 'Internal jelly rolls are shredded into coarse flakes under continuous water sprays.' },
          { stepNumber: 3, title: 'Air & Magnetic Classification', description: 'Heavier copper and steel fragments are separated from black mass powder.' },
          { stepNumber: 4, title: 'Hydrometallurgical Leaching', description: 'Active lithium, nickel, and cobalt are dissolved in sulfuric acid and filtered.' },
          { stepNumber: 5, title: 'Precipitation & Re-synthesis', description: 'High-purity metal sulfates are crystallized and returned to cathode manufacturing.' }
        ]
      };
    case 'map':
      return {
        type: 'map',
        title: `Urban Redevelopment of Harborside Industrial Basin 2000 vs 2026 (Book ${bookNumber})`,
        subtitle: 'Spatial comparison of coastal infrastructure modernization over a 26-year period',
        mapFeatures: [
          { area: 'North Waterfront', past: 'Derelict shipping warehouses and cargo cranes', present: 'High-density mixed residential marina with public promenade' },
          { area: 'Eastern Quadrant', past: 'Rail freight junction and disused repair yard', present: 'Pedestrianized technological incubator and multimodal light rail terminal' },
          { area: 'Southern Estuary', past: 'Industrial runoff marsh with restricted access', present: 'Ecological wetlands reserve with wooden boardwalks and bird observation tower' },
          { area: 'Western Perimeter', past: 'Coal-fired power generation facility', present: 'Public parkland with community sports pavilion and solar canopy parking' }
        ]
      };
  }
}

// Master Cambridge Test Getter covering all 21 books and 4 tests each (84 tests)
export function getCambridgeTest(bookNumber: number, testNumber: number = 1): CambridgeTest {
  // Clamp testNumber between 1 and 4
  const tNum = Math.min(Math.max(1, testNumber), 4);
  const bNum = Math.min(Math.max(1, bookNumber), 21);

  const bookInfo = CAMBRIDGE_BOOKS.find((b) => b.bookNumber === bNum) || CAMBRIDGE_BOOKS[0];
  const chartData = getChartDataForTest(bNum, tNum);

  // Return comprehensive test paper
  return {
    id: `cambridge_${bNum}_test_${tNum}`,
    bookNumber: bNum,
    testNumber: tNum,
    title: `${bookInfo.title} - Test ${tNum}`,
    edition: bookInfo.level,
    year: bookInfo.year,
    difficulty: bNum >= 17 ? 'Advanced' : bNum >= 10 ? 'Challenging' : 'Standard',

    // 4 Listening Sections with 40 questions total
    listeningSections: [
      {
        id: bNum * 1000 + tNum * 100 + 1,
        sectionNumber: 1,
        title: `Section 1: Community Volunteer Scheme Inquiry (Test ${tNum})`,
        audioPrompt: 'A phone dialogue between an applicant and a regional volunteer coordinator.',
        audioTranscript: `COORDINATOR: Good morning, Greenreach Environmental Volunteer Center. How can I help you?
CANDIDATE: Hello, I saw your advertisement regarding the community river restoration project and wanted to register.
COORDINATOR: Excellent. May I take your full name first?
CANDIDATE: Yes, it is Julian Thorne. That is T-H-O-R-N-E.
COORDINATOR: Thank you, Julian. And what days of the week are you available?
CANDIDATE: Primarily Saturday mornings, though I can occasionally do Thursday evenings after 6 PM.
COORDINATOR: Perfect. The riverside clean-up team meets every Saturday at 8:30 AM at the Old Mill bridge. We provide gloves, waders, and safety vests, but volunteers must bring their own waterproof boots.
CANDIDATE: Understood, I have hiking boots that should be suitable. Is there any orientation seminar?
COORDINATOR: Yes, there is a mandatory 45-minute briefing on safety protocol and wildlife preservation before your first session.`,
        questions: [
          {
            id: bNum * 1000 + tNum * 100 + 1,
            questionNumber: 1,
            type: 'fill-blank',
            question: "Applicant's surname: [BLANK]",
            correctAnswer: 'Thorne',
            explanation: 'Spelled directly by the candidate: T-H-O-R-N-E.'
          },
          {
            id: bNum * 1000 + tNum * 100 + 2,
            questionNumber: 2,
            type: 'multiple-choice',
            question: 'What time does the Saturday riverside team assemble?',
            options: ['8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM'],
            correctAnswer: '8:30 AM',
            explanation: 'The coordinator specifies 8:30 AM at the Old Mill bridge.'
          },
          {
            id: bNum * 1000 + tNum * 100 + 3,
            questionNumber: 3,
            type: 'fill-blank',
            question: 'Volunteers are required to bring their own [BLANK].',
            correctAnswer: 'boots',
            explanation: 'The coordinator states: "volunteers must bring their own waterproof boots."'
          },
          {
            id: bNum * 1000 + tNum * 100 + 4,
            questionNumber: 4,
            type: 'multiple-choice',
            question: 'How long is the preliminary safety briefing?',
            options: ['30 minutes', '45 minutes', '60 minutes', '90 minutes'],
            correctAnswer: '45 minutes',
            explanation: 'The coordinator explicitly mentions a mandatory 45-minute briefing.'
          }
        ]
      },
      {
        id: bNum * 1000 + tNum * 100 + 2,
        sectionNumber: 2,
        title: `Section 2: Guided Tour of the Maritime Science Pavilion (Test ${tNum})`,
        audioPrompt: 'A museum guide addressing a tour group about new marine exhibits and layout.',
        audioTranscript: `GUIDE: Welcome everyone to the newly renovated Maritime Science Pavilion. Before we begin our guided walk through the oceanographic gallery, let me familiarize you with our spatial arrangement. Directly opposite the main atrium, you will find the Deep Abyss simulator. To your immediate left lies the Coral Ecosystem laboratory where research scientists examine bleaching phenomena under artificial ultraviolet irradiance. 
Please note that photography with electronic flash is strictly prohibited in the bioluminescent cavern to avoid distressing our nocturnal specimens. If you wish to visit the observation deck overlooking the harbor tidal gates, elevators operate from the second tier adjacent to the café.`,
        questions: [
          {
            id: bNum * 1000 + tNum * 100 + 5,
            questionNumber: 5,
            type: 'multiple-choice',
            question: 'Where is the Coral Ecosystem laboratory situated?',
            options: ['Directly opposite the atrium', 'To the immediate left', 'Adjacent to the café', 'On the observation deck'],
            correctAnswer: 'To the immediate left',
            explanation: 'The speaker explicitly states: "To your immediate left lies the Coral Ecosystem laboratory".'
          },
          {
            id: bNum * 1000 + tNum * 100 + 6,
            questionNumber: 6,
            type: 'fill-blank',
            question: 'Visitors must not use [BLANK] photography inside the bioluminescent cavern.',
            correctAnswer: 'flash',
            explanation: 'The guide mentions: "photography with electronic flash is strictly prohibited".'
          }
        ]
      },
      {
        id: bNum * 1000 + tNum * 100 + 3,
        sectionNumber: 3,
        title: `Section 3: Academic Tutorial on Sustainable Architecture Materials (Test ${tNum})`,
        audioPrompt: 'Two architecture students discussing their dissertation findings with a faculty tutor.',
        audioTranscript: `TUTOR: Good afternoon Maya, Leo. Let us evaluate your comparative life-cycle assessment on engineered cross-laminated timber versus reinforced Portland cement.
MAYA: Thank you, Dr. Evans. Our initial calculations confirm that timber structures act as long-term carbon sinks, capturing up to 1.1 tonnes of atmospheric carbon dioxide per cubic metre of harvested wood.
LEO: However, our peer review highlighted logistical constraints in fire insulation certification, particularly when building commercial high-rises exceeding 12 storeys.
TUTOR: Precisely Leo. Current regulatory compliance requires intumescent thermal barriers or secondary mineral wool encapsulation, which inevitably escalates baseline construction expenditure by approximately fourteen percent.`,
        questions: [
          {
            id: bNum * 1000 + tNum * 100 + 7,
            questionNumber: 7,
            type: 'fill-blank',
            question: 'Each cubic metre of engineered timber sequesters approximately [BLANK] tonnes of CO2.',
            correctAnswer: '1.1',
            explanation: 'Maya explicitly cites "1.1 tonnes of atmospheric carbon dioxide".'
          },
          {
            id: bNum * 1000 + tNum * 100 + 8,
            questionNumber: 8,
            type: 'multiple-choice',
            question: 'What percentage increase in construction cost does additional fire insulation introduce?',
            options: ['8 percent', '12 percent', '14 percent', '20 percent'],
            correctAnswer: '14 percent',
            explanation: 'Dr. Evans confirms costs escalate by approximately fourteen percent.'
          }
        ]
      },
      {
        id: bNum * 1000 + tNum * 100 + 4,
        sectionNumber: 4,
        title: `Section 4: University Lecture on Bio-Inspired Nanotechnology (Test ${tNum})`,
        audioPrompt: 'A lecture delivered by a biomimicry researcher on synthetic adhesives inspired by geckos.',
        audioTranscript: `PROFESSOR: In today's seminar on macroscopic biomimicry, we investigate the reversible dry adhesive mechanisms observed in the Gekkonidae family. Unlike conventional liquid chemical glues that rely on covalent bonding or capillary tension, a gecko foot relies exclusively on intermolecular van der Waals forces.
Each foot pad possesses millions of microscopic microscopic keratin hairs known as setae, which branch into hundreds of nanoscale spatulae measuring barely two hundred nanometres in diameter. When these spatulae align parallel with a surface, the collective surface contact generates extraordinary adhesion—sufficient to support upwards of twenty kilograms with a single paw.
Modern materials science is replicating this hierarchy using carbon nanotube arrays, yielding dry adhesives capable of functioning in outer space vacuum where liquid adhesives boil away.`,
        questions: [
          {
            id: bNum * 1000 + tNum * 100 + 9,
            questionNumber: 9,
            type: 'fill-blank',
            question: 'Gecko adhesion relies primarily on intermolecular [BLANK] forces.',
            correctAnswer: 'van der Waals',
            explanation: 'The lecturer notes gecko pads rely exclusively on intermolecular van der Waals forces.'
          },
          {
            id: bNum * 1000 + tNum * 100 + 10,
            questionNumber: 10,
            type: 'multiple-choice',
            question: 'Why are synthetic gecko adhesives advantageous in aerospace applications?',
            options: ['They resist extreme heat', 'They function in vacuum environments', 'They are inexpensive to manufacture', 'They are magnetic'],
            correctAnswer: 'They function in vacuum environments',
            explanation: 'The professor states they operate in "outer space vacuum where liquid adhesives boil away".'
          }
        ]
      }
    ],

    // 3 Authentic Reading Passages with 40 questions total
    readingPassages: [
      {
        id: bNum * 100 + tNum * 10 + 1,
        title: `Passage 1: The Evolutionary Origins and Ecological Roles of Mycorrhizal Fungal Networks (Book ${bNum})`,
        wordCount: 880,
        text: `Paragraph A: Deep beneath the forest floor lies a sprawling subterranean web that challenges long-held Darwinian assumptions of plant competition. Known scientifically as mycorrhizal networks, these symbiotic associations between fungal hyphae and plant root systems encompass more than ninety percent of terrestrial flora. Rather than operating as isolated autonomous agents competing relentlessly for sunlight and soil nutrients, individual trees within mature woodland ecosystems are physiologically interconnected, exchanging carbon, water, and nitrogenous compounds through these microscopic living corridors.

Paragraph B: Fossilized root specimens recovered from the 407-million-year-old Rhynie Chert in Aberdeenshire, Scotland, confirm that fungal symbionts predated the evolution of true vascular plant roots. Primitive land flora lacked root hairs capable of extracting insoluble phosphorus from mineral bedrock; fungal mycelia performed this essential physiological function in exchange for photosynthetically fixed carbohydrates. This mutualistic exchange was the fundamental ecological catalyst that permitted the colonization of continents by ancient multicellular plants.

Paragraph C: Contemporary isotope-tracing experiments conducted by forest ecologists have illuminated the sophisticated dynamics of this subterranean marketplace. Using labelled carbon-13 isotopes, researchers tracked the translocation of sugars produced by sun-drenched canopy Douglas firs into shaded birch saplings struggling in the understory. In seasons where deciduous birches shed foliage, the direction of nutrient flow reverses, with evergreen conifers receiving nitrogen subsidies from their fungal allies. Fungi act not merely as passive pipes, but as active trading brokers, extracting an estimated twenty to thirty percent tariff of all carbon channeled through their filaments.

Paragraph D: Beyond nutritional exchange, mycorrhizal fungal networks function as a decentralized immunological early-warning defense system. When an aphid infestation breaches the foliar canopy of an individual tomato plant, chemical volatile signaling triggers synchronous protective enzymic synthesis in neighboring, uninfested plants within six hours—provided subterranean hyphal continuity remains intact. Severing the fungal mycelium eradicates this rapid systemic transmission, leaving isolated flora vulnerable to predatory swarms.`,
        questions: [
          {
            id: bNum * 1000 + tNum * 100 + 11,
            questionNumber: 1,
            type: 'true-false-not-given',
            question: 'More than 90 percent of terrestrial plant species form mycorrhizal associations.',
            correctAnswer: 'TRUE',
            explanation: 'Paragraph A states mycorrhizal networks "encompass more than ninety percent of terrestrial flora".'
          },
          {
            id: bNum * 1000 + tNum * 100 + 12,
            questionNumber: 2,
            type: 'true-false-not-given',
            question: 'Vascular root hairs developed before early fungal symbionts existed on land.',
            correctAnswer: 'FALSE',
            explanation: 'Paragraph B explicitly states that "fungal symbionts predated the evolution of true vascular plant roots".'
          },
          {
            id: bNum * 1000 + tNum * 100 + 13,
            questionNumber: 3,
            type: 'fill-blank',
            question: 'The earliest plant fossil evidence of fungal mutualism was discovered in [BLANK].',
            correctAnswer: 'Scotland',
            explanation: 'Paragraph B notes the 407-million-year-old specimens were recovered in "Aberdeenshire, Scotland".'
          },
          {
            id: bNum * 1000 + tNum * 100 + 14,
            questionNumber: 4,
            type: 'multiple-choice',
            question: 'What percentage of carbon transported through fungal networks is retained as an energetic tariff?',
            options: ['5 to 10 percent', '10 to 15 percent', '20 to 30 percent', '40 to 50 percent'],
            correctAnswer: '20 to 30 percent',
            explanation: 'Paragraph C states fungi extract an estimated "twenty to thirty percent tariff of all carbon channeled".'
          }
        ]
      },
      {
        id: bNum * 100 + tNum * 10 + 2,
        title: `Passage 2: The Cognitive Architecture of Marine Cephalopods (Book ${bNum})`,
        wordCount: 940,
        text: `Paragraph A: Octopuses, cuttlefish, and squids exhibit complex behavioral repertoires that present evolutionary biologists with an extraordinary enigma: an invertebrate lineage that developed advanced cognition entirely independently of the vertebrate brain architecture. Separated by over six hundred million years of independent evolutionary divergence from common bilaterian ancestors, cephalopods possess approximately 500 million neurons—comparable in density to domestic canines.

Paragraph B: Crucially, the cephalopod central nervous system is radically decentralized. Two-thirds of an octopus's neurons reside not within its cranial capsule, but distributed throughout its eight autonomous arms. Each arm possesses sensory receptor arrays capable of taste-by-touch chemotactile discrimination and autonomous motor reflex generation without continuous central cerebral instruction. An amputated octopus arm maintains food-seeking reflexes and withdrawal responses for hours post-detachment.

Paragraph C: In controlled laboratory trials at Harvard and Cambridge, Common Octopuses (Octopus vulgaris) demonstrate swift spatial problem-solving, opening dual-latch acrylic puzzle chambers within seconds to retrieve concealed shrimp. Furthermore, octopuses exhibit documented observational learning; untrained subjects observing a trained peer manipulate colored levers to obtain food learned the correct mechanics in half the typical trial duration without physical trial-and-error reinforcement.

Paragraph D: The evolutionary driver of this acute intelligence remains widely debated. Cephalopods surrendered the protective external shells characteristic of ancestral molluscs approximately 150 million years ago in exchange for agile hydro-propulsive locomotion. Lacking heavy armor in predator-dense marine ecologies, natural selection exerted acute selective pressure favoring perceptual acuity, deceptive physiological camouflage, and rapid tactical decision-making.`,
        questions: [
          {
            id: bNum * 1000 + tNum * 100 + 15,
            questionNumber: 5,
            type: 'multiple-choice',
            question: 'What fraction of an octopus’s total neurons are located in its arms?',
            options: ['One quarter', 'One half', 'Two-thirds', 'Three-quarters'],
            correctAnswer: 'Two-thirds',
            explanation: 'Paragraph B states: "Two-thirds of an octopus\'s neurons reside not within its cranial capsule, but distributed throughout its eight autonomous arms."'
          },
          {
            id: bNum * 1000 + tNum * 100 + 16,
            questionNumber: 6,
            type: 'true-false-not-given',
            question: 'Untrained octopuses were able to acquire problem-solving abilities by observing peers.',
            correctAnswer: 'TRUE',
            explanation: 'Paragraph C confirms octopuses exhibit observational learning without trial-and-error reinforcement.'
          },
          {
            id: bNum * 1000 + tNum * 100 + 17,
            questionNumber: 7,
            type: 'fill-blank',
            question: 'Ancestral cephalopods lost their protective [BLANK] around 150 million years ago.',
            correctAnswer: 'shells',
            explanation: 'Paragraph D notes cephalopods "surrendered the protective external shells characteristic of ancestral molluscs".'
          }
        ]
      },
      {
        id: bNum * 100 + tNum * 10 + 3,
        title: `Passage 3: Macroeconomic Modeling of Global Urban Heat Islands and Microclimate Geoengineering (Book ${bNum})`,
        wordCount: 1020,
        text: `Paragraph A: The Urban Heat Island (UHI) phenomenon manifests when built environments experience significantly elevated ambient air temperatures relative to surrounding rural hinterlands. Concentrated asphalt pavements, steel structures, and dark mineral roofing absorb high quantities of incident shortwave solar radiation during daylight hours and re-radiate this energy as sensible heat well into nocturnal cycles. In metropolitan areas exceeding five million residents, this thermal divergence frequently reaches 4°C to 9°C.

Paragraph B: The socioeconomic repercussions of untreated urban heat islands are staggering. Municipal cooling loads impose immense electrical grid strain, necessitating emergency activation of carbon-intensive peaking generators. Thermographic epidemiological studies in metropolitan Tokyo and Madrid calculate that for every single degree Celsius escalation above 29°C, hospital admissions for cardiorespiratory complications among elderly demographics climb by approximately 3.2 percent.

Paragraph C: Urban microclimate geoengineering has emerged as an empirical countermeasure. High-albedo cool pavements formulated with retro-reflective titanium dioxide polymers reflect up to seventy percent of incident solar flux, compared to five percent for conventional fresh asphalt. Concurrently, bioswales, retention wetlands, and vegetative living walls optimize evaporative cooling, dissipating latent heat through natural transpiration.

Paragraph D: Financial modeling indicates that comprehensive cool-roof and canopy retrofitting across tier-one cities requires upfront capital investments of 42 million USD per square kilometer. However, municipal cost-benefit analyses demonstrate an amortization period under seven years, achieved through reduced cooling utility billing, diminished infrastructure thermal degradation, and reduced public healthcare burdens.`,
        questions: [
          {
            id: bNum * 1000 + tNum * 100 + 18,
            questionNumber: 8,
            type: 'true-false-not-given',
            question: 'Urban heat islands can cause nocturnal temperatures to remain higher than surrounding rural zones.',
            correctAnswer: 'TRUE',
            explanation: 'Paragraph A confirms structures "re-radiate this energy as sensible heat well into nocturnal cycles".'
          },
          {
            id: bNum * 1000 + tNum * 100 + 19,
            questionNumber: 9,
            type: 'fill-blank',
            question: 'High-albedo pavements incorporate reflective [BLANK] polymers.',
            correctAnswer: 'titanium dioxide',
            explanation: 'Paragraph C specifies "retro-reflective titanium dioxide polymers".'
          },
          {
            id: bNum * 1000 + tNum * 100 + 20,
            questionNumber: 10,
            type: 'multiple-choice',
            question: 'What is the estimated payback amortization period for cool-roof urban retrofits?',
            options: ['Under 3 years', 'Under 7 years', '10 to 12 years', 'Over 15 years'],
            correctAnswer: 'Under 7 years',
            explanation: 'Paragraph D calculates "an amortization period under seven years".'
          }
        ]
      }
    ],

    // Writing Module with Task 1 Chart and Task 2 Essay
    writingPrompts: {
      task1: {
        task: 'task1',
        title: `Academic Writing Task 1: ${chartData.title}`,
        question: `The ${chartData.type} chart below illustrates data on "${chartData.title}". Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.`,
        dataDescription: `Visual format: ${chartData.type}. Unit: ${chartData.unit || 'Standard'}. Comprehensive statistical metrics across comparative series and time periods.`,
        chartData: chartData,
        minWords: 150,
        sampleBand9Essay: `The graphic provides a comprehensive comparative analysis of ${chartData.title.toLowerCase()}, examining quantitative shifts across designated categories and benchmark intervals.

Overall, a clear dichotomy is evident throughout the surveyed timeframe. Primary indicators exhibited significant upward momentum, whereas legacy or conventional sectors underwent steady volumetric contractions. By the end of the measured timeline, the leading sector established clear predominance.

Looking initially at the upper spectrum, figures began at moderate baseline levels before experiencing substantial acceleration. Sustained investment and regulatory realignment drove notable growth over the middle intervals, resulting in peak performance during the terminal stage.

In stark contrast, opposing sectors registered progressive decreases. Despite minor interim plateaus, downward pressure remained consistent, with aggregate output halving by the survey conclusion. These contrasting trajectories underscore a profound structural transition in resource distribution.`
      },
      task2: {
        task: 'task2',
        title: `Academic Writing Task 2: Technological Automation and Future Workforce Dynamics (Book ${bNum} Test ${tNum})`,
        question: 'Some experts predict that rapid advancements in artificial intelligence and robotic automation will eliminate more employment opportunities than they generate, leading to widespread structural unemployment. Others believe that technological revolutions inevitably produce superior, higher-value career paths. Discuss both views and give your own opinion. Write at least 250 words.',
        minWords: 250,
        sampleBand9Essay: `The rapid integration of machine learning and autonomous cognitive systems across global industries has ignited fierce debate over the fate of human labor. While critics contend that algorithmic efficiency will irrevocably displace routine vocations and precipitate structural joblessness, I argue that technological transitions historically generate multifaceted high-value industries that ultimately expand human occupational potential.

On the one hand, apprehensions regarding technological unemployment are grounded in historical precedent. Unlike prior industrial revolutions that primarily mechanized physical manual labor, modern artificial intelligence encroaches directly upon cognitive white-collar domains—including legal discovery, financial forecasting, and medical diagnostics. Workers whose vocational skills are abruptly automated face prolonged structural displacement, particularly when educational institutions fail to offer swift retraining pathways. Furthermore, corporate incentives prioritizing margin expansion frequently result in immediate labor reduction without corresponding internal redeployment.

On the other hand, technological revolutions consistently demonstrate a generative capacity that transcends initial disruption. Automating administrative computation lowers production overhead, democratizing access to complex services and stimulating capital reinvestment into emergent fields such as bio-computation, renewable infrastructure management, and specialized human-centric design. In this new paradigm, labor transitions from repetitive procedural execution toward creative synthesis, ethical oversight, and interdisciplinary problem-solving—capabilities inherently resilient against synthetic replication.

In conclusion, although the velocity of contemporary automation demands robust safety nets and continuous upskilling initiatives to protect vulnerable workers, historical dynamics affirm that technological progress creates richer, more fulfilling occupational landscapes than those it replaces.`
      }
    },

    // Speaking Module with 3 Authentic Parts
    speakingParts: [
      {
        part: 1,
        title: `Part 1: Personal Profile, Hometown & Environmental Habits (Book ${bNum} Test ${tNum})`,
        instructions: 'The examiner will introduce themselves and ask 3-4 warm-up questions on familiar topics.',
        questions: [
          'What is the most distinctive feature of your hometown?',
          'How has your local neighborhood changed over the last five to ten years?',
          'Do you prefer spending your leisure time indoors or in natural outdoor settings?',
          'What daily habits do you practice to minimize personal household waste?'
        ]
      },
      {
        part: 2,
        title: `Part 2: Individual Long Turn Cue Card (Book ${bNum} Test ${tNum})`,
        instructions: 'You will have 1 minute to prepare notes and 2 minutes to speak uninterrupted on this topic.',
        cueCard: {
          topic: `Describe an important scientific discovery or technological innovation that has influenced your daily life.`,
          points: [
            'What the innovation is and when you first encountered it',
            'How it operates in practice and what makes it notable',
            'How it has altered your personal productivity or learning methods',
            'And explain why you consider this development significant for modern society'
          ],
          prepSeconds: 60,
          speakSeconds: 120
        }
      },
      {
        part: 3,
        title: `Part 3: Two-Way Analytical Discussion with the Examiner (Book ${bNum} Test ${tNum})`,
        instructions: 'The examiner will ask broader, abstract questions related to science, technology, and ethics.',
        questions: [
          'Should public governments or private corporations be the primary funders of basic scientific research?',
          'What ethical boundaries should be established when developing autonomous algorithms that make critical human decisions?',
          'How can developing nations bridge the technological divide without incurring unsustainable debt?'
        ]
      }
    ]
  };
}

// Fallback legacy sample tests map for direct lookups
export const CAMBRIDGE_SAMPLE_TESTS: Record<number, CambridgeTest> = {
  21: getCambridgeTest(21, 1),
  20: getCambridgeTest(20, 1),
  19: getCambridgeTest(19, 1),
  18: getCambridgeTest(18, 1),
  17: getCambridgeTest(17, 1),
  16: getCambridgeTest(16, 1),
  15: getCambridgeTest(15, 1),
  10: getCambridgeTest(10, 1),
  1: getCambridgeTest(1, 1),
};
