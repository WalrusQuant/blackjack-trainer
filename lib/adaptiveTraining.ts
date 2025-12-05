import {
  Statistics,
  TrainingScenario,
  Card,
  DifficultyLevel,
  CustomScenarioFilter,
  Rank,
  HandType,
} from './types';
import { findWeakestScenarios, findStaleScenarios, parseScenarioKey, getScenarioKey } from './analytics';
import { createDeck, shuffleDeck } from './deck';

const SUITS = ['♠', '♥', '♦', '♣'] as const;

/**
 * Spaced repetition intervals (in hours)
 */
const REPETITION_INTERVALS = [
  1,      // First review after 1 hour
  4,      // Second review after 4 hours
  24,     // Third review after 1 day
  72,     // Fourth review after 3 days
  168,    // Fifth review after 1 week
  336,    // Sixth review after 2 weeks
];

/**
 * Get next review time based on accuracy
 */
function getNextReviewInterval(accuracy: number, reviewCount: number): number {
  const baseInterval = REPETITION_INTERVALS[Math.min(reviewCount, REPETITION_INTERVALS.length - 1)];

  // Adjust interval based on accuracy
  if (accuracy >= 95) {
    return baseInterval * 1.5; // Increase interval if doing well
  } else if (accuracy < 70) {
    return baseInterval * 0.5; // Decrease interval if struggling
  }
  return baseInterval;
}

/**
 * Generate a scenario targeting a specific weakness
 */
export function generateTargetedScenario(
  playerTotal: number,
  dealerUpcard: string,
  handType: HandType,
  level: DifficultyLevel
): TrainingScenario {
  const deck = shuffleDeck(createDeck());
  let playerCards: Card[] = [];

  const randomSuit = () => SUITS[Math.floor(Math.random() * 4)];
  const rankFromValue = (val: number): Rank => {
    if (val === 1 || val === 11) return 'A';
    if (val === 10) {
      const faces: Rank[] = ['10', 'J', 'Q', 'K'];
      return faces[Math.floor(Math.random() * 4)];
    }
    return val.toString() as Rank;
  };

  if (handType === 'pair') {
    // Generate pair
    let rank: Rank;
    if (playerTotal === 22) {
      rank = 'A';
    } else {
      rank = rankFromValue(playerTotal / 2);
    }
    playerCards = [
      { suit: randomSuit(), rank, faceUp: true },
      { suit: randomSuit(), rank, faceUp: true },
    ];
  } else if (handType === 'soft') {
    // Generate soft hand (Ace + card)
    const secondCardValue = playerTotal - 11;
    playerCards = [
      { suit: randomSuit(), rank: 'A', faceUp: true },
      { suit: randomSuit(), rank: rankFromValue(secondCardValue), faceUp: true },
    ];
  } else {
    // Generate hard hand
    // Try to use two cards that sum to the total
    const card1Value = Math.floor(Math.random() * Math.min(10, playerTotal - 2)) + 2;
    const card2Value = playerTotal - card1Value;

    if (card2Value >= 2 && card2Value <= 11) {
      playerCards = [
        { suit: randomSuit(), rank: rankFromValue(card1Value), faceUp: true },
        { suit: randomSuit(), rank: rankFromValue(card2Value), faceUp: true },
      ];
    } else {
      // Use three cards if needed
      const v1 = Math.floor(playerTotal / 3);
      const v2 = Math.floor(playerTotal / 3);
      const v3 = playerTotal - v1 - v2;
      playerCards = [
        { suit: randomSuit(), rank: rankFromValue(Math.min(10, Math.max(2, v1))), faceUp: true },
        { suit: randomSuit(), rank: rankFromValue(Math.min(10, Math.max(2, v2))), faceUp: true },
        { suit: randomSuit(), rank: rankFromValue(Math.min(10, Math.max(2, v3))), faceUp: true },
      ];
    }
  }

  // Create dealer upcard
  const dealerRank: Rank = dealerUpcard === 'A' ? 'A' : (dealerUpcard as Rank);
  const dealerCard: Card = { suit: randomSuit(), rank: dealerRank, faceUp: true };

  // Determine available actions
  const isPair = handType === 'pair';
  const canDouble = playerCards.length === 2;
  const canSplit = isPair && level >= 3;
  // Surrender is only legal on the first two cards
  const canSurrender = level === 4 && !isPair && playerCards.length === 2;

  return {
    playerCards,
    dealerUpcard: dealerCard,
    canDouble,
    canSplit,
    canSurrender,
    scenarioStartTime: Date.now(),
    targetedScenario: true,
    scenarioKey: getScenarioKey(playerTotal, dealerUpcard, handType),
  };
}

/**
 * Generate scenarios for mastery mode (only weak scenarios)
 */
