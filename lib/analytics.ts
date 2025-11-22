import {
  Statistics,
  HeatmapData,
  TrendDataPoint,
  TrainingSession,
  HandType,
  MistakeRecord,
  Rank,
} from './types';
import { getSessionAccuracy, loadSessionHistory } from './sessionManager';

// All possible player totals for each hand type
const HARD_TOTALS = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
const SOFT_TOTALS = [13, 14, 15, 16, 17, 18, 19, 20]; // A+2 through A+9
const PAIR_TOTALS = [4, 6, 8, 10, 12, 14, 16, 18, 20, 22]; // 2,2 through A,A
const DEALER_UPCARDS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'A'];

/**
 * Generate scenario key for tracking
 */
export function getScenarioKey(
  playerTotal: number,
  dealerUpcard: string,
  handType: HandType
): string {
  return `${playerTotal}-${dealerUpcard}-${handType}`;
}

/**
 * Parse scenario key
 */
export function parseScenarioKey(key: string): {
  playerTotal: number;
  dealerUpcard: string;
  handType: HandType;
} {
  const [total, dealer, type] = key.split('-');
  return {
    playerTotal: parseInt(total, 10),
    dealerUpcard: dealer,
    handType: type as HandType,
  };
}

/**
 * Generate heatmap data for hard hands
 */
export function getHardHandHeatmap(stats: Statistics): HeatmapData[] {
  const data: HeatmapData[] = [];

  for (const total of HARD_TOTALS) {
    for (const dealer of DEALER_UPCARDS) {
      const key = getScenarioKey(total, dealer, 'hard');
      const scenario = stats.byScenario?.[key];

      if (scenario) {
        const totalDecisions = scenario.correct + scenario.incorrect;
        data.push({
          playerTotal: total,
          dealerUpcard: dealer,
          handType: 'hard',
          accuracy: totalDecisions > 0
            ? Math.round((scenario.correct / totalDecisions) * 100)
            : -1,
          total: totalDecisions,
          correct: scenario.correct,
        });
      } else {
        data.push({
          playerTotal: total,
          dealerUpcard: dealer,
          handType: 'hard',
          accuracy: -1, // No data
          total: 0,
          correct: 0,
        });
      }
    }
  }

  return data;
}

/**
 * Generate heatmap data for soft hands
 */
export function getSoftHandHeatmap(stats: Statistics): HeatmapData[] {
  const data: HeatmapData[] = [];

  for (const total of SOFT_TOTALS) {
    for (const dealer of DEALER_UPCARDS) {
      const key = getScenarioKey(total, dealer, 'soft');
      const scenario = stats.byScenario?.[key];

      if (scenario) {
        const totalDecisions = scenario.correct + scenario.incorrect;
        data.push({
          playerTotal: total,
          dealerUpcard: dealer,
          handType: 'soft',
          accuracy: totalDecisions > 0
            ? Math.round((scenario.correct / totalDecisions) * 100)
            : -1,
          total: totalDecisions,
          correct: scenario.correct,
        });
      } else {
        data.push({
          playerTotal: total,
          dealerUpcard: dealer,
          handType: 'soft',
          accuracy: -1,
          total: 0,
          correct: 0,
        });
      }
    }
  }

  return data;
}

/**
 * Generate heatmap data for pairs
 */
export function getPairHeatmap(stats: Statistics): HeatmapData[] {
  const data: HeatmapData[] = [];
  const pairRanks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'A'];

  for (const rank of pairRanks) {
    const total = rank === 'A' ? 22 : parseInt(rank, 10) * 2;

    for (const dealer of DEALER_UPCARDS) {
      const key = getScenarioKey(total, dealer, 'pair');
      const scenario = stats.byScenario?.[key];

      if (scenario) {
        const totalDecisions = scenario.correct + scenario.incorrect;
        data.push({
          playerTotal: total,
          dealerUpcard: dealer,
          handType: 'pair',
          accuracy: totalDecisions > 0
            ? Math.round((scenario.correct / totalDecisions) * 100)
            : -1,
          total: totalDecisions,
          correct: scenario.correct,
        });
      } else {
        data.push({
          playerTotal: total,
          dealerUpcard: dealer,
          handType: 'pair',
          accuracy: -1,
          total: 0,
          correct: 0,
        });
      }
    }
  }

  return data;
}

