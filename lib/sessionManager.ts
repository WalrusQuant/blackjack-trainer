import {
  TrainingSession,
  TrainingMode,
  DifficultyLevel,
  SessionGoal,
  MistakeRecord,
} from './types';

const SESSION_HISTORY_KEY = 'blackjack-session-history';
const MAX_SESSIONS = 100;

/**
 * Generate unique session ID
 */
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a new training session
 */
export function createSession(
  mode: TrainingMode,
  level: DifficultyLevel,
  goals?: SessionGoal[]
): TrainingSession {
  return {
    id: generateSessionId(),
    startTime: Date.now(),
    mode,
    level,
    handsPlayed: 0,
    correctDecisions: 0,
    incorrectDecisions: 0,
    goals: goals || [],
    mistakes: [],
  };
}

/**
 * End a session and calculate final stats
 */
export function endSession(session: TrainingSession): TrainingSession {
  const endTime = Date.now();
  const totalDecisions = session.correctDecisions + session.incorrectDecisions;

  // Check goals
  const goals = session.goals?.map(goal => {
    let achieved = false;
    switch (goal.type) {
      case 'hands':
        achieved = session.handsPlayed >= goal.target;
        break;
      case 'accuracy':
        const accuracy = totalDecisions > 0
          ? (session.correctDecisions / totalDecisions) * 100
          : 0;
        achieved = accuracy >= goal.target;
        break;
      case 'time':
        achieved = (endTime - session.startTime) >= goal.target * 60 * 1000;
        break;
      case 'streak':
        // This would need to be tracked during the session
        achieved = goal.achieved;
        break;
    }
    return { ...goal, achieved };
  });

  return {
    ...session,
    endTime,
    goals,
  };
}

/**
 * Update session with a decision
 */
export function updateSession(
  session: TrainingSession,
  isCorrect: boolean,
  decisionTime?: number,
  mistake?: MistakeRecord
): TrainingSession {
  const updated = {
    ...session,
    handsPlayed: session.handsPlayed + 1,
    correctDecisions: session.correctDecisions + (isCorrect ? 1 : 0),
    incorrectDecisions: session.incorrectDecisions + (isCorrect ? 0 : 1),
    mistakes: mistake ? [...session.mistakes, mistake] : session.mistakes,
  };

  // Update average decision time
  if (decisionTime !== undefined) {
    const totalTime = (session.avgDecisionTime || 0) * (session.handsPlayed);
    updated.avgDecisionTime = (totalTime + decisionTime) / (session.handsPlayed + 1);
  }

  return updated;
}

/**
 * Get session accuracy
 */
export function getSessionAccuracy(session: TrainingSession): number {
  const total = session.correctDecisions + session.incorrectDecisions;
  if (total === 0) return 0;
  return Math.round((session.correctDecisions / total) * 100);
}

/**
 * Get session duration in minutes
 */
export function getSessionDuration(session: TrainingSession): number {
  const endTime = session.endTime || Date.now();
  return Math.round((endTime - session.startTime) / 60000);
}

/**
 * Format session duration as string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

/**
 * Create common session goals
 */
export function createGoals(config: {
  hands?: number;
  accuracy?: number;
  timeMinutes?: number;
  streak?: number;
}): SessionGoal[] {
  const goals: SessionGoal[] = [];

  if (config.hands) {
    goals.push({ type: 'hands', target: config.hands, achieved: false });
  }
  if (config.accuracy) {
    goals.push({ type: 'accuracy', target: config.accuracy, achieved: false });
  }
  if (config.timeMinutes) {
    goals.push({ type: 'time', target: config.timeMinutes, achieved: false });
  }
  if (config.streak) {
    goals.push({ type: 'streak', target: config.streak, achieved: false });
  }

  return goals;
}

/**
 * Save session to history
 */
