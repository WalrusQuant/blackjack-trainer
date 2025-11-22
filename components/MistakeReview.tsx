'use client';

import { useState, useMemo } from 'react';
import { MistakeRecord, Statistics } from '@/lib/types';
import { analyzeMistakes } from '@/lib/analytics';
import { getScenarioExplanation } from '@/lib/adaptiveTraining';
import CardComponent from './Card';

interface MistakeReviewProps {
  stats: Statistics;
  onPracticeScenario?: (mistake: MistakeRecord) => void;
  onClearMistakes?: () => void;
  darkMode?: boolean;
}

export default function MistakeReview({
  stats,
  onPracticeScenario,
  onClearMistakes,
  darkMode = false,
}: MistakeReviewProps) {
  const [selectedMistake, setSelectedMistake] = useState<MistakeRecord | null>(null);
  const [quizMode, setQuizMode] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState<string>('');
  const [quizFeedback, setQuizFeedback] = useState<string>('');
  const [quizIndex, setQuizIndex] = useState(0);

  const mistakes = stats.mistakes || [];
  const analysis = useMemo(() => analyzeMistakes(mistakes), [mistakes]);

  const bgClass = darkMode ? 'bg-gray-800' : 'bg-green-900/50';
  const textClass = darkMode ? 'text-gray-200' : 'text-white';
  const mutedClass = darkMode ? 'text-gray-400' : 'text-green-200';
  const borderClass = darkMode ? 'border-gray-700' : 'border-green-700';

  const formatAction = (action: string) => action.charAt(0).toUpperCase() + action.slice(1);

  // Quiz mode handlers
  const startQuiz = () => {
    if (mistakes.length === 0) return;
    setQuizMode(true);
    setQuizIndex(0);
    setQuizAnswer('');
    setQuizFeedback('');
  };

  const checkQuizAnswer = () => {
    const currentMistake = mistakes[quizIndex];
    if (!currentMistake) return;

    const isCorrect = quizAnswer.toLowerCase() === currentMistake.correctAction;
    const explanation = getScenarioExplanation(
      currentMistake.playerTotal,
      currentMistake.dealerUpcard.rank,
      currentMistake.handType,
      currentMistake.correctAction
    );

    setQuizFeedback(
      isCorrect
        ? `Correct! ${explanation}`
        : `Incorrect. The correct answer is ${formatAction(currentMistake.correctAction)}. ${explanation}`
    );
  };

  const nextQuizQuestion = () => {
    if (quizIndex < mistakes.length - 1) {
      setQuizIndex(quizIndex + 1);
      setQuizAnswer('');
      setQuizFeedback('');
    } else {
      setQuizMode(false);
    }
  };

  if (mistakes.length === 0) {
    return (
      <div className={`${bgClass} backdrop-blur-sm rounded-lg p-6 ${borderClass} border text-center`}>
        <h3 className={`font-bold ${textClass} mb-2`}>Mistake Review</h3>
        <p className={mutedClass}>No mistakes recorded yet. Keep practicing!</p>
      </div>
    );
  }

  // Quiz Mode
  if (quizMode && mistakes[quizIndex]) {
    const currentMistake = mistakes[quizIndex];

    return (
      <div className={`${bgClass} backdrop-blur-sm rounded-lg p-6 ${borderClass} border`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`font-bold ${textClass}`}>Quiz: Test Your Mistakes</h3>
          <span className={mutedClass}>
            {quizIndex + 1} / {mistakes.length}
          </span>
        </div>

        {/* Scenario Display */}
        <div className="mb-6">
          <p className={`text-sm ${mutedClass} mb-2`}>What is the correct play?</p>
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <p className={`text-xs ${mutedClass} mb-1`}>Player ({currentMistake.handType} {currentMistake.playerTotal})</p>
              <div className="flex gap-1 justify-center">
                {currentMistake.playerCards.map((card, i) => (
                  <CardComponent key={i} card={card} delay={i * 100} />
                ))}
              </div>
            </div>
            <span className={`text-2xl ${mutedClass}`}>vs</span>
            <div className="text-center">
              <p className={`text-xs ${mutedClass} mb-1`}>Dealer</p>
              <CardComponent card={currentMistake.dealerUpcard} delay={0} />
            </div>
          </div>
        </div>

        {/* Answer Selection */}
        {!quizFeedback && (
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {['hit', 'stand', 'double', 'split', 'surrender'].map(action => (
              <button
                key={action}
                onClick={() => setQuizAnswer(action)}
                className={`px-4 py-2 rounded font-medium capitalize ${
                  quizAnswer === action
                    ? 'bg-blue-600 text-white'
                    : darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-green-700 text-green-100 hover:bg-green-600'
                }`}
              >
                {formatAction(action)}
              </button>
            ))}
          </div>
        )}

        {/* Submit or Next */}
        <div className="text-center">
          {!quizFeedback ? (
            <button
              onClick={checkQuizAnswer}
              disabled={!quizAnswer}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white rounded font-medium"
            >
              Submit
            </button>
          ) : (
            <div>
              <div className={`mb-4 p-4 rounded ${
                quizFeedback.includes('Correct!')
                  ? 'bg-green-600/20 text-green-400'
                  : 'bg-red-600/20 text-red-400'
              }`}>
                {quizFeedback}
              </div>
              <button
                onClick={nextQuizQuestion}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium"
              >
                {quizIndex < mistakes.length - 1 ? 'Next Question' : 'Finish Quiz'}
              </button>
            </div>
          )}
        </div>

        <div className="text-center mt-4">
          <button
            onClick={() => setQuizMode(false)}
            className={`text-sm ${mutedClass} underline`}
          >
            Exit Quiz
          </button>
        </div>
      </div>
    );
  }

  // Normal Review Mode
  return (
    <div className={`${bgClass} backdrop-blur-sm rounded-lg p-6 ${borderClass} border`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-bold ${textClass}`}>Mistake Review</h3>
        <div className="flex gap-2">
          <button
            onClick={startQuiz}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded"
          >
            Quiz Mode
          </button>
          {onClearMistakes && (
            <button
              onClick={() => {
                if (confirm('Clear all mistake history?')) {
                  onClearMistakes();
                }
              }}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Analysis Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className={`text-2xl font-bold ${textClass}`}>{mistakes.length}</div>
          <div className={`text-xs ${mutedClass}`}>Total Mistakes</div>
        </div>
        <div className="text-center">
          <div className={`text-xl font-bold ${textClass}`}>
            {Object.entries(analysis.byHandType)
              .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
          </div>
          <div className={`text-xs ${mutedClass}`}>Hardest Type</div>
        </div>
        <div className="text-center">
          <div className={`text-xl font-bold ${textClass}`}>
            {Object.entries(analysis.byDealerCard)
              .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
          </div>
          <div className={`text-xs ${mutedClass}`}>Hardest Dealer</div>
        </div>
        <div className="text-center">
          <div className={`text-sm ${textClass}`}>
            {analysis.mostCommon[0]?.scenario || 'N/A'}
          </div>
          <div className={`text-xs ${mutedClass}`}>Most Common</div>
        </div>
      </div>

      {/* Most Common Mistakes */}
      <div className="mb-6">
        <h4 className={`text-sm font-medium ${mutedClass} mb-2`}>Most Common Mistakes</h4>
        <div className="space-y-2">
          {analysis.mostCommon.slice(0, 5).map((item, i) => (
            <div
              key={i}
              className={`flex justify-between items-center p-2 rounded ${
                darkMode ? 'bg-gray-700' : 'bg-green-800/50'
              }`}
            >
              <span className={textClass}>{item.scenario}</span>
              <span className={mutedClass}>{item.count}x</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Mistakes List */}
      <div>
        <h4 className={`text-sm font-medium ${mutedClass} mb-2`}>Recent Mistakes</h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {analysis.recentMistakes.slice(0, 10).map((mistake, i) => (
            <div
              key={mistake.id}
              className={`p-3 rounded cursor-pointer transition-colors ${
                selectedMistake?.id === mistake.id
                  ? 'bg-blue-600/20 border border-blue-500'
                  : darkMode
                  ? 'bg-gray-700 hover:bg-gray-600'
                  : 'bg-green-800/50 hover:bg-green-700/50'
              }`}
              onClick={() => setSelectedMistake(selectedMistake?.id === mistake.id ? null : mistake)}
            >
              <div className="flex justify-between items-center">
                <span className={textClass}>
                  {mistake.handType} {mistake.playerTotal} vs {mistake.dealerUpcard.rank}
                </span>
                <span className={`text-xs ${mutedClass}`}>
                  {new Date(mistake.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className={`text-sm ${mutedClass}`}>
                You: {formatAction(mistake.playerAction)} → Correct: {formatAction(mistake.correctAction)}
              </div>

              {selectedMistake?.id === mistake.id && (
                <div className="mt-3 pt-3 border-t border-gray-600">
                  <div className="flex justify-center gap-4 mb-3">
                    <div className="flex gap-1">
                      {mistake.playerCards.map((card, j) => (
                        <CardComponent key={j} card={card} delay={j * 100} />
                      ))}
                    </div>
                    <span className={mutedClass}>vs</span>
                    <CardComponent card={mistake.dealerUpcard} delay={0} />
                  </div>
                  <p className={`text-sm ${textClass} mb-2`}>
                    {getScenarioExplanation(
                      mistake.playerTotal,
                      mistake.dealerUpcard.rank,
                      mistake.handType,
                      mistake.correctAction
                    )}
                  </p>
                  {onPracticeScenario && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPracticeScenario(mistake);
                      }}
                      className="w-full px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded"
                    >
                      Practice This Scenario
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
