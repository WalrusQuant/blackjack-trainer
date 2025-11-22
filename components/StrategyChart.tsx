'use client';

import { useState } from 'react';

interface StrategyChartProps {
  onClose: () => void;
  darkMode?: boolean;
}

type ChartType = 'hard' | 'soft' | 'pair';

// Strategy chart data: H=Hit, S=Stand, D=Double, P=Split, R=Surrender, Ds=Double if allowed else Stand
// Dealer cards: 2, 3, 4, 5, 6, 7, 8, 9, 10, A
const HARD_STRATEGY: Record<number, string[]> = {
  17: ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],
  16: ['S', 'S', 'S', 'S', 'S', 'H', 'H', 'R', 'R', 'R'],
  15: ['S', 'S', 'S', 'S', 'S', 'H', 'H', 'H', 'R', 'H'],
  14: ['S', 'S', 'S', 'S', 'S', 'H', 'H', 'H', 'H', 'H'],
  13: ['S', 'S', 'S', 'S', 'S', 'H', 'H', 'H', 'H', 'H'],
  12: ['H', 'H', 'S', 'S', 'S', 'H', 'H', 'H', 'H', 'H'],
  11: ['D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'H'],
  10: ['D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'H', 'H'],
  9:  ['H', 'D', 'D', 'D', 'D', 'H', 'H', 'H', 'H', 'H'],
  8:  ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
};

const SOFT_STRATEGY: Record<number, string[]> = {
  20: ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],
  19: ['S', 'S', 'S', 'S', 'D', 'S', 'S', 'S', 'S', 'S'],
  18: ['S', 'D', 'D', 'D', 'D', 'S', 'S', 'H', 'H', 'H'],
  17: ['H', 'D', 'D', 'D', 'D', 'H', 'H', 'H', 'H', 'H'],
  16: ['H', 'H', 'D', 'D', 'D', 'H', 'H', 'H', 'H', 'H'],
  15: ['H', 'H', 'D', 'D', 'D', 'H', 'H', 'H', 'H', 'H'],
  14: ['H', 'H', 'H', 'D', 'D', 'H', 'H', 'H', 'H', 'H'],
  13: ['H', 'H', 'H', 'D', 'D', 'H', 'H', 'H', 'H', 'H'],
};

// P=Split, H=Hit, S=Stand, D=Double
const PAIR_STRATEGY: Record<string, string[]> = {
  'A': ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
  '10':['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],
  '9': ['P', 'P', 'P', 'P', 'P', 'S', 'P', 'P', 'S', 'S'],
  '8': ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
  '7': ['P', 'P', 'P', 'P', 'P', 'P', 'H', 'H', 'H', 'H'],
  '6': ['P', 'P', 'P', 'P', 'P', 'H', 'H', 'H', 'H', 'H'],
  '5': ['D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'H', 'H'],
  '4': ['H', 'H', 'H', 'P', 'P', 'H', 'H', 'H', 'H', 'H'],
  '3': ['P', 'P', 'P', 'P', 'P', 'P', 'H', 'H', 'H', 'H'],
  '2': ['P', 'P', 'P', 'P', 'P', 'P', 'H', 'H', 'H', 'H'],
};

const DEALER_CARDS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'A'];

const ACTION_COLORS: Record<string, string> = {
  H: 'bg-red-500',
  S: 'bg-green-500',
  D: 'bg-yellow-500',
  P: 'bg-blue-500',
  R: 'bg-purple-500',
  Ds: 'bg-orange-500',
};

const ACTION_LABELS: Record<string, string> = {
  H: 'Hit',
  S: 'Stand',
  D: 'Double',
  P: 'Split',
  R: 'Surrender',
  Ds: 'Double/Stand',
};

export default function StrategyChart({ onClose, darkMode = false }: StrategyChartProps) {
  const [chartType, setChartType] = useState<ChartType>('hard');

  const bgClass = darkMode ? 'bg-gray-900' : 'bg-gray-900/95';
  const textClass = 'text-white';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className={`${bgClass} rounded-lg p-4 max-w-4xl w-full max-h-[90vh] overflow-auto`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-xl font-bold ${textClass}`}>Basic Strategy Chart</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {/* Chart Type Tabs */}
        <div className="flex gap-2 mb-4">
          {(['hard', 'soft', 'pair'] as ChartType[]).map(type => (
            <button
              key={type}
              onClick={() => setChartType(type)}
              className={`px-4 py-2 rounded capitalize font-medium ${
                chartType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {type === 'pair' ? 'Pairs' : `${type} Hands`}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-2 mb-4 text-sm">
          {Object.entries(ACTION_LABELS).map(([code, label]) => (
            <div key={code} className="flex items-center gap-1">
              <div className={`w-4 h-4 rounded ${ACTION_COLORS[code]}`} />
              <span className="text-gray-300">{label}</span>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="overflow-x-auto">
          <table className="w-full text-center text-sm">
            <thead>
              <tr>
                <th className="p-2 text-gray-400">
                  {chartType === 'pair' ? 'Pair' : chartType === 'soft' ? 'Soft' : 'Hard'}
                </th>
                {DEALER_CARDS.map(card => (
                  <th key={card} className="p-2 text-gray-400 font-medium">
                    {card}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {chartType === 'hard' && (
                Object.entries(HARD_STRATEGY)
                  .sort((a, b) => parseInt(b[0]) - parseInt(a[0]))
                  .map(([total, actions]) => (
                    <tr key={total}>
                      <td className="p-2 text-gray-300 font-medium">{total}</td>
                      {actions.map((action, i) => (
                        <td key={i} className="p-1">
                          <div className={`${ACTION_COLORS[action]} rounded p-2 text-white font-bold`}>
                            {action}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))
              )}
              {chartType === 'soft' && (
                Object.entries(SOFT_STRATEGY)
                  .sort((a, b) => parseInt(b[0]) - parseInt(a[0]))
                  .map(([total, actions]) => (
                    <tr key={total}>
                      <td className="p-2 text-gray-300 font-medium">A-{parseInt(total) - 11}</td>
                      {actions.map((action, i) => (
                        <td key={i} className="p-1">
                          <div className={`${ACTION_COLORS[action]} rounded p-2 text-white font-bold`}>
                            {action}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))
              )}
              {chartType === 'pair' && (
                Object.entries(PAIR_STRATEGY)
                  .sort((a, b) => {
                    const order = ['A', '10', '9', '8', '7', '6', '5', '4', '3', '2'];
                    return order.indexOf(a[0]) - order.indexOf(b[0]);
                  })
                  .map(([rank, actions]) => (
                    <tr key={rank}>
                      <td className="p-2 text-gray-300 font-medium">{rank}-{rank}</td>
                      {actions.map((action, i) => (
                        <td key={i} className="p-1">
                          <div className={`${ACTION_COLORS[action]} rounded p-2 text-white font-bold`}>
                            {action}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>

        {/* Rules Note */}
        <p className="text-gray-500 text-xs mt-4">
          Chart assumes: Dealer hits soft 17 (H17), Double after split allowed (DAS), Surrender on first two cards.
          D = Double if allowed, otherwise hit. R = Surrender if allowed, otherwise hit.
        </p>
      </div>
    </div>
  );
}
