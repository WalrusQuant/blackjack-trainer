import { Statistics, TrainingSession } from '@/lib/types';
import { getAccuracy } from '@/lib/statistics';

interface StatsBarProps {
  stats: Statistics;
  currentSession?: TrainingSession | null;
  onReset: () => void;
  onExport?: () => void;
  darkMode?: boolean;
  compact?: boolean;
}

/**
 * Displays statistics bar with accuracy, correct/incorrect counts, and streaks
 */
export default function StatsBar({
  stats,
  currentSession,
  onReset,
  onExport,
  darkMode = false,
  compact = false,
}: StatsBarProps) {
  const accuracy = getAccuracy(stats);

  const bgClass = darkMode ? 'bg-gray-800' : 'bg-green-900/50';
  const borderClass = darkMode ? 'border-gray-700' : 'border-green-700';
  const textClass = darkMode ? 'text-gray-200' : 'text-white';
  const mutedClass = darkMode ? 'text-gray-400' : 'text-green-200';

  if (compact) {
    return (
      <div
        className={`${bgClass} backdrop-blur-sm rounded-lg px-4 py-2 ${borderClass} border`}
        role="region"
        aria-label="Statistics"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-sm">
            <span className={mutedClass}>
              Accuracy: <span className={`font-bold ${textClass}`}>{accuracy}%</span>
            </span>
            <span className={mutedClass}>
              Hands: <span className={`font-bold ${textClass}`}>{stats.totalDecisions}</span>
            </span>
            {stats.currentStreak > 0 && (
              <span className={mutedClass}>
                Streak: <span className="font-bold text-yellow-400">{stats.currentStreak}</span>
              </span>
            )}
            {currentSession && (
              <span className="text-green-400 text-xs flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Session active
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {onExport && (
              <button
                onClick={onExport}
                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                aria-label="Export statistics"
              >
                Export
              </button>
            )}
            <button
              onClick={onReset}
              className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
              aria-label="Reset all statistics"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${bgClass} backdrop-blur-sm rounded-lg p-3 sm:p-4 ${borderClass} border`}
      role="region"
      aria-label="Statistics"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4 sm:gap-6">
          <div>
            <div className={`${mutedClass} text-xs sm:text-sm`} id="accuracy-label">
              Accuracy
            </div>
            <div
              className={`${textClass} text-xl sm:text-2xl font-bold`}
              aria-labelledby="accuracy-label"
            >
              {accuracy}%
            </div>
          </div>
          <div>
            <div className={`${mutedClass} text-xs sm:text-sm`} id="correct-label">
              Correct
            </div>
            <div
              className="text-green-400 text-lg sm:text-xl font-bold"
              aria-labelledby="correct-label"
            >
              {stats.correctDecisions}
            </div>
          </div>
          <div>
            <div className={`${mutedClass} text-xs sm:text-sm`} id="incorrect-label">
              Incorrect
            </div>
            <div
              className="text-red-400 text-lg sm:text-xl font-bold"
              aria-labelledby="incorrect-label"
            >
              {stats.incorrectDecisions}
            </div>
          </div>
          <div>
            <div className={`${mutedClass} text-xs sm:text-sm`} id="total-label">
              Total
            </div>
            <div
              className={`${textClass} text-lg sm:text-xl font-bold`}
              aria-labelledby="total-label"
            >
              {stats.totalDecisions}
            </div>
          </div>
          {stats.currentStreak > 0 && (
            <div>
              <div className={`${mutedClass} text-xs sm:text-sm`} id="streak-label">
                Streak
              </div>
              <div
                className="text-yellow-400 text-lg sm:text-xl font-bold"
                aria-labelledby="streak-label"
              >
                {stats.currentStreak}
              </div>
            </div>
          )}
          {stats.longestStreak > 0 && (
            <div>
              <div className={`${mutedClass} text-xs sm:text-sm`} id="longest-streak-label">
                Best
              </div>
              <div
                className="text-yellow-300 text-lg sm:text-xl font-bold"
                aria-labelledby="longest-streak-label"
              >
                {stats.longestStreak}
              </div>
            </div>
          )}
          {currentSession && (
            <div className="flex items-center gap-2 text-green-400 text-sm">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Session active
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {onExport && (
            <button
              onClick={onExport}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
              aria-label="Export statistics"
            >
              Export
            </button>
          )}
          <button
            onClick={onReset}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
            aria-label="Reset all statistics"
          >
            Reset Stats
          </button>
        </div>
      </div>
    </div>
  );
}
