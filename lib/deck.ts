import { Card, Suit, Rank } from './types';

const SUITS: Suit[] = ['♠', '♥', '♦', '♣'];
const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

/**
 * Creates a new 52-card deck
 */
export function createDeck(): Card[] {
  const deck: Card[] = [];

  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        suit,
        rank,
        faceUp: false,
      });
    }
  }

  return deck;
}

/**
 * Shuffles a deck using Fisher-Yates algorithm
 */
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

/**
 * Deals a card from the deck
 */
export function dealCard(deck: Card[], faceUp: boolean = true): { card: Card; remainingDeck: Card[] } {
  if (deck.length === 0) {
    // Create and shuffle new deck if empty
    const newDeck = shuffleDeck(createDeck());
    const [card, ...rest] = newDeck;
    return {
      card: { ...card, faceUp },
      remainingDeck: rest,
    };
  }

  const [card, ...remainingDeck] = deck;
  return {
    card: { ...card, faceUp },
    remainingDeck,
  };
}

/**
 * Gets the numeric value of a card rank
 */
export function getCardValue(rank: Rank): number {
  if (rank === 'A') return 11; // Aces are 11 by default, adjusted later if needed
  if (['J', 'Q', 'K'].includes(rank)) return 10;
  return parseInt(rank, 10);
}

/**
 * Checks if a card is red (hearts or diamonds)
 */
export function isRedCard(suit: Suit): boolean {
  return suit === '♥' || suit === '♦';
}