/**
 * Get accuracy color for heatmap cell
 */
export function getAccuracyColor(accuracy: number, darkMode: boolean = false): string {
  if (accuracy < 0) return darkMode ? '#374151' : '#e5e7eb'; // No data

  if (accuracy >= 95) return darkMode ? '#059669' : '#10b981'; // Excellent - green
  if (accuracy >= 85) return darkMode ? '#0d9488' : '#14b8a6'; // Good - teal
  if (accuracy >= 75) return darkMode ? '#ca8a04' : '#eab308'; // Okay - yellow
  if (accuracy >= 60) return darkMode ? '#ea580c' : '#f97316'; // Needs work - orange
  return darkMode ? '#dc2626' : '#ef4444'; // Poor - red
}

/**
 * Find weakest scenarios
 */
export function findWeakestScenarios(
  stats: Statistics,
  count: number = 10,
  minAttempts: number = 3
): Array<{ key: string; accuracy: number; attempts: number }> {
  if (!stats.byScenario) return [];

  const scenarios = Object.entries(stats.byScenario)
    .map(([key, data]) => ({
      key,
      accuracy: (data.correct + data.incorrect) > 0
        ? Math.round((data.correct / (data.correct + data.incorrect)) * 100)
        : 0,
      attempts: data.correct + data.incorrect,
    }))
    .filter(s => s.attempts >= minAttempts)
    .sort((a, b) => a.accuracy - b.accuracy);

  return scenarios.slice(0, count);
}

/**
 * Find scenarios needing more practice (spaced repetition)
 */
export function findStaleScenarios(
  stats: Statistics,
  maxAge: number = 7 * 24 * 60 * 60 * 1000 // 7 days
): Array<{ key: string; lastSeen: number; accuracy: number }> {
  if (!stats.byScenario) return [];

  const now = Date.now();

  return Object.entries(stats.byScenario)
    .filter(([_, data]) => {
      const lastSeen = data.lastSeen || 0;
      return (now - lastSeen) > maxAge;
    })
    .map(([key, data]) => ({
      key,
      lastSeen: data.lastSeen || 0,
      accuracy: (data.correct + data.incorrect) > 0
        ? Math.round((data.correct / (data.correct + data.incorrect)) * 100)
        : 0,
    }))
    .sort((a, b) => a.lastSeen - b.lastSeen);
}

/**
 * Generate trend data from session history
 */
