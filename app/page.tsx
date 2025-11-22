'use client';

import { useReducer, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';
import StatsBar from '@/components/StatsBar';
import LevelSelector from '@/components/LevelSelector';
import GameArea from '@/components/GameArea';
import FeedbackPanel from '@/components/FeedbackPanel';
import ActionButtons from '@/components/ActionButtons';
import TrainingModeSelector from '@/components/TrainingModeSelector';
import SessionPanel from '@/components/SessionPanel';
import CardCountingTrainer from '@/components/CardCountingTrainer';
import MistakeReview from '@/components/MistakeReview';
import SpeedTraining from '@/components/SpeedTraining';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import SettingsPanel from '@/components/SettingsPanel';
import StrategyChart from '@/components/StrategyChart';
import {
  DifficultyLevel,
  PlayerAction,
  TrainingMode,
  TrainingSession,
  MistakeRecord,
  HandType,
  CountingStats,
} from '@/lib/types';
import { generateTrainingScenario } from '@/lib/gameEngine';
import { getBasicStrategyAction, getAvailableActions } from '@/lib/basicStrategy';
import { getHandType, calculateHandValue } from '@/lib/handValue';
import {
  loadStatistics,
  saveStatistics,
  updateStatistics,
  resetStatistics,
  exportStatisticsCSV,
  clearAllMistakes,
} from '@/lib/statistics';
import { gameReducer, createInitialState, loadUISettings } from '@/lib/gameReducer';
import { getSuggestedLevel } from '@/lib/adaptiveDifficulty';
import {
  createSession,
  endSession,
  updateSession as updateSessionFn,
  saveSessionToHistory,
  loadSessionHistory,
} from '@/lib/sessionManager';
import {
  createCountingStats,
  loadCountingStats,
  saveCountingStats,
} from '@/lib/cardCounting';
import {
  generateMasteryScenario,
  generateTargetedScenario,
  getScenarioExplanation,
} from '@/lib/adaptiveTraining';
import { getScenarioKey } from '@/lib/analytics';

export default function Home() {
  const [state, dispatch] = useReducer(gameReducer, createInitialState());
  const [scenarioStartTime, setScenarioStartTime] = useState<number>(Date.now());
  const [showSettings, setShowSettings] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showStrategyChart, setShowStrategyChart] = useState(false);
  const [countingStats, setCountingStats] = useState<CountingStats>(() => createCountingStats());
  const [sessionHistory, setSessionHistory] = useState<TrainingSession[]>([]);
  const [tournamentProgress, setTournamentProgress] = useState({ hands: 0, correct: 0 });
  const touchStartX = useRef<number>(0);

  // Apply dark mode to body
  useEffect(() => {
    if (state.uiSettings.darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [state.uiSettings.darkMode]);

  // Load all data on mount
  useEffect(() => {
    const stats = loadStatistics();
    dispatch({ type: 'UPDATE_STATS', payload: stats });

    const uiSettings = loadUISettings();
    dispatch({ type: 'SET_UI_SETTINGS', payload: uiSettings });

    const counting = loadCountingStats();
    setCountingStats(counting);

    const sessions = loadSessionHistory();
    setSessionHistory(sessions);
  }, []);

  // Generate initial scenario
  useEffect(() => {
    if (!state.scenario && state.stats && state.trainingMode === 'basic') {
      const scenario = generateTrainingScenario(state.ui.level);
      dispatch({ type: 'SET_SCENARIO', payload: scenario });
      setScenarioStartTime(Date.now());
    }
  }, [state.scenario, state.stats, state.ui.level, state.trainingMode]);

  // Memoized adaptive difficulty suggestion
  const adaptiveSuggestion = useMemo(() => {
    if (!state.stats || !state.config.adaptiveDifficulty) return null;
    return getSuggestedLevel(state.stats, state.ui.level);
  }, [state.stats, state.ui.level, state.config.adaptiveDifficulty]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const key = e.key.toLowerCase();

      // Level switching (1-4)
      if (['1', '2', '3', '4'].includes(key) && !state.feedback.show) {
        dispatch({ type: 'SET_LEVEL', payload: parseInt(key) as DifficultyLevel });
        return;
      }

      // Mode shortcuts
      if (key === 'c') {
        dispatch({ type: 'SET_TRAINING_MODE', payload: 'counting' });
        return;
      }
      if (key === 'm') {
        dispatch({ type: 'SET_TRAINING_MODE', payload: 'mistakes' });
        return;
      }
      if (key === 'escape') {
        dispatch({ type: 'SET_TRAINING_MODE', payload: 'basic' });
        setShowSettings(false);
        setShowAnalytics(false);
        return;
      }

      // Toggle hints
      if (key === '?') {
        dispatch({ type: 'TOGGLE_HINTS' });
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.feedback.show]);

  // Mobile gesture handling
  useEffect(() => {
    if (!state.uiSettings.mobileGestures) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchEndX - touchStartX.current;

      if (Math.abs(diff) > 100 && state.scenario && !state.feedback.show) {
        if (diff > 0) {
          // Swipe right = Stand
          handleAction('stand');
        } else {
          // Swipe left = Hit
          handleAction('hit');
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [state.uiSettings.mobileGestures, state.scenario, state.feedback.show]);

  // Handle player action
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
      const handValue = calculateHandValue(state.scenario.playerCards);
      const playerTotal = handValue.value;

      // Get explanation for feedback
      const explanation = getScenarioExplanation(
        playerTotal,
        state.scenario.dealerUpcard.rank,
        handType,
        correctAction
      );

      // Update statistics with full tracking
      const newStats = updateStatistics(
        state.stats,
        action,
        handType,
        isCorrect,
        decisionTime,
        state.scenario.dealerUpcard.rank,
        playerTotal,
        state.scenario.playerCards,
        state.scenario.dealerUpcard,
        correctAction,
        state.currentSession?.id
      );

      dispatch({ type: 'UPDATE_STATS', payload: newStats });
      saveStatistics(newStats);

      // Update session if active
      if (state.currentSession) {
        const mistake: MistakeRecord | undefined = !isCorrect ? {
          id: `mistake_${Date.now()}`,
          timestamp: Date.now(),
          playerCards: state.scenario.playerCards,
          dealerUpcard: state.scenario.dealerUpcard,
          playerAction: action,
          correctAction,
          handType,
          playerTotal,
          decisionTime,
          sessionId: state.currentSession.id,
        } : undefined;

        dispatch({
          type: 'UPDATE_SESSION',
          payload: {
            handsPlayed: state.currentSession.handsPlayed + 1,
            correctDecisions: state.currentSession.correctDecisions + (isCorrect ? 1 : 0),
            incorrectDecisions: state.currentSession.incorrectDecisions + (isCorrect ? 0 : 1),
            mistakes: mistake ? [...state.currentSession.mistakes, mistake] : state.currentSession.mistakes,
          },
        });
      }

      // Tournament mode progress
      if (state.trainingMode === 'tournament') {
        setTournamentProgress(prev => ({
          hands: prev.hands + 1,
          correct: prev.correct + (isCorrect ? 1 : 0),
        }));
      }

      // Show feedback
      dispatch({
        type: 'SET_FEEDBACK',
        payload: {
          show: true,
          correct: isCorrect,
          correctAction,
          playerAction: action,
          decisionTime,
          explanation: !isCorrect ? explanation : undefined,
        },
      });

      // Play sound if enabled
      if (state.uiSettings.soundEnabled) {
        // Sound would be played here
      }
    },
    [state.scenario, state.feedback.show, state.stats, state.ui.level, state.currentSession, state.trainingMode, state.uiSettings.soundEnabled, scenarioStartTime]
  );

  // Handle next hand
  const handleNextHand = useCallback(() => {
    let newScenario;

    // Generate scenario based on mode
    if (state.trainingMode === 'mastery' && state.stats) {
      newScenario = generateMasteryScenario(state.stats, state.ui.level, 95);
      if (!newScenario) {
        // All scenarios mastered!
        alert('Congratulations! You have mastered all scenarios at 95%+ accuracy!');
        dispatch({ type: 'SET_TRAINING_MODE', payload: 'basic' });
        return;
      }
    } else {
      newScenario = generateTrainingScenario(state.ui.level);
    }

    dispatch({ type: 'SET_SCENARIO', payload: newScenario });
    dispatch({ type: 'CLEAR_FEEDBACK' });
    setScenarioStartTime(Date.now());

    // Check tournament completion
    if (state.trainingMode === 'tournament' && tournamentProgress.hands >= 100) {
      const accuracy = Math.round((tournamentProgress.correct / 100) * 100);
      alert(`Tournament Complete!\n\nAccuracy: ${accuracy}%\nCorrect: ${tournamentProgress.correct}/100`);
      setTournamentProgress({ hands: 0, correct: 0 });
      dispatch({ type: 'SET_TRAINING_MODE', payload: 'basic' });
    }
  }, [state.ui.level, state.trainingMode, state.stats, tournamentProgress]);

  // Handle level change
  const handleLevelChange = useCallback((newLevel: DifficultyLevel) => {
    dispatch({ type: 'SET_LEVEL', payload: newLevel });
    setScenarioStartTime(Date.now());
  }, []);

  // Handle mode change
  const handleModeChange = useCallback((mode: TrainingMode) => {
    dispatch({ type: 'SET_TRAINING_MODE', payload: mode });

    if (mode === 'tournament') {
      setTournamentProgress({ hands: 0, correct: 0 });
    }

    // Generate appropriate scenario for mode
    if (mode === 'basic' || mode === 'flashcard' || mode === 'tournament') {
      const scenario = generateTrainingScenario(state.ui.level);
      dispatch({ type: 'SET_SCENARIO', payload: scenario });
      setScenarioStartTime(Date.now());
    }
  }, [state.ui.level]);

  // Handle session management
  const handleStartSession = useCallback((session: TrainingSession) => {
    dispatch({ type: 'START_SESSION', payload: session });
  }, []);

  const handleEndSession = useCallback(() => {
    if (state.currentSession) {
      const ended = endSession(state.currentSession);
      saveSessionToHistory(ended);
      setSessionHistory(prev => [ended, ...prev].slice(0, 100));
      dispatch({ type: 'END_SESSION' });
    }
  }, [state.currentSession]);

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

  // Handle practice scenario from analytics
  const handlePracticeScenario = useCallback((playerTotal: number, dealer: string, handType: HandType) => {
    const scenario = generateTargetedScenario(playerTotal, dealer, handType, state.ui.level);
    dispatch({ type: 'SET_SCENARIO', payload: scenario });
    dispatch({ type: 'SET_TRAINING_MODE', payload: 'basic' });
    setScenarioStartTime(Date.now());
    setShowAnalytics(false);
  }, [state.ui.level]);

  // Handle counting stats update
  const handleCountingStatsUpdate = useCallback((stats: CountingStats) => {
    setCountingStats(stats);
    saveCountingStats(stats);
  }, []);

  // Handle clear mistakes
  const handleClearMistakes = useCallback(() => {
    if (!state.stats) return;
    const newStats = clearAllMistakes(state.stats);
    dispatch({ type: 'UPDATE_STATS', payload: newStats });
    saveStatistics(newStats);
  }, [state.stats]);

  // Handle import data
  const handleImportData = useCallback((data: any) => {
    if (data.statistics) {
      dispatch({ type: 'UPDATE_STATS', payload: data.statistics });
      saveStatistics(data.statistics);
    }
    if (data.sessions) {
      setSessionHistory(data.sessions);
    }
    if (data.countingStats) {
      setCountingStats(data.countingStats);
      saveCountingStats(data.countingStats);
    }
    if (data.uiSettings) {
      dispatch({ type: 'SET_UI_SETTINGS', payload: data.uiSettings });
    }
  }, []);

  // Handle reset all
  const handleResetAll = useCallback(() => {
    localStorage.clear();
    window.location.reload();
  }, []);

  // Loading state
  if (!state.stats) {
    return (
      <div className="min-h-screen flex items-center justify-center" role="status">
        <div className="text-white text-xl" aria-live="polite">
          Loading...
        </div>
      </div>
    );
  }

  const darkMode = state.uiSettings.darkMode;

  // Render based on training mode
  const renderMainContent = () => {
    // Settings panel
    if (showSettings) {
      return (
        <SettingsPanel
          settings={state.uiSettings}
          stats={state.stats!}
          config={state.config}
          countingStats={countingStats}
          onSettingsChange={(s) => dispatch({ type: 'SET_UI_SETTINGS', payload: s })}
          onImportData={handleImportData}
          onResetAll={handleResetAll}
          darkMode={darkMode}
        />
      );
    }

    // Analytics dashboard
    if (showAnalytics) {
      return (
        <AnalyticsDashboard
          stats={state.stats!}
          sessions={sessionHistory}
          onPracticeScenario={handlePracticeScenario}
          darkMode={darkMode}
        />
      );
    }

    // Card counting mode
    if (state.trainingMode === 'counting' || state.trainingMode === 'deviation') {
      return (
        <CardCountingTrainer
          countingStats={countingStats}
          onStatsUpdate={handleCountingStatsUpdate}
          darkMode={darkMode}
        />
      );
    }

    // Mistake review mode
    if (state.trainingMode === 'mistakes') {
      return (
        <MistakeReview
          stats={state.stats!}
          onPracticeScenario={(mistake) => {
            handlePracticeScenario(mistake.playerTotal, mistake.dealerUpcard.rank, mistake.handType);
          }}
          onClearMistakes={handleClearMistakes}
          darkMode={darkMode}
        />
      );
    }

    // Speed training mode
    if (state.trainingMode === 'speed') {
      return (
        <SpeedTraining
          stats={state.stats!}
          level={state.ui.level}
          onDecision={(action, correct, time) => {
            // Stats are tracked within the component
          }}
          darkMode={darkMode}
        />
      );
    }

    // Basic strategy training (default)
    if (!state.scenario) {
      return (
        <div className="text-white text-center py-8">Loading scenario...</div>
      );
    }

    const availableActions = getAvailableActions(
      state.scenario.playerCards,
      state.scenario.canDouble,
      state.scenario.canSplit,
      state.scenario.canSurrender,
      state.ui.level
    );

    return (
      <>
        {/* Tournament Progress */}
        {state.trainingMode === 'tournament' && (
          <div className={`mb-4 p-3 rounded ${darkMode ? 'bg-gray-800' : 'bg-green-900/50'} text-center`}>
            <span className="text-white">Tournament Progress: </span>
            <span className="font-bold text-yellow-400">{tournamentProgress.hands}/100</span>
            <span className="text-white"> | Correct: </span>
            <span className="font-bold text-green-400">{tournamentProgress.correct}</span>
          </div>
        )}

        {/* Level Selector */}
        {state.trainingMode !== 'tournament' && (
          <LevelSelector
            currentLevel={state.ui.level}
            onLevelChange={handleLevelChange}
            adaptiveSuggestion={adaptiveSuggestion}
          />
        )}

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
          >
            {state.ui.showHints ? 'Hide' : 'Show'} Hints
          </button>
          {state.ui.showHints && !state.feedback.show && (
            <div className="mt-2 text-green-200 text-xs sm:text-sm">
              Think about: Is this a hard or soft hand? What&apos;s the dealer showing?
              <br />
              <span className="text-green-300 text-xs">
                Keyboard: H=Hit, S=Stand, D=Double, P=Split, R=Surrender | 1-4=Level | C=Counting | M=Mistakes
              </span>
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <ErrorBoundary>
      <main className="min-h-screen p-4 flex flex-col">
        {/* Header */}
        <header className="mb-4 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className={`text-2xl sm:text-3xl font-bold ${darkMode ? 'text-gray-100' : 'text-white'}`}>
              Blackjack Trainer Pro
            </h1>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-green-200'}`}>
              Master basic strategy through deliberate practice
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowStrategyChart(!showStrategyChart)}
              className={`px-3 py-1 rounded text-sm ${
                darkMode ? 'bg-gray-700 text-gray-300' : 'bg-green-700 text-white'
              } hover:opacity-80`}
            >
              Chart
            </button>
            <button
              onClick={() => { setShowAnalytics(!showAnalytics); setShowSettings(false); }}
              className={`px-3 py-1 rounded text-sm ${
                showAnalytics ? 'bg-blue-600 text-white' : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-green-700 text-white'
              } hover:opacity-80`}
            >
              Analytics
            </button>
            <button
              onClick={() => { setShowSettings(!showSettings); setShowAnalytics(false); }}
              className={`px-3 py-1 rounded text-sm ${
                showSettings ? 'bg-blue-600 text-white' : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-green-700 text-white'
              } hover:opacity-80`}
            >
              Settings
            </button>
          </div>
        </header>

        {/* Stats Bar */}
        <StatsBar
          stats={state.stats}
          onReset={handleResetStats}
          onExport={handleExportStats}
        />

        {/* Training Mode Selector */}
        {!showSettings && !showAnalytics && (
          <div className="mb-4">
            <TrainingModeSelector
              currentMode={state.trainingMode}
              onModeChange={handleModeChange}
              darkMode={darkMode}
            />
          </div>
        )}

        {/* Session Panel */}
        {!showSettings && !showAnalytics && state.trainingMode !== 'counting' && state.trainingMode !== 'speed' && (
          <div className="mb-4">
            <SessionPanel
              currentSession={state.currentSession}
              sessionHistory={sessionHistory}
              currentMode={state.trainingMode}
              currentLevel={state.ui.level}
              onStartSession={handleStartSession}
              onEndSession={handleEndSession}
              darkMode={darkMode}
            />
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1">
          {renderMainContent()}
        </div>

        {/* Strategy Chart Overlay */}
        {(showStrategyChart || state.uiSettings.showStrategyChart) && (
          <StrategyChart
            onClose={() => {
              setShowStrategyChart(false);
              dispatch({ type: 'SET_UI_SETTINGS', payload: { showStrategyChart: false } });
            }}
            darkMode={darkMode}
          />
        )}

        {/* Mobile gesture zones (visual hint) */}
        {state.uiSettings.mobileGestures && !state.feedback.show && state.trainingMode === 'basic' && (
          <>
            <div className="gesture-zone-left" />
            <div className="gesture-zone-right" />
          </>
        )}
      </main>
    </ErrorBoundary>
  );
}
