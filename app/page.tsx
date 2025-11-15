'use client';

import { useReducer, useEffect, useState, useCallback, useMemo } from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';
import StatsBar from '@/components/StatsBar';
import LevelSelector from '@/components/LevelSelector';
import GameArea from '@/components/GameArea';
import FeedbackPanel from '@/components/FeedbackPanel';
import ActionButtons from '@/components/ActionButtons';
import { DifficultyLevel, PlayerAction } from '@/lib/types';
import { generateTrainingScenario } from '@/lib/gameEngine';
import { getBasicStrategyAction, getAvailableActions } from '@/lib/basicStrategy';
import { getHandType } from '@/lib/handValue';
import {
  loadStatistics,
  saveStatistics,
  updateStatistics,
  resetStatistics,
  exportStatisticsCSV,
} from '@/lib/statistics';
import { gameReducer, createInitialState } from '@/lib/gameReducer';
import { getSuggestedLevel } from '@/lib/adaptiveDifficulty';

export default function Home() {
  const [state, dispatch] = useReducer(gameReducer, createInitialState());
  const [scenarioStartTime, setScenarioStartTime] = useState<number>(Date.now());

  // Load statistics on mount
  useEffect(() => {
    const stats = loadStatistics();
    dispatch({ type: 'UPDATE_STATS', payload: stats });
  }, []);

  // Generate initial scenario
  useEffect(() => {
    if (!state.scenario && state.stats) {
      const scenario = generateTrainingScenario(state.ui.level);
      dispatch({ type: 'SET_SCENARIO', payload: scenario });
      setScenarioStartTime(Date.now());
    }
  }, [state.scenario, state.stats, state.ui.level]);

  // Memoized adaptive difficulty suggestion
  const adaptiveSuggestion = useMemo(() => {
    if (!state.stats || !state.config.adaptiveDifficulty) return null;
    return getSuggestedLevel(state.stats, state.ui.level);
  }, [state.stats, state.ui.level, state.config.adaptiveDifficulty]);

  // Handle player action with timing
  const handleAction = useCallback(
    (action: PlayerAction) => {
      if (!state.scenario || state.feedback.show || !state.stats) return;

      const decisionTime = Date.now() - scenarioStartTime;

      const correctAction = getBasicStrategyAction(
        state.scenario.playerCards,
        state.scenario.dealerUpcard,
        state.scenario.canDouble,
        state.scenario.canSplit,
        state.scenario.canSurrender,
        state.ui.level
      );

      const isCorrect = action === correctAction;
      const handType = getHandType(state.scenario.playerCards);

      // Update statistics with enhanced tracking
      const newStats = updateStatistics(
        state.stats,
        action,
        handType,
        isCorrect,
        decisionTime,
        state.scenario.dealerUpcard.rank
      );

      dispatch({ type: 'UPDATE_STATS', payload: newStats });
      saveStatistics(newStats);

      // Show feedback
      dispatch({
        type: 'SET_FEEDBACK',
        payload: {
          show: true,
          correct: isCorrect,
          correctAction,
          playerAction: action,
          decisionTime,
        },
      });
    },
    [state.scenario, state.feedback.show, state.stats, state.ui.level, scenarioStartTime]
  );

  // Handle next hand
  const handleNextHand = useCallback(() => {
    const newScenario = generateTrainingScenario(state.ui.level);
    dispatch({ type: 'SET_SCENARIO', payload: newScenario });
    dispatch({ type: 'CLEAR_FEEDBACK' });
    setScenarioStartTime(Date.now());
  }, [state.ui.level]);

  // Handle level change
  const handleLevelChange = useCallback((newLevel: DifficultyLevel) => {
    dispatch({ type: 'SET_LEVEL', payload: newLevel });
    setScenarioStartTime(Date.now());
  }, []);

  // Handle stats reset
  const handleResetStats = useCallback(() => {
    if (confirm('Are you sure you want to reset all statistics?')) {
      const newStats = resetStatistics();
      dispatch({ type: 'UPDATE_STATS', payload: newStats });
    }
  }, []);

  // Handle stats export
  const handleExportStats = useCallback(() => {
    if (!state.stats) return;

    try {
      const csv = exportStatisticsCSV(state.stats);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `blackjack-stats-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export statistics:', error);
      alert('Failed to export statistics. Please try again.');
    }
  }, [state.stats]);

  // Loading state
  if (!state.scenario || !state.stats) {
    return (
      <div className="min-h-screen flex items-center justify-center" role="status">
        <div className="text-white text-xl" aria-live="polite">
          Loading...
        </div>
      </div>
    );
  }

  // Get available actions
  const availableActions = getAvailableActions(
    state.scenario.playerCards,
    state.scenario.canDouble,
    state.scenario.canSplit,
    state.scenario.canSurrender,
    state.ui.level
  );

  return (
    <ErrorBoundary>
      <main className="min-h-screen p-4 flex flex-col">
        {/* Header */}
        <header className="mb-6 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Blackjack Strategy Trainer
          </h1>
          <p className="text-green-200 text-sm sm:text-base">
            Master basic strategy through practice
          </p>
        </header>

        {/* Stats Bar */}
        <StatsBar
          stats={state.stats}
          onReset={handleResetStats}
          onExport={handleExportStats}
        />

        {/* Level Selector */}
        <LevelSelector
          currentLevel={state.ui.level}
          onLevelChange={handleLevelChange}
          adaptiveSuggestion={adaptiveSuggestion}
        />

        {/* Game Area */}
        <GameArea
          dealerCard={state.scenario.dealerUpcard}
          playerCards={state.scenario.playerCards}
        />

        {/* Feedback */}
        <FeedbackPanel feedback={state.feedback} />

        {/* Action Buttons */}
        <ActionButtons
          availableActions={availableActions}
          onAction={handleAction}
          onNextHand={handleNextHand}
          showingFeedback={state.feedback.show}
        />

        {/* Hint Toggle */}
        <div className="text-center">
          <button
            onClick={() => dispatch({ type: 'TOGGLE_HINTS' })}
            className="text-green-300 hover:text-green-200 text-sm underline focus:outline-none focus:ring-2 focus:ring-green-400 rounded px-2 py-1"
            aria-label={state.ui.showHints ? 'Hide hints' : 'Show hints'}
            aria-expanded={state.ui.showHints}
          >
            {state.ui.showHints ? 'Hide' : 'Show'} Hints
          </button>
          {state.ui.showHints && !state.feedback.show && (
            <div className="mt-2 text-green-200 text-xs sm:text-sm" role="region" aria-live="polite">
              Think about: Is this a hard or soft hand? What&apos;s the dealer showing?
              <br />
              <span className="text-green-300 text-xs">
                Use keyboard shortcuts: H (Hit), S (Stand), D (Double), P (Split), R (Surrender)
              </span>
            </div>
          )}
        </div>
      </main>
    </ErrorBoundary>
  );
}
