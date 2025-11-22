'use client';

import { useMemo } from 'react';
import { Statistics, HandType } from '@/lib/types';
import { getHardHandHeatmap, getSoftHandHeatmap, getPairHeatmap, getAccuracyColor } from '@/lib/analytics';

interface HeatmapProps {
  stats: Statistics;
  handType: HandType;
  darkMode?: boolean;
  onCellClick?: (playerTotal: number, dealerUpcard: string, handType: HandType) => void;
}

const DEALER_UPCARDS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'A'];

export default function Heatmap({ stats, handType, darkMode = false, onCellClick }: HeatmapProps) {
  const heatmapData = useMemo(() => {
    switch (handType) {
      case 'hard':
        return getHardHandHeatmap(stats);
      case 'soft':
        return getSoftHandHeatmap(stats);
      case 'pair':
        return getPairHeatmap(stats);
      default:
        return [];
    }
  }, [stats, handType]);

  // Group data by player total
  const rowTotals = useMemo(() => {
    const totals = [...new Set(heatmapData.map(d => d.playerTotal))].sort((a, b) => b - a);
    return totals;
  }, [heatmapData]);

  const getCell = (playerTotal: number, dealerUpcard: string) => {
    return heatmapData.find(d => d.playerTotal === playerTotal && d.dealerUpcard === dealerUpcard);
  };

  const formatRowLabel = (total: number) => {
    if (handType === 'pair') {
      if (total === 22) return 'A-A';
      const cardVal = total / 2;
      if (cardVal === 10) return '10-10';
      return `${cardVal}-${cardVal}`;
    }
    if (handType === 'soft') {
      return `A-${total - 11}`;
    }
    return total.toString();
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-xs sm:text-sm">
        <thead>
          <tr>
            <th className={`p-1 sm:p-2 text-left ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {handType === 'pair' ? 'Pair' : handType === 'soft' ? 'Soft' : 'Hard'}
            </th>
            {DEALER_UPCARDS.map(card => (
              <th
                key={card}
                className={`p-1 sm:p-2 text-center font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
              >
                {card}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rowTotals.map(total => (
            <tr key={total}>
              <td className={`p-1 sm:p-2 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {formatRowLabel(total)}
              </td>
              {DEALER_UPCARDS.map(dealer => {
                const cell = getCell(total, dealer);
                const accuracy = cell?.accuracy ?? -1;
                const bgColor = getAccuracyColor(accuracy, darkMode);

                return (
                  <td
                    key={dealer}
                    className="p-0.5 sm:p-1"
                  >
                    <button
                      onClick={() => onCellClick?.(total, dealer, handType)}
                      className="w-full h-8 sm:h-10 rounded text-xs font-medium transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      style={{ backgroundColor: bgColor }}
                      title={
                        accuracy >= 0
                          ? `${accuracy}% (${cell?.correct}/${cell?.total})`
                          : 'No data'
                      }
                    >
                      {accuracy >= 0 ? (
                        <span className={accuracy > 50 ? 'text-white' : 'text-gray-900'}>
                          {accuracy}%
                        </span>
                      ) : (
                        <span className={darkMode ? 'text-gray-500' : 'text-gray-400'}>-</span>
                      )}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Legend */}
      <div className="flex items-center justify-center gap-2 mt-4 text-xs">
        <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Accuracy:</span>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: getAccuracyColor(100, darkMode) }} />
          <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>95%+</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: getAccuracyColor(85, darkMode) }} />
          <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>85%+</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: getAccuracyColor(75, darkMode) }} />
          <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>75%+</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: getAccuracyColor(60, darkMode) }} />
          <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>60%+</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: getAccuracyColor(50, darkMode) }} />
          <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>&lt;60%</span>
        </div>
      </div>
    </div>
  );
}