export function generateMasteryScenario(
  stats: Statistics,
  level: DifficultyLevel,
  masteryThreshold: number = 95
): TrainingScenario | null {
  // Find scenarios below mastery threshold
  const weakScenarios = findWeakestScenarios(stats, 50, 1)
    .filter(s => s.accuracy < masteryThreshold);

  if (weakScenarios.length === 0) {
    return null; // All scenarios mastered!
  }

  // Weighted random selection - lower accuracy = higher weight
  const weights = weakScenarios.map(s => (100 - s.accuracy) ** 2);
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;

  let selectedScenario = weakScenarios[0];
  for (let i = 0; i < weakScenarios.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      selectedScenario = weakScenarios[i];
      break;
    }
  }

  const { playerTotal, dealerUpcard, handType } = parseScenarioKey(selectedScenario.key);
  return generateTargetedScenario(playerTotal, dealerUpcard, handType, level);
}

/**
 * Generate scenario based on spaced repetition
 */
export function generateSpacedRepetitionScenario(
  stats: Statistics,
  level: DifficultyLevel
): TrainingScenario | null {
  const staleScenarios = findStaleScenarios(stats);

  if (staleScenarios.length === 0) {
    return null;
  }

  // Prioritize scenarios with lower accuracy that are due for review
  const prioritized = staleScenarios
    .map(s => ({
      ...s,
      priority: (100 - s.accuracy) * (Date.now() - s.lastSeen) / (1000 * 60 * 60), // Hours overdue * error rate
    }))
    .sort((a, b) => b.priority - a.priority);

  const selected = prioritized[0];
  const { playerTotal, dealerUpcard, handType } = parseScenarioKey(selected.key);

  return generateTargetedScenario(playerTotal, dealerUpcard, handType, level);
}

/**
 * Generate scenario based on custom filter
 */
export function generateFilteredScenario(
  filter: CustomScenarioFilter,
  level: DifficultyLevel,
  stats?: Statistics
): TrainingScenario {
  // Filter by accuracy if specified
  let eligibleTotals = filter.playerTotals;

  if (filter.maxAccuracy !== undefined && stats?.byScenario) {
    eligibleTotals = filter.playerTotals.filter(total => {
      // Check if any scenario with this total is below accuracy threshold
      return filter.dealerUpcards.some(dealer => {
        return filter.handTypes.some(handType => {
          const key = getScenarioKey(total, dealer, handType);
          const scenario = stats.byScenario?.[key];
          if (!scenario) return true; // Not yet practiced
          const accuracy = (scenario.correct / (scenario.correct + scenario.incorrect)) * 100;
          return accuracy < (filter.maxAccuracy || 100);
        });
      });
    });
  }

  if (eligibleTotals.length === 0) {
    eligibleTotals = filter.playerTotals;
  }

  const playerTotal = eligibleTotals[Math.floor(Math.random() * eligibleTotals.length)];
  const dealerUpcard = filter.dealerUpcards[Math.floor(Math.random() * filter.dealerUpcards.length)];
  const handType = filter.handTypes[Math.floor(Math.random() * filter.handTypes.length)];

  return generateTargetedScenario(playerTotal, dealerUpcard, handType, level);
}

/**
 * Get adaptive scenario based on current performance
 */
export function getAdaptiveScenario(
  stats: Statistics,
  level: DifficultyLevel,
  mode: 'balanced' | 'weakness' | 'spaced'
): TrainingScenario | null {
  switch (mode) {
    case 'weakness':
      return generateMasteryScenario(stats, level, 100); // All non-100% scenarios
    case 'spaced':
      return generateSpacedRepetitionScenario(stats, level);
    case 'balanced':
    default:
      // 40% chance to target weak spots, 20% spaced repetition, 40% random
      const roll = Math.random();
      if (roll < 0.4) {
        const mastery = generateMasteryScenario(stats, level, 90);
        if (mastery) return mastery;
      } else if (roll < 0.6) {
        const spaced = generateSpacedRepetitionScenario(stats, level);
        if (spaced) return spaced;
      }
      return null; // Fall back to random
  }
}

/**
 * Create preset custom filters
 */
