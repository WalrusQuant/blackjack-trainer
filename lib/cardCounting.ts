import { Card, Rank, CardCountingState, CountingStats, IndexPlay } from './types';
import { createDeck, shuffleDeck } from './deck';

// Hi-Lo card counting values
export const HI_LO_VALUES: Record<Rank, number> = {
  '2': 1,
  '3': 1,
  '4': 1,
  '5': 1,
  '6': 1,
  '7': 0,
  '8': 0,
  '9': 0,
  '10': -1,
  'J': -1,
  'Q': -1,
  'K': -1,
  'A': -1,
};

// The Illustrious 18 index plays (most important deviations from basic strategy)
export const ILLUSTRIOUS_18: IndexPlay[] = [
  {
    id: 'i18-1',
    name: 'Insurance',
    playerHand: 'any',
    dealerUpcard: 'A',
    basicStrategy: 'stand', // Represents "no insurance"
    deviation: 'stand', // Represents "take insurance"
    indexCount: 3,
    description: 'Take insurance when true count is +3 or higher',
  },
  {
    id: 'i18-2',
    name: '16 vs 10',
    playerHand: '16',
    dealerUpcard: '10',
    basicStrategy: 'hit',
    deviation: 'stand',
    indexCount: 0,
    description: 'Stand on 16 vs 10 when true count is 0 or higher',
  },
  {
    id: 'i18-3',
    name: '15 vs 10',
    playerHand: '15',
    dealerUpcard: '10',
    basicStrategy: 'hit',
    deviation: 'stand',
    indexCount: 4,
    description: 'Stand on 15 vs 10 when true count is +4 or higher',
  },
  {
    id: 'i18-4',
    name: '10,10 vs 5',
    playerHand: '10,10',
    dealerUpcard: '5',
    basicStrategy: 'stand',
    deviation: 'split',
    indexCount: 5,
    description: 'Split 10s vs 5 when true count is +5 or higher',
  },
  {
    id: 'i18-5',
    name: '10,10 vs 6',
    playerHand: '10,10',
    dealerUpcard: '6',
    basicStrategy: 'stand',
    deviation: 'split',
    indexCount: 4,
    description: 'Split 10s vs 6 when true count is +4 or higher',
  },
  {
    id: 'i18-6',
    name: '10 vs 10',
    playerHand: '10',
    dealerUpcard: '10',
    basicStrategy: 'hit',
    deviation: 'double',
    indexCount: 4,
    description: 'Double 10 vs 10 when true count is +4 or higher',
  },
  {
    id: 'i18-7',
    name: '12 vs 3',
    playerHand: '12',
    dealerUpcard: '3',
    basicStrategy: 'hit',
    deviation: 'stand',
    indexCount: 2,
    description: 'Stand on 12 vs 3 when true count is +2 or higher',
  },
  {
    id: 'i18-8',
    name: '12 vs 2',
    playerHand: '12',
    dealerUpcard: '2',
    basicStrategy: 'hit',
    deviation: 'stand',
    indexCount: 3,
    description: 'Stand on 12 vs 2 when true count is +3 or higher',
  },
  {
    id: 'i18-9',
    name: '11 vs A',
    playerHand: '11',
    dealerUpcard: 'A',
    basicStrategy: 'hit',
    deviation: 'double',
    indexCount: 1,
    description: 'Double 11 vs A when true count is +1 or higher',
  },
  {
    id: 'i18-10',
    name: '9 vs 2',
    playerHand: '9',
    dealerUpcard: '2',
    basicStrategy: 'hit',
    deviation: 'double',
    indexCount: 1,
    description: 'Double 9 vs 2 when true count is +1 or higher',
  },
  {
    id: 'i18-11',
    name: '10 vs A',
    playerHand: '10',
    dealerUpcard: 'A',
    basicStrategy: 'hit',
    deviation: 'double',
    indexCount: 4,
    description: 'Double 10 vs A when true count is +4 or higher',
  },
  {
    id: 'i18-12',
    name: '9 vs 7',
    playerHand: '9',
    dealerUpcard: '7',
    basicStrategy: 'hit',
    deviation: 'double',
    indexCount: 3,
    description: 'Double 9 vs 7 when true count is +3 or higher',
  },
  {
    id: 'i18-13',
    name: '16 vs 9',
    playerHand: '16',
    dealerUpcard: '9',
    basicStrategy: 'hit',
    deviation: 'stand',
    indexCount: 5,
    description: 'Stand on 16 vs 9 when true count is +5 or higher',
  },
  {
    id: 'i18-14',
    name: '13 vs 2',
    playerHand: '13',
    dealerUpcard: '2',
    basicStrategy: 'stand',
    deviation: 'hit',
    indexCount: -1,
    description: 'Hit 13 vs 2 when true count is -1 or lower',
  },
  {
    id: 'i18-15',
    name: '12 vs 4',
    playerHand: '12',
    dealerUpcard: '4',
    basicStrategy: 'stand',
    deviation: 'hit',
    indexCount: 0,
    description: 'Hit 12 vs 4 when true count is negative',
  },
  {
    id: 'i18-16',
    name: '12 vs 5',
    playerHand: '12',
    dealerUpcard: '5',
    basicStrategy: 'stand',
    deviation: 'hit',
    indexCount: -2,
    description: 'Hit 12 vs 5 when true count is -2 or lower',
  },
  {
    id: 'i18-17',
    name: '12 vs 6',
    playerHand: '12',
    dealerUpcard: '6',
    basicStrategy: 'stand',
    deviation: 'hit',
    indexCount: -1,
    description: 'Hit 12 vs 6 when true count is -1 or lower',
  },
  {
    id: 'i18-18',
    name: '13 vs 3',
    playerHand: '13',
    dealerUpcard: '3',
    basicStrategy: 'stand',
    deviation: 'hit',
    indexCount: -2,
    description: 'Hit 13 vs 3 when true count is -2 or lower',
  },
];

