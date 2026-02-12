import { FeedbackState } from '@/lib/types';

interface FeedbackPanelProps {
  feedback: FeedbackState;
}

/**
 * Displays feedback about the player's decision with accessibility
 */
export default function FeedbackPanel({ feedback }: FeedbackPanelProps) {
  if (!feedback.show) return null;

  return (
    <div
      className={`p-3 rounded-lg border-2 ${
        feedback.correct
          ? 'bg-green-900/70 border-green-500 animate-pulse-correct'
          : 'bg-red-900/70 border-red-500 animate-shake'
      }`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="text-center">
        <div
          className={`text-xl sm:text-2xl font-bold mb-2 ${
            feedback.correct ? 'text-green-300' : 'text-red-300'
          }`}
        >
          {feedback.correct ? (
            <span role="img" aria-label="Correct">
              ✓ Correct!
            </span>
          ) : (
            <span role="img" aria-label="Incorrect">
              ✗ Incorrect
            </span>
          )}
        </div>
        {!feedback.correct && feedback.correctAction && feedback.playerAction && (
          <div className="text-white text-sm sm:text-base">
            You chose{' '}
            <span className="font-bold uppercase" aria-label={`Your choice: ${feedback.playerAction}`}>
              {feedback.playerAction}
            </span>
            . The correct play is{' '}
            <span className="font-bold uppercase text-yellow-300" aria-label={`Correct choice: ${feedback.correctAction}`}>
              {feedback.correctAction}
            </span>
            .
          </div>
        )}
        {/* EV Explanation for mistakes */}
        {!feedback.correct && feedback.explanation && (
          <div className="mt-3 p-2 bg-black/30 rounded text-yellow-200 text-xs sm:text-sm">
            💡 {feedback.explanation}
          </div>
        )}
        {feedback.decisionTime !== undefined && (
          <div className={`text-xs mt-2 ${feedback.correct ? 'text-green-200' : 'text-red-200'}`}>
            Decision time: {(feedback.decisionTime / 1000).toFixed(1)}s
            {feedback.correct && feedback.decisionTime < 2000 && ' ⚡ Fast!'}
          </div>
        )}
      </div>
    </div>
  );
}
