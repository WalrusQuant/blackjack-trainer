import { DifficultyLevel } from '@/lib/types';

interface LevelSelectorProps {
  currentLevel: DifficultyLevel;
  onLevelChange: (level: DifficultyLevel) => void;
  adaptiveSuggestion?: DifficultyLevel | null;
}

const LEVEL_DESCRIPTIONS: Record<DifficultyLevel, string> = {
  1: 'Hard totals (12-17)',
  2: 'Hard totals + Soft hands',
  3: 'Hard totals + Soft hands + Pairs',
  4: 'All scenarios + Surrender',
};

/**
 * Level selector component with accessibility and adaptive difficulty suggestions
 */
export default function LevelSelector({
  currentLevel,
  onLevelChange,
  adaptiveSuggestion,
}: LevelSelectorProps) {
  return (
    <div
      className="bg-green-900/50 backdrop-blur-sm rounded-lg px-3 py-2 border border-green-700"
      role="region"
      aria-label="Difficulty level selection"
    >
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Difficulty level selection">
        <span className="text-green-200 text-xs sm:text-sm" id="difficulty-label">Level</span>
        {[1, 2, 3, 4].map((l) => {
          const level = l as DifficultyLevel;
          const isCurrentLevel = currentLevel === level;
          const isSuggested = adaptiveSuggestion === level;

          return (
            <button
              key={l}
              onClick={() => onLevelChange(level)}
              className={`px-4 py-2 rounded font-semibold transition-colors relative ${
                isCurrentLevel
                  ? 'bg-green-600 text-white'
                  : 'bg-green-800/50 text-green-200 hover:bg-green-700/50'
              }`}
              aria-label={`Level ${l}: ${LEVEL_DESCRIPTIONS[level]}`}
              aria-current={isCurrentLevel ? 'true' : undefined}
            >
              Level {l}
              {isSuggested && !isCurrentLevel && (
                <span
                  className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"
                  aria-label="Recommended level"
                  title="Recommended based on your performance"
                />
              )}
            </button>
          );
        })}
      </div>
      <span className="text-green-200/70 text-xs hidden sm:inline ml-2" aria-live="polite">
        — {LEVEL_DESCRIPTIONS[currentLevel]}
        {adaptiveSuggestion && adaptiveSuggestion !== currentLevel && (
          <span className="ml-1 text-yellow-300">
            (Try Level {adaptiveSuggestion})
          </span>
        )}
      </span>
    </div>
  );
}