export const PRESET_FILTERS: Record<string, CustomScenarioFilter> = {
  'soft-18-vs-9-A': {
    handTypes: ['soft'],
    playerTotals: [18],
    dealerUpcards: ['9', '10', 'A'],
    actionsRequired: ['hit', 'stand', 'double'],
  },
  'hard-16-vs-7-A': {
    handTypes: ['hard'],
    playerTotals: [16],
    dealerUpcards: ['7', '8', '9', '10', 'A'],
    actionsRequired: ['hit', 'stand', 'surrender'],
  },
  'hard-12-vs-2-6': {
    handTypes: ['hard'],
    playerTotals: [12],
    dealerUpcards: ['2', '3', '4', '5', '6'],
    actionsRequired: ['hit', 'stand'],
  },
  'doubling-hands': {
    handTypes: ['hard', 'soft'],
    playerTotals: [9, 10, 11, 13, 14, 15, 16, 17, 18],
    dealerUpcards: ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'A'],
    actionsRequired: ['double', 'hit', 'stand'],
  },
  'splitting-decisions': {
    handTypes: ['pair'],
    playerTotals: [4, 6, 8, 10, 12, 14, 16, 18, 20, 22],
    dealerUpcards: ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'A'],
    actionsRequired: ['split', 'hit', 'stand'],
  },
  'surrender-situations': {
    handTypes: ['hard'],
    playerTotals: [15, 16],
    dealerUpcards: ['9', '10', 'A'],
    actionsRequired: ['surrender', 'hit', 'stand'],
  },
  'dealer-bust-cards': {
    handTypes: ['hard', 'soft'],
    playerTotals: [12, 13, 14, 15, 16],
    dealerUpcards: ['2', '3', '4', '5', '6'],
    actionsRequired: ['hit', 'stand'],
  },
  'dealer-strong-cards': {
    handTypes: ['hard', 'soft'],
    playerTotals: [12, 13, 14, 15, 16],
    dealerUpcards: ['7', '8', '9', '10', 'A'],
    actionsRequired: ['hit', 'stand'],
  },
};

/**
 * Get scenario explanation with EV calculation
 */
export function getScenarioExplanation(
  playerTotal: number,
  dealerUpcard: string,
  handType: HandType,
  correctAction: string
): string {
  const explanations: Record<string, string> = {
    // Hard hands
    'hard-17-any-stand': 'Always stand on hard 17+. The risk of busting outweighs potential gains.',
    'hard-16-10-hit': 'Hit 16 vs 10. Dealer has ~21% chance to make 20, hitting gives better EV despite bust risk.',
    'hard-16-2-6-stand': 'Stand on 16 vs 2-6. Dealer will bust ~35-42% of the time.',
    'hard-12-4-6-stand': 'Stand on 12 vs 4-6. Dealer will bust often, avoid busting yourself.',
    'hard-12-2-3-hit': 'Hit 12 vs 2-3. Dealer bust probability is lower, risk of hitting is acceptable.',
    'hard-11-double': 'Double on 11. You have the best chance of making 21 with one card.',
    'hard-10-2-9-double': 'Double on 10 vs 2-9. High probability of beating dealer with one more card.',
    'hard-9-3-6-double': 'Double on 9 vs 3-6. Favorable odds when dealer shows bust card.',

    // Soft hands
    'soft-18-9-A-hit': 'Hit soft 18 vs 9-A. Standing yields lower EV than attempting to improve.',
    'soft-18-3-6-double': 'Double soft 18 vs 3-6. Take advantage of dealer bust cards.',
    'soft-17-3-6-double': 'Double soft 17 vs 3-6. Flexible hand with good doubling opportunity.',
    'soft-13-16-5-6-double': 'Double soft 13-16 vs 5-6. Maximize value against weak dealer cards.',

    // Pairs
    'pair-A-A-split': 'Always split Aces. Two chances at 21 beats one hand of 12.',
    'pair-8-8-split': 'Always split 8s. 16 is the worst hand; two 8s have better potential.',
    'pair-10-10-stand': 'Never split 10s. 20 is too strong to risk for two uncertain hands.',
    'pair-5-5-double': 'Never split 5s; treat as hard 10 and double vs 2-9.',
    'pair-4-4-hit': 'Don\'t split 4s in most cases. Hit or double (if allowed) is better.',
    'pair-9-9-2-6-split': 'Split 9s vs 2-6. Two hands of 9 beat standing on 18 vs bust cards.',
    'pair-9-9-7-stand': 'Stand 9s vs 7. Your 18 beats dealer\'s likely 17.',

    // Surrender
    'surrender-16-9-A': 'Surrender 16 vs 9-A. Lose half rather than likely lose full bet.',
    'surrender-15-10': 'Surrender 15 vs 10. The math favors losing half in this situation.',
  };

  // Try to find a matching explanation
  const keys = [
    `${handType}-${playerTotal}-${dealerUpcard}-${correctAction}`,
    `${handType}-${playerTotal}-any-${correctAction}`,
    `pair-${playerTotal === 22 ? 'A' : playerTotal / 2}-${playerTotal === 22 ? 'A' : playerTotal / 2}-${correctAction}`,
  ];

  for (const key of keys) {
    if (explanations[key]) {
      return explanations[key];
    }
  }

  // Generate generic explanation
  const actionVerb: Record<string, string> = {
    hit: 'Hit',
    stand: 'Stand',
    double: 'Double down',
    split: 'Split',
    surrender: 'Surrender',
  };

  return `${actionVerb[correctAction]} is the mathematically optimal play for ${handType} ${playerTotal} vs dealer ${dealerUpcard} based on expected value calculations.`;
}