export function generateTrendData(sessions: TrainingSession[]): TrendDataPoint[] {
  return sessions
    .filter(s => s.handsPlayed > 0)
    .map(s => ({
      timestamp: s.startTime,
      accuracy: getSessionAccuracy(s),
      handsPlayed: s.handsPlayed,
      avgDecisionTime: s.avgDecisionTime || 0,
    }))
    .sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Calculate decision time analysis
 */
export function analyzeDecisionTimes(stats: Statistics): {
  overallAvg: number;
  byAction: Record<string, number>;
  byHandType: Record<string, number>;
  slowestScenarios: Array<{ key: string; avgTime: number }>;
} {
  const byAction: Record<string, number> = {};
  const byHandType: Record<string, number> = {};

  // Action timing
  Object.entries(stats.byAction).forEach(([action, data]) => {
    if (data.avgTime) {
      byAction[action] = Math.round(data.avgTime);
    }
  });

  // Hand type timing
  Object.entries(stats.byHandType).forEach(([type, data]) => {
    if (data.avgTime) {
      byHandType[type] = Math.round(data.avgTime);
    }
  });

  // Overall average
  const totalTime = stats.speedRecords?.totalTimeTracked || 0;
  const totalDecisions = stats.speedRecords?.decisionsTracked || 0;
  const overallAvg = totalDecisions > 0 ? Math.round(totalTime / totalDecisions) : 0;

  // Slowest scenarios
  const slowestScenarios = stats.byScenario
    ? Object.entries(stats.byScenario)
        .filter(([_, data]) => data.avgTime && data.avgTime > 0)
        .map(([key, data]) => ({
          key,
          avgTime: Math.round(data.avgTime || 0),
        }))
        .sort((a, b) => b.avgTime - a.avgTime)
        .slice(0, 10)
    : [];

  return { overallAvg, byAction, byHandType, slowestScenarios };
}

/**
 * Analyze mistakes to find patterns
 */
export function analyzeMistakes(mistakes: MistakeRecord[]): {
  byHandType: Record<string, number>;
  byDealerCard: Record<string, number>;
  byAction: Record<string, number>;
  mostCommon: Array<{ scenario: string; count: number }>;
  recentMistakes: MistakeRecord[];
} {
  const byHandType: Record<string, number> = { hard: 0, soft: 0, pair: 0 };
  const byDealerCard: Record<string, number> = {};
  const byAction: Record<string, number> = {};
  const scenarioCounts: Record<string, number> = {};

  mistakes.forEach(m => {
    // By hand type
    byHandType[m.handType] = (byHandType[m.handType] || 0) + 1;

    // By dealer card
    const dealer = m.dealerUpcard.rank;
    byDealerCard[dealer] = (byDealerCard[dealer] || 0) + 1;

    // By action (what they chose vs what they should have)
    const actionKey = `${m.playerAction} instead of ${m.correctAction}`;
    byAction[actionKey] = (byAction[actionKey] || 0) + 1;

    // Scenario
    const scenario = `${m.playerTotal} vs ${dealer} (${m.handType})`;
    scenarioCounts[scenario] = (scenarioCounts[scenario] || 0) + 1;
  });

  const mostCommon = Object.entries(scenarioCounts)
    .map(([scenario, count]) => ({ scenario, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const recentMistakes = mistakes.slice(-20).reverse();

  return { byHandType, byDealerCard, byAction, mostCommon, recentMistakes };
}

/**
 * Get performance comparison between periods
 */
export function comparePerformance(
  currentStats: Statistics,
  sessions: TrainingSession[],
  periodDays: number = 7
): {
  currentPeriodAccuracy: number;
  previousPeriodAccuracy: number;
  change: number;
  trend: 'improving' | 'declining' | 'stable';
} {
  const now = Date.now();
  const periodMs = periodDays * 24 * 60 * 60 * 1000;

  const currentPeriod = sessions.filter(
    s => s.startTime > now - periodMs
  );
  const previousPeriod = sessions.filter(
    s => s.startTime > now - periodMs * 2 && s.startTime <= now - periodMs
  );

  const calculatePeriodAccuracy = (period: TrainingSession[]) => {
    if (period.length === 0) return 0;
    const totalCorrect = period.reduce((sum, s) => sum + s.correctDecisions, 0);
    const totalDecisions = period.reduce(
      (sum, s) => sum + s.correctDecisions + s.incorrectDecisions,
      0
    );
    return totalDecisions > 0 ? Math.round((totalCorrect / totalDecisions) * 100) : 0;
  };

  const currentPeriodAccuracy = calculatePeriodAccuracy(currentPeriod);
  const previousPeriodAccuracy = calculatePeriodAccuracy(previousPeriod);
  const change = currentPeriodAccuracy - previousPeriodAccuracy;

  let trend: 'improving' | 'declining' | 'stable' = 'stable';
  if (change > 3) trend = 'improving';
  else if (change < -3) trend = 'declining';

  return { currentPeriodAccuracy, previousPeriodAccuracy, change, trend };
}

/**
 * Generate recommendations based on analytics
 */
export function generateRecommendations(
  stats: Statistics,
  sessions: TrainingSession[]
): string[] {
  const recommendations: string[] = [];

  // Check weakest scenarios
  const weakest = findWeakestScenarios(stats, 5, 5);
  if (weakest.length > 0 && weakest[0].accuracy < 70) {
    const parsed = parseScenarioKey(weakest[0].key);
    recommendations.push(
      `Focus on ${parsed.handType} ${parsed.playerTotal} vs dealer ${parsed.dealerUpcard} - only ${weakest[0].accuracy}% accuracy`
    );
  }

  // Check stale scenarios
  const stale = findStaleScenarios(stats);
  if (stale.length > 10) {
    recommendations.push(
      `${stale.length} scenarios haven't been practiced recently - consider using Mastery Mode`
    );
  }

  // Check decision time
  const timeAnalysis = analyzeDecisionTimes(stats);
  if (timeAnalysis.overallAvg > 3000) {
    recommendations.push(
      `Average decision time is ${(timeAnalysis.overallAvg / 1000).toFixed(1)}s - try Speed Training to improve`
    );
  }

  // Check mistake patterns
  if (stats.mistakes && stats.mistakes.length > 0) {
    const mistakeAnalysis = analyzeMistakes(stats.mistakes);
    if (mistakeAnalysis.mostCommon.length > 0 && mistakeAnalysis.mostCommon[0].count >= 3) {
      recommendations.push(
        `You've made ${mistakeAnalysis.mostCommon[0].count} mistakes on "${mistakeAnalysis.mostCommon[0].scenario}" - review this scenario`
      );
    }
  }

  // Check trend
  if (sessions.length >= 4) {
    const comparison = comparePerformance(stats, sessions);
    if (comparison.trend === 'declining') {
      recommendations.push(
        `Your accuracy has dropped ${Math.abs(comparison.change)}% this week - consider reviewing basics`
      );
    }
  }

  // General encouragement if doing well
  if (recommendations.length === 0 && stats.totalDecisions > 50) {
    const accuracy = Math.round((stats.correctDecisions / stats.totalDecisions) * 100);
    if (accuracy >= 90) {
      recommendations.push('Excellent performance! Try increasing difficulty or Speed Training');
    } else if (accuracy >= 80) {
      recommendations.push('Good progress! Focus on your remaining weak spots with Mastery Mode');
    }
  }

  return recommendations;
}

/**
 * Export analytics data as CSV
 */
export function exportAnalyticsCSV(stats: Statistics, sessions: TrainingSession[]): string {
  const lines: string[] = [];

  // Header
  lines.push('Blackjack Trainer Advanced Analytics Export');
  lines.push(`Export Date,${new Date().toISOString()}`);
  lines.push('');

  // Overall stats
  lines.push('OVERALL STATISTICS');
  lines.push('Metric,Value');
  lines.push(`Total Decisions,${stats.totalDecisions}`);
  lines.push(`Correct Decisions,${stats.correctDecisions}`);
  lines.push(`Accuracy,${Math.round((stats.correctDecisions / stats.totalDecisions) * 100)}%`);
  lines.push(`Longest Streak,${stats.longestStreak}`);
  lines.push('');

  // By scenario heatmap data
  lines.push('SCENARIO BREAKDOWN');
  lines.push('Hand Type,Player Total,Dealer Card,Correct,Incorrect,Accuracy');

  if (stats.byScenario) {
    Object.entries(stats.byScenario).forEach(([key, data]) => {
      const { playerTotal, dealerUpcard, handType } = parseScenarioKey(key);
      const total = data.correct + data.incorrect;
      const accuracy = total > 0 ? Math.round((data.correct / total) * 100) : 0;
      lines.push(`${handType},${playerTotal},${dealerUpcard},${data.correct},${data.incorrect},${accuracy}%`);
    });
  }
  lines.push('');

  // Session history
  lines.push('SESSION HISTORY');
  lines.push('Date,Mode,Level,Hands,Correct,Incorrect,Accuracy,Duration (min),Avg Time (ms)');

  sessions.forEach(s => {
    const accuracy = getSessionAccuracy(s);
    const duration = Math.round((s.endTime || Date.now()) - s.startTime) / 60000;
    lines.push(
      `${new Date(s.startTime).toISOString()},${s.mode},${s.level},${s.handsPlayed},${s.correctDecisions},${s.incorrectDecisions},${accuracy}%,${duration.toFixed(1)},${s.avgDecisionTime?.toFixed(0) || 'N/A'}`
    );
  });

  return lines.join('\n');
}
