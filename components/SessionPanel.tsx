'use client';

import { useState } from 'react';
import {
  TrainingSession,
  TrainingMode,
  DifficultyLevel,
  SessionGoal,
} from '@/lib/types';
import {
  createSession,
  createGoals,
  getSessionSummary,
  getSessionAccuracy,
  formatDuration,
  getSessionDuration,
} from '@/lib/sessionManager';

interface SessionPanelProps {
  currentSession: TrainingSession | null;
  sessionHistory: TrainingSession[];
  currentMode: TrainingMode;
  currentLevel: DifficultyLevel;
  onStartSession: (session: TrainingSession) => void;
  onEndSession: () => void;
  darkMode?: boolean;
}

const MODE_LABELS: Record<TrainingMode, string> = {
  basic: 'Basic Strategy',
  counting: 'Card Counting',
  speed: 'Speed Training',
  flashcard: 'Flash Cards',
  tournament: 'Tournament',
  custom: 'Custom Practice',
  mastery: 'Mastery Mode',
  deviation: 'Index Plays',
  mistakes: 'Mistake Review',
};

export default function SessionPanel({
  currentSession,
  sessionHistory,
  currentMode,
  currentLevel,
  onStartSession,
  onEndSession,
  darkMode = false,
}: SessionPanelProps) {
  const [showGoalSetup, setShowGoalSetup] = useState(false);
  const [goalHands, setGoalHands] = useState<number>(50);
  const [goalAccuracy, setGoalAccuracy] = useState<number>(90);
  const [goalTime, setGoalTime] = useState<number>(15);
  const [showHistory, setShowHistory] = useState(false);

  const bgClass = darkMode ? 'bg-gray-800' : 'bg-green-900/50';
  const textClass = darkMode ? 'text-gray-200' : 'text-white';
  const mutedClass = darkMode ? 'text-gray-400' : 'text-green-200';
  const borderClass = darkMode ? 'border-gray-700' : 'border-green-700';

  const handleStartSession = () => {
    const goals = createGoals({
      hands: goalHands,
      accuracy: goalAccuracy,
      timeMinutes: goalTime,
    });

    const session = createSession(currentMode, currentLevel, goals);
    onStartSession(session);
    setShowGoalSetup(false);
  };

  // Current session display
  if (currentSession) {
    const summary = getSessionSummary(currentSession);
    const elapsed = Math.floor((Date.now() - currentSession.startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;

    return (
      <div className={`${bgClass} backdrop-blur-sm rounded-lg p-4 ${borderClass} border`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`font-bold ${textClass}`}>Current Session</h3>
          <span className={`text-sm ${mutedClass}`}>
            {MODE_LABELS[currentSession.mode]} - Level {currentSession.level}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className={`text-2xl font-bold ${textClass}`}>{summary.handsPlayed}</div>
            <div className={`text-xs ${mutedClass}`}>Hands</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${summary.accuracy >= 90 ? 'text-green-400' : summary.accuracy >= 70 ? 'text-yellow-400' : 'text-red-400'}`}>
              {summary.accuracy}%
            </div>
            <div className={`text-xs ${mutedClass}`}>Accuracy</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${textClass}`}>
              {minutes}:{seconds.toString().padStart(2, '0')}
            </div>
            <div className={`text-xs ${mutedClass}`}>Time</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${textClass}`}>{summary.mistakeCount}</div>
            <div className={`text-xs ${mutedClass}`}>Mistakes</div>
          </div>
        </div>

        {/* Goals Progress */}
        {currentSession.goals && currentSession.goals.length > 0 && (
          <div className="mb-4">
            <h4 className={`text-sm font-medium ${mutedClass} mb-2`}>Goals</h4>
            <div className="space-y-2">
              {currentSession.goals.map((goal, i) => {
                let current = 0;
                let label = '';

                switch (goal.type) {
                  case 'hands':
                    current = currentSession.handsPlayed;
                    label = `${current}/${goal.target} hands`;
                    break;
                  case 'accuracy':
                    current = summary.accuracy;
                    label = `${current}%/${goal.target}% accuracy`;
                    break;
                  case 'time':
                    current = Math.floor(elapsed / 60);
                    label = `${current}/${goal.target} minutes`;
                    break;
                }

                const progress = Math.min(100, (current / goal.target) * 100);

                return (
                  <div key={i} className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          progress >= 100 ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className={`text-xs ${mutedClass} w-32 text-right`}>{label}</span>
                    {progress >= 100 && <span className="text-green-400">✓</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <button
          onClick={onEndSession}
          className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium"
        >
          End Session
        </button>
      </div>
    );
  }

  // No active session - show start options
  return (
    <div className={`${bgClass} backdrop-blur-sm rounded-lg p-4 ${borderClass} border`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-bold ${textClass}`}>Training Session</h3>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className={`text-sm ${mutedClass} underline`}
        >
          {showHistory ? 'Hide History' : 'View History'}
        </button>
      </div>

      {showHistory ? (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {sessionHistory.length === 0 ? (
            <p className={`text-sm ${mutedClass}`}>No session history yet.</p>
          ) : (
            sessionHistory.slice(0, 20).map(session => {
              const summary = getSessionSummary(session);
              return (
                <div
                  key={session.id}
                  className={`p-3 rounded ${darkMode ? 'bg-gray-700' : 'bg-green-800/50'}`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${textClass}`}>
                      {MODE_LABELS[session.mode]} L{session.level}
                    </span>
                    <span className={`text-xs ${mutedClass}`}>
                      {new Date(session.startTime).toLocaleDateString()}
                    </span>
                  </div>
                  <div className={`text-sm ${mutedClass} mt-1`}>
                    {summary.handsPlayed} hands • {summary.accuracy}% accuracy • {summary.duration}
                    {summary.totalGoals > 0 && ` • ${summary.goalsAchieved}/${summary.totalGoals} goals`}
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : showGoalSetup ? (
        <div className="space-y-4">
          <div>
            <label className={`block text-sm ${mutedClass} mb-1`}>Target Hands</label>
            <input
              type="number"
              value={goalHands}
              onChange={e => setGoalHands(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded bg-gray-700 text-white"
              min="10"
              max="500"
            />
          </div>
          <div>
            <label className={`block text-sm ${mutedClass} mb-1`}>Target Accuracy (%)</label>
            <input
              type="number"
              value={goalAccuracy}
              onChange={e => setGoalAccuracy(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded bg-gray-700 text-white"
              min="50"
              max="100"
            />
          </div>
          <div>
            <label className={`block text-sm ${mutedClass} mb-1`}>Target Time (minutes)</label>
            <input
              type="number"
              value={goalTime}
              onChange={e => setGoalTime(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded bg-gray-700 text-white"
              min="5"
              max="120"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowGoalSetup(false)}
              className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleStartSession}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium"
            >
              Start Session
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <button
            onClick={handleStartSession}
            className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
          >
            Quick Start
          </button>
          <button
            onClick={() => setShowGoalSetup(true)}
            className={`w-full px-4 py-2 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-green-700 hover:bg-green-600'} text-white rounded`}
          >
            Start with Goals
          </button>
          <p className={`text-xs ${mutedClass} text-center`}>
            Sessions track your progress and let you set goals.
          </p>
        </div>
      )}
    </div>
  );
}
