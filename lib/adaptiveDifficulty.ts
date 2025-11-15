import { Statistics, DifficultyLevel } from './types';
import {
  ADAPTIVE_DIFFICULTY_THRESHOLD,
  ADAPTIVE_DIFFICULTY_MIN_DECISIONS,
  MIN_DIFFICULTY_LEVEL,
  MAX_DIFFICULTY_LEVEL,
} from './constants';
import { getAccuracy } from './statistics';

/**
 * Determines if the user should advance to a higher difficulty level
 */
export function shouldAdvanceLevel(
  stats: Statistics,
  currentLevel: DifficultyLevel
): boolean {
  if (currentLevel >= MAX_DIFFICULTY_LEVEL) return false;
  if (stats.totalDecisions < ADAPTIVE_DIFFICULTY_MIN_DECISIONS) return false;

  const accuracy = getAccuracy(stats);
  return accuracy >= ADAPTIVE_DIFFICULTY_THRESHOLD;
}

/**
 * Gets the suggested next difficulty level based on performance
 */
export function getSuggestedLevel(
  stats: Statistics,
  currentLevel: DifficultyLevel
): DifficultyLevel | null {
  if (stats.totalDecisions < ADAPTIVE_DIFFICULTY_MIN_DECISIONS) {
    return null;
  }

  const accuracy = getAccuracy(stats);

  // High accuracy: suggest advancing
  if (accuracy >= ADAPTIVE_DIFFICULTY_THRESHOLD && currentLevel < MAX_DIFFICULTY_LEVEL) {
    return (currentLevel + 1) as DifficultyLevel;
  }

  // Low accuracy: suggest going back
  if (accuracy < 60 && currentLevel > MIN_DIFFICULTY_LEVEL) {
    return (currentLevel - 1) as DifficultyLevel;
  }

  return null;
}

/**
 * Gets a performance message based on accuracy
 */
export function getPerformanceMessage(accuracy: number): string {
  if (accuracy >= 95) return 'Excellent! You\'re mastering basic strategy!';
  if (accuracy >= 90) return 'Great job! You\'re doing very well!';
  if (accuracy >= 80) return 'Good work! Keep practicing!';
  if (accuracy >= 70) return 'Not bad! You\'re improving!';
  if (accuracy >= 60) return 'Keep trying! Practice makes perfect!';
  return 'Don\'t give up! Review the strategy and try again!';
}

/**
 * Calculates a performance score (0-100) based on multiple factors
 */
export function calculatePerformanceScore(stats: Statistics): number {
  const accuracy = getAccuracy(stats);
  const streakBonus = Math.min(stats.currentStreak * 2, 20); // Up to 20 bonus points
  const volumeBonus = Math.min(stats.totalDecisions / 10, 10); // Up to 10 bonus points

  return Math.min(100, accuracy + streakBonus + volumeBonus);
}
