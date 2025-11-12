'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/Card';
import { DifficultyLevel, PlayerAction, Statistics } from '@/lib/types';
import { generateTrainingScenario, TrainingScenario } from '@/lib/gameEngine';
import { getBasicStrategyAction, getAvailableActions } from '@/lib/basicStrategy';
import { calculateHandValue, getHandValueDisplay, getHandType } from '@/lib/handValue';
import {
  loadStatistics,
  saveStatistics,
  updateStatistics,
  getAccuracy,
  resetStatistics,
} from '@/lib/statistics';

export default function Home() {
  const [level, setLevel] = useState<DifficultyLevel>(1);
  const [scenario, setScenario] = useState<TrainingScenario | null>(null);
  const [feedback, setFeedback] = useState<{
    show: boolean;
    correct: boolean;
    correctAction: PlayerAction | null;
    playerAction: PlayerAction | null;
  }>({ show: false, correct: false, correctAction: null, playerAction: null });
  const [stats, setStats] = useState<Statistics | null>(null);
  const [showHints, setShowHints] = useState(false);

  // Load statistics on mount
  useEffect(() => {
    setStats(loadStatistics());
  }, []);

  // Generate initial scenario
  useEffect(() => {
    if (!scenario) {
      setScenario(generateTrainingScenario(level));
    }
  }, [scenario, level]);

  const handleAction = (action: PlayerAction) => {
    if (!scenario || feedback.show) return;

    const correctAction = getBasicStrategyAction(
      scenario.playerCards,
      scenario.dealerUpcard,
      scenario.canDouble,
      scenario.canSplit,
      scenario.canSurrender,
      level
    );

    const isCorrect = action === correctAction;
    const handType = getHandType(scenario.playerCards);

    // Update statistics
    if (stats) {
      const newStats = updateStatistics(stats, action, handType, isCorrect);
      setStats(newStats);
      saveStatistics(newStats);
    }

    // Show feedback
    setFeedback({
      show: true,
      correct: isCorrect,
      correctAction,
      playerAction: action,
    });
  };

  const handleNextHand = () => {
    setScenario(generateTrainingScenario(level));
    setFeedback({ show: false, correct: false, correctAction: null, playerAction: null });
  };

  const handleLevelChange = (newLevel: DifficultyLevel) => {
    setLevel(newLevel);
    setScenario(generateTrainingScenario(newLevel));
    setFeedback({ show: false, correct: false, correctAction: null, playerAction: null });
  };

  const handleResetStats = () => {
    if (confirm('Are you sure you want to reset all statistics?')) {
      const newStats = resetStatistics();
      setStats(newStats);
    }
  };

  if (!scenario || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const playerHandValue = calculateHandValue(scenario.playerCards);
  const dealerHandValue = calculateHandValue([scenario.dealerUpcard]);
  const availableActions = getAvailableActions(
    scenario.playerCards,
    scenario.canDouble,
    scenario.canSplit,
    scenario.canSurrender,
    level
  );

  const accuracy = getAccuracy(stats);

  return (
    <main className="min-h-screen p-4 flex flex-col">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
          Blackjack Strategy Trainer
        </h1>
        <p className="text-green-200 text-sm sm:text-base">
          Master basic strategy through practice
        </p>
      </div>

      {/* Stats Bar */}
      <div className="bg-green-900/50 backdrop-blur-sm rounded-lg p-3 sm:p-4 mb-6 border border-green-700">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 sm:gap-6">
            <div>
              <div className="text-green-200 text-xs sm:text-sm">Accuracy</div>
              <div className="text-white text-xl sm:text-2xl font-bold">{accuracy}%</div>
            </div>
            <div>
              <div className="text-green-200 text-xs sm:text-sm">Correct</div>
              <div className="text-green-400 text-lg sm:text-xl font-bold">
                {stats.correctDecisions}
              </div>
            </div>
            <div>
              <div className="text-green-200 text-xs sm:text-sm">Incorrect</div>
              <div className="text-red-400 text-lg sm:text-xl font-bold">
                {stats.incorrectDecisions}
              </div>
            </div>
            <div>
              <div className="text-green-200 text-xs sm:text-sm">Total</div>
              <div className="text-white text-lg sm:text-xl font-bold">
                {stats.totalDecisions}
              </div>
            </div>
          </div>
          <button
            onClick={handleResetStats}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
          >
            Reset Stats
          </button>
        </div>
      </div>

      {/* Level Selector */}
      <div className="bg-green-900/50 backdrop-blur-sm rounded-lg p-3 sm:p-4 mb-6 border border-green-700">
        <div className="text-green-200 text-sm mb-2">Difficulty Level</div>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4].map((l) => (
            <button
              key={l}
              onClick={() => handleLevelChange(l as DifficultyLevel)}
              className={`px-4 py-2 rounded font-semibold transition-colors ${
                level === l
                  ? 'bg-green-600 text-white'
                  : 'bg-green-800/50 text-green-200 hover:bg-green-700/50'
              }`}
            >
              Level {l}
            </button>
          ))}
        </div>
        <div className="mt-2 text-green-200 text-xs sm:text-sm">
          {level === 1 && 'Hard totals (12-17)'}
          {level === 2 && 'Hard totals + Soft hands'}
          {level === 3 && 'Hard totals + Soft hands + Pairs'}
          {level === 4 && 'All scenarios + Surrender'}
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 sm:gap-12">
        {/* Dealer Section */}
        <div className="text-center">
          <div className="text-green-200 text-sm sm:text-base mb-3">Dealer Shows</div>
          <div className="flex justify-center gap-2">
            <Card card={scenario.dealerUpcard} />
          </div>
          <div className="mt-2 text-white text-lg font-semibold">
            {dealerHandValue.value}
          </div>
        </div>

        {/* VS Divider */}
        <div className="text-green-300 text-xl sm:text-2xl font-bold">VS</div>

        {/* Player Section */}
        <div className="text-center">
          <div className="text-green-200 text-sm sm:text-base mb-3">Your Hand</div>
          <div className="flex justify-center gap-2">
            {scenario.playerCards.map((card, idx) => (
              <Card key={idx} card={card} delay={idx * 100} />
            ))}
          </div>
          <div className="mt-2 text-white text-lg font-semibold">
            {getHandValueDisplay(playerHandValue)}
            {playerHandValue.isSoft && (
              <span className="text-green-300 text-sm ml-2">(Soft)</span>
            )}
          </div>
        </div>
      </div>

      {/* Feedback */}
      {feedback.show && (
        <div
          className={`mb-6 p-4 rounded-lg border-2 ${
            feedback.correct
              ? 'bg-green-900/70 border-green-500'
              : 'bg-red-900/70 border-red-500'
          }`}
        >
          <div className="text-center">
            <div
              className={`text-xl sm:text-2xl font-bold mb-2 ${
                feedback.correct ? 'text-green-300' : 'text-red-300'
              }`}
            >
              {feedback.correct ? '✓ Correct!' : '✗ Incorrect'}
            </div>
            {!feedback.correct && (
              <div className="text-white text-sm sm:text-base">
                You chose <span className="font-bold uppercase">{feedback.playerAction}</span>.
                The correct play is{' '}
                <span className="font-bold uppercase">{feedback.correctAction}</span>.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-3 mb-6">
        {!feedback.show ? (
          availableActions.map((action) => (
            <button
              key={action}
              onClick={() => handleAction(action)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg transition-colors uppercase text-sm sm:text-base min-w-[100px]"
            >
              {action}
            </button>
          ))
        ) : (
          <button
            onClick={handleNextHand}
            className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-lg transition-colors text-base sm:text-lg"
          >
            Next Hand →
          </button>
        )}
      </div>

      {/* Hint Toggle */}
      <div className="text-center">
        <button
          onClick={() => setShowHints(!showHints)}
          className="text-green-300 hover:text-green-200 text-sm underline"
        >
          {showHints ? 'Hide' : 'Show'} Hints
        </button>
        {showHints && !feedback.show && (
          <div className="mt-2 text-green-200 text-xs sm:text-sm">
            Think about: Is this a hard or soft hand? What&apos;s the dealer showing?
          </div>
        )}
      </div>
    </main>
  );
}
