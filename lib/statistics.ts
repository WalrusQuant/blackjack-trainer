import {
  Statistics,
  PlayerAction,
  VersionedStatistics,
  HandType,
  MistakeRecord,
  Card,
  ExportData,
  UISettings,
  GameConfig,
  TrainingSession,
  CountingStats,
} from './types';
import {
  STORAGE_KEY_STATS,
  CURRENT_STATS_VERSION,
  MIN_ACCURACY,
  MAX_ACCURACY,
} from './constants';
import { getScenarioKey } from './analytics';

/**
 * Creates initial statistics object with enhanced tracking
 */
export function createInitialStats(): Statistics {
  return {
    totalDecisions: 0,
    correctDecisions: 0,
    incorrectDecisions: 0,
    currentStreak: 0,
    longestStreak: 0,
    sessionStartTime: Date.now(),
    totalSessionTime: 0,
    byAction: {
      hit: { correct: 0, incorrect: 0, totalTime: 0, avgTime: 0 },
      stand: { correct: 0, incorrect: 0, totalTime: 0, avgTime: 0 },
      double: { correct: 0, incorrect: 0, totalTime: 0, avgTime: 0 },
      split: { correct: 0, incorrect: 0, totalTime: 0, avgTime: 0 },
      surrender: { correct: 0, incorrect: 0, totalTime: 0, avgTime: 0 },
    },
    byHandType: {
      hard: { correct: 0, incorrect: 0, totalTime: 0, avgTime: 0 },
      soft: { correct: 0, incorrect: 0, totalTime: 0, avgTime: 0 },
      pair: { correct: 0, incorrect: 0, totalTime: 0, avgTime: 0 },
    },
    byDealerUpcard: {},
    byScenario: {},
    mistakes: [],
    speedRecords: {
      fastestCorrect: undefined,
      avgSpeed: 0,
      totalTimeTracked: 0,
      decisionsTracked: 0,
    },
  };
}

/**
 * Deep clones a statistics object to prevent mutation
 */
function deepCloneStats(stats: Statistics): Statistics {
  return {
    ...stats,
    byAction: {
      hit: { ...stats.byAction.hit },
      stand: { ...stats.byAction.stand },
      double: { ...stats.byAction.double },
      split: { ...stats.byAction.split },
      surrender: { ...stats.byAction.surrender },
    },
    byHandType: {
      hard: { ...stats.byHandType.hard },
      soft: { ...stats.byHandType.soft },
      pair: { ...stats.byHandType.pair },
    },
    byDealerUpcard: stats.byDealerUpcard ? { ...stats.byDealerUpcard } : {},
    byScenario: stats.byScenario ? { ...stats.byScenario } : {},
    mistakes: stats.mistakes ? [...stats.mistakes] : [],
    speedRecords: stats.speedRecords ? { ...stats.speedRecords } : {
      fastestCorrect: undefined,
      avgSpeed: 0,
      totalTimeTracked: 0,
      decisionsTracked: 0,
    },
  };
}

/**
 * Generate a unique mistake ID
 */
