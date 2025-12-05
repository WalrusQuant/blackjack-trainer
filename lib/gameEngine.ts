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
    const playerCards = generateHardHandFromDeck(targetTotal, getCard);
    const dealerUpcard = getCard(true);

    return {
      playerCards: playerCards.map((c: Card) => ({ ...c, faceUp: true })),
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
      const card1 = getCard(true);
      const card2 = getCard(true);
      const playerCards: Card[] = [
        { ...card1, rank: 'A' },
        { ...card2, rank: secondCard },
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
      const playerCards = generateHardHandFromDeck(targetTotal, getCard);
      const dealerUpcard = getCard(true);

      return {
        playerCards: playerCards.map((c: Card) => ({ ...c, faceUp: true })),
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
      const card1 = getCard(true);
      const card2 = getCard(true);
      const playerCards: Card[] = [
        { ...card1, rank },
        { ...card2, rank },
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
      const card1 = getCard(true);
      const card2 = getCard(true);
      const playerCards: Card[] = [
        { ...card1, rank: 'A' },
        { ...card2, rank: secondCard },
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
      const playerCards = generateHardHandFromDeck(targetTotal, getCard);
      const dealerUpcard = getCard(true);

      return {
        playerCards: playerCards.map((c: Card) => ({ ...c, faceUp: true })),
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
    const card1 = getCard(true);
    const card2 = getCard(true);
    const playerCards: Card[] = [
      { ...card1, rank },
      { ...card2, rank },
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
    const card1 = getCard(true);
    const card2 = getCard(true);
    const playerCards: Card[] = [
      { ...card1, rank: 'A' },
      { ...card2, rank: secondCard },
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
    const playerCards = generateHardHandFromDeck(targetTotal, getCard);
    const dealerUpcard = getCard(true);

    return {
      playerCards: playerCards.map((c: Card) => ({ ...c, faceUp: true })),
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

    const playerCards = generateHardHandFromDeck(playerTotal, getCard);
    const dealerCard = getCard(true);
    const dealerUpcard: Card = { ...dealerCard, rank: dealerRank };

    return {
      playerCards: playerCards.map((c: Card) => ({ ...c, faceUp: true })),
      dealerUpcard,
      canDouble: playerCards.length === 2,
      canSplit: false,
      canSurrender: playerCards.length === 2,
      scenarioStartTime: Date.now(),
    };
  }
}

/**
 * Generates a hard hand using getCard to properly consume cards from the deck
 * This ensures cards are unique across player and dealer hands
 */
function generateHardHandFromDeck(
  targetTotal: number,
  getCard: (faceUp?: boolean) => Card
): Card[] {
  const numberToRank = (num: number): Rank | null => {
    if (num >= 2 && num <= 10) return num.toString() as Rank;
    if (num === 11) return 'J';
    return null;
  };

  const useThreeCards = targetTotal >= MIN_THREE_CARD_TOTAL && Math.random() > THREE_CARD_HAND_PROBABILITY;

  if (useThreeCards && targetTotal >= MIN_THREE_CARD_TOTAL && targetTotal <= BLACKJACK_VALUE) {
    const firstCard = MIN_CARD_VALUE + Math.floor(Math.random() * Math.min(MAX_CARD_VALUE - 1, targetTotal - 6));
    const secondCard = MIN_CARD_VALUE + Math.floor(Math.random() * Math.min(MAX_CARD_VALUE - 1, targetTotal - firstCard - 4));
    const thirdCard = targetTotal - firstCard - secondCard;

    const firstRank = numberToRank(firstCard);
    const secondRank = numberToRank(secondCard);
    const thirdRank = numberToRank(thirdCard);

    if (firstRank && secondRank && thirdRank) {
      const card1 = getCard(true);
      const card2 = getCard(true);
      const card3 = getCard(true);
      return [
        { ...card1, rank: firstRank },
        { ...card2, rank: secondRank },
        { ...card3, rank: thirdRank },
      ];
    }
  }

  const firstCardVal = MIN_CARD_VALUE + Math.floor(Math.random() * Math.min(MAX_CARD_VALUE - 1, targetTotal - MIN_CARD_VALUE));
  const secondCardVal = targetTotal - firstCardVal;

  const firstRank = numberToRank(firstCardVal);
  const secondRank = numberToRank(secondCardVal);

  if (firstRank && secondRank) {
    const card1 = getCard(true);
    const card2 = getCard(true);
    return [
      { ...card1, rank: firstRank },
      { ...card2, rank: secondRank },
    ];
  }

  // Fallback
  const fallbackSecondValue = Math.max(MIN_CARD_VALUE, Math.min(MAX_CARD_VALUE, targetTotal - 7));
  const fallbackSecondRank = numberToRank(fallbackSecondValue) || '5';

  const card1 = getCard(true);
  const card2 = getCard(true);
  return [
    { ...card1, rank: '7' as Rank },
    { ...card2, rank: fallbackSecondRank },
  ];
}
