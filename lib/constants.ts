/**
 * Game constants for Blackjack trainer
 */

// Card values
export const CARD_RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'] as const;
export const CARD_SUITS = ['hearts', 'diamonds', 'clubs', 'spades'] as const;

// Hand value thresholds
export const BLACKJACK_VALUE = 21;
export const DEALER_STAND_THRESHOLD = 17;
export const ALWAYS_STAND_THRESHOLD = 17;
export const ACE_HIGH_VALUE = 11;
export const ACE_LOW_VALUE = 1;
export const FACE_CARD_VALUE = 10;

// Hard hand ranges
export const HARD_TOTAL_MIN = 12;
export const HARD_TOTAL_MAX = 17;
export const HARD_TOTAL_RANGE = HARD_TOTAL_MAX - HARD_TOTAL_MIN + 1; // 6 values (12-17)

// Soft hand ranges
export const SOFT_SECOND_CARD_MIN = 2;
export const SOFT_SECOND_CARD_MAX = 9;

// Dealer values
export const DEALER_VALUE_MIN = 2;
export const DEALER_VALUE_MAX = 11; // Ace

// Strategy decision thresholds
export const DOUBLE_ON_11_THRESHOLD = 11;
export const DOUBLE_ON_10_MAX_DEALER = 9;
export const DOUBLE_ON_9_MIN_DEALER = 3;
export const DOUBLE_ON_9_MAX_DEALER = 6;

export const HARD_12_STAND_MIN_DEALER = 4;
export const HARD_12_STAND_MAX_DEALER = 6;
export const HARD_13_15_HIT_THRESHOLD = 7;
export const HARD_16_HIT_THRESHOLD = 7;

// Soft hand thresholds
export const SOFT_19_DOUBLE_DEALER = 6;
export const SOFT_18_HIT_THRESHOLD = 9;
export const SOFT_18_DOUBLE_MIN_DEALER = 3;
export const SOFT_18_DOUBLE_MAX_DEALER = 6;
export const SOFT_17_DOUBLE_MIN_DEALER = 3;
export const SOFT_17_DOUBLE_MAX_DEALER = 6;
export const SOFT_15_16_DOUBLE_MIN_DEALER = 4;
export const SOFT_15_16_DOUBLE_MAX_DEALER = 6;
export const SOFT_13_14_DOUBLE_DEALER_5 = 5;
export const SOFT_13_14_DOUBLE_DEALER_6 = 6;

// Pair splitting
export const PAIR_9_NO_SPLIT_DEALER_7 = 7;
export const PAIR_9_NO_SPLIT_THRESHOLD = 10;
export const PAIR_7_SPLIT_MIN_DEALER = 2;
export const PAIR_7_SPLIT_MAX_DEALER = 7;
export const PAIR_6_SPLIT_MIN_DEALER = 2;
export const PAIR_6_SPLIT_MAX_DEALER = 6;
export const PAIR_2_3_SPLIT_MIN_DEALER = 2;
export const PAIR_2_3_SPLIT_MAX_DEALER = 7;

// Surrender thresholds
export const SURRENDER_16_MIN_DEALER = 9;
export const SURRENDER_15_DEALER_10 = 10;

// Difficulty level scenario distribution
export const LEVEL_3_PAIR_PROBABILITY = 0.33;
export const LEVEL_3_SOFT_PROBABILITY = 0.66;
export const LEVEL_4_PAIR_PROBABILITY = 0.25;
export const LEVEL_4_SOFT_PROBABILITY = 0.5;
export const LEVEL_4_HARD_PROBABILITY = 0.75;

// Hand generation
export const MIN_CARD_VALUE = 2;
export const MAX_CARD_VALUE = 10;
export const THREE_CARD_HAND_PROBABILITY = 0.5;
export const MIN_THREE_CARD_TOTAL = 12;

// localStorage keys
export const STORAGE_KEY_STATS = 'blackjack-trainer-stats';
export const STORAGE_KEY_CONFIG = 'blackjack-trainer-config';

// Data versioning
export const CURRENT_STATS_VERSION = 1;
export const CURRENT_CONFIG_VERSION = 1;

// Animation delays (ms)
export const CARD_DEAL_DELAY_MS = 100;

// Difficulty levels
export const MIN_DIFFICULTY_LEVEL = 1;
export const MAX_DIFFICULTY_LEVEL = 4;

// Default game rules
export const DEFAULT_DEALER_HITS_SOFT_17 = true;
export const DEFAULT_DOUBLE_AFTER_SPLIT = true;
export const DEFAULT_SURRENDER_ALLOWED = true;
export const DEFAULT_MAX_SPLITS = 3;
export const DEFAULT_NUM_DECKS = 1;

// Statistics
export const MIN_ACCURACY = 0;
export const MAX_ACCURACY = 100;

// Adaptive difficulty
export const ADAPTIVE_DIFFICULTY_THRESHOLD = 90; // 90% accuracy to advance
export const ADAPTIVE_DIFFICULTY_MIN_DECISIONS = 20; // Minimum decisions before advancement

// Streak tracking
export const STREAK_EXCELLENT_THRESHOLD = 10;
export const STREAK_GOOD_THRESHOLD = 5;
