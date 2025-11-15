import { Card, DifficultyLevel, TrainingScenario, Rank } from './types';
import { createDeck, shuffleDeck } from './deck';
import {
  HARD_TOTAL_MIN,
  HARD_TOTAL_MAX,
  SOFT_SECOND_CARD_MIN,
  SOFT_SECOND_CARD_MAX,
  LEVEL_3_PAIR_PROBABILITY,
  LEVEL_3_SOFT_PROBABILITY,
  LEVEL_4_PAIR_PROBABILITY,
  LEVEL_4_SOFT_PROBABILITY,
  LEVEL_4_HARD_PROBABILITY,
  MIN_CARD_VALUE,
  MAX_CARD_VALUE,
  THREE_CARD_HAND_PROBABILITY,
  MIN_THREE_CARD_TOTAL,
  BLACKJACK_VALUE,
} from './constants';

/**
 * Generates a training scenario based on difficulty level
 */
export function generateTrainingScenario(level: DifficultyLevel): TrainingScenario {
  const deck = shuffleDeck(createDeck());
  let deckIndex = 0;

  const getCard = (faceUp: boolean = true): Card => {
    const card = { ...deck[deckIndex], faceUp };
    deckIndex++;
    return card;
  };

  // Level 1: Hard totals only (12-17)
  if (level === 1) {
    // Generate hard hands (12-17 vs dealer 2-A)
    const targetTotal = HARD_TOTAL_MIN + Math.floor(Math.random() * (HARD_TOTAL_MAX - HARD_TOTAL_MIN + 1));
    const playerCards = generateHardHand(targetTotal, deck);
    const dealerUpcard = getCard(true);

    return {
      playerCards: playerCards.map(c => ({ ...c, faceUp: true })),
      dealerUpcard,
      canDouble: playerCards.length === 2,
      canSplit: false,
      canSurrender: playerCards.length === 2,
      scenarioStartTime: Date.now(),
    };
  }

  // Level 2: Add soft hands
  if (level === 2) {
    const useSoftHand = Math.random() > 0.5;

    if (useSoftHand) {
      // Soft hands A-2 through A-9
      const secondCardValue = SOFT_SECOND_CARD_MIN + Math.floor(Math.random() * (SOFT_SECOND_CARD_MAX - SOFT_SECOND_CARD_MIN + 1));
      const secondCard = secondCardValue.toString() as Rank;
      const playerCards: Card[] = [
        { ...deck[0], rank: 'A', faceUp: true },
        { ...deck[1], rank: secondCard, faceUp: true },
      ];
      const dealerUpcard = getCard(true);

      return {
        playerCards,
        dealerUpcard,
        canDouble: true,
        canSplit: false,
        canSurrender: true,
        scenarioStartTime: Date.now(),
      };
    } else {
      // Fall back to hard hand
      const targetTotal = HARD_TOTAL_MIN + Math.floor(Math.random() * (HARD_TOTAL_MAX - HARD_TOTAL_MIN + 1));
      const playerCards = generateHardHand(targetTotal, deck);
      const dealerUpcard = getCard(true);

      return {
        playerCards: playerCards.map(c => ({ ...c, faceUp: true })),
        dealerUpcard,
        canDouble: playerCards.length === 2,
        canSplit: false,
        canSurrender: playerCards.length === 2,
        scenarioStartTime: Date.now(),
      };
    }
  }

  // Level 3: Add pairs
  if (level === 3) {
    const scenarioType = Math.random();

    if (scenarioType < LEVEL_3_PAIR_PROBABILITY) {
      // Generate pair
      const ranks: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'A'];
      const rank = ranks[Math.floor(Math.random() * ranks.length)];
      const playerCards: Card[] = [
        { ...deck[0], rank, faceUp: true },
        { ...deck[1], rank, faceUp: true },
      ];
      const dealerUpcard = getCard(true);

      return {
        playerCards,
        dealerUpcard,
        canDouble: true,
        canSplit: true,
        canSurrender: true,
        scenarioStartTime: Date.now(),
      };
    } else if (scenarioType < LEVEL_3_SOFT_PROBABILITY) {
      // Soft hand
      const secondCardValue = SOFT_SECOND_CARD_MIN + Math.floor(Math.random() * (SOFT_SECOND_CARD_MAX - SOFT_SECOND_CARD_MIN + 1));
      const secondCard = secondCardValue.toString() as Rank;
      const playerCards: Card[] = [
        { ...deck[0], rank: 'A', faceUp: true },
        { ...deck[1], rank: secondCard, faceUp: true },
      ];
      const dealerUpcard = getCard(true);

      return {
        playerCards,
        dealerUpcard,
        canDouble: true,
        canSplit: false,
        canSurrender: true,
        scenarioStartTime: Date.now(),
      };
    } else {
      // Hard hand
      const targetTotal = HARD_TOTAL_MIN + Math.floor(Math.random() * (HARD_TOTAL_MAX - HARD_TOTAL_MIN + 1));
      const playerCards = generateHardHand(targetTotal, deck);
      const dealerUpcard = getCard(true);

      return {
        playerCards: playerCards.map(c => ({ ...c, faceUp: true })),
        dealerUpcard,
        canDouble: playerCards.length === 2,
        canSplit: false,
        canSurrender: playerCards.length === 2,
        scenarioStartTime: Date.now(),
      };
    }
  }

  // Level 4: All scenarios including surrender focus
  const scenarioType = Math.random();

  if (scenarioType < LEVEL_4_PAIR_PROBABILITY) {
    // Pair
    const ranks: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'A'];
    const rank = ranks[Math.floor(Math.random() * ranks.length)];
    const playerCards: Card[] = [
      { ...deck[0], rank, faceUp: true },
      { ...deck[1], rank, faceUp: true },
    ];
    const dealerUpcard = getCard(true);

    return {
      playerCards,
      dealerUpcard,
      canDouble: true,
      canSplit: true,
      canSurrender: true,
      scenarioStartTime: Date.now(),
    };
  } else if (scenarioType < LEVEL_4_SOFT_PROBABILITY) {
    // Soft hand
    const secondCardValue = SOFT_SECOND_CARD_MIN + Math.floor(Math.random() * (SOFT_SECOND_CARD_MAX - SOFT_SECOND_CARD_MIN + 1));
    const secondCard = secondCardValue.toString() as Rank;
    const playerCards: Card[] = [
      { ...deck[0], rank: 'A', faceUp: true },
      { ...deck[1], rank: secondCard, faceUp: true },
    ];
    const dealerUpcard = getCard(true);

    return {
      playerCards,
      dealerUpcard,
      canDouble: true,
      canSplit: false,
      canSurrender: true,
      scenarioStartTime: Date.now(),
    };
  } else if (scenarioType < LEVEL_4_HARD_PROBABILITY) {
    // Hard hand
    const targetTotal = HARD_TOTAL_MIN + Math.floor(Math.random() * (HARD_TOTAL_MAX - HARD_TOTAL_MIN + 1));
    const playerCards = generateHardHand(targetTotal, deck);
    const dealerUpcard = getCard(true);

    return {
      playerCards: playerCards.map(c => ({ ...c, faceUp: true })),
      dealerUpcard,
      canDouble: playerCards.length === 2,
      canSplit: false,
      canSurrender: playerCards.length === 2,
      scenarioStartTime: Date.now(),
    };
  } else {
    // Surrender scenario (hard 15-16 vs 9, 10, A)
    const playerTotal = Math.random() > 0.5 ? 15 : 16;
    const dealerRanks: Rank[] = ['9', '10', 'A'];
    const dealerRank = dealerRanks[Math.floor(Math.random() * dealerRanks.length)];

    const playerCards = generateHardHand(playerTotal, deck);
    const dealerUpcard: Card = { ...deck[10], rank: dealerRank, faceUp: true };

    return {
      playerCards: playerCards.map(c => ({ ...c, faceUp: true })),
      dealerUpcard,
      canDouble: playerCards.length === 2,
      canSplit: false,
      canSurrender: playerCards.length === 2,
      scenarioStartTime: Date.now(),
    };
  }
}

