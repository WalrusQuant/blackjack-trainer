import Card from './Card';
import { Card as CardType } from '@/lib/types';
import { calculateHandValue, getHandValueDisplay } from '@/lib/handValue';

interface GameAreaProps {
  dealerCard: CardType;
  playerCards: CardType[];
}

/**
 * Main game area displaying dealer and player cards with proper accessibility
 */
export default function GameArea({ dealerCard, playerCards }: GameAreaProps) {
  const playerHandValue = calculateHandValue(playerCards);
  const dealerHandValue = calculateHandValue([dealerCard]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-8 sm:gap-12">
      {/* Dealer Section */}
      <div className="text-center" role="region" aria-label="Dealer's cards">
        <div className="text-green-200 text-sm sm:text-base mb-3" id="dealer-label">
          Dealer Shows
        </div>
        <div className="flex justify-center gap-2" role="group" aria-labelledby="dealer-label">
          <Card card={dealerCard} />
        </div>
        <div
          className="mt-2 text-white text-lg font-semibold"
          aria-label={`Dealer has ${dealerHandValue.value}`}
        >
          {dealerHandValue.value}
        </div>
      </div>

      {/* VS Divider */}
      <div className="text-green-300 text-xl sm:text-2xl font-bold" aria-hidden="true">
        VS
      </div>

      {/* Player Section */}
      <div className="text-center" role="region" aria-label="Your cards">
        <div className="text-green-200 text-sm sm:text-base mb-3" id="player-label">
          Your Hand
        </div>
        <div className="flex justify-center gap-2" role="group" aria-labelledby="player-label">
          {playerCards.map((card, idx) => (
            <Card key={idx} card={card} delay={idx * 100} />
          ))}
        </div>
        <div className="mt-2 text-white text-lg font-semibold">
          <span
            aria-label={`Your hand value: ${getHandValueDisplay(playerHandValue)}${
              playerHandValue.isSoft ? ' (soft)' : ''
            }`}
          >
            {getHandValueDisplay(playerHandValue)}
            {playerHandValue.isSoft && (
              <span className="text-green-300 text-sm ml-2">(Soft)</span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
