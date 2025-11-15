import { GameConfig, VersionedConfig } from './types';
import {
  STORAGE_KEY_CONFIG,
  CURRENT_CONFIG_VERSION,
  DEFAULT_DEALER_HITS_SOFT_17,
  DEFAULT_DOUBLE_AFTER_SPLIT,
  DEFAULT_SURRENDER_ALLOWED,
  DEFAULT_MAX_SPLITS,
  DEFAULT_NUM_DECKS,
} from './constants';

/**
 * Creates the default game configuration
 */
export function createDefaultConfig(): GameConfig {
  return {
    dealerHitsSoft17: DEFAULT_DEALER_HITS_SOFT_17,
    doubleAfterSplit: DEFAULT_DOUBLE_AFTER_SPLIT,
    surrenderAllowed: DEFAULT_SURRENDER_ALLOWED,
    maxSplits: DEFAULT_MAX_SPLITS,
    numDecks: DEFAULT_NUM_DECKS,
    adaptiveDifficulty: false,
  };
}

/**
 * Validates and migrates configuration data
 */
function validateAndMigrateConfig(data: any): GameConfig {
  if (data && typeof data === 'object') {
    const defaultConfig = createDefaultConfig();

    // Ensure all required fields exist with defaults
    return {
      dealerHitsSoft17: data.dealerHitsSoft17 ?? defaultConfig.dealerHitsSoft17,
      doubleAfterSplit: data.doubleAfterSplit ?? defaultConfig.doubleAfterSplit,
      surrenderAllowed: data.surrenderAllowed ?? defaultConfig.surrenderAllowed,
      maxSplits: data.maxSplits ?? defaultConfig.maxSplits,
      numDecks: data.numDecks ?? defaultConfig.numDecks,
      adaptiveDifficulty: data.adaptiveDifficulty ?? defaultConfig.adaptiveDifficulty,
    };
  }

  return createDefaultConfig();
}

/**
 * Loads game configuration from localStorage with versioning
 */
export function loadConfig(): GameConfig {
  if (typeof window === 'undefined') return createDefaultConfig();

  try {
    const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (saved) {
      const parsed = JSON.parse(saved);

      // Handle versioned data
      if (parsed.version !== undefined) {
        const versioned = parsed as VersionedConfig;
        if (versioned.version === CURRENT_CONFIG_VERSION) {
          return validateAndMigrateConfig(versioned.data);
        }
        // Future version migration logic would go here
      }

      // Handle legacy unversioned data
      return validateAndMigrateConfig(parsed);
    }
  } catch (e) {
    console.error('Failed to load configuration:', e);
  }

  return createDefaultConfig();
}

/**
 * Saves game configuration to localStorage with versioning
 */
export function saveConfig(config: GameConfig): void {
  if (typeof window === 'undefined') return;

  try {
    const versioned: VersionedConfig = {
      version: CURRENT_CONFIG_VERSION,
      data: config,
      lastUpdated: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(versioned));
  } catch (e) {
    console.error('Failed to save configuration:', e);
    // Fallback: try saving without versioning
    try {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
    } catch (fallbackError) {
      console.error('Fallback save also failed:', fallbackError);
    }
  }
}

/**
 * Resets configuration to defaults
 */
export function resetConfig(): GameConfig {
  const defaultConfig = createDefaultConfig();
  saveConfig(defaultConfig);
  return defaultConfig;
}

/**
 * Updates specific configuration options
 */
export function updateConfig(
  currentConfig: GameConfig,
  updates: Partial<GameConfig>
): GameConfig {
  const newConfig = { ...currentConfig, ...updates };
  saveConfig(newConfig);
  return newConfig;
}

/**
 * Gets a human-readable description of the configuration
 */
export function getConfigDescription(config: GameConfig): string[] {
  const descriptions: string[] = [];

  descriptions.push(`Dealer ${config.dealerHitsSoft17 ? 'hits' : 'stands'} on soft 17`);
  descriptions.push(`Double after split: ${config.doubleAfterSplit ? 'allowed' : 'not allowed'}`);
  descriptions.push(`Surrender: ${config.surrenderAllowed ? 'allowed' : 'not allowed'}`);
  descriptions.push(`Maximum splits: ${config.maxSplits}`);
  descriptions.push(`Number of decks: ${config.numDecks}`);
  descriptions.push(`Adaptive difficulty: ${config.adaptiveDifficulty ? 'enabled' : 'disabled'}`);

  return descriptions;
}

/**
 * Validates configuration values
 */
export function validateConfig(config: GameConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (config.maxSplits < 0 || config.maxSplits > 10) {
    errors.push('Maximum splits must be between 0 and 10');
  }

  if (config.numDecks < 1 || config.numDecks > 8) {
    errors.push('Number of decks must be between 1 and 8');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
