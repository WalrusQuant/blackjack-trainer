'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { SpeedChallenge, Statistics, SpeedRecord, TrainingScenario, PlayerAction } from '@/lib/types';
import { generateTrainingScenario } from '@/lib/gameEngine';
import { getBasicStrategyAction, getAvailableActions } from '@/lib/basicStrategy';
import { getHandType, calculateHandValue } from '@/lib/handValue';
import GameArea from './GameArea';

interface SpeedTrainingProps {
  stats: Statistics;
  level: number;
  onDecision: (action: PlayerAction, correct: boolean, time: number) => void;
  darkMode?: boolean;
}

const SPEED_LEVELS: SpeedChallenge[] = [
  { level: 'beginner', timeLimit: 5000, handsRequired: 20, accuracyRequired: 80 },
  { level: 'intermediate', timeLimit: 3000, handsRequired: 30, accuracyRequired: 85 },
  { level: 'advanced', timeLimit: 2000, handsRequired: 40, accuracyRequired: 90 },
  { level: 'expert', timeLimit: 1500, handsRequired: 50, accuracyRequired: 95 },
];

const STORAGE_KEY = 'blackjack-speed-records';

function loadSpeedRecords(): SpeedRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveSpeedRecords(records: SpeedRecord[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records.slice(-100)));
}

