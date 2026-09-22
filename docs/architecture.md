# Architecture

## Map

```
Browser
  └─ Next.js App Router
       ├─ / (client Game via dynamic import, ssr:false)
       │    ├─ GameHUD / GameCanvas / GameOverlay / GameControls
       │    ├─ ScoreNotification / TacticalAdvisor
       │    └─ useGameEngine
       │         ├─ EntityManager + collision (in-memory)
       │         ├─ effects (particles, starfield, shake, CRT)
       │         └─ Zustand store (score/lives/wave; highScore+sound persist)
       └─ POST /api/completion (optional AI advisor)
            └─ zod parse → deferred @ai-sdk/openai streamText
```

## Authority per write

| Path | Fact | Writer | Cache / durability |
| --- | --- | --- | --- |
| start_game | status PLAYING | resetGame / setStatus | in-memory |
| move_player | player velocity flags | useGameEngine.movePlayer | in-memory |
| fire_shot | projectiles[] | useGameEngine.shoot | in-memory |
| resolve_hits | score, lives, aliens | collision loop → store | in-memory; score may update highScore |
| pause_game | status PAUSED | setStatus | in-memory |
| persist_high_score | highScore | zustand persist | localStorage |
| toggle_sound | isSoundEnabled | toggleSound | localStorage |
| request_advice | LLM stream | POST /api/completion | ephemeral; requires OPENAI_API_KEY |

## Server / client

Interactive game is client-only (`"use client"` / dynamic ssr:false). The only route handler is `POST /api/completion` (optional). Secrets stay on the server (`OPENAI_API_KEY`). Invalid bodies → 400; missing key → 503; GET → 405.

## Change exercises

1. **Data:** change alien point values in `src/lib/constants/game.ts` — engine scoring + overlay labels + unit test.
2. **Access:** completion route rejects bad/missing input without a key; no client-side authorization of model calls.