export function saveSessionToHistory(session: TrainingSession): void {
  if (typeof window === 'undefined') return;

  try {
    const history = loadSessionHistory();
    const updated = [session, ...history].slice(0, MAX_SESSIONS);
    localStorage.setItem(SESSION_HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save session history:', e);
  }
}

/**
 * Load session history
 */
export function loadSessionHistory(): TrainingSession[] {
  if (typeof window === 'undefined') return [];

  try {
    const saved = localStorage.getItem(SESSION_HISTORY_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load session history:', e);
  }
  return [];
}

/**
 * Clear session history
 */
export function clearSessionHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_HISTORY_KEY);
}

/**
 * Get session summary for display
 */
export function getSessionSummary(session: TrainingSession): {
  accuracy: number;
  duration: string;
  handsPlayed: number;
  mistakeCount: number;
  avgDecisionTime: string;
  goalsAchieved: number;
  totalGoals: number;
} {
  const accuracy = getSessionAccuracy(session);
  const duration = formatDuration(getSessionDuration(session));
  const avgTime = session.avgDecisionTime
    ? `${(session.avgDecisionTime / 1000).toFixed(1)}s`
    : 'N/A';

  const goalsAchieved = session.goals?.filter(g => g.achieved).length || 0;
  const totalGoals = session.goals?.length || 0;

  return {
    accuracy,
    duration,
    handsPlayed: session.handsPlayed,
    mistakeCount: session.mistakes.length,
    avgDecisionTime: avgTime,
    goalsAchieved,
    totalGoals,
  };
}

/**
 * Compare two sessions
 */
export function compareSessions(
  current: TrainingSession,
  previous: TrainingSession
): {
  accuracyChange: number;
  speedChange: number;
  handsChange: number;
} {
  const currentAccuracy = getSessionAccuracy(current);
  const previousAccuracy = getSessionAccuracy(previous);

  const currentSpeed = current.avgDecisionTime || 0;
  const previousSpeed = previous.avgDecisionTime || 0;

  return {
    accuracyChange: currentAccuracy - previousAccuracy,
    speedChange: previousSpeed - currentSpeed, // Positive = faster
    handsChange: current.handsPlayed - previous.handsPlayed,
  };
}

/**
 * Get aggregate stats from session history
 */
export function getAggregateStats(sessions: TrainingSession[]): {
  totalSessions: number;
  totalHands: number;
  totalCorrect: number;
  totalIncorrect: number;
  overallAccuracy: number;
  avgSessionLength: number;
  totalTrainingTime: number;
  improvementTrend: number;
} {
  if (sessions.length === 0) {
    return {
      totalSessions: 0,
      totalHands: 0,
      totalCorrect: 0,
      totalIncorrect: 0,
      overallAccuracy: 0,
      avgSessionLength: 0,
      totalTrainingTime: 0,
      improvementTrend: 0,
    };
  }

  const totalHands = sessions.reduce((sum, s) => sum + s.handsPlayed, 0);
  const totalCorrect = sessions.reduce((sum, s) => sum + s.correctDecisions, 0);
  const totalIncorrect = sessions.reduce((sum, s) => sum + s.incorrectDecisions, 0);
  const totalTime = sessions.reduce((sum, s) => sum + getSessionDuration(s), 0);

  // Calculate improvement trend (comparing recent vs older sessions)
  let improvementTrend = 0;
  if (sessions.length >= 4) {
    const recentSessions = sessions.slice(0, Math.floor(sessions.length / 2));
    const olderSessions = sessions.slice(Math.floor(sessions.length / 2));

    const recentAccuracy =
      recentSessions.reduce((sum, s) => sum + getSessionAccuracy(s), 0) / recentSessions.length;
    const olderAccuracy =
      olderSessions.reduce((sum, s) => sum + getSessionAccuracy(s), 0) / olderSessions.length;

    improvementTrend = recentAccuracy - olderAccuracy;
  }

  return {
    totalSessions: sessions.length,
    totalHands,
    totalCorrect,
    totalIncorrect,
    overallAccuracy: totalHands > 0 ? Math.round((totalCorrect / totalHands) * 100) : 0,
    avgSessionLength: Math.round(totalTime / sessions.length),
    totalTrainingTime: totalTime,
    improvementTrend: Math.round(improvementTrend * 10) / 10,
  };
}
