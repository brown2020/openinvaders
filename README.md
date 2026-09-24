# Open Invaders

A browser-based remake of the classic Space Invaders arcade game. Play waves of pixel aliens, hide behind destructible barriers, chase mystery UFO bonuses, and (optionally) get short tactical tips from an AI advisor. Live demo: [openinvaders.vercel.app](https://openinvaders.vercel.app/).

## Features

Verified from the current codebase:

- Classic Space Invaders loop: player ship, 5×11 alien grid, four destructible barriers, progressive waves
- Mystery UFO with deterministic score table (original-style shot-count scoring)
- Combo scoring (kills within 1s stack up to 10× with a 10% bonus per level)
- Extra life at the configured score threshold
- Persistent high score and sound preference (Zustand + `localStorage`)
- Visual effects: parallax starfield, particle explosions, CRT scanlines/vignette, glow, screen shake
- Web Audio API 8-bit sound (march cycle, shots, explosions, extra life) — no external audio files
- Keyboard controls (←/→ or A/D, Space to shoot, P/Esc pause, R restart) and on-screen touch controls
- Optional AI tactical advisor (`POST /api/completion`) via Vercel AI SDK + OpenAI GPT-4o; soft-degrades when no API key is set

## Tech stack

| Area | Choice | Version (package.json) |
| --- | --- | --- |
| Framework | Next.js (App Router) | ^16.3.6 |
| UI | React | ^19.3.0 |
| Language | TypeScript | ^6 |
| Styling | Tailwind CSS + `@tailwindcss/postcss` | ^4.2.4 |
| UI primitives | Radix UI (Dialog, Slot) + shadcn/ui-style components | — |
| State | Zustand (with `persist` + `devtools`) | ^5.0.12 |
| AI | Vercel AI SDK (`ai`, `@ai-sdk/openai`, `@ai-sdk/react`) | ai ^6.0.168 |
| Validation | Zod | ^4.3.6 |
| Icons | Lucide React | 1.8.0 |
| Rendering | HTML5 Canvas (client-only game) | — |
| Lint / test | ESLint 10, `tsx --test` | — |

No Firebase, Stripe, or database — gameplay state is in-memory; high score/sound persist in the browser.

## Project structure

```
src/
  app/
    layout.tsx              # Root layout, Press Start 2P font, metadata
    page.tsx                # Dynamic import of Game (ssr: false)
    api/completion/route.ts # Optional AI advisor stream
    globals.css
  components/
    game/                   # Game, GameCanvas, HUD, Overlay, Controls, TacticalAdvisor, …
    ui/                     # Button, Dialog (shadcn-style)
  hooks/useGameEngine.ts    # Game loop, input → entity updates
  lib/
    entities/               # Player, Alien, Barrier, Projectile, UFO
    game/                   # EntityManager, CollisionManager
    effects/                # Particles, starfield, screen effects
    sounds/                 # Web Audio SoundManager
    store/game-store.ts     # Zustand store
    completion/             # Request parsing + tests
    constants/              # Game dimensions, scoring, colors
  types/game.ts
docs/                       # Architecture notes
.github/workflows/ci.yml
ENV_TEMPLATE.md             # Lists OPENAI_API_KEY=
```

## Getting started

### Prerequisites

- Node.js 22 (matches CI) or a current LTS
- npm

### Clone and install

```bash
git clone https://github.com/brown2020/openinvaders.git
cd openinvaders
npm install
```

### Environment variables

Create `.env.local` only if you want the AI advisor. The game runs fully without it.

| Name | Purpose | Where to get it |
| --- | --- | --- |
| `OPENAI_API_KEY` | Server-side key for `POST /api/completion` (GPT-4o tactical tips). Optional; without it the route returns a plain-text “Advisor offline” message. | [OpenAI API keys](https://platform.openai.com/api-keys) |

Template (also in `ENV_TEMPLATE.md`):

```bash
OPENAI_API_KEY=
```

Never commit real keys. `.env*.local` is gitignored.

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Controls

| Input | Action |
| --- | --- |
| ← / → or A / D | Move |
| Space | Shoot (or start / resume from menu / pause / game over) |
| P or Esc | Pause / resume |
| R | Restart |
| Touch buttons | Move / shoot on mobile |

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Next.js development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Node test runner via `tsx --test` (`src/**/*.test.ts`) |

## Testing and CI

- Unit tests cover completion request parsing and route security helpers under `src/lib/completion/`.
- GitHub Actions workflow `.github/workflows/ci.yml` runs on pushes and PRs to `dev` and `main`: `npm ci` → lint → typecheck → test → build (Node 22). `OPENAI_API_KEY` is optional in CI via repository secrets.

## Deployment

Deployed as a standard Next.js app (demo on Vercel at [openinvaders.vercel.app](https://openinvaders.vercel.app/)). No `vercel.json` or Firebase config in-repo. If you enable the advisor in production, set `OPENAI_API_KEY` in the host’s environment / secrets — do not inline keys in the workflow or source.

## Contributing

1. Branch from `dev`.
2. Keep changes focused; run `npm run lint`, `npm run typecheck`, and `npm test` before opening a PR.
3. Do not commit secrets or `.env*.local` files.

## License

[GNU Affero General Public License v3.0](LICENSE.md) (AGPL-3.0).
