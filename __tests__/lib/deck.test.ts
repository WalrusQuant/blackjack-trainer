import { createDeck, shuffleDeck, dealCard, getCardValue } from '@/lib/deck';
import { Card } from '@/lib/types';

describe('deck', () => {
  describe('createDeck', () => {
    it('creates a deck with 52 cards', () => {
      const deck = createDeck();
      expect(deck).toHaveLength(52);
    });

    it('creates cards with all ranks', () => {
      const deck = createDeck();
      const ranks = new Set(deck.map(card => card.rank));
      expect(ranks.size).toBe(13);
      expect(ranks).toContain('A');
      expect(ranks).toContain('K');
      expect(ranks).toContain('2');
    });

    it('creates cards with all suits', () => {
      const deck = createDeck();
      const suits = new Set(deck.map(card => card.suit));
      expect(suits.size).toBe(4);
    });

    it('creates all cards face up by default', () => {
      const deck = createDeck();
      expect(deck.every(card => card.faceUp === true)).toBe(true);
    });
  });

  describe('shuffleDeck', () => {
    it('returns a deck with the same length', () => {
      const deck = createDeck();
      const shuffled = shuffleDeck(deck);
      expect(shuffled).toHaveLength(52);
    });

    it('contains all the same cards', () => {
      const deck = createDeck();
      const shuffled = shuffleDeck(deck);

      // Sort both decks for comparison
      const sortFn = (a: Card, b: Card) => {
        if (a.rank !== b.rank) return a.rank.localeCompare(b.rank);
        return a.suit.localeCompare(b.suit);
      };

      const sortedOriginal = [...deck].sort(sortFn);
      const sortedShuffled = [...shuffled].sort(sortFn);

      expect(sortedShuffled).toEqual(sortedOriginal);
    });

    it('does not mutate the original deck', () => {
      const deck = createDeck();
      const original = [...deck];
      shuffleDeck(deck);
      expect(deck).toEqual(original);
    });
  });

  describe('dealCard', () => {
    it('returns a card and updated deck', () => {
      const deck = createDeck();
      const result = dealCard(deck);

      expect(result.card).toBeDefined();
      expect(result.remainingDeck).toHaveLength(51);
    });

    it('deals from the end of the deck', () => {
      const deck = createDeck();
      const lastCard = deck[deck.length - 1];
      const result = dealCard(deck);

      expect(result.card).toEqual(lastCard);
    });

    it('creates a new deck when running out of cards', () => {
      const deck = [createDeck()[0]]; // Only one card
      const result = dealCard(deck);

      expect(result.remainingDeck).toHaveLength(51); // New deck with one card dealt
    });
  });

  describe('getCardValue', () => {
    it('returns correct value for number cards', () => {
      expect(getCardValue('2')).toBe(2);
      expect(getCardValue('5')).toBe(5);
      expect(getCardValue('9')).toBe(9);
    });

    it('returns 10 for face cards', () => {
      expect(getCardValue('10')).toBe(10);
      expect(getCardValue('J')).toBe(10);
      expect(getCardValue('Q')).toBe(10);
      expect(getCardValue('K')).toBe(10);
    });

    it('returns 11 for Ace', () => {
      expect(getCardValue('A')).toBe(11);
    });
  });
});