export default function SpeedTraining({
  stats,
  level,
  onDecision,
  darkMode = false,
}: SpeedTrainingProps) {
  const [challenge, setChallenge] = useState<SpeedChallenge | null>(null);
  const [scenario, setScenario] = useState<TrainingScenario | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [handsCompleted, setHandsCompleted] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);
  const [records, setRecords] = useState<SpeedRecord[]>(() => loadSpeedRecords());
  const [showResults, setShowResults] = useState(false);

  const scenarioStartRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const bgClass = darkMode ? 'bg-gray-800' : 'bg-green-900/50';
  const textClass = darkMode ? 'text-gray-200' : 'text-white';
  const mutedClass = darkMode ? 'text-gray-400' : 'text-green-200';
  const borderClass = darkMode ? 'border-gray-700' : 'border-green-700';

  // Start a new hand
  const startHand = useCallback(() => {
    if (!challenge) return;

    const newScenario = generateTrainingScenario(level as 1 | 2 | 3 | 4);
    setScenario(newScenario);
    setTimeRemaining(challenge.timeLimit);
    setFeedback(null);
    scenarioStartRef.current = Date.now();

    // Start countdown
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 100) {
          // Time's up - count as wrong
          clearInterval(timerRef.current!);
          handleTimeout();
          return 0;
        }
        return prev - 100;
      });
    }, 100);
  }, [challenge, level]);

  // Handle timeout
  const handleTimeout = () => {
    if (!scenario) return;

    const correctAction = getBasicStrategyAction(
      scenario.playerCards,
      scenario.dealerUpcard,
      scenario.canDouble,
      scenario.canSplit,
      scenario.canSurrender,
      level as 1 | 2 | 3 | 4
    );

    setFeedback({ correct: false, message: `Time's up! Correct: ${correctAction}` });
    setHandsCompleted(prev => prev + 1);

    setTimeout(() => {
      if (handsCompleted + 1 >= (challenge?.handsRequired || 0)) {
        endChallenge();
      } else {
        startHand();
      }
    }, 1500);
  };

  // Handle player action
  const handleAction = (action: PlayerAction) => {
    if (!scenario || !isRunning || feedback) return;

    clearInterval(timerRef.current!);
    const decisionTime = Date.now() - scenarioStartRef.current;

    const correctAction = getBasicStrategyAction(
      scenario.playerCards,
      scenario.dealerUpcard,
      scenario.canDouble,
      scenario.canSplit,
      scenario.canSurrender,
      level as 1 | 2 | 3 | 4
    );

    const isCorrect = action === correctAction;

    setFeedback({
      correct: isCorrect,
      message: isCorrect ? `Correct! (${(decisionTime / 1000).toFixed(1)}s)` : `Wrong! Correct: ${correctAction}`,
    });

    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
      setTotalTime(prev => prev + decisionTime);
    }

    setHandsCompleted(prev => prev + 1);
    onDecision(action, isCorrect, decisionTime);

    setTimeout(() => {
      if (handsCompleted + 1 >= (challenge?.handsRequired || 0)) {
        endChallenge();
      } else {
        startHand();
      }
    }, 1000);
  };

  // End challenge and record results
  const endChallenge = () => {
    setIsRunning(false);
    setShowResults(true);

    if (!challenge) return;

    const accuracy = handsCompleted > 0 ? Math.round((correctCount / handsCompleted) * 100) : 0;
    const avgTime = correctCount > 0 ? totalTime / correctCount : 0;

    const newRecord: SpeedRecord = {
      timestamp: Date.now(),
      avgTime,
      accuracy,
      handsPlayed: handsCompleted,
      level: challenge.level,
    };

    const updatedRecords = [...records, newRecord];
    setRecords(updatedRecords);
    saveSpeedRecords(updatedRecords);
  };

  // Start challenge
  const startChallenge = (selectedChallenge: SpeedChallenge) => {
    setChallenge(selectedChallenge);
    setHandsCompleted(0);
    setCorrectCount(0);
    setTotalTime(0);
    setShowResults(false);
    setIsRunning(true);
  };

  // Start first hand when challenge begins
  useEffect(() => {
    if (isRunning && challenge && !scenario) {
      startHand();
    }
  }, [isRunning, challenge, scenario, startHand]);

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Get best record for a level
  const getBestRecord = (levelName: SpeedChallenge['level']) => {
    const levelRecords = records.filter(r => r.level === levelName && r.accuracy >= SPEED_LEVELS.find(l => l.level === levelName)!.accuracyRequired);
    if (levelRecords.length === 0) return null;
    return levelRecords.reduce((best, r) => r.avgTime < best.avgTime ? r : best);
  };

  // Results screen
  if (showResults && challenge) {
    const accuracy = handsCompleted > 0 ? Math.round((correctCount / handsCompleted) * 100) : 0;
    const avgTime = correctCount > 0 ? totalTime / correctCount : 0;
    const passed = accuracy >= challenge.accuracyRequired;
    const bestRecord = getBestRecord(challenge.level);
    const isNewRecord = bestRecord && avgTime < bestRecord.avgTime && passed;

    return (
      <div className={`${bgClass} backdrop-blur-sm rounded-lg p-6 ${borderClass} border text-center`}>
        <h2 className={`text-2xl font-bold ${textClass} mb-4`}>
          {passed ? 'Challenge Complete!' : 'Challenge Failed'}
        </h2>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className={`p-4 rounded ${darkMode ? 'bg-gray-700' : 'bg-green-800/50'}`}>
            <div className={`text-3xl font-bold ${accuracy >= challenge.accuracyRequired ? 'text-green-400' : 'text-red-400'}`}>
              {accuracy}%
            </div>
            <div className={mutedClass}>Accuracy (need {challenge.accuracyRequired}%)</div>
          </div>
          <div className={`p-4 rounded ${darkMode ? 'bg-gray-700' : 'bg-green-800/50'}`}>
            <div className={`text-3xl font-bold ${textClass}`}>
              {(avgTime / 1000).toFixed(2)}s
            </div>
            <div className={mutedClass}>Avg Decision Time</div>
          </div>
        </div>

        {isNewRecord && (
          <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500 rounded text-yellow-400 font-medium">
            New Personal Record!
          </div>
        )}

        {bestRecord && (
          <p className={`mb-4 ${mutedClass}`}>
            Your best: {(bestRecord.avgTime / 1000).toFixed(2)}s at {bestRecord.accuracy}% accuracy
          </p>
        )}

        <div className="flex gap-2 justify-center">
          <button
            onClick={() => startChallenge(challenge)}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium"
          >
            Try Again
          </button>
          <button
            onClick={() => {
              setChallenge(null);
              setShowResults(false);
              setScenario(null);
            }}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded font-medium"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  // Active challenge
  if (isRunning && scenario && challenge) {
    const availableActions = getAvailableActions(
      scenario.playerCards,
      scenario.canDouble,
      scenario.canSplit,
      scenario.canSurrender,
      level as 1 | 2 | 3 | 4
    );

    const timerPercent = (timeRemaining / challenge.timeLimit) * 100;

    return (
      <div className={`${bgClass} backdrop-blur-sm rounded-lg p-4 ${borderClass} border`}>
        {/* Timer Bar */}
        <div className="h-2 bg-gray-700 rounded-full mb-4 overflow-hidden">
          <div
            className={`h-full transition-all duration-100 ${
              timerPercent > 50 ? 'bg-green-500' : timerPercent > 25 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${timerPercent}%` }}
          />
        </div>

        {/* Progress */}
        <div className="flex justify-between items-center mb-4">
          <span className={textClass}>
            Hand {handsCompleted + 1} / {challenge.handsRequired}
          </span>
          <span className={`text-xl font-mono ${timeRemaining < 1000 ? 'text-red-400' : textClass}`}>
            {(timeRemaining / 1000).toFixed(1)}s
          </span>
          <span className={correctCount > 0 ? 'text-green-400' : mutedClass}>
            {correctCount} correct
          </span>
        </div>

        {/* Game Area */}
        <GameArea
          dealerCard={scenario.dealerUpcard}
          playerCards={scenario.playerCards}
        />

        {/* Feedback */}
        {feedback && (
          <div className={`text-center text-lg font-medium my-4 ${
            feedback.correct ? 'text-green-400' : 'text-red-400'
          }`}>
            {feedback.message}
          </div>
        )}

        {/* Action Buttons */}
        {!feedback && (
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {availableActions.map(action => (
              <button
                key={action}
                onClick={() => handleAction(action)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg uppercase"
              >
                {action}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Challenge selection
  return (
    <div className={`${bgClass} backdrop-blur-sm rounded-lg p-6 ${borderClass} border`}>
      <h2 className={`text-xl font-bold ${textClass} mb-4`}>Speed Training</h2>
      <p className={`${mutedClass} mb-6`}>
        Make correct decisions before time runs out! Beat your own records.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {SPEED_LEVELS.map(speedLevel => {
          const bestRecord = getBestRecord(speedLevel.level);

          return (
            <button
              key={speedLevel.level}
              onClick={() => startChallenge(speedLevel)}
              className={`p-4 rounded-lg text-left transition-colors ${
                darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-green-800/50 hover:bg-green-700/50'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className={`font-bold ${textClass} capitalize`}>{speedLevel.level}</span>
                <span className={mutedClass}>{speedLevel.timeLimit / 1000}s/hand</span>
              </div>
              <div className={`text-sm ${mutedClass}`}>
                {speedLevel.handsRequired} hands • {speedLevel.accuracyRequired}% required
              </div>
              {bestRecord && (
                <div className="text-sm text-green-400 mt-2">
                  Best: {(bestRecord.avgTime / 1000).toFixed(2)}s @ {bestRecord.accuracy}%
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Personal Records */}
      {records.length > 0 && (
        <div className="mt-6">
          <h3 className={`font-medium ${textClass} mb-2`}>Recent Attempts</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {records.slice(-5).reverse().map((record, i) => (
              <div
                key={i}
                className={`flex justify-between text-sm p-2 rounded ${
                  darkMode ? 'bg-gray-700' : 'bg-green-800/30'
                }`}
              >
                <span className={`capitalize ${textClass}`}>{record.level}</span>
                <span className={mutedClass}>
                  {record.accuracy}% • {(record.avgTime / 1000).toFixed(2)}s avg
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
