'use client';

import { Card as CardType } from '@/lib/types';
import { isRedCard } from '@/lib/deck';

interface CardProps {
  card: CardType;
  delay?: number;
}

export default function Card({ card, delay = 0 }: CardProps) {
  const isRed = isRedCard(card.suit);
  const colorClass = isRed ? 'text-red-600' : 'text-black';

  if (!card.faceUp) {
    return (
      <div
        className="relative w-16 h-24 sm:w-20 sm:h-28 rounded-lg shadow-lg animate-deal-card"
        style={{ animationDelay: `${delay}ms` }}
      >
        {/* Card back */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg border-2 border-white">
          <div className="absolute inset-2 border-2 border-white/30 rounded">
            <div className="w-full h-full bg-blue-700/50 rounded flex items-center justify-center">
              <div className="text-white/20 text-4xl font-bold">♠</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative w-16 h-24 sm:w-20 sm:h-28 rounded-lg shadow-lg bg-white border-2 border-gray-300 animate-deal-card overflow-hidden"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Top left corner */}
      <div className={`absolute top-1 left-1.5 text-center ${colorClass}`}>
        <div className="text-xs sm:text-sm font-bold leading-none">{card.rank}</div>
        <div className="text-xs sm:text-sm leading-none">{card.suit}</div>
      </div>

      {/* Center suit */}
      <div className={`absolute inset-0 flex items-center justify-center ${colorClass}`}>
        <div className="text-2xl sm:text-3xl">{card.suit}</div>
      </div>

      {/* Bottom right corner (rotated) */}
      <div className={`absolute bottom-1 right-1.5 text-center rotate-180 ${colorClass}`}>
        <div className="text-xs sm:text-sm font-bold leading-none">{card.rank}</div>
        <div className="text-xs sm:text-sm leading-none">{card.suit}</div>
      </div>
    </div>
  );
}
