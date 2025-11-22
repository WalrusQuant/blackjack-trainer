export type Suit = '♠' | '♥' | '♦' | '♣';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  suit: Suit;
  rank: Rank;
  faceUp: boolean;
}

export interface Hand {
  cards: Card[];
  bet: number;
  isActive: boolean;
  isFinished: boolean;
}

export interface HandValue {
  value: number;
  isSoft: boolean;
  isBlackjack: boolean;
  isBusted: boolean;
}

export type PlayerAction = 'hit' | 'stand' | 'double' | 'split' | 'surrender';

export interface GameState {
  deck: Card[];
  dealerHand: Hand;
  playerHands: Hand[];
  currentHandIndex: number;
  gamePhase: 'betting' | 'playing' | 'dealer' | 'finished';
  canDouble: boolean;
  canSplit: boolean;
  canSurrender: boolean;
}

export interface ActionStats {
  correct: number;
  incorrect: number;
  totalTime?: number;
  avgTime?: number;
}

export interface ScenarioStats {
  correct: number;
  incorrect: number;
  totalTime?: number;
  avgTime?: number;
  lastSeen?: number;
}

export interface MistakeRecord {
  id: string;
  timestamp: number;
  playerCards: Card[];
  dealerUpcard: Card;
  playerAction: PlayerAction;
  correctAction: PlayerAction;
  handType: HandType;
  playerTotal: number;
  decisionTime?: number;
  sessionId?: string;
}

export interface Statistics {
  totalDecisions: number;
  correctDecisions: number;
  incorrectDecisions: number;
  byAction: {
    hit: ActionStats;
    stand: ActionStats;
    double: ActionStats;
    split: ActionStats;
    surrender: ActionStats;
  };
  byHandType: {
    hard: ActionStats;
    soft: ActionStats;
    pair: ActionStats;
  };
  currentStreak: number;
  longestStreak: number;
  sessionStartTime?: number;
  totalSessionTime?: number;
  lastDecisionTime?: number;
  byDealerUpcard?: {
    [key: string]: { correct: number; incorrect: number };
  };
  // Enhanced: Per-scenario tracking for heatmaps
  byScenario?: {
    [key: string]: ScenarioStats; // key: "playerTotal-dealerCard-handType" e.g., "16-10-hard"
  };
  // Mistake log
  mistakes?: MistakeRecord[];
  // Speed records
  speedRecords?: {
    fastestCorrect?: number;
    avgSpeed?: number;
    totalTimeTracked?: number;
    decisionsTracked?: number;
  };
}

export interface VersionedStatistics {
  version: number;
  data: Statistics;
  lastUpdated: number;
}

export type DifficultyLevel = 1 | 2 | 3 | 4;

export interface LevelConfig {
  level: DifficultyLevel;
  name: string;
  description: string;
  includeHardHands: boolean;
  includeSoftHands: boolean;
  includePairs: boolean;
  includeSurrender: boolean;
}

export interface GameConfig {
  dealerHitsSoft17: boolean;
  doubleAfterSplit: boolean;
  surrenderAllowed: boolean;
  maxSplits: number;
  numDecks: number;
  adaptiveDifficulty: boolean;
}

export interface VersionedConfig {
  version: number;
  data: GameConfig;
  lastUpdated: number;
}

export type HandType = 'hard' | 'soft' | 'pair';

export interface FeedbackState {
  show: boolean;
  correct: boolean;
  correctAction: PlayerAction | null;
  playerAction: PlayerAction | null;
  decisionTime?: number;
  explanation?: string;
}

export interface UIState {
  level: DifficultyLevel;
  showHints: boolean;
  isLoading: boolean;
  error: string | null;
}

// Training modes
export type TrainingMode =
  | 'basic'           // Standard basic strategy training
  | 'counting'        // Card counting practice
  | 'speed'           // Timed challenges
  | 'flashcard'       // Quick-fire scenarios
  | 'tournament'      // 100-hand challenge
  | 'custom'          // Custom scenario selection
  | 'mastery'         // Only weak spots
  | 'deviation'       // Index play deviations
  | 'mistakes';       // Review past mistakes

// Session Management
export interface SessionGoal {
  type: 'hands' | 'accuracy' | 'time' | 'streak';
  target: number;
  achieved: boolean;
}

export interface TrainingSession {
  id: string;
  startTime: number;
  endTime?: number;
  mode: TrainingMode;
  level: DifficultyLevel;
  handsPlayed: number;
  correctDecisions: number;
  incorrectDecisions: number;
  goals?: SessionGoal[];
  mistakes: MistakeRecord[];
  avgDecisionTime?: number;
  // Card counting specific
  countingAccuracy?: number;
  trueCountAccuracy?: number;
}