/**
 * Get Hi-Lo count value for a card
 */
export function getHiLoValue(card: Card): number {
  return HI_LO_VALUES[card.rank];
}

/**
 * Calculate running count for a set of cards
 */
export function calculateRunningCount(cards: Card[]): number {
  return cards.reduce((count, card) => count + getHiLoValue(card), 0);
}

/**
 * Calculate true count from running count
 */
export function calculateTrueCount(runningCount: number, decksRemaining: number): number {
  if (decksRemaining <= 0) return runningCount;
  return Math.round((runningCount / decksRemaining) * 10) / 10;
}

/**
 * Create initial card counting state
 */
export function createCountingState(numDecks: number = 6): CardCountingState {
  return {
    runningCount: 0,
    cardsDealt: [],
    decksRemaining: numDecks,
    trueCount: 0,
    userRunningCount: 0,
    userTrueCount: 0,
    isCorrect: null,
    feedback: '',
    speed: 1000, // 1 second per card default
    totalCards: numDecks * 52,
    correctCounts: 0,
    incorrectCounts: 0,
    mode: 'practice',
  };
}

/**
 * Create initial counting stats
 */
export function createCountingStats(): CountingStats {
  return {
    totalAttempts: 0,
    correctAttempts: 0,
    avgSpeed: 0,
    fastestShoe: Infinity,
    bestAccuracy: 0,
    sessionHistory: [],
  };
}

/**
 * Deal a card and update counting state
 */
export function dealCountingCard(
  state: CardCountingState,
  deck: Card[]
): { newState: CardCountingState; card: Card; remainingDeck: Card[] } {
  const [card, ...remainingDeck] = deck;
  const dealtCard = { ...card, faceUp: true };

  const newRunningCount = state.runningCount + getHiLoValue(dealtCard);
  const cardsDealt = [...state.cardsDealt, dealtCard];
  const cardsRemaining = state.totalCards - cardsDealt.length;
  const decksRemaining = Math.max(0.5, cardsRemaining / 52);
  const newTrueCount = calculateTrueCount(newRunningCount, decksRemaining);

  return {
    newState: {
      ...state,
      runningCount: newRunningCount,
      cardsDealt,
      decksRemaining,
      trueCount: newTrueCount,
    },
    card: dealtCard,
    remainingDeck,
  };
}

/**
 * Check user's count against actual count
 */
export function checkCount(
  state: CardCountingState,
  userRunningCount: number,
  userTrueCount?: number
): { isCorrect: boolean; feedback: string } {
  const runningCorrect = userRunningCount === state.runningCount;

  let trueCorrect = true;
  if (userTrueCount !== undefined) {
    // Allow for rounding differences (within 0.5)
    trueCorrect = Math.abs(userTrueCount - state.trueCount) < 0.5;
  }

  const isCorrect = runningCorrect && trueCorrect;

  let feedback = '';
  if (!runningCorrect) {
    feedback = `Running count: ${state.runningCount} (you said ${userRunningCount})`;
  }
  if (!trueCorrect) {
    feedback += feedback ? '. ' : '';
    feedback += `True count: ${state.trueCount.toFixed(1)} (you said ${userTrueCount?.toFixed(1)})`;
  }
  if (isCorrect) {
    feedback = 'Correct!';
  }

  return { isCorrect, feedback };
}

