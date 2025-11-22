import {
  AppState,
  GameAction,
  TrainingMode,
  UISettings,
  CardCountingState,
} from './types';
import { createInitialStats } from './statistics';
import { createDefaultConfig } from './config';
import { generateTrainingScenario } from './gameEngine';
import { createCountingState, createCountingStats } from './cardCounting';

/**
 * Default UI settings
 */
export function createDefaultUISettings(): UISettings {
  return {
    darkMode: false,
    soundEnabled: false,
    cardDesign: 'classic',
    showStrategyChart: false,
    fullScreenMode: false,
    animationsEnabled: true,
    mobileGestures: true,
  };
}

/**
 * Storage keys
 */
const UI_SETTINGS_KEY = 'blackjack-ui-settings';
const SESSION_HISTORY_KEY = 'blackjack-session-history';

/**
 * Load UI settings from localStorage
 */
export function loadUISettings(): UISettings {
  if (typeof window === 'undefined') return createDefaultUISettings();

  try {
    const saved = localStorage.getItem(UI_SETTINGS_KEY);
    if (saved) {
      return { ...createDefaultUISettings(), ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Failed to load UI settings:', e);
  }
  return createDefaultUISettings();
}

/**
 * Save UI settings to localStorage
 */
export function saveUISettings(settings: UISettings): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(UI_SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save UI settings:', e);
  }
}

/**
 * Initial application state
 */
export function createInitialState(): AppState {
  return {
    ui: {
      level: 1,
      showHints: false,
      isLoading: false,
      error: null,
    },
    scenario: null,
    feedback: {
      show: false,
      correct: false,
      correctAction: null,
      playerAction: null,
    },
    stats: null,
    config: createDefaultConfig(),
    // New state
    trainingMode: 'basic',
    currentSession: null,
    sessionHistory: [],
    uiSettings: createDefaultUISettings(),
    countingState: null,
    customFilter: null,
    speedChallenge: null,
    countingStats: null,
  };
}

/**
 * Main reducer for game state management
 */
export function gameReducer(state: AppState, action: GameAction): AppState {
  switch (action.type) {
    case 'SET_LEVEL':
      return {
        ...state,
        ui: {
          ...state.ui,
          level: action.payload,
        },
        scenario: generateTrainingScenario(action.payload),
        feedback: {
          show: false,
          correct: false,
          correctAction: null,
          playerAction: null,
        },
      };

    case 'SET_SCENARIO':
      return {
        ...state,
        scenario: action.payload,
      };

    case 'SET_FEEDBACK':
      return {
        ...state,
        feedback: action.payload,
      };

    case 'CLEAR_FEEDBACK':
      return {
        ...state,
        feedback: {
          show: false,
          correct: false,
          correctAction: null,
          playerAction: null,
        },
      };

    case 'TOGGLE_HINTS':
      return {
        ...state,
        ui: {
          ...state.ui,
          showHints: !state.ui.showHints,
        },
      };

    case 'SET_LOADING':
      return {
        ...state,
        ui: {
          ...state.ui,
          isLoading: action.payload,
        },
      };

    case 'SET_ERROR':
      return {
        ...state,
        ui: {
          ...state.ui,
          error: action.payload,
        },
      };

    case 'UPDATE_STATS':
      return {
        ...state,
        stats: action.payload,
      };

    case 'RESET_STATS':
      return {
        ...state,
        stats: createInitialStats(),
      };

    case 'NEXT_HAND':
      return {
        ...state,
        scenario: generateTrainingScenario(state.ui.level),
        feedback: {
          show: false,
          correct: false,
          correctAction: null,
          playerAction: null,
        },
      };

    case 'SET_TRAINING_MODE':
      // Initialize counting state if entering counting mode
      let countingState = state.countingState;
      if (action.payload === 'counting' && !state.countingState) {
        countingState = createCountingState(6);
      }

      return {
        ...state,
        trainingMode: action.payload,
        countingState,
        feedback: {
          show: false,
          correct: false,
          correctAction: null,
          playerAction: null,
        },
      };

    case 'START_SESSION':
      return {
        ...state,
        currentSession: action.payload,
      };

    case 'END_SESSION':
      if (!state.currentSession) return state;

      const endedSession = {
        ...state.currentSession,
        endTime: Date.now(),
      };

      return {
        ...state,
        currentSession: null,
        sessionHistory: [endedSession, ...state.sessionHistory].slice(0, 100),
      };

    case 'UPDATE_SESSION':
      if (!state.currentSession) return state;

      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          ...action.payload,
        },
      };

    case 'SET_UI_SETTINGS':
      const newSettings = {
        ...state.uiSettings,
        ...action.payload,
      };
      saveUISettings(newSettings);

      return {
        ...state,
        uiSettings: newSettings,
      };

    case 'SET_COUNTING_STATE':
      return {
        ...state,
        countingState: state.countingState
          ? { ...state.countingState, ...action.payload }
          : createCountingState(6),
      };

    case 'SET_CUSTOM_FILTER':
      return {
        ...state,
        customFilter: action.payload,
      };

    case 'SET_SPEED_CHALLENGE':
      return {
        ...state,
        speedChallenge: action.payload,
      };

    case 'ADD_MISTAKE':
      if (!state.stats) return state;

      return {
        ...state,
        stats: {
          ...state.stats,
          mistakes: [...(state.stats.mistakes || []), action.payload].slice(-500),
        },
      };

    case 'CLEAR_MISTAKES':
      if (!state.stats) return state;

      return {
        ...state,
        stats: {
          ...state.stats,
          mistakes: [],
        },
      };

    default:
      return state;
  }
}
