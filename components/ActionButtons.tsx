import { PlayerAction } from '@/lib/types';
import { useEffect } from 'react';

interface ActionButtonsProps {
  availableActions: PlayerAction[];
  onAction: (action: PlayerAction) => void;
  onNextHand?: () => void;
  showingFeedback: boolean;
}

const ACTION_HOTKEYS: Record<PlayerAction, string> = {
  hit: 'h',
  stand: 's',
  double: 'd',
  split: 'p',
  surrender: 'r',
};

const ACTION_LABELS: Record<PlayerAction, string> = {
  hit: 'Hit',
  stand: 'Stand',
  double: 'Double',
  split: 'Split',
  surrender: 'Surrender',
};

/**
 * Action buttons with keyboard navigation support
 */
export default function ActionButtons({
  availableActions,
  onAction,
  onNextHand,
  showingFeedback,
}: ActionButtonsProps) {
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showingFeedback) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onNextHand?.();
        }
        return;
      }

      // Check for action hotkeys
      const action = Object.entries(ACTION_HOTKEYS).find(
        ([_, hotkey]) => e.key.toLowerCase() === hotkey
      )?.[0] as PlayerAction | undefined;

      if (action && availableActions.includes(action)) {
        e.preventDefault();
        onAction(action);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [availableActions, onAction, onNextHand, showingFeedback]);

  return (
    <div className="flex flex-wrap justify-center gap-3 mb-6" role="group" aria-label="Game actions">
      {!showingFeedback ? (
        availableActions.map((action) => (
          <button
            key={action}
            onClick={() => onAction(action)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg transition-colors uppercase text-sm sm:text-base min-w-[100px] focus:ring-2 focus:ring-blue-400 focus:outline-none"
            aria-label={`${ACTION_LABELS[action]} (Press ${ACTION_HOTKEYS[action].toUpperCase()})`}
          >
            {ACTION_LABELS[action]}
            <span className="text-xs ml-1 opacity-75">({ACTION_HOTKEYS[action].toUpperCase()})</span>
          </button>
        ))
      ) : (
        <button
          onClick={onNextHand}
          className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-lg transition-colors text-base sm:text-lg focus:ring-2 focus:ring-green-400 focus:outline-none"
          aria-label="Next hand (Press Enter or Space)"
          autoFocus
        >
          Next Hand →
          <span className="text-xs ml-2 opacity-75">(Enter)</span>
        </button>
      )}
    </div>
  );
}