/**
 * Create a multi-deck shoe for counting practice
 */
export function createShoe(numDecks: number = 6): Card[] {
  let shoe: Card[] = [];
  for (let i = 0; i < numDecks; i++) {
    shoe = [...shoe, ...createDeck()];
  }
  return shuffleDeck(shoe);
}

/**
 * Get the correct action considering index plays
 */
export function getDeviationAction(
  playerTotal: number,
  dealerUpcard: Rank,
  trueCount: number,
  isPair: boolean = false,
  pairRank?: Rank
): { useDeviation: boolean; indexPlay: IndexPlay | null; action: string } {
  // Check for applicable index play
  const playerHand = isPair && pairRank
    ? `${pairRank === '10' || pairRank === 'J' || pairRank === 'Q' || pairRank === 'K' ? '10,10' : `${pairRank},${pairRank}`}`
    : playerTotal.toString();

  const indexPlay = ILLUSTRIOUS_18.find(ip => {
    if (ip.dealerUpcard !== dealerUpcard) return false;
    if (ip.playerHand === 'any') return true;
    return ip.playerHand === playerHand;
  });

  if (!indexPlay) {
    return { useDeviation: false, indexPlay: null, action: 'basic' };
  }

  // Check if count meets threshold
  const meetsThreshold = indexPlay.indexCount >= 0
    ? trueCount >= indexPlay.indexCount
    : trueCount <= indexPlay.indexCount;

  return {
    useDeviation: meetsThreshold,
    indexPlay,
    action: meetsThreshold ? indexPlay.deviation : indexPlay.basicStrategy,
  };
}

/**
 * Generate a random index play scenario for practice
 */
export function generateDeviationScenario(): {
  indexPlay: IndexPlay;
  trueCount: number;
  shouldDeviate: boolean;
} {
  const indexPlay = ILLUSTRIOUS_18[Math.floor(Math.random() * ILLUSTRIOUS_18.length)];

  // Generate a true count that may or may not trigger the deviation
  const shouldDeviate = Math.random() > 0.5;
  let trueCount: number;

  if (shouldDeviate) {
    // Generate count that triggers deviation
    if (indexPlay.indexCount >= 0) {
      trueCount = indexPlay.indexCount + Math.floor(Math.random() * 3);
    } else {
      trueCount = indexPlay.indexCount - Math.floor(Math.random() * 3);
    }
  } else {
    // Generate count that doesn't trigger deviation
    if (indexPlay.indexCount >= 0) {
      trueCount = indexPlay.indexCount - 1 - Math.floor(Math.random() * 3);
    } else {
      trueCount = indexPlay.indexCount + 1 + Math.floor(Math.random() * 3);
    }
  }

  return { indexPlay, trueCount, shouldDeviate };
}

/**
 * Calculate counting accuracy
 */
export function getCountingAccuracy(stats: CountingStats): number {
  if (stats.totalAttempts === 0) return 0;
  return Math.round((stats.correctAttempts / stats.totalAttempts) * 100);
}

/**
 * Update counting stats after a session
 */
export function updateCountingStats(
  stats: CountingStats,
  accuracy: number,
  speed: number,
  cardsDealt: number,
  correct: number,
  total: number
): CountingStats {
  const newTotalAttempts = stats.totalAttempts + total;
  const newCorrectAttempts = stats.correctAttempts + correct;
  const totalSpeed = stats.avgSpeed * stats.totalAttempts + speed * total;
  const newAvgSpeed = newTotalAttempts > 0 ? totalSpeed / newTotalAttempts : 0;

  return {
    ...stats,
    totalAttempts: newTotalAttempts,
    correctAttempts: newCorrectAttempts,
    avgSpeed: newAvgSpeed,
    fastestShoe: Math.min(stats.fastestShoe, speed * cardsDealt),
    bestAccuracy: Math.max(stats.bestAccuracy, accuracy),
    sessionHistory: [
      ...stats.sessionHistory,
      {
        timestamp: Date.now(),
        accuracy,
        speed,
        cardsDealt,
      },
    ].slice(-100), // Keep last 100 sessions
  };
}

// Storage key
const COUNTING_STATS_KEY = 'blackjack-counting-stats';

/**
 * Save counting stats to localStorage
 */
export function saveCountingStats(stats: CountingStats): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(COUNTING_STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save counting stats:', e);
  }
}

/**
 * Load counting stats from localStorage
 */
export function loadCountingStats(): CountingStats {
  if (typeof window === 'undefined') return createCountingStats();
  try {
    const saved = localStorage.getItem(COUNTING_STATS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load counting stats:', e);
  }
  return createCountingStats();
}
