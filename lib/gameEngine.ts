import { Card, Hand, DifficultyLevel, PlayerAction } from './types';
import { createDeck, shuffleDeck, dealCard } from './deck';
import { calculateHandValue, isPair } from './handValue';

export interface TrainingScenario {
  playerCards: Card[];
  dealerUpcard: Card;
  canDouble: boolean;
  canSplit: boolean;
  canSurrender: boolean;
}

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
    const targetTotal = 12 + Math.floor(Math.random() * 6); // 12-17
    const playerCards = generateHardHand(targetTotal, deck);
    const dealerUpcard = getCard(true);

    return {
      playerCards: playerCards.map(c => ({ ...c, faceUp: true })),
      dealerUpcard,
      canDouble: playerCards.length === 2,
      canSplit: false,
      canSurrender: playerCards.length === 2,
    };
  }

  // Level 2: Add soft hands
  if (level === 2) {
    const useSoftHand = Math.random() > 0.5;

    if (useSoftHand) {
      // Soft hands A-2 through A-9
      const secondCard = (2 + Math.floor(Math.random() * 8)).toString(); // 2-9
      const playerCards = [
        { ...deck[0], rank: 'A' as const, faceUp: true },
        { ...deck[1], rank: secondCard as any, faceUp: true },
      ];
      const dealerUpcard = getCard(true);

      return {
        playerCards,
        dealerUpcard,
        canDouble: true,
        canSplit: false,
        canSurrender: true,
      };
    } else {
      // Fall back to hard hand
      const targetTotal = 12 + Math.floor(Math.random() * 6);
      const playerCards = generateHardHand(targetTotal, deck);
      const dealerUpcard = getCard(true);

      return {
        playerCards: playerCards.map(c => ({ ...c, faceUp: true })),
        dealerUpcard,
        canDouble: playerCards.length === 2,
        canSplit: false,
        canSurrender: playerCards.length === 2,
      };
    }
  }

  // Level 3: Add pairs
  if (level === 3) {
    const scenarioType = Math.random();

    if (scenarioType < 0.33) {
      // Generate pair
      const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'A'];
      const rank = ranks[Math.floor(Math.random() * ranks.length)];
      const playerCards = [
        { ...deck[0], rank: rank as any, faceUp: true },
        { ...deck[1], rank: rank as any, faceUp: true },
      ];
      const dealerUpcard = getCard(true);

      return {
        playerCards,
        dealerUpcard,
        canDouble: true,
        canSplit: true,
        canSurrender: true,
      };
    } else if (scenarioType < 0.66) {
      // Soft hand
      const secondCard = (2 + Math.floor(Math.random() * 8)).toString();
      const playerCards = [
        { ...deck[0], rank: 'A' as const, faceUp: true },
        { ...deck[1], rank: secondCard as any, faceUp: true },
      ];
      const dealerUpcard = getCard(true);

      return {
        playerCards,
        dealerUpcard,
        canDouble: true,
        canSplit: false,
        canSurrender: true,
      };
    } else {
      // Hard hand
      const targetTotal = 12 + Math.floor(Math.random() * 6);
      const playerCards = generateHardHand(targetTotal, deck);
      const dealerUpcard = getCard(true);

      return {
        playerCards: playerCards.map(c => ({ ...c, faceUp: true })),
        dealerUpcard,
        canDouble: playerCards.length === 2,
        canSplit: false,
        canSurrender: playerCards.length === 2,
      };
    }
  }

  // Level 4: All scenarios including surrender focus
  const scenarioType = Math.random();

  if (scenarioType < 0.25) {
    // Pair
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'A'];
    const rank = ranks[Math.floor(Math.random() * ranks.length)];
    const playerCards = [
      { ...deck[0], rank: rank as any, faceUp: true },
      { ...deck[1], rank: rank as any, faceUp: true },
    ];
    const dealerUpcard = getCard(true);

    return {
      playerCards,
      dealerUpcard,
      canDouble: true,
      canSplit: true,
      canSurrender: true,
    };
  } else if (scenarioType < 0.5) {
    // Soft hand
    const secondCard = (2 + Math.floor(Math.random() * 8)).toString();
    const playerCards = [
      { ...deck[0], rank: 'A' as const, faceUp: true },
      { ...deck[1], rank: secondCard as any, faceUp: true },
    ];
    const dealerUpcard = getCard(true);

    return {
      playerCards,
      dealerUpcard,
      canDouble: true,
      canSplit: false,
      canSurrender: true,
    };
  } else if (scenarioType < 0.75) {
    // Hard hand
    const targetTotal = 12 + Math.floor(Math.random() * 6);
    const playerCards = generateHardHand(targetTotal, deck);
    const dealerUpcard = getCard(true);

    return {
      playerCards: playerCards.map(c => ({ ...c, faceUp: true })),
      dealerUpcard,
      canDouble: playerCards.length === 2,
      canSplit: false,
      canSurrender: playerCards.length === 2,
    };
  } else {
    // Surrender scenario (hard 15-16 vs 9, 10, A)
    const playerTotal = Math.random() > 0.5 ? 15 : 16;
    const dealerRanks = ['9', '10', 'A'];
    const dealerRank = dealerRanks[Math.floor(Math.random() * dealerRanks.length)];

    const playerCards = generateHardHand(playerTotal, deck);
    const dealerUpcard = { ...deck[10], rank: dealerRank as any, faceUp: true };

    return {
      playerCards: playerCards.map(c => ({ ...c, faceUp: true })),
      dealerUpcard,
      canDouble: playerCards.length === 2,
      canSplit: false,
      canSurrender: playerCards.length === 2,
    };
  }
}

/**
 * Generates a hard hand with a specific total
 */
function generateHardHand(targetTotal: number, deck: Card[]): Card[] {
  // For simplicity, generate 2-3 card hard hands
  const useThreeCards = targetTotal >= 12 && Math.random() > 0.5;

  if (useThreeCards && targetTotal >= 12 && targetTotal <= 21) {
    // Three card hand
    const firstCard = 2 + Math.floor(Math.random() * Math.min(9, targetTotal - 6));
    const secondCard = 2 + Math.floor(Math.random() * Math.min(9, targetTotal - firstCard - 4));
    const thirdCard = targetTotal - firstCard - secondCard;

    if (thirdCard >= 2 && thirdCard <= 10) {
      return [
        { ...deck[0], rank: firstCard.toString() as any, faceUp: true },
        { ...deck[1], rank: secondCard.toString() as any, faceUp: true },
        { ...deck[2], rank: thirdCard.toString() as any, faceUp: true },
      ];
    }
  }

  // Two card hand
  const firstCard = 2 + Math.floor(Math.random() * Math.min(9, targetTotal - 2));
  const secondCard = targetTotal - firstCard;

  if (secondCard >= 2 && secondCard <= 11) {
    let secondRank = secondCard.toString();
    if (secondCard === 11) secondRank = 'J'; // Use face card for 10

    return [
      { ...deck[0], rank: firstCard.toString() as any, faceUp: true },
      { ...deck[1], rank: secondRank as any, faceUp: true },
    ];
  }

  // Fallback: just give two cards that sum close to target
  return [
    { ...deck[0], rank: '7' as const, faceUp: true },
    { ...deck[1], rank: (targetTotal - 7).toString() as any, faceUp: true },
  ];
}