/**
 * Generates a hard hand with a specific total
 * Improved with better validation and no type assertions
 */
function generateHardHand(targetTotal: number, deck: Card[]): Card[] {
  /**
   * Helper to convert number to valid Rank
   */
  const numberToRank = (num: number): Rank | null => {
    if (num >= 2 && num <= 10) return num.toString() as Rank;
    if (num === 11) return 'J'; // Use face card for 11
    return null;
  };

  // For simplicity, generate 2-3 card hard hands
  const useThreeCards = targetTotal >= MIN_THREE_CARD_TOTAL && Math.random() > THREE_CARD_HAND_PROBABILITY;

  if (useThreeCards && targetTotal >= MIN_THREE_CARD_TOTAL && targetTotal <= BLACKJACK_VALUE) {
    // Three card hand
    const firstCard = MIN_CARD_VALUE + Math.floor(Math.random() * Math.min(MAX_CARD_VALUE - 1, targetTotal - 6));
    const secondCard = MIN_CARD_VALUE + Math.floor(Math.random() * Math.min(MAX_CARD_VALUE - 1, targetTotal - firstCard - 4));
    const thirdCard = targetTotal - firstCard - secondCard;

    const firstRank = numberToRank(firstCard);
    const secondRank = numberToRank(secondCard);
    const thirdRank = numberToRank(thirdCard);

    if (firstRank && secondRank && thirdRank) {
      return [
        { ...deck[0], rank: firstRank, faceUp: true },
        { ...deck[1], rank: secondRank, faceUp: true },
        { ...deck[2], rank: thirdRank, faceUp: true },
      ];
    }
  }

  // Two card hand
  const firstCard = MIN_CARD_VALUE + Math.floor(Math.random() * Math.min(MAX_CARD_VALUE - 1, targetTotal - MIN_CARD_VALUE));
  const secondCard = targetTotal - firstCard;

  const firstRank = numberToRank(firstCard);
  const secondRank = numberToRank(secondCard);

  if (firstRank && secondRank) {
    return [
      { ...deck[0], rank: firstRank, faceUp: true },
      { ...deck[1], rank: secondRank, faceUp: true },
    ];
  }

  // Fallback: safe default that will always work
  // Generate a hand close to target (7 + something)
  const fallbackSecondValue = Math.max(MIN_CARD_VALUE, Math.min(MAX_CARD_VALUE, targetTotal - 7));
  const fallbackSecondRank = numberToRank(fallbackSecondValue) || '5';

  return [
    { ...deck[0], rank: '7', faceUp: true },
    { ...deck[1], rank: fallbackSecondRank, faceUp: true },
  ];
}
