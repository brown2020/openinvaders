# Open Invaders

A browser remake of Space Invaders. Clear waves of pixel aliens, shelter behind destructible barriers, catch the mystery UFO, and optionally receive short tactical tips from an AI advisor. Live demo: [openinvaders.vercel.app](https://openinvaders.vercel.app/).

## Features

- 5×11 alien grid, four destructible barriers, and waves that speed up as aliens are destroyed
- One player shot on screen at a time, and at most three alien shots
- Mystery UFO with a deterministic 15-entry score table based on the player shot count
- Combo scoring: kills within 1 second stack up to 10×, adding 10% per combo level
- Extra life at 1500 points, capped at 6 lives. Lives are one shared counter for the HUD and the ship
- High score and mute preference persist in `localStorage`
- Starfield, particles, CRT treatment, glow, and screen shake
- Web Audio march cycle, shots, explosions, UFO warble, and extra-life sting
- Keyboard and touch controls
- Optional advisor at `POST /api/completion` (OpenAI GPT-4o through the Vercel AI SDK). The route accepts an allowlisted game event, not a free-form prompt

## Tech stack

Ranges below match `package.json`.

| Area | Choice | package.json |
| --- | --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) | `next` ^16.4.5 |
| UI | React 19 | `react` / `react-dom` ^19.3.1 |
| Language | TypeScript 6.0.3. TypeScript 7 still has no compiler API, so ESLint and Next keep importing this package | `typescript` 6.0.3 |
| Styling | Tailwind CSS 4 | `tailwindcss` ^4.3.4 |
| UI primitives | Radix Dialog and Slot, shadcn-style button | `@radix-ui/react-dialog` ^1.3.1 |
| State | Zustand 5 (`persist` + `devtools`) | `zustand` ^5.0.16 |
| AI | Vercel AI SDK and OpenAI provider. Model id stays `gpt-4o` | `ai` ^7.0.162, `@ai-sdk/openai` ^4.0.108, `@ai-sdk/react` ^4.0.166 |
| Validation | Zod 4 | `zod` ^4.6.7 |
| Icons | Lucide React (exact pin) | `lucide-react` 1.68.0 |
| Lint / test | ESLint 10, Node’s test runner via `tsx` | `eslint` ^10.14.0, `tsx` ^4.23.15 |

TypeScript 7.0 does not ship a compiler API, and `typescript-eslint` still peers `typescript` below 6.1.0. `typescript` is pinned to 6.0.3, which has both `tsc` and the compiler API, so `npm run typecheck`, ESLint, and `next build` all use that package. `@types/node` stays on 24.x to match the Node 24 runtime.

There is no Firebase, Stripe, database, or user account. Gameplay state is in memory. High score and sound preference stay in the browser.

## Project structure

```
src/
  app/
    layout.tsx              # Root layout, Press Start 2P, metadata
    page.tsx                # Client page; Game is loaded with ssr: false
    api/completion/route.ts # Optional advisor
    globals.css
  components/
    game/                   # Canvas, HUD, overlay, controls, advisor
    ui/                     # Button and dialog
  hooks/useGameEngine.ts    # Game loop
  lib/
    entities/               # Player, Alien, Barrier, Projectile, UFO
    game/                   # EntityManager, CollisionManager
    effects/                # Particles, starfield, screen effects
    sounds/                 # Web Audio SoundManager
    store/game-store.ts     # Zustand store
    completion/             # Advisor schema, rate limit, origin check, tests
    constants/              # Dimensions, scoring, colors
  types/game.ts
docs/architecture.md        # Request and state map
docs/budget.md              # Client JS size budget
spec.md                     # Behavior as built
roadmap.md                  # Next steps and known gaps
.github/workflows/ci.yml
ENV_TEMPLATE.md             # Env var name only
```

## Getting started

### Prerequisites

- Node.js 24 (the version CI uses)
- npm

### Install

```bash
git clone https://github.com/brown2020/openinvaders.git
cd openinvaders
npm install
```

### Environment variables

The game runs with no environment variables. Set one only if you want the advisor to call OpenAI.

| Name | Required | Purpose |
| --- | --- | --- |
| `OPENAI_API_KEY` | No | Server-only key for `POST /api/completion`. When it is unset, the route returns a short plain-text offline message and does not call OpenAI. |

Create `.env.local` for local development. `ENV_TEMPLATE.md` lists the name and nothing else. `.env` and `.env.*` are gitignored (`ENV_TEMPLATE.md` is not). Do not commit key material.

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Controls

| Input | Action |
| --- | --- |
| ← / → or A / D | Move |
| Space | Shoot. From the menu, pause screen, or game over, Space starts or resumes |
| P or Esc | Pause or resume |
| R | Restart |
| On-screen buttons | Move and shoot on a touch device |

Leaving the window or cancelling a touch clears movement so the ship does not stick.

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Next.js development server |
| `npm run build` | Production build. Succeeds when `OPENAI_API_KEY` is unset |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` (TypeScript 6.0.3) |
| `npm test` | `tsx --test src/**/*.test.ts` |

## Testing and CI

Tests cover the advisor allowlist, origin check, and rate limit, plus lives, the alien shot cap, combo points, and the player sprite. They do not drive the canvas.

`.github/workflows/ci.yml` runs on pushes and pull requests to `dev` and `main`: `npm ci`, lint, typecheck, test, and build on Node 24. The build step does not receive secrets.

## Deployment

Standard Next.js app. The public demo is [openinvaders.vercel.app](https://openinvaders.vercel.app/). There is no `vercel.json` and no Firebase config in this repo. To enable the advisor in a host, set `OPENAI_API_KEY` in that host’s environment. Do not put the key in source or in the workflow file.

## Contributing

1. Branch from `dev`. `main` is updated separately after QA.
2. Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` before pushing.
3. Do not commit secrets.

## License

[GNU Affero General Public License v3.0](LICENSE.md) (AGPL-3.0).
