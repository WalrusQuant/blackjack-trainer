# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Dev server on localhost:3000
npm run build        # Production build
npm run lint         # ESLint with Next.js config
npm test             # Run Jest tests
npm run test:watch   # Jest in watch mode
npm run test:coverage # Jest with coverage (70% threshold on branches/functions/lines/statements)
```

## Architecture

**Next.js 14 App Router** + **TypeScript** + **Tailwind CSS** blackjack basic strategy trainer. Client-side only (`'use client'`) — all data persists in versioned localStorage buckets.

### State Management

`app/page.tsx` is the main orchestrator. It uses `useReducer` with `gameReducer` (`lib/gameReducer.ts`) managing a single `AppState` object. Actions are dispatched for level changes, scenario generation, stats updates, training mode switches, and session lifecycle.

### Key Directories

- **`lib/`** — Business logic: strategy rules (`basicStrategy.ts`), hand evaluation (`handValue.ts`), deck management (`deck.ts`), scenario generation (`gameEngine.ts`), stats persistence (`statistics.ts`), card counting (`cardCounting.ts`), adaptive difficulty (`adaptiveDifficulty.ts`, `adaptiveTraining.ts`), analytics/heatmaps (`analytics.ts`)
- **`components/`** — 17 React components for game UI, analytics dashboard, card counting trainer, speed training, settings, and strategy chart
- **`app/`** — Next.js App Router with root layout and single page
- **`__tests__/lib/`** — Jest tests for deck and basic strategy logic

### Domain Model

- **Hand types**: `hard`, `soft`, `pair` — determine strategy lookup
- **Strategy**: H17 rules (dealer hits soft 17), DAS allowed, surrender allowed. Lookup via `getBasicStrategyAction()` in `basicStrategy.ts`
- **Difficulty levels 1-4**: Progressive — L1 hard hands only → L2 adds soft → L3 adds pairs → L4 adds surrender focus
- **Scenario key format**: `"{playerTotal}-{dealerCard}-{handType}"` (e.g., `"16-10-hard"`) used for per-scenario stats tracking and heatmaps

### Training Modes

9 modes defined in `TrainingMode` type (`lib/types.ts`): `basic`, `counting`, `speed`, `flashcard`, `tournament`, `custom`, `mastery`, `deviation`, `mistakes`. Mode rendering is switched in `page.tsx`'s `renderMainContent()`.

### Data Persistence

localStorage keys: `blackjack-trainer-stats`, `blackjack-trainer-config`, `blackjack-ui-settings`, `blackjack-session-history`. Stats and config use a `version` field for migration support.

## Testing

Tests use `jest-environment-jsdom` with `@testing-library/react`. localStorage is mocked in `jest.setup.js`. Path alias `@/` maps to project root. Coverage collected from `lib/`, `components/`, and `app/`.

## Styling

Green felt casino theme (`bg-green-900`, `text-green-200`). Dark mode toggled via state with inline conditional classes. Custom card deal/flip animations defined in `tailwind.config.ts`. Mobile-first responsive with `sm:` breakpoints.
