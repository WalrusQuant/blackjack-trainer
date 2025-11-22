'use client';

import { UISettings, Statistics, GameConfig } from '@/lib/types';
import { exportAllData, importAllData, exportStatisticsCSV } from '@/lib/statistics';
import { loadSessionHistory } from '@/lib/sessionManager';
import { useRef } from 'react';

interface SettingsPanelProps {
  settings: UISettings;
  stats: Statistics;
  config: GameConfig;
  countingStats: any;
  onSettingsChange: (settings: Partial<UISettings>) => void;
  onImportData: (data: any) => void;
  onResetAll: () => void;
  darkMode?: boolean;
}

export default function SettingsPanel({
  settings,
  stats,
  config,
  countingStats,
  onSettingsChange,
  onImportData,
  onResetAll,
  darkMode = false,
}: SettingsPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const bgClass = darkMode ? 'bg-gray-800' : 'bg-green-900/50';
  const textClass = darkMode ? 'text-gray-200' : 'text-white';
  const mutedClass = darkMode ? 'text-gray-400' : 'text-green-200';
  const borderClass = darkMode ? 'border-gray-700' : 'border-green-700';

  // Export all data
  const handleExportAll = () => {
    const sessions = loadSessionHistory();
    const json = exportAllData(stats, sessions, countingStats, settings, config);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blackjack-trainer-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Export CSV
  const handleExportCSV = () => {
    const csv = exportStatisticsCSV(stats);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blackjack-stats-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import data
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = importAllData(event.target?.result as string);
        if (data) {
          onImportData(data);
          alert('Data imported successfully!');
        } else {
          alert('Invalid backup file format');
        }
      } catch (err) {
        alert('Failed to import data');
      }
    };
    reader.readAsText(file);
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      onSettingsChange({ fullScreenMode: true });
    } else {
      document.exitFullscreen();
      onSettingsChange({ fullScreenMode: false });
    }
  };

  return (
    <div className={`${bgClass} backdrop-blur-sm rounded-lg p-6 ${borderClass} border`}>
      <h2 className={`text-xl font-bold ${textClass} mb-6`}>Settings</h2>

      {/* Display Settings */}
      <div className="mb-6">
        <h3 className={`font-medium ${textClass} mb-3`}>Display</h3>
        <div className="space-y-3">
          <label className="flex items-center justify-between">
            <span className={mutedClass}>Dark Mode</span>
            <button
              onClick={() => onSettingsChange({ darkMode: !settings.darkMode })}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.darkMode ? 'bg-blue-600' : 'bg-gray-500'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  settings.darkMode ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </label>

          <label className="flex items-center justify-between">
            <span className={mutedClass}>Animations</span>
            <button
              onClick={() => onSettingsChange({ animationsEnabled: !settings.animationsEnabled })}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.animationsEnabled ? 'bg-blue-600' : 'bg-gray-500'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  settings.animationsEnabled ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </label>

          <label className="flex items-center justify-between">
            <span className={mutedClass}>Strategy Chart Overlay</span>
            <button
              onClick={() => onSettingsChange({ showStrategyChart: !settings.showStrategyChart })}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.showStrategyChart ? 'bg-blue-600' : 'bg-gray-500'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  settings.showStrategyChart ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </label>

          <label className="flex items-center justify-between">
            <span className={mutedClass}>Sound Effects</span>
            <button
              onClick={() => onSettingsChange({ soundEnabled: !settings.soundEnabled })}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.soundEnabled ? 'bg-blue-600' : 'bg-gray-500'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  settings.soundEnabled ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </label>

          <label className="flex items-center justify-between">
            <span className={mutedClass}>Mobile Gestures</span>
            <button
              onClick={() => onSettingsChange({ mobileGestures: !settings.mobileGestures })}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.mobileGestures ? 'bg-blue-600' : 'bg-gray-500'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  settings.mobileGestures ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </label>

          <button
            onClick={toggleFullscreen}
            className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
          >
            {settings.fullScreenMode ? 'Exit Full Screen' : 'Enter Full Screen'}
          </button>
        </div>
      </div>

      {/* Card Design */}
      <div className="mb-6">
        <h3 className={`font-medium ${textClass} mb-3`}>Card Design</h3>
        <div className="flex gap-2">
          {(['classic', 'modern', 'minimal'] as const).map(design => (
            <button
              key={design}
              onClick={() => onSettingsChange({ cardDesign: design })}
              className={`flex-1 px-3 py-2 rounded capitalize ${
                settings.cardDesign === design
                  ? 'bg-blue-600 text-white'
                  : darkMode
                  ? 'bg-gray-700 text-gray-300'
                  : 'bg-green-700 text-green-100'
              }`}
            >
              {design}
            </button>
          ))}
        </div>
      </div>

      {/* Data Management */}
      <div className="mb-6">
        <h3 className={`font-medium ${textClass} mb-3`}>Data Management</h3>
        <div className="space-y-2">
          <button
            onClick={handleExportAll}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Export All Data (JSON)
          </button>
          <button
            onClick={handleExportCSV}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Export Statistics (CSV)
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
          >
            Import Backup
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </div>
      </div>

      {/* Danger Zone */}
      <div className={`pt-4 border-t ${borderClass}`}>
        <h3 className="font-medium text-red-400 mb-3">Danger Zone</h3>
        <button
          onClick={() => {
            if (confirm('This will delete ALL your data including statistics, session history, and settings. This cannot be undone. Continue?')) {
              onResetAll();
            }
          }}
          className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
        >
          Reset All Data
        </button>
      </div>

      {/* Keyboard Shortcuts Reference */}
      <div className={`mt-6 pt-4 border-t ${borderClass}`}>
        <h3 className={`font-medium ${textClass} mb-3`}>Keyboard Shortcuts</h3>
        <div className={`text-sm ${mutedClass} space-y-1`}>
          <div className="flex justify-between">
            <span>H</span><span>Hit</span>
          </div>
          <div className="flex justify-between">
            <span>S</span><span>Stand</span>
          </div>
          <div className="flex justify-between">
            <span>D</span><span>Double Down</span>
          </div>
          <div className="flex justify-between">
            <span>P</span><span>Split</span>
          </div>
          <div className="flex justify-between">
            <span>R</span><span>Surrender</span>
          </div>
          <div className="flex justify-between">
            <span>Space / Enter</span><span>Next Hand</span>
          </div>
          <div className="flex justify-between">
            <span>?</span><span>Toggle Hints</span>
          </div>
          <div className="flex justify-between">
            <span>1-4</span><span>Change Level</span>
          </div>
          <div className="flex justify-between">
            <span>C</span><span>Card Counting Mode</span>
          </div>
          <div className="flex justify-between">
            <span>M</span><span>Mistake Review</span>
          </div>
          <div className="flex justify-between">
            <span>Esc</span><span>Exit Current Mode</span>
          </div>
        </div>
      </div>
    </div>
  );
}
