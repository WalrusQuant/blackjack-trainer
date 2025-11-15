import { getBasicStrategyAction } from '@/lib/basicStrategy';
import { Card } from '@/lib/types';

// Helper to create card
const card = (rank: Card['rank'], suit: Card['suit'] = '♠'): Card => ({
  rank,
  suit,
  faceUp: true,
});

describe('basicStrategy', () => {
  describe('Hard hands', () => {
    it('always stands on 17 or higher', () => {
      expect(getBasicStrategyAction([card('10'), card('7')], card('6'), true, false, false, 1)).toBe('stand');
      expect(getBasicStrategyAction([card('10'), card('8')], card('10'), true, false, false, 1)).toBe('stand');
      expect(getBasicStrategyAction([card('10'), card('9')], card('A'), true, false, false, 1)).toBe('stand');
    });

    it('hits hard 16 against dealer 7-A', () => {
      expect(getBasicStrategyAction([card('10'), card('6')], card('7'), true, false, false, 1)).toBe('hit');
      expect(getBasicStrategyAction([card('10'), card('6')], card('10'), true, false, false, 1)).toBe('hit');
      expect(getBasicStrategyAction([card('10'), card('6')], card('A'), true, false, false, 1)).toBe('hit');
    });

    it('stands on hard 12-16 against dealer 2-6', () => {
      expect(getBasicStrategyAction([card('10'), card('3')], card('4'), true, false, false, 1)).toBe('stand');
      expect(getBasicStrategyAction([card('10'), card('4')], card('5'), true, false, false, 1)).toBe('stand');
      expect(getBasicStrategyAction([card('10'), card('5')], card('6'), true, false, false, 1)).toBe('stand');
    });

    it('doubles on 11', () => {
      expect(getBasicStrategyAction([card('6'), card('5')], card('6'), true, false, false, 1)).toBe('double');
      expect(getBasicStrategyAction([card('6'), card('5')], card('10'), true, false, false, 1)).toBe('double');
    });

    it('hits 11 when cannot double', () => {
      expect(getBasicStrategyAction([card('6'), card('5')], card('6'), false, false, false, 1)).toBe('hit');
    });

    it('doubles on 10 against dealer 2-9', () => {
      expect(getBasicStrategyAction([card('6'), card('4')], card('5'), true, false, false, 1)).toBe('double');
      expect(getBasicStrategyAction([card('6'), card('4')], card('9'), true, false, false, 1)).toBe('double');
    });

    it('hits on 10 against dealer 10 or A', () => {
      expect(getBasicStrategyAction([card('6'), card('4')], card('10'), true, false, false, 1)).toBe('hit');
      expect(getBasicStrategyAction([card('6'), card('4')], card('A'), true, false, false, 1)).toBe('hit');
    });
  });

  describe('Soft hands', () => {
    it('always stands on soft 19-21', () => {
      expect(getBasicStrategyAction([card('A'), card('8')], card('6'), true, false, false, 2)).toBe('stand');
      expect(getBasicStrategyAction([card('A'), card('9')], card('10'), true, false, false, 2)).toBe('stand');
    });

    it('hits soft 18 against dealer 9-A', () => {
      expect(getBasicStrategyAction([card('A'), card('7')], card('9'), true, false, false, 2)).toBe('hit');
      expect(getBasicStrategyAction([card('A'), card('7')], card('10'), true, false, false, 2)).toBe('hit');
      expect(getBasicStrategyAction([card('A'), card('7')], card('A'), true, false, false, 2)).toBe('hit');
    });

    it('doubles soft 18 against dealer 3-6', () => {
      expect(getBasicStrategyAction([card('A'), card('7')], card('3'), true, false, false, 2)).toBe('double');
      expect(getBasicStrategyAction([card('A'), card('7')], card('6'), true, false, false, 2)).toBe('double');
    });

    it('doubles soft 13-17 against dealer 5-6', () => {
      expect(getBasicStrategyAction([card('A'), card('2')], card('5'), true, false, false, 2)).toBe('double');
      expect(getBasicStrategyAction([card('A'), card('3')], card('6'), true, false, false, 2)).toBe('double');
    });
  });

  describe('Pairs', () => {
    it('always splits Aces and 8s', () => {
      expect(getBasicStrategyAction([card('A'), card('A')], card('10'), true, true, false, 3)).toBe('split');
      expect(getBasicStrategyAction([card('8'), card('8')], card('A'), true, true, false, 3)).toBe('split');
    });

    it('never splits 10s, 5s, or 4s', () => {
      expect(getBasicStrategyAction([card('10'), card('10')], card('6'), true, true, false, 3)).not.toBe('split');
      expect(getBasicStrategyAction([card('5'), card('5')], card('5'), true, true, false, 3)).not.toBe('split');
      expect(getBasicStrategyAction([card('4'), card('4')], card('6'), true, true, false, 3)).not.toBe('split');
    });
  });

  describe('Surrender', () => {
    it('surrenders hard 16 vs dealer 9-A at level 4', () => {
      expect(getBasicStrategyAction([card('10'), card('6')], card('9'), true, false, true, 4)).toBe('surrender');
      expect(getBasicStrategyAction([card('10'), card('6')], card('10'), true, false, true, 4)).toBe('surrender');
      expect(getBasicStrategyAction([card('10'), card('6')], card('A'), true, false, true, 4)).toBe('surrender');
    });

    it('surrenders hard 15 vs dealer 10 at level 4', () => {
      expect(getBasicStrategyAction([card('10'), card('5')], card('10'), true, false, true, 4)).toBe('surrender');
    });

    it('does not surrender at lower levels', () => {
      expect(getBasicStrategyAction([card('10'), card('6')], card('10'), true, false, true, 3)).not.toBe('surrender');
    });
  });
});
