'use client';

import { useState, useMemo } from 'react';
import { Statistics, TrainingSession, HandType } from '@/lib/types';
import {
  findWeakestScenarios,
  analyzeDecisionTimes,
  generateRecommendations,
  comparePerformance,
  parseScenarioKey,
  generateTrendData,
} from '@/lib/analytics';
import { getAccuracy, getHandTypeAccuracy, getActionAccuracy } from '@/lib/statistics';
import Heatmap from './Heatmap';

interface AnalyticsDashboardProps {
  stats: Statistics;
  sessions: TrainingSession[];
  onPracticeScenario?: (playerTotal: number, dealer: string, handType: HandType) => void;
  darkMode?: boolean;
}

export default function AnalyticsDashboard({
  stats,
  sessions,
  onPracticeScenario,
  darkMode = false,
}: AnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'heatmaps' | 'trends' | 'recommendations'>('overview');
  const [heatmapType, setHeatmapType] = useState<HandType>('hard');

  const bgClass = darkMode ? 'bg-gray-800' : 'bg-green-900/50';
  const textClass = darkMode ? 'text-gray-200' : 'text-white';
  const mutedClass = darkMode ? 'text-gray-400' : 'text-green-200';
  const borderClass = darkMode ? 'border-gray-700' : 'border-green-700';

  // Computed analytics
  const weakestScenarios = useMemo(() => findWeakestScenarios(stats, 5, 3), [stats]);
  const timeAnalysis = useMemo(() => analyzeDecisionTimes(stats), [stats]);
  const recommendations = useMemo(() => generateRecommendations(stats, sessions), [stats, sessions]);
  const comparison = useMemo(() => comparePerformance(stats, sessions, 7), [stats, sessions]);
  const trendData = useMemo(() => generateTrendData(sessions), [sessions]);

  const accuracy = getAccuracy(stats);

  return (
    <div className={`${bgClass} backdrop-blur-sm rounded-lg p-4 sm:p-6 ${borderClass} border`}>
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(['overview', 'heatmaps', 'trends', 'recommendations'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded font-medium capitalize ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : darkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-green-700 text-green-100 hover:bg-green-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Main Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className={`p-4 rounded ${darkMode ? 'bg-gray-700' : 'bg-green-800/50'}`}>
              <div className={`text-3xl font-bold ${accuracy >= 90 ? 'text-green-400' : accuracy >= 70 ? 'text-yellow-400' : 'text-red-400'}`}>
                {accuracy}%
              </div>
              <div className={mutedClass}>Overall Accuracy</div>
            </div>
            <div className={`p-4 rounded ${darkMode ? 'bg-gray-700' : 'bg-green-800/50'}`}>
              <div className={`text-3xl font-bold ${textClass}`}>{stats.totalDecisions}</div>
              <div className={mutedClass}>Total Decisions</div>
            </div>
            <div className={`p-4 rounded ${darkMode ? 'bg-gray-700' : 'bg-green-800/50'}`}>
              <div className={`text-3xl font-bold text-yellow-400`}>{stats.longestStreak}</div>
              <div className={mutedClass}>Longest Streak</div>
            </div>
            <div className={`p-4 rounded ${darkMode ? 'bg-gray-700' : 'bg-green-800/50'}`}>
              <div className={`text-3xl font-bold ${textClass}`}>
                {timeAnalysis.overallAvg ? `${(timeAnalysis.overallAvg / 1000).toFixed(1)}s` : 'N/A'}
              </div>
              <div className={mutedClass}>Avg Decision Time</div>
            </div>
          </div>

          {/* By Hand Type */}
          <div>
            <h3 className={`font-medium ${textClass} mb-3`}>Accuracy by Hand Type</h3>
            <div className="grid grid-cols-3 gap-4">
              {(['hard', 'soft', 'pair'] as HandType[]).map(type => {
                const acc = getHandTypeAccuracy(stats, type);
                const total = stats.byHandType[type].correct + stats.byHandType[type].incorrect;
                return (
                  <div key={type} className={`p-3 rounded ${darkMode ? 'bg-gray-700' : 'bg-green-800/50'}`}>
                    <div className={`text-xl font-bold ${acc >= 90 ? 'text-green-400' : acc >= 70 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {acc}%
                    </div>
                    <div className={`capitalize ${mutedClass}`}>{type}</div>
                    <div className={`text-xs ${mutedClass}`}>{total} hands</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* By Action */}
          <div>
            <h3 className={`font-medium ${textClass} mb-3`}>Accuracy by Action</h3>
            <div className="grid grid-cols-5 gap-2">
              {(['hit', 'stand', 'double', 'split', 'surrender'] as const).map(action => {
                const acc = getActionAccuracy(stats, action);
                const total = stats.byAction[action].correct + stats.byAction[action].incorrect;
                return (
                  <div key={action} className={`p-2 rounded text-center ${darkMode ? 'bg-gray-700' : 'bg-green-800/50'}`}>
                    <div className={`font-bold ${acc >= 90 ? 'text-green-400' : acc >= 70 ? 'text-yellow-400' : total === 0 ? mutedClass : 'text-red-400'}`}>
                      {total > 0 ? `${acc}%` : '-'}
                    </div>
                    <div className={`text-xs capitalize ${mutedClass}`}>{action}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weakest Scenarios */}
          {weakestScenarios.length > 0 && (
            <div>
              <h3 className={`font-medium ${textClass} mb-3`}>Weakest Scenarios</h3>
              <div className="space-y-2">
                {weakestScenarios.map(scenario => {
                  const { playerTotal, dealerUpcard, handType } = parseScenarioKey(scenario.key);
                  return (
                    <div
                      key={scenario.key}
                      className={`flex items-center justify-between p-3 rounded ${
                        darkMode ? 'bg-gray-700' : 'bg-green-800/50'
                      }`}
                    >
                      <div className={textClass}>
                        <span className="capitalize">{handType}</span> {playerTotal} vs {dealerUpcard}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`font-bold ${scenario.accuracy < 70 ? 'text-red-400' : 'text-yellow-400'}`}>
                          {scenario.accuracy}%
                        </span>
                        <span className={`text-xs ${mutedClass}`}>({scenario.attempts} attempts)</span>
                        {onPracticeScenario && (
                          <button
                            onClick={() => onPracticeScenario(playerTotal, dealerUpcard, handType)}
                            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
                          >
                            Practice
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Weekly Comparison */}
          {sessions.length >= 2 && (
            <div className={`p-4 rounded ${darkMode ? 'bg-gray-700' : 'bg-green-800/50'}`}>
              <h3 className={`font-medium ${textClass} mb-2`}>This Week vs Last Week</h3>
              <div className="flex items-center gap-4">
                <div>
                  <span className={mutedClass}>This week: </span>
                  <span className={textClass}>{comparison.currentPeriodAccuracy}%</span>
                </div>
                <div>
                  <span className={mutedClass}>Last week: </span>
                  <span className={textClass}>{comparison.previousPeriodAccuracy}%</span>
                </div>
                <div className={`font-bold ${
                  comparison.change > 0 ? 'text-green-400' : comparison.change < 0 ? 'text-red-400' : mutedClass
                }`}>
                  {comparison.change > 0 ? '+' : ''}{comparison.change}%
                  {comparison.trend === 'improving' && ' ↑'}
                  {comparison.trend === 'declining' && ' ↓'}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Heatmaps Tab */}
      {activeTab === 'heatmaps' && (
        <div>
          <div className="flex gap-2 mb-4">
            {(['hard', 'soft', 'pair'] as HandType[]).map(type => (
              <button
                key={type}
                onClick={() => setHeatmapType(type)}
                className={`px-4 py-2 rounded capitalize ${
                  heatmapType === type
                    ? 'bg-blue-600 text-white'
                    : darkMode
                    ? 'bg-gray-700 text-gray-300'
                    : 'bg-green-700 text-green-100'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          <Heatmap
            stats={stats}
            handType={heatmapType}
            darkMode={darkMode}
            onCellClick={onPracticeScenario}
          />
        </div>
      )}

      {/* Trends Tab */}
      {activeTab === 'trends' && (
        <div className="space-y-6">
          {trendData.length === 0 ? (
            <p className={mutedClass}>Complete more sessions to see trends.</p>
          ) : (
            <>
              {/* Simple text-based trend visualization */}
              <div>
                <h3 className={`font-medium ${textClass} mb-3`}>Session History (Last 10)</h3>
                <div className="space-y-2">
                  {trendData.slice(-10).reverse().map((point, i) => (
                    <div
                      key={point.timestamp}
                      className={`flex items-center gap-4 p-2 rounded ${
                        darkMode ? 'bg-gray-700' : 'bg-green-800/50'
                      }`}
                    >
                      <span className={`text-xs ${mutedClass} w-20`}>
                        {new Date(point.timestamp).toLocaleDateString()}
                      </span>
                      <div className="flex-1 h-4 bg-gray-600 rounded overflow-hidden">
                        <div
                          className={`h-full ${
                            point.accuracy >= 90 ? 'bg-green-500' : point.accuracy >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${point.accuracy}%` }}
                        />
                      </div>
                      <span className={`text-sm font-medium ${textClass} w-12`}>
                        {point.accuracy}%
                      </span>
                      <span className={`text-xs ${mutedClass} w-16`}>
                        {point.handsPlayed} hands
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Decision Time Trends */}
              <div>
                <h3 className={`font-medium ${textClass} mb-3`}>Decision Time by Action</h3>
                <div className="grid grid-cols-5 gap-2">
                  {Object.entries(timeAnalysis.byAction).map(([action, time]) => (
                    <div key={action} className={`p-3 rounded text-center ${darkMode ? 'bg-gray-700' : 'bg-green-800/50'}`}>
                      <div className={textClass}>{(time / 1000).toFixed(1)}s</div>
                      <div className={`text-xs capitalize ${mutedClass}`}>{action}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Recommendations Tab */}
      {activeTab === 'recommendations' && (
        <div className="space-y-4">
          <h3 className={`font-medium ${textClass}`}>Personalized Recommendations</h3>
          {recommendations.length === 0 ? (
            <p className={mutedClass}>Practice more to get personalized recommendations.</p>
          ) : (
            recommendations.map((rec, i) => (
              <div
                key={i}
                className={`p-4 rounded flex items-start gap-3 ${
                  darkMode ? 'bg-gray-700' : 'bg-green-800/50'
                }`}
              >
                <span className="text-2xl">💡</span>
                <p className={textClass}>{rec}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
