import { AppState, GameAction, FeedbackState } from './types';
import { createInitialStats } from './statistics';
import { createDefaultConfig } from './config';
import { generateTrainingScenario } from './gameEngine';

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

    default:
      return state;
  }
}
