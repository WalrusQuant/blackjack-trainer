'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardCountingState, CountingStats } from '@/lib/types';
import {
  createShoe,
  createCountingState,
  dealCountingCard,
  checkCount,
  getHiLoValue,
  HI_LO_VALUES,
  ILLUSTRIOUS_18,
  generateDeviationScenario,
  updateCountingStats,
  saveCountingStats,
} from '@/lib/cardCounting';
import CardComponent from './Card';

interface CardCountingTrainerProps {
  countingStats: CountingStats;
  onStatsUpdate: (stats: CountingStats) => void;
  darkMode?: boolean;
}

type CountingMode = 'practice' | 'speed' | 'deviation';

export default function CardCountingTrainer({
  countingStats,
  onStatsUpdate,
  darkMode = false,
}: CardCountingTrainerProps) {
  const [mode, setMode] = useState<CountingMode>('practice');
  const [countingState, setCountingState] = useState<CardCountingState>(() => createCountingState(6));
  const [deck, setDeck] = useState<Card[]>(() => createShoe(6));
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [userCount, setUserCount] = useState<string>('');
  const [userTrueCount, setUserTrueCount] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [showCount, setShowCount] = useState(false);
  const [cardsPerSecond, setCardsPerSecond] = useState(1);
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);
  const [deviationScenario, setDeviationScenario] = useState<ReturnType<typeof generateDeviationScenario> | null>(null);
  const [userDeviationAnswer, setUserDeviationAnswer] = useState<string>('');

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Deal next card
  const dealNext = useCallback(() => {
    if (deck.length === 0) {
      setIsRunning(false);
      // End of shoe - record stats
      const accuracy = countingState.totalCards > 0
        ? (countingState.correctCounts / (countingState.correctCounts + countingState.incorrectCounts)) * 100
        : 0;
      const speed = (Date.now() - sessionStartTime) / countingState.cardsDealt.length;

      const newStats = updateCountingStats(
        countingStats,
        accuracy,
        speed,
        countingState.cardsDealt.length,
        countingState.correctCounts,
        countingState.correctCounts + countingState.incorrectCounts
      );
      onStatsUpdate(newStats);
      saveCountingStats(newStats);
      setFeedback(`Shoe complete! Accuracy: ${accuracy.toFixed(1)}%`);
      return;
    }

    const { newState, card, remainingDeck } = dealCountingCard(countingState, deck);
    setCountingState(newState);
    setDeck(remainingDeck);
    setCurrentCard(card);
    setFeedback('');
  }, [deck, countingState, countingStats, onStatsUpdate, sessionStartTime]);

  // Handle speed mode auto-deal
  useEffect(() => {
    if (mode === 'speed' && isRunning) {
      intervalRef.current = setInterval(() => {
        dealNext();
      }, 1000 / cardsPerSecond);

      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [mode, isRunning, cardsPerSecond, dealNext]);

  // Start new session
  const startSession = () => {
    const newDeck = createShoe(6);
    const newState = createCountingState(6);
    setDeck(newDeck);
    setCountingState(newState);
    setCurrentCard(null);
    setUserCount('');
    setUserTrueCount('');
    setFeedback('');
    setIsRunning(true);
    setShowCount(false);
    setSessionStartTime(Date.now());

    // Deal first card
    const { newState: firstState, card, remainingDeck } = dealCountingCard(newState, newDeck);
    setCountingState(firstState);
    setDeck(remainingDeck);
    setCurrentCard(card);
  };

  // Check user's count
  const checkUserCount = () => {
    const runningCount = parseInt(userCount, 10);
    const trueCount = userTrueCount ? parseFloat(userTrueCount) : undefined;

    if (isNaN(runningCount)) {
      setFeedback('Please enter a valid number');
      return;
    }

    const result = checkCount(countingState, runningCount, trueCount);

    setCountingState(prev => ({
      ...prev,
      correctCounts: prev.correctCounts + (result.isCorrect ? 1 : 0),
      incorrectCounts: prev.incorrectCounts + (result.isCorrect ? 0 : 1),
    }));

    setFeedback(result.feedback);
    setUserCount('');
    setUserTrueCount('');

    // Deal next card after short delay
    setTimeout(() => {
      dealNext();
      inputRef.current?.focus();
    }, 1500);
  };

  // Handle deviation practice
  const startDeviationPractice = () => {
    setMode('deviation');
    const scenario = generateDeviationScenario();
    setDeviationScenario(scenario);
    setUserDeviationAnswer('');
    setFeedback('');
  };

  const checkDeviationAnswer = () => {
    if (!deviationScenario) return;

    const correctAnswer = deviationScenario.shouldDeviate
      ? deviationScenario.indexPlay.deviation
      : deviationScenario.indexPlay.basicStrategy;

    const isCorrect = userDeviationAnswer.toLowerCase() === correctAnswer;

    setFeedback(
      isCorrect
        ? 'Correct!'
        : `Incorrect. The correct play is ${correctAnswer}. ${deviationScenario.indexPlay.description}`
    );

    // Next scenario after delay
    setTimeout(() => {
      const scenario = generateDeviationScenario();
      setDeviationScenario(scenario);
      setUserDeviationAnswer('');
      setFeedback('');
    }, 3000);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mode === 'practice' && isRunning) {
        if (e.key === 'Enter') {
          e.preventDefault();
          checkUserCount();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, isRunning, userCount, userTrueCount]);

  const bgClass = darkMode ? 'bg-gray-800' : 'bg-green-900/50';
  const textClass = darkMode ? 'text-gray-200' : 'text-white';
  const mutedClass = darkMode ? 'text-gray-400' : 'text-green-200';

  return (
    <div className={`${bgClass} backdrop-blur-sm rounded-lg p-4 sm:p-6`}>
      <h2 className={`text-xl font-bold ${textClass} mb-4`}>Card Counting Trainer</h2>

      {/* Mode Selection */}
      <div className="flex gap-2 mb-6">
        {(['practice', 'speed', 'deviation'] as CountingMode[]).map(m => (
          <button
            key={m}
            onClick={() => {
              setMode(m);
              setIsRunning(false);
              if (m === 'deviation') startDeviationPractice();
            }}
            className={`px-4 py-2 rounded font-medium transition-colors ${
              mode === m
                ? 'bg-blue-600 text-white'
                : darkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-green-700 text-green-100 hover:bg-green-600'
            }`}
          >
            {m === 'practice' ? 'Practice' : m === 'speed' ? 'Speed Drill' : 'Deviations'}
          </button>
        ))}
      </div>

      {/* Hi-Lo Reference */}
      <div className={`mb-6 p-3 rounded ${darkMode ? 'bg-gray-700' : 'bg-green-800/50'}`}>
        <p className={`text-sm ${mutedClass} mb-2`}>Hi-Lo Count Values:</p>
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="text-green-400">+1: 2-6</span>
          <span className={mutedClass}>0: 7-9</span>
          <span className="text-red-400">-1: 10-A</span>
        </div>
      </div>

      {/* Practice Mode */}
      {mode === 'practice' && (
        <div>
          {!isRunning ? (
            <button
              onClick={startSession}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg"
            >
              Start Counting Session
            </button>
          ) : (
            <div className="space-y-4">
              {/* Current Card */}
              {currentCard && (
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <CardComponent card={currentCard} delay={0} />
                    <span className={`absolute -bottom-6 left-1/2 -translate-x-1/2 text-lg font-bold ${
                      getHiLoValue(currentCard) > 0
                        ? 'text-green-400'
                        : getHiLoValue(currentCard) < 0
                        ? 'text-red-400'
                        : mutedClass
                    }`}>
                      {getHiLoValue(currentCard) > 0 ? '+' : ''}{getHiLoValue(currentCard)}
                    </span>
                  </div>
                </div>
              )}

              {/* Cards dealt info */}
              <div className={`text-center ${mutedClass}`}>
                Cards dealt: {countingState.cardsDealt.length} / {countingState.totalCards}
                {' | '}
                Decks remaining: {countingState.decksRemaining.toFixed(1)}
              </div>

              {/* Count inputs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <div>
                  <label className={`block text-sm ${mutedClass} mb-1`}>Running Count</label>
                  <input
                    ref={inputRef}
                    type="number"
                    value={userCount}
                    onChange={e => setUserCount(e.target.value)}
                    className="w-24 px-3 py-2 rounded bg-gray-700 text-white text-center"
                    placeholder="0"
                    autoFocus
                  />
                </div>
                <div>
                  <label className={`block text-sm ${mutedClass} mb-1`}>True Count (optional)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={userTrueCount}
                    onChange={e => setUserTrueCount(e.target.value)}
                    className="w-24 px-3 py-2 rounded bg-gray-700 text-white text-center"
                    placeholder="0"
                  />
                </div>
                <button
                  onClick={checkUserCount}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium mt-4 sm:mt-6"
                >
                  Check
                </button>
              </div>

              {/* Show/Hide Count */}
              <div className="text-center">
                <button
                  onClick={() => setShowCount(!showCount)}
                  className={`text-sm ${mutedClass} underline`}
                >
                  {showCount ? 'Hide' : 'Show'} actual count
                </button>
                {showCount && (
                  <div className={`mt-2 ${textClass}`}>
                    Running: {countingState.runningCount} | True: {countingState.trueCount.toFixed(1)}
                  </div>
                )}
              </div>

              {/* Feedback */}
              {feedback && (
                <div className={`text-center text-lg font-medium ${
                  feedback.includes('Correct') ? 'text-green-400' : 'text-red-400'
                }`}>
                  {feedback}
                </div>
              )}

              {/* Stats */}
              <div className={`text-center ${mutedClass}`}>
                Session: {countingState.correctCounts} correct / {countingState.correctCounts + countingState.incorrectCounts} total
              </div>
            </div>
          )}
        </div>
      )}

      {/* Speed Mode */}
      {mode === 'speed' && (
        <div className="space-y-4">
          <div className="flex items-center gap-4 justify-center">
            <label className={mutedClass}>Speed:</label>
            <input
              type="range"
              min="0.5"
              max="4"
              step="0.5"
              value={cardsPerSecond}
              onChange={e => setCardsPerSecond(parseFloat(e.target.value))}
              className="w-32"
            />
            <span className={textClass}>{cardsPerSecond} cards/sec</span>
          </div>

          {!isRunning ? (
            <div className="text-center">
              <button
                onClick={startSession}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg"
              >
                Start Speed Drill
              </button>
              <p className={`mt-2 text-sm ${mutedClass}`}>
                Cards will flash at your selected speed. Track the count mentally!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentCard && (
                <div className="flex justify-center">
                  <CardComponent card={currentCard} delay={0} />
                </div>
              )}

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded font-medium"
                >
                  {isRunning ? 'Pause' : 'Resume'}
                </button>
                <button
                  onClick={() => setShowCount(!showCount)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded font-medium"
                >
                  {showCount ? 'Hide Count' : 'Check Count'}
                </button>
              </div>

              {showCount && (
                <div className={`text-center text-xl ${textClass}`}>
                  Running Count: {countingState.runningCount}
                  <br />
                  True Count: {countingState.trueCount.toFixed(1)}
                </div>
              )}

              <div className={`text-center ${mutedClass}`}>
                {countingState.cardsDealt.length} cards dealt
              </div>
            </div>
          )}
        </div>
      )}

      {/* Deviation Mode */}
      {mode === 'deviation' && deviationScenario && (
        <div className="space-y-4">
          <div className={`p-4 rounded ${darkMode ? 'bg-gray-700' : 'bg-green-800/50'}`}>
            <p className={`text-lg ${textClass} mb-2`}>
              {deviationScenario.indexPlay.name}
            </p>
            <p className={mutedClass}>
              Player hand: {deviationScenario.indexPlay.playerHand} vs Dealer {deviationScenario.indexPlay.dealerUpcard}
            </p>
            <p className={`text-xl font-bold ${textClass} mt-2`}>
              True Count: {deviationScenario.trueCount > 0 ? '+' : ''}{deviationScenario.trueCount}
            </p>
          </div>

          <div className="flex gap-2 justify-center flex-wrap">
            {['hit', 'stand', 'double', 'split', 'surrender'].map(action => (
              <button
                key={action}
                onClick={() => {
                  setUserDeviationAnswer(action);
                }}
                className={`px-4 py-2 rounded font-medium capitalize transition-colors ${
                  userDeviationAnswer === action
                    ? 'bg-blue-600 text-white'
                    : darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-green-700 text-green-100 hover:bg-green-600'
                }`}
              >
                {action}
              </button>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={checkDeviationAnswer}
              disabled={!userDeviationAnswer}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white font-bold rounded-lg"
            >
              Submit Answer
            </button>
          </div>

          {feedback && (
            <div className={`text-center p-4 rounded ${
              feedback.includes('Correct')
                ? 'bg-green-600/20 text-green-400'
                : 'bg-red-600/20 text-red-400'
            }`}>
              {feedback}
            </div>
          )}

          {/* Illustrious 18 Reference */}
          <details className={`mt-4 ${mutedClass}`}>
            <summary className="cursor-pointer">View Illustrious 18 Reference</summary>
            <div className="mt-2 text-sm space-y-1 max-h-48 overflow-y-auto">
              {ILLUSTRIOUS_18.map(play => (
                <div key={play.id} className="flex justify-between">
                  <span>{play.name}</span>
                  <span>
                    {play.indexCount >= 0 ? '+' : ''}{play.indexCount}: {play.deviation}
                  </span>
                </div>
              ))}
            </div>
          </details>
        </div>
      )}

      {/* Overall Stats */}
      <div className={`mt-6 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-green-700'}`}>
        <h3 className={`font-medium ${textClass} mb-2`}>Counting Statistics</h3>
        <div className={`grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm ${mutedClass}`}>
          <div>
            <div className={textClass}>{countingStats.totalAttempts}</div>
            <div>Total Attempts</div>
          </div>
          <div>
            <div className={textClass}>
              {countingStats.totalAttempts > 0
                ? Math.round((countingStats.correctAttempts / countingStats.totalAttempts) * 100)
                : 0}%
            </div>
            <div>Accuracy</div>
          </div>
          <div>
            <div className={textClass}>
              {countingStats.avgSpeed > 0 ? `${(countingStats.avgSpeed / 1000).toFixed(1)}s` : 'N/A'}
            </div>
            <div>Avg Speed/Card</div>
          </div>
          <div>
            <div className={textClass}>{countingStats.bestAccuracy}%</div>
            <div>Best Accuracy</div>
          </div>
        </div>
      </div>
    </div>
  );
}