// Card Counting
export interface CardCountingState {
  runningCount: number;
  cardsDealt: Card[];
  decksRemaining: number;
  trueCount: number;
  userRunningCount: number;
  userTrueCount: number;
  isCorrect: boolean | null;
  feedback: string;
  speed: number; // ms per card
  totalCards: number;
  correctCounts: number;
  incorrectCounts: number;
  mode: 'practice' | 'speed' | 'deviation';
}

export interface CountingStats {
  totalAttempts: number;
  correctAttempts: number;
  avgSpeed: number; // ms per card
  fastestShoe: number; // ms to count entire shoe
  bestAccuracy: number;
  sessionHistory: {
    timestamp: number;
    accuracy: number;
    speed: number;
    cardsDealt: number;
  }[];
}

// Illustrious 18 Index Plays
export interface IndexPlay {
  id: string;
  name: string;
  playerHand: string; // e.g., "16", "15", "A,7" for soft 18
  dealerUpcard: Rank;
  basicStrategy: PlayerAction;
  deviation: PlayerAction;
  indexCount: number; // True count threshold
  description: string;
}

// Speed Training
export interface SpeedChallenge {
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  timeLimit: number; // ms
  handsRequired: number;
  accuracyRequired: number;
}

export interface SpeedRecord {
  timestamp: number;
  avgTime: number;
  accuracy: number;
  handsPlayed: number;
  level: SpeedChallenge['level'];
}

// Custom Scenario
export interface CustomScenarioFilter {
  handTypes: HandType[];
  playerTotals: number[];
  dealerUpcards: Rank[];
  actionsRequired: PlayerAction[];
  maxAccuracy?: number; // Only show scenarios below this accuracy
}

// Analytics
export interface HeatmapData {
  playerTotal: number;
  dealerUpcard: string;
  handType: HandType;
  accuracy: number;
  total: number;
  correct: number;
}

export interface TrendDataPoint {
  timestamp: number;
  accuracy: number;
  handsPlayed: number;
  avgDecisionTime: number;
}

// UI Settings
export interface UISettings {
  darkMode: boolean;
  soundEnabled: boolean;
  cardDesign: 'classic' | 'modern' | 'minimal';
  showStrategyChart: boolean;
  fullScreenMode: boolean;
  animationsEnabled: boolean;
  mobileGestures: boolean;
}

// State management types for useReducer
export type GameAction =
  | { type: 'SET_LEVEL'; payload: DifficultyLevel }
  | { type: 'SET_SCENARIO'; payload: TrainingScenario | null }
  | { type: 'SET_FEEDBACK'; payload: FeedbackState }
  | { type: 'CLEAR_FEEDBACK' }
  | { type: 'TOGGLE_HINTS' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_STATS'; payload: Statistics }
  | { type: 'RESET_STATS' }
  | { type: 'NEXT_HAND' }
  | { type: 'SET_TRAINING_MODE'; payload: TrainingMode }
  | { type: 'START_SESSION'; payload: TrainingSession }
  | { type: 'END_SESSION' }
  | { type: 'UPDATE_SESSION'; payload: Partial<TrainingSession> }
  | { type: 'SET_UI_SETTINGS'; payload: Partial<UISettings> }
  | { type: 'SET_COUNTING_STATE'; payload: Partial<CardCountingState> }
  | { type: 'SET_CUSTOM_FILTER'; payload: CustomScenarioFilter | null }
  | { type: 'SET_SPEED_CHALLENGE'; payload: SpeedChallenge | null }
  | { type: 'ADD_MISTAKE'; payload: MistakeRecord }
  | { type: 'CLEAR_MISTAKES' };

export interface TrainingScenario {
  playerCards: Card[];
  dealerUpcard: Card;
  canDouble: boolean;
  canSplit: boolean;
  canSurrender: boolean;
  scenarioStartTime?: number;
  // For targeted training
  targetedScenario?: boolean;
  scenarioKey?: string;
}

export interface AppState {
  ui: UIState;
  scenario: TrainingScenario | null;
  feedback: FeedbackState;
  stats: Statistics | null;
  config: GameConfig;
  // New state
  trainingMode: TrainingMode;
  currentSession: TrainingSession | null;
  sessionHistory: TrainingSession[];
  uiSettings: UISettings;
  countingState: CardCountingState | null;
  customFilter: CustomScenarioFilter | null;
  speedChallenge: SpeedChallenge | null;
  countingStats: CountingStats | null;
}

// Export/Import data structure
export interface ExportData {
  version: number;
  exportDate: number;
  statistics: Statistics;
  sessions: TrainingSession[];
  countingStats: CountingStats | null;
  uiSettings: UISettings;
  config: GameConfig;
}
