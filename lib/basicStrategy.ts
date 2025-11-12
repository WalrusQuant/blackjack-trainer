import { Card, PlayerAction, DifficultyLevel } from './types';
import { calculateHandValue, isPair } from './handValue';
import { getCardValue } from './deck';

/**
 * Gets the optimal action according to basic strategy
 * Strategy assumes: H17, DAS, surrender allowed, 3 splits max
 */
export function getBasicStrategyAction(
  playerCards: Card[],
  dealerUpcard: Card,
  canDouble: boolean,
  canSplit: boolean,
  canSurrender: boolean,
  level: DifficultyLevel
): PlayerAction {
  const dealerValue = getCardValue(dealerUpcard.rank);
  const handValue = calculateHandValue(playerCards);

  // Check surrender (Level 4)
  if (level >= 4 && canSurrender && playerCards.length === 2) {
    const surrenderAction = checkSurrender(handValue.value, dealerValue, handValue.isSoft);
    if (surrenderAction) return 'surrender';
  }

  // Check pairs (Level 3)
  if (level >= 3 && isPair(playerCards) && canSplit) {
    const pairAction = getPairAction(playerCards[0].rank, dealerValue);
    if (pairAction === 'split') return 'split';
  }

  // Check soft hands (Level 2)
  if (level >= 2 && handValue.isSoft && handValue.value >= 13 && handValue.value <= 21) {
    return getSoftHandAction(handValue.value, dealerValue, canDouble);
  }

  // Hard hands (Level 1 and default)
  return getHardHandAction(handValue.value, dealerValue, canDouble);
}

/**
 * Hard hand strategy (dealer hits soft 17)
 */
function getHardHandAction(
  playerTotal: number,
  dealerValue: number,
  canDouble: boolean
): PlayerAction {
  // 17 or higher: always stand
  if (playerTotal >= 17) return 'stand';

  // 16 or less
  if (playerTotal === 16) {
    return dealerValue >= 7 ? 'hit' : 'stand';
  }

  if (playerTotal === 15) {
    return dealerValue >= 7 ? 'hit' : 'stand';
  }

  if (playerTotal === 14) {
    return dealerValue >= 7 ? 'hit' : 'stand';
  }

  if (playerTotal === 13) {
    return dealerValue >= 7 ? 'hit' : 'stand';
  }

  if (playerTotal === 12) {
    return (dealerValue >= 4 && dealerValue <= 6) ? 'stand' : 'hit';
  }

  if (playerTotal === 11) {
    return canDouble ? 'double' : 'hit';
  }

  if (playerTotal === 10) {
    return (canDouble && dealerValue <= 9) ? 'double' : 'hit';
  }

  if (playerTotal === 9) {
    return (canDouble && dealerValue >= 3 && dealerValue <= 6) ? 'double' : 'hit';
  }

  // 8 or less: always hit
  return 'hit';
}

/**
 * Soft hand strategy (dealer hits soft 17)
 */
function getSoftHandAction(
  playerTotal: number,
  dealerValue: number,
  canDouble: boolean
): PlayerAction {
  // Soft 20-21: always stand
  if (playerTotal >= 20) return 'stand';

  // Soft 19 (A-8)
  if (playerTotal === 19) {
    return (canDouble && dealerValue === 6) ? 'double' : 'stand';
  }

  // Soft 18 (A-7)
  if (playerTotal === 18) {
    if (dealerValue >= 9) return 'hit';
    if (canDouble && (dealerValue >= 3 && dealerValue <= 6)) return 'double';
    return 'stand';
  }

  // Soft 17 (A-6)
  if (playerTotal === 17) {
    return (canDouble && dealerValue >= 3 && dealerValue <= 6) ? 'double' : 'hit';
  }

  // Soft 16 (A-5)
  if (playerTotal === 16) {
    return (canDouble && dealerValue >= 4 && dealerValue <= 6) ? 'double' : 'hit';
  }

  // Soft 15 (A-4)
  if (playerTotal === 15) {
    return (canDouble && dealerValue >= 4 && dealerValue <= 6) ? 'double' : 'hit';
  }

  // Soft 14 (A-3)
  if (playerTotal === 14) {
    return (canDouble && (dealerValue === 5 || dealerValue === 6)) ? 'double' : 'hit';
  }

  // Soft 13 (A-2)
  if (playerTotal === 13) {
    return (canDouble && (dealerValue === 5 || dealerValue === 6)) ? 'double' : 'hit';
  }

  return 'hit';
}

/**
 * Pair splitting strategy (dealer hits soft 17, DAS)
 */
function getPairAction(
  pairRank: string,
  dealerValue: number
): 'split' | 'nosplit' {
  // Always split Aces and 8s
  if (pairRank === 'A' || pairRank === '8') return 'split';

  // Never split 10s, 5s, or 4s
  if (['10', 'J', 'Q', 'K'].includes(pairRank) || pairRank === '5' || pairRank === '4') {
    return 'nosplit';
  }

  // 9s: split except against 7, 10, or Ace
  if (pairRank === '9') {
    return (dealerValue === 7 || dealerValue >= 10) ? 'nosplit' : 'split';
  }

  // 7s: split against 2-7
  if (pairRank === '7') {
    return (dealerValue >= 2 && dealerValue <= 7) ? 'split' : 'nosplit';
  }

  // 6s: split against 2-6 (DAS)
  if (pairRank === '6') {
    return (dealerValue >= 2 && dealerValue <= 6) ? 'split' : 'nosplit';
  }

  // 3s and 2s: split against 2-7 (DAS)
  if (pairRank === '3' || pairRank === '2') {
    return (dealerValue >= 2 && dealerValue <= 7) ? 'split' : 'nosplit';
  }

  return 'nosplit';
}

/**
 * Surrender strategy (dealer hits soft 17)
 */
function checkSurrender(
  playerTotal: number,
  dealerValue: number,
  isSoft: boolean
): boolean {
  // Only surrender hard hands
  if (isSoft) return false;

  // Surrender 16 vs dealer 9, 10, or Ace
  if (playerTotal === 16 && dealerValue >= 9) return true;

  // Surrender 15 vs dealer 10
  if (playerTotal === 15 && dealerValue === 10) return true;

  return false;
}

/**
 * Gets available actions for a given situation
 */
export function getAvailableActions(
  playerCards: Card[],
  canDouble: boolean,
  canSplit: boolean,
  canSurrender: boolean,
  level: DifficultyLevel
): PlayerAction[] {
  const actions: PlayerAction[] = ['hit', 'stand'];

  // Double only on first two cards
  if (canDouble && playerCards.length === 2) {
    actions.push('double');
  }

  // Split only pairs
  if (level >= 3 && canSplit && isPair(playerCards) && playerCards.length === 2) {
    actions.push('split');
  }

  // Surrender only on first two cards (Level 4)
  if (level >= 4 && canSurrender && playerCards.length === 2) {
    actions.push('surrender');
  }

  return actions;
}
