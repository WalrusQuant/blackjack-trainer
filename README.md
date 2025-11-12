# Blackjack Strategy Trainer

A production-ready, mobile-first web application for mastering basic blackjack strategy through interactive training.

## Features

### Progressive Difficulty System
- **Level 1**: Hard totals only (hands 12-17 vs dealer 2-A)
- **Level 2**: Hard totals + Soft hands (A-2 through A-9)
- **Level 3**: Hard totals + Soft hands + Pairs (splitting decisions)
- **Level 4**: All scenarios + Surrender options

### Core Functionality
- ✅ Real-time feedback on every decision
- ✅ Accurate basic strategy based on H17 rules
- ✅ Session statistics tracking with localStorage persistence
- ✅ Smooth card animations
- ✅ Mobile-first responsive design
- ✅ Visual hint system (toggle on/off)
- ✅ Clean, distraction-free interface

### Basic Strategy Rules
The trainer follows standard basic strategy assuming:
- Dealer hits soft 17 (H17)
- Double after split allowed (DAS)
- Surrender allowed
- Split up to 3 times (4 hands max)
- Split aces get one card each

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Vercel (Recommended)
This app is optimized for Vercel deployment:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- Render
- Self-hosted with Docker

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React hooks
- **Game Logic**: Vanilla JavaScript (no external dependencies)

## Project Structure

```
blackjack-trainer/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main game component
│   └── globals.css         # Global styles
├── components/
│   └── Card.tsx            # Card component with animations
├── lib/
│   ├── types.ts            # TypeScript interfaces
│   ├── deck.ts             # Deck management
│   ├── handValue.ts        # Hand calculation logic
│   ├── basicStrategy.ts    # Basic strategy rules
│   ├── gameEngine.ts       # Training scenario generation
│   └── statistics.ts       # Statistics tracking
└── public/                 # Static assets
```

## How to Use

1. **Select a difficulty level** - Start with Level 1 to master hard totals
2. **Review the scenario** - See your hand and the dealer's upcard
3. **Make your decision** - Choose Hit, Stand, Double, Split, or Surrender
4. **Get instant feedback** - Learn if your choice matches basic strategy
5. **Track your progress** - Monitor accuracy and identify weak areas
6. **Practice consistently** - Build muscle memory for optimal play

## Statistics Tracking

The app tracks:
- Overall accuracy percentage
- Correct vs incorrect decisions
- Performance by action type (hit, stand, double, split, surrender)
- Performance by hand type (hard, soft, pair)

Statistics are saved to browser localStorage and persist between sessions.

## Future Enhancements

Potential additions for future versions:
- Multi-deck training scenarios
- Custom rule variations (S17, no DAS, etc.)
- Timed challenges
- Achievement system
- Strategy chart reference overlay
- Card counting trainer mode
- Multiplayer leaderboards

## License

MIT License - feel free to use this project for learning or commercial purposes.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.
