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
  totalTime?: number; // Total time in ms for this action
  avgTime?: number; // Average decision time in ms
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
  // Enhanced statistics
  currentStreak: number;
  longestStreak: number;
  sessionStartTime?: number;
  totalSessionTime?: number;
  lastDecisionTime?: number;
  byDealerUpcard?: {
    [key: string]: { correct: number; incorrect: number };
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
}

export interface UIState {
  level: DifficultyLevel;
  showHints: boolean;
  isLoading: boolean;
  error: string | null;
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
  | { type: 'NEXT_HAND' };

export interface TrainingScenario {
  playerCards: Card[];
  dealerUpcard: Card;
  canDouble: boolean;
  canSplit: boolean;
  canSurrender: boolean;
  scenarioStartTime?: number;
}

export interface AppState {
  ui: UIState;
  scenario: TrainingScenario | null;
  feedback: FeedbackState;
  stats: Statistics | null;
  config: GameConfig;
}
