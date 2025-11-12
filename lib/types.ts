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

export interface Statistics {
  totalDecisions: number;
  correctDecisions: number;
  incorrectDecisions: number;
  byAction: {
    hit: { correct: number; incorrect: number };
    stand: { correct: number; incorrect: number };
    double: { correct: number; incorrect: number };
    split: { correct: number; incorrect: number };
    surrender: { correct: number; incorrect: number };
  };
  byHandType: {
    hard: { correct: number; incorrect: number };
    soft: { correct: number; incorrect: number };
    pair: { correct: number; incorrect: number };
  };
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
