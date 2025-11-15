import { Statistics } from '@/lib/types';
import { getAccuracy } from '@/lib/statistics';

interface StatsBarProps {
  stats: Statistics;
  onReset: () => void;
  onExport?: () => void;
}

/**
 * Displays statistics bar with accuracy, correct/incorrect counts, and streaks
 */
export default function StatsBar({ stats, onReset, onExport }: StatsBarProps) {
  const accuracy = getAccuracy(stats);

  return (
    <div
      className="bg-green-900/50 backdrop-blur-sm rounded-lg p-3 sm:p-4 mb-6 border border-green-700"
      role="region"
      aria-label="Statistics"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4 sm:gap-6">
          <div>
            <div className="text-green-200 text-xs sm:text-sm" id="accuracy-label">
              Accuracy
            </div>
            <div
              className="text-white text-xl sm:text-2xl font-bold"
              aria-labelledby="accuracy-label"
            >
              {accuracy}%
            </div>
          </div>
          <div>
            <div className="text-green-200 text-xs sm:text-sm" id="correct-label">
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
            <div className="text-green-200 text-xs sm:text-sm" id="incorrect-label">
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
            <div className="text-green-200 text-xs sm:text-sm" id="total-label">
              Total
            </div>
            <div
              className="text-white text-lg sm:text-xl font-bold"
              aria-labelledby="total-label"
            >
              {stats.totalDecisions}
            </div>
          </div>
          {stats.currentStreak > 0 && (
            <div>
              <div className="text-green-200 text-xs sm:text-sm" id="streak-label">
                Streak
              </div>
              <div
                className="text-yellow-400 text-lg sm:text-xl font-bold"
                aria-labelledby="streak-label"
              >
                🔥 {stats.currentStreak}
              </div>
            </div>
          )}
          {stats.longestStreak > 0 && (
            <div>
              <div className="text-green-200 text-xs sm:text-sm" id="longest-streak-label">
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
