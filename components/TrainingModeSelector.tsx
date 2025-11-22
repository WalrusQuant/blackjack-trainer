'use client';

import { TrainingMode } from '@/lib/types';

interface TrainingModeSelectorProps {
  currentMode: TrainingMode;
  onModeChange: (mode: TrainingMode) => void;
  darkMode?: boolean;
}

const MODE_INFO: Record<TrainingMode, { label: string; description: string; icon: string }> = {
  basic: {
    label: 'Basic Strategy',
    description: 'Practice fundamental blackjack decisions',
    icon: '📚',
  },
  counting: {
    label: 'Card Counting',
    description: 'Learn Hi-Lo counting and deviations',
    icon: '🎯',
  },
  speed: {
    label: 'Speed Training',
    description: 'Make decisions under time pressure',
    icon: '⚡',
  },
  flashcard: {
    label: 'Flash Cards',
    description: 'Rapid-fire scenario practice',
    icon: '🃏',
  },
  tournament: {
    label: 'Tournament',
    description: '100-hand challenge mode',
    icon: '🏆',
  },
  custom: {
    label: 'Custom Practice',
    description: 'Focus on specific scenarios',
    icon: '🎛️',
  },
  mastery: {
    label: 'Mastery Mode',
    description: 'Train only your weak spots',
    icon: '🎓',
  },
  deviation: {
    label: 'Index Plays',
    description: 'Practice counting deviations',
    icon: '📊',
  },
  mistakes: {
    label: 'Review Mistakes',
    description: 'Learn from your errors',
    icon: '📝',
  },
};

export default function TrainingModeSelector({
  currentMode,
  onModeChange,
  darkMode = false,
}: TrainingModeSelectorProps) {
  const bgClass = darkMode ? 'bg-gray-800' : 'bg-green-900/50';
  const textClass = darkMode ? 'text-gray-200' : 'text-white';
  const mutedClass = darkMode ? 'text-gray-400' : 'text-green-200';
  const borderClass = darkMode ? 'border-gray-700' : 'border-green-700';

  return (
    <div className={`${bgClass} backdrop-blur-sm rounded-lg p-4 ${borderClass} border`}>
      <h2 className={`text-lg font-bold ${textClass} mb-4`}>Training Modes</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {(Object.keys(MODE_INFO) as TrainingMode[]).map(mode => {
          const info = MODE_INFO[mode];
          const isActive = currentMode === mode;

          return (
            <button
              key={mode}
              onClick={() => onModeChange(mode)}
              className={`p-3 rounded-lg text-left transition-all ${
                isActive
                  ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                  : darkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  : 'bg-green-800/50 hover:bg-green-700/50 text-white'
              }`}
            >
              <div className="text-2xl mb-1">{info.icon}</div>
              <div className="font-medium text-sm">{info.label}</div>
              <div className={`text-xs mt-1 ${isActive ? 'text-blue-100' : mutedClass}`}>
                {info.description}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
