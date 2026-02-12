'use client';

import { useState, useRef, useEffect } from 'react';
import { TrainingMode, TrainingSession } from '@/lib/types';

interface TabNavigationProps {
  activeTab: 'training' | 'analytics' | 'settings';
  currentMode: TrainingMode;
  currentSession: TrainingSession | null;
  darkMode: boolean;
  onTabChange: (tab: 'training' | 'analytics' | 'settings') => void;
  onModeChange: (mode: TrainingMode) => void;
  onChartToggle: () => void;
  onStartSession: () => void;
  onViewHistory: () => void;
  showChart: boolean;
}

const TRAINING_MODES: { mode: TrainingMode; label: string; group: string }[] = [
  { mode: 'basic', label: 'Basic Strategy', group: 'core' },
  { mode: 'counting', label: 'Card Counting', group: 'practice' },
  { mode: 'speed', label: 'Speed Training', group: 'practice' },
  { mode: 'mistakes', label: 'Mistake Review', group: 'practice' },
  { mode: 'flashcard', label: 'Flash Cards', group: 'challenge' },
  { mode: 'tournament', label: 'Tournament', group: 'challenge' },
  { mode: 'mastery', label: 'Mastery Mode', group: 'challenge' },
  { mode: 'deviation', label: 'Index Plays', group: 'challenge' },
  { mode: 'custom', label: 'Custom', group: 'challenge' },
];

const MODE_LABELS: Record<TrainingMode, string> = {
  basic: 'Basic Strategy',
  counting: 'Card Counting',
  speed: 'Speed Training',
  mistakes: 'Mistake Review',
  flashcard: 'Flash Cards',
  tournament: 'Tournament',
  mastery: 'Mastery Mode',
  deviation: 'Index Plays',
  custom: 'Custom',
};

export default function TabNavigation({
  activeTab,
  currentMode,
  currentSession,
  darkMode,
  onTabChange,
  onModeChange,
  onChartToggle,
  onStartSession,
  onViewHistory,
  showChart,
}: TabNavigationProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const bgClass = darkMode ? 'bg-gray-800' : 'bg-green-900/70';
  const borderClass = darkMode ? 'border-gray-700' : 'border-green-700';
  const textClass = darkMode ? 'text-gray-200' : 'text-white';
  const mutedClass = darkMode ? 'text-gray-400' : 'text-green-200';
  const hoverClass = darkMode ? 'hover:bg-gray-700' : 'hover:bg-green-800';
  const activeClass = darkMode ? 'bg-blue-600' : 'bg-blue-600';
  const dropdownBg = darkMode ? 'bg-gray-800' : 'bg-green-900';

  const handleModeSelect = (mode: TrainingMode) => {
    onModeChange(mode);
    onTabChange('training');
    setDropdownOpen(false);
  };

  const handleStartSession = () => {
    onStartSession();
    setDropdownOpen(false);
  };

  const handleViewHistory = () => {
    onViewHistory();
    setDropdownOpen(false);
  };

  return (
    <nav className={`${bgClass} backdrop-blur-sm rounded-lg ${borderClass} border mb-2 relative z-40`}>
      <div className="flex items-center justify-between px-2 py-1">
        {/* Main Tabs */}
        <div className="flex items-center gap-1">
          {/* Training Tab with Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                activeTab === 'training'
                  ? `${activeClass} text-white`
                  : `${textClass} ${hoverClass}`
              }`}
            >
              <span>{MODE_LABELS[currentMode]}</span>
              <svg
                className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              {currentSession && (
                <span className="w-2 h-2 bg-green-400 rounded-full" title="Session active" />
              )}
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div
                className={`absolute top-full left-0 mt-1 ${dropdownBg} ${borderClass} border rounded-lg shadow-xl z-50 min-w-[200px] py-1`}
              >
                {/* Core Mode */}
                {TRAINING_MODES.filter(m => m.group === 'core').map(({ mode, label }) => (
                  <button
                    key={mode}
                    onClick={() => handleModeSelect(mode)}
                    className={`w-full px-4 py-2 text-left flex items-center justify-between ${hoverClass} ${
                      currentMode === mode ? 'text-blue-400' : textClass
                    }`}
                  >
                    <span>{label}</span>
                    {currentMode === mode && (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                ))}

                {/* Divider */}
                <div className={`my-1 border-t ${borderClass}`} />

                {/* Practice Modes */}
                {TRAINING_MODES.filter(m => m.group === 'practice').map(({ mode, label }) => (
                  <button
                    key={mode}
                    onClick={() => handleModeSelect(mode)}
                    className={`w-full px-4 py-2 text-left flex items-center justify-between ${hoverClass} ${
                      currentMode === mode ? 'text-blue-400' : textClass
                    }`}
                  >
                    <span>{label}</span>
                    {currentMode === mode && (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                ))}

                {/* Divider */}
                <div className={`my-1 border-t ${borderClass}`} />

                {/* Challenge Modes */}
                {TRAINING_MODES.filter(m => m.group === 'challenge').map(({ mode, label }) => (
                  <button
                    key={mode}
                    onClick={() => handleModeSelect(mode)}
                    className={`w-full px-4 py-2 text-left flex items-center justify-between ${hoverClass} ${
                      currentMode === mode ? 'text-blue-400' : textClass
                    }`}
                  >
                    <span>{label}</span>
                    {currentMode === mode && (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                ))}

                {/* Divider */}
                <div className={`my-1 border-t ${borderClass}`} />

                {/* Session Management */}
                <button
                  onClick={handleStartSession}
                  className={`w-full px-4 py-2 text-left ${hoverClass} ${mutedClass}`}
                >
                  {currentSession ? 'End Session' : 'Start Session...'}
                </button>
                <button
                  onClick={handleViewHistory}
                  className={`w-full px-4 py-2 text-left ${hoverClass} ${mutedClass}`}
                >
                  View Session History
                </button>
              </div>
            )}
          </div>

          {/* Analytics Tab */}
          <button
            onClick={() => onTabChange('analytics')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'analytics'
                ? `${activeClass} text-white`
                : `${textClass} ${hoverClass}`
            }`}
          >
            Analytics
          </button>

          {/* Settings Tab */}
          <button
            onClick={() => onTabChange('settings')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'settings'
                ? `${activeClass} text-white`
                : `${textClass} ${hoverClass}`
            }`}
          >
            Settings
          </button>
        </div>

        {/* Chart Button */}
        <button
          onClick={onChartToggle}
          className={`px-3 py-2 rounded-lg font-medium transition-colors ${
            showChart
              ? `${activeClass} text-white`
              : `${textClass} ${hoverClass}`
          }`}
          title="Strategy Chart Reference"
        >
          Chart
        </button>
      </div>
    </nav>
  );
}
