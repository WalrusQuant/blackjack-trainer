import { Card, HandValue } from './types';
import { getCardValue } from './deck';

/**
 * Calculates the value of a hand, handling soft/hard aces
 */
export function calculateHandValue(cards: Card[]): HandValue {
  let value = 0;
  let aces = 0;

  // Count face-up cards only
  const faceUpCards = cards.filter(card => card.faceUp);

  // First pass: count all cards with aces as 11
  for (const card of faceUpCards) {
    const cardValue = getCardValue(card.rank);
    value += cardValue;
    if (card.rank === 'A') {
      aces += 1;
    }
  }

  // Adjust for aces: convert from 11 to 1 if busted
  while (value > 21 && aces > 0) {
    value -= 10; // Convert one ace from 11 to 1
    aces -= 1;
  }

  const isSoft = aces > 0 && value <= 21;
  const isBlackjack = faceUpCards.length === 2 && value === 21;
  const isBusted = value > 21;

  return {
    value,
    isSoft,
    isBlackjack,
    isBusted,
  };
}

/**
 * Checks if a hand is a pair (two cards of same rank)
 */
export function isPair(cards: Card[]): boolean {
  if (cards.length !== 2) return false;
  return cards[0].rank === cards[1].rank;
}

/**
 * Gets a display string for the hand value
 */
export function getHandValueDisplay(handValue: HandValue): string {
  if (handValue.isBusted) {
    return 'BUST';
  }
  if (handValue.isBlackjack) {
    return 'BLACKJACK';
  }
  if (handValue.isSoft) {
    // Show both values for soft hands (e.g., "7/17" for A-6)
    const hardValue = handValue.value - 10;
    return `${hardValue}/${handValue.value}`;
  }
  return handValue.value.toString();
}

/**
 * Gets the hand type for strategy purposes
 */
export function getHandType(cards: Card[]): 'hard' | 'soft' | 'pair' {
  if (isPair(cards)) {
    return 'pair';
  }

  const handValue = calculateHandValue(cards);
  return handValue.isSoft ? 'soft' : 'hard';
}