function generateMistakeId(): string {
  return `mistake_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Updates statistics with a new decision with enhanced tracking
 */
export function updateStatistics(
  stats: Statistics,
  action: PlayerAction,
  handType: HandType,
  isCorrect: boolean,
  decisionTime?: number,
  dealerUpcard?: string,
  playerTotal?: number,
  playerCards?: Card[],
  dealerCard?: Card,
  correctAction?: PlayerAction,
  sessionId?: string
): Statistics {
  // Deep clone to prevent mutation
  const newStats = deepCloneStats(stats);

  newStats.totalDecisions++;

  // Update streak
  if (isCorrect) {
    newStats.correctDecisions++;
    newStats.currentStreak++;
    if (newStats.currentStreak > newStats.longestStreak) {
      newStats.longestStreak = newStats.currentStreak;
    }
    newStats.byAction[action].correct++;
    newStats.byHandType[handType].correct++;
  } else {
    newStats.incorrectDecisions++;
    newStats.currentStreak = 0; // Reset streak
    newStats.byAction[action].incorrect++;
    newStats.byHandType[handType].incorrect++;

    // Log mistake
    if (playerCards && dealerCard && correctAction && playerTotal !== undefined) {
      const mistake: MistakeRecord = {
        id: generateMistakeId(),
        timestamp: Date.now(),
        playerCards,
        dealerUpcard: dealerCard,
        playerAction: action,
        correctAction,
        handType,
        playerTotal,
        decisionTime,
        sessionId,
      };
      newStats.mistakes = [...(newStats.mistakes || []), mistake].slice(-500); // Keep last 500
    }
  }

  // Update decision time tracking
  if (decisionTime !== undefined) {
    newStats.lastDecisionTime = decisionTime;

    // Update action timing
    const actionStats = newStats.byAction[action];
    actionStats.totalTime = (actionStats.totalTime || 0) + decisionTime;
    const actionTotal = actionStats.correct + actionStats.incorrect;
    actionStats.avgTime = actionStats.totalTime / actionTotal;

    // Update hand type timing
    const handStats = newStats.byHandType[handType];
    handStats.totalTime = (handStats.totalTime || 0) + decisionTime;
    const handTotal = handStats.correct + handStats.incorrect;
    handStats.avgTime = handStats.totalTime / handTotal;

    // Update speed records
    if (newStats.speedRecords) {
      newStats.speedRecords.totalTimeTracked = (newStats.speedRecords.totalTimeTracked || 0) + decisionTime;
      newStats.speedRecords.decisionsTracked = (newStats.speedRecords.decisionsTracked || 0) + 1;
      newStats.speedRecords.avgSpeed = newStats.speedRecords.totalTimeTracked / newStats.speedRecords.decisionsTracked;

      if (isCorrect) {
        if (!newStats.speedRecords.fastestCorrect || decisionTime < newStats.speedRecords.fastestCorrect) {
          newStats.speedRecords.fastestCorrect = decisionTime;
        }
      }
    }
  }

  // Track by dealer upcard
  if (dealerUpcard && newStats.byDealerUpcard) {
    if (!newStats.byDealerUpcard[dealerUpcard]) {
      newStats.byDealerUpcard[dealerUpcard] = { correct: 0, incorrect: 0 };
    }
    if (isCorrect) {
      newStats.byDealerUpcard[dealerUpcard].correct++;
    } else {
      newStats.byDealerUpcard[dealerUpcard].incorrect++;
    }
  }

  // Track by scenario (for heatmap)
  if (playerTotal !== undefined && dealerUpcard) {
    const scenarioKey = getScenarioKey(playerTotal, dealerUpcard, handType);

    if (!newStats.byScenario) {
      newStats.byScenario = {};
    }

    if (!newStats.byScenario[scenarioKey]) {
      newStats.byScenario[scenarioKey] = {
        correct: 0,
        incorrect: 0,
        totalTime: 0,
        avgTime: 0,
        lastSeen: Date.now(),
      };
    }

    const scenarioStats = newStats.byScenario[scenarioKey];
    if (isCorrect) {
      scenarioStats.correct++;
    } else {
      scenarioStats.incorrect++;
    }
    scenarioStats.lastSeen = Date.now();

    if (decisionTime !== undefined) {
      scenarioStats.totalTime = (scenarioStats.totalTime || 0) + decisionTime;
      const totalScenario = scenarioStats.correct + scenarioStats.incorrect;
      scenarioStats.avgTime = scenarioStats.totalTime / totalScenario;
    }
  }

  // Update session time
  if (newStats.sessionStartTime) {
    newStats.totalSessionTime = Date.now() - newStats.sessionStartTime;
  }

  return newStats;
}

/**
 * Calculates accuracy percentage
 */
export function getAccuracy(stats: Statistics): number {
  if (stats.totalDecisions === 0) return MIN_ACCURACY;
  const accuracy = Math.round((stats.correctDecisions / stats.totalDecisions) * 100);
  return Math.min(MAX_ACCURACY, Math.max(MIN_ACCURACY, accuracy));
}

/**
 * Gets accuracy for a specific action
 */
export function getActionAccuracy(stats: Statistics, action: PlayerAction): number {
  const total = stats.byAction[action].correct + stats.byAction[action].incorrect;
  if (total === 0) return MIN_ACCURACY;
  const accuracy = Math.round((stats.byAction[action].correct / total) * 100);
  return Math.min(MAX_ACCURACY, Math.max(MIN_ACCURACY, accuracy));
}

/**
 * Gets accuracy for a specific hand type
 */
export function getHandTypeAccuracy(stats: Statistics, handType: HandType): number {
  const total = stats.byHandType[handType].correct + stats.byHandType[handType].incorrect;
  if (total === 0) return MIN_ACCURACY;
  const accuracy = Math.round((stats.byHandType[handType].correct / total) * 100);
  return Math.min(MAX_ACCURACY, Math.max(MIN_ACCURACY, accuracy));
}

/**
 * Gets accuracy for a specific dealer upcard
 */
export function getDealerUpcardAccuracy(stats: Statistics, dealerUpcard: string): number {
  if (!stats.byDealerUpcard || !stats.byDealerUpcard[dealerUpcard]) {
    return MIN_ACCURACY;
  }
  const data = stats.byDealerUpcard[dealerUpcard];
  const total = data.correct + data.incorrect;
  if (total === 0) return MIN_ACCURACY;
  const accuracy = Math.round((data.correct / total) * 100);
  return Math.min(MAX_ACCURACY, Math.max(MIN_ACCURACY, accuracy));
}

/**
 * Gets accuracy for a specific scenario
 */
export function getScenarioAccuracy(stats: Statistics, scenarioKey: string): number {
  if (!stats.byScenario || !stats.byScenario[scenarioKey]) {
    return -1; // No data
  }
  const data = stats.byScenario[scenarioKey];
  const total = data.correct + data.incorrect;
  if (total === 0) return -1;
  return Math.round((data.correct / total) * 100);
}

/**
 * Validates and migrates statistics data
 */
function validateAndMigrateStats(data: any): Statistics {
  // If it's already in the correct format
  if (data && typeof data === 'object') {
    // Migration from v0 (unversioned) to v1
    if (!data.currentStreak && data.totalDecisions !== undefined) {
      const migratedStats: Statistics = {
        ...createInitialStats(),
        ...data,
        currentStreak: 0,
        longestStreak: 0,
        sessionStartTime: Date.now(),
        totalSessionTime: 0,
      };

      // Ensure nested objects have proper structure
      if (!migratedStats.byAction.hit.totalTime) {
        Object.keys(migratedStats.byAction).forEach(action => {
          const actionKey = action as PlayerAction;
          migratedStats.byAction[actionKey].totalTime = 0;
          migratedStats.byAction[actionKey].avgTime = 0;
        });
      }

      if (!migratedStats.byHandType.hard.totalTime) {
        Object.keys(migratedStats.byHandType).forEach(handType => {
          const handKey = handType as HandType;
          migratedStats.byHandType[handKey].totalTime = 0;
          migratedStats.byHandType[handKey].avgTime = 0;
        });
      }

      return migratedStats;
    }

    // Ensure new fields exist
    if (!data.byScenario) data.byScenario = {};
    if (!data.mistakes) data.mistakes = [];
    if (!data.speedRecords) {
      data.speedRecords = {
        fastestCorrect: undefined,
        avgSpeed: 0,
        totalTimeTracked: 0,
        decisionsTracked: 0,
      };
    }

    return data as Statistics;
  }

  return createInitialStats();
}

/**
 * Loads statistics from localStorage with versioning and validation
 */
export function loadStatistics(): Statistics {
  if (typeof window === 'undefined') return createInitialStats();

  try {
    const saved = localStorage.getItem(STORAGE_KEY_STATS);
    if (saved) {
      const parsed = JSON.parse(saved);

      // Handle versioned data
      if (parsed.version !== undefined) {
        const versioned = parsed as VersionedStatistics;
        if (versioned.version === CURRENT_STATS_VERSION) {
          return validateAndMigrateStats(versioned.data);
        }
        // Future version migration logic would go here
      }

      // Handle legacy unversioned data
      return validateAndMigrateStats(parsed);
    }
  } catch (e) {
    console.error('Failed to load statistics:', e);
  }

  return createInitialStats();
}

/**
 * Saves statistics to localStorage with versioning
 */
export function saveStatistics(stats: Statistics): void {
  if (typeof window === 'undefined') return;

  try {
    const versioned: VersionedStatistics = {
      version: CURRENT_STATS_VERSION,
      data: stats,
      lastUpdated: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(versioned));
  } catch (e) {
    console.error('Failed to save statistics:', e);
    // Fallback: try saving without versioning
    try {
      localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats));
    } catch (fallbackError) {
      console.error('Fallback save also failed:', fallbackError);
    }
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

/**
 * Exports statistics as JSON string
 */
export function exportStatistics(stats: Statistics): string {
  const versioned: VersionedStatistics = {
    version: CURRENT_STATS_VERSION,
    data: stats,
    lastUpdated: Date.now(),
  };
  return JSON.stringify(versioned, null, 2);
}

/**
 * Exports statistics as CSV string
 */
export function exportStatisticsCSV(stats: Statistics): string {
  const lines: string[] = [];

  // Header
  lines.push('Blackjack Strategy Trainer Statistics');
  lines.push('');

  // Overall stats
  lines.push('Overall Statistics');
  lines.push('Metric,Value');
  lines.push(`Total Decisions,${stats.totalDecisions}`);
  lines.push(`Correct Decisions,${stats.correctDecisions}`);
  lines.push(`Incorrect Decisions,${stats.incorrectDecisions}`);
  lines.push(`Accuracy,${getAccuracy(stats)}%`);
  lines.push(`Current Streak,${stats.currentStreak}`);
  lines.push(`Longest Streak,${stats.longestStreak}`);
  lines.push('');

  // By action
  lines.push('Statistics by Action');
  lines.push('Action,Correct,Incorrect,Total,Accuracy,Avg Time (ms)');
  Object.keys(stats.byAction).forEach(action => {
    const actionKey = action as PlayerAction;
    const data = stats.byAction[actionKey];
    const total = data.correct + data.incorrect;
    const accuracy = total > 0 ? Math.round((data.correct / total) * 100) : 0;
    const avgTime = data.avgTime ? Math.round(data.avgTime) : 0;
    lines.push(`${action},${data.correct},${data.incorrect},${total},${accuracy}%,${avgTime}`);
  });
  lines.push('');

  // By hand type
  lines.push('Statistics by Hand Type');
  lines.push('Hand Type,Correct,Incorrect,Total,Accuracy,Avg Time (ms)');
  Object.keys(stats.byHandType).forEach(handType => {
    const handKey = handType as HandType;
    const data = stats.byHandType[handKey];
    const total = data.correct + data.incorrect;
    const accuracy = total > 0 ? Math.round((data.correct / total) * 100) : 0;
    const avgTime = data.avgTime ? Math.round(data.avgTime) : 0;
    lines.push(`${handType},${data.correct},${data.incorrect},${total},${accuracy}%,${avgTime}`);
  });
  lines.push('');

  // By scenario (heatmap data)
  if (stats.byScenario && Object.keys(stats.byScenario).length > 0) {
    lines.push('Statistics by Scenario');
    lines.push('Scenario Key,Correct,Incorrect,Total,Accuracy,Avg Time (ms),Last Seen');
    Object.entries(stats.byScenario).forEach(([key, data]) => {
      const total = data.correct + data.incorrect;
      const accuracy = total > 0 ? Math.round((data.correct / total) * 100) : 0;
      const avgTime = data.avgTime ? Math.round(data.avgTime) : 0;
      const lastSeen = data.lastSeen ? new Date(data.lastSeen).toISOString() : 'N/A';
      lines.push(`${key},${data.correct},${data.incorrect},${total},${accuracy}%,${avgTime},${lastSeen}`);
    });
  }

  return lines.join('\n');
}

/**
 * Export all data for backup
 */
export function exportAllData(
  stats: Statistics,
  sessions: TrainingSession[],
  countingStats: CountingStats | null,
  uiSettings: UISettings,
  config: GameConfig
): string {
  const exportData: ExportData = {
    version: 2,
    exportDate: Date.now(),
    statistics: stats,
    sessions,
    countingStats,
    uiSettings,
    config,
  };
  return JSON.stringify(exportData, null, 2);
}

/**
 * Import data from backup
 */
export function importAllData(jsonString: string): ExportData | null {
  try {
    const data = JSON.parse(jsonString);
    if (data.version && data.statistics) {
      return data as ExportData;
    }
  } catch (e) {
    console.error('Failed to parse import data:', e);
  }
  return null;
}

/**
 * Clear specific mistake from history
 */
export function clearMistake(stats: Statistics, mistakeId: string): Statistics {
  const newStats = deepCloneStats(stats);
  newStats.mistakes = newStats.mistakes?.filter(m => m.id !== mistakeId) || [];
  return newStats;
}

/**
 * Clear all mistakes
 */
export function clearAllMistakes(stats: Statistics): Statistics {
  const newStats = deepCloneStats(stats);
  newStats.mistakes = [];
  return newStats;
}

/**
 * Get mistakes by scenario for review
 */
export function getMistakesByScenario(
  mistakes: MistakeRecord[],
  scenarioKey?: string
): MistakeRecord[] {
  if (!scenarioKey) return mistakes;

  return mistakes.filter(m => {
    const key = getScenarioKey(m.playerTotal, m.dealerUpcard.rank, m.handType);
    return key === scenarioKey;
  });
}
