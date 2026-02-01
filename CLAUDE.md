# CLAUDE.md - OpenInvaders Game

## Project Overview

Open Invaders is a modern Space Invaders remake built with Next.js 16, React 19, and TypeScript. It features HTML5 Canvas rendering, AI-powered tactical advice via OpenAI's GPT-4o, and visual effects including particles, CRT effects, and screen shake.

## Quick Commands

```bash
# Install dependencies
npm install

# Development server (http://localhost:3000)
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Run linting
npm run lint
```

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript 5 (strict mode)
- **UI**: React 19
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand 5 with persist middleware
- **AI Integration**: Vercel AI SDK with OpenAI
- **UI Components**: Radix UI primitives, shadcn/ui patterns
- **Animations**: Framer Motion
- **Rendering**: HTML5 Canvas (60 FPS game loop)

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/completion/     # AI advisor API route (POST /api/completion)
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main game page
│   └── globals.css         # Global styles
├── components/
│   ├── game/               # Game components (Game, GameCanvas, GameControls, etc.)
│   └── ui/                 # Reusable UI (button, dialog - shadcn/ui style)
├── hooks/
│   └── useGameEngine.ts    # Core game loop and state management
├── lib/
│   ├── constants/          # Game config (game.ts, colors.ts, effects.ts)
│   ├── entities/           # Entity classes (Player, Alien, Projectile, Barrier, UFO)
│   ├── effects/            # Visual effects (ParticleSystem, ScreenEffects, Starfield)
│   ├── game/               # Game systems (EntityManager, CollisionManager)
│   ├── sounds/             # Audio (SoundManager, SoundTypes)
│   └── store/              # Zustand store (game-store.ts)
└── types/
    └── game.ts             # TypeScript type definitions
```

## Path Aliases

Use `@/` prefix for imports from `src/`:
```typescript
import { useGameStore } from "@/lib/store/game-store";
import { Player } from "@/lib/entities/player";
import { GAME_COLORS } from "@/lib/constants/colors";
```

## Code Patterns

### State Management
- Global game state via Zustand store (`useGameStore`)
- State persists high score and sound settings to localStorage
- Game status: `"MENU" | "PLAYING" | "PAUSED" | "GAME_OVER"`

### Entity Pattern
- Base `Entity` class with position, dimensions, velocity
- Specialized entities: `Player`, `Alien`, `Projectile`, `Barrier`, `UFO`
- `EntityManager` handles lifecycle and updates
- `CollisionManager` returns typed `CollisionEvent` discriminated union

### Game Loop
- `useGameEngine` hook manages requestAnimationFrame loop
- Delta time capped at 32ms for consistent physics
- Effect systems: ParticleSystem, Starfield, ScreenShake, CRTEffect

### Component Style
- Functional components with hooks
- Props interfaces defined inline or in types/game.ts
- Use `class-variance-authority` for component variants

## Environment Variables

Optional for AI tactical advisor feature:
```
OPENAI_API_KEY=sk-your_key_here
```

The game works fully without an API key - the AI advisor just won't appear.

## Key Files

- `src/hooks/useGameEngine.ts` - Core game loop, collision handling, entity management
- `src/lib/store/game-store.ts` - Zustand state with combo system
- `src/lib/game/CollisionManager.ts` - Hit detection and event generation
- `src/lib/constants/game.ts` - Game dimensions, speeds, spawn rates
- `src/components/game/GameCanvas.tsx` - Canvas rendering
- `src/app/api/completion/route.ts` - AI advisor API endpoint

## Scoring System

- Bottom aliens: 10 pts, Middle: 20 pts, Top: 30 pts
- UFO: 50-300 pts (random)
- Combo multiplier: Kills within 1 second stack up to 10x

## Testing Notes

- No test framework currently configured
- Test manually on desktop (keyboard) and mobile (touch controls)
- Check 60 FPS performance in browser dev tools
