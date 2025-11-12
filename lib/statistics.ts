import { Statistics, PlayerAction } from './types';

/**
 * Creates initial statistics object
 */
export function createInitialStats(): Statistics {
  return {
    totalDecisions: 0,
    correctDecisions: 0,
    incorrectDecisions: 0,
    byAction: {
      hit: { correct: 0, incorrect: 0 },
      stand: { correct: 0, incorrect: 0 },
      double: { correct: 0, incorrect: 0 },
      split: { correct: 0, incorrect: 0 },
      surrender: { correct: 0, incorrect: 0 },
    },
    byHandType: {
      hard: { correct: 0, incorrect: 0 },
      soft: { correct: 0, incorrect: 0 },
      pair: { correct: 0, incorrect: 0 },
    },
  };
}

/**
 * Updates statistics with a new decision
 */
export function updateStatistics(
  stats: Statistics,
  action: PlayerAction,
  handType: 'hard' | 'soft' | 'pair',
  isCorrect: boolean
): Statistics {
  const newStats = { ...stats };

  newStats.totalDecisions++;

  if (isCorrect) {
    newStats.correctDecisions++;
    newStats.byAction[action].correct++;
    newStats.byHandType[handType].correct++;
  } else {
    newStats.incorrectDecisions++;
    newStats.byAction[action].incorrect++;
    newStats.byHandType[handType].incorrect++;
  }

  return newStats;
}

/**
 * Calculates accuracy percentage
 */
export function getAccuracy(stats: Statistics): number {
  if (stats.totalDecisions === 0) return 0;
  return Math.round((stats.correctDecisions / stats.totalDecisions) * 100);
}

/**
 * Gets accuracy for a specific action
 */
export function getActionAccuracy(stats: Statistics, action: PlayerAction): number {
  const total = stats.byAction[action].correct + stats.byAction[action].incorrect;
  if (total === 0) return 0;
  return Math.round((stats.byAction[action].correct / total) * 100);
}

/**
 * Gets accuracy for a specific hand type
 */
export function getHandTypeAccuracy(stats: Statistics, handType: 'hard' | 'soft' | 'pair'): number {
  const total = stats.byHandType[handType].correct + stats.byHandType[handType].incorrect;
  if (total === 0) return 0;
  return Math.round((stats.byHandType[handType].correct / total) * 100);
}

/**
 * Loads statistics from localStorage
 */
export function loadStatistics(): Statistics {
  if (typeof window === 'undefined') return createInitialStats();

  try {
    const saved = localStorage.getItem('blackjack-trainer-stats');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load statistics:', e);
  }

  return createInitialStats();
}

/**
 * Saves statistics to localStorage
 */
export function saveStatistics(stats: Statistics): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem('blackjack-trainer-stats', JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save statistics:', e);
  }
}

/**
 * Resets all statistics
 */
export function resetStatistics(): Statistics {
  const newStats = createInitialStats();
  saveStatistics(newStats);
  return newStats;
}
