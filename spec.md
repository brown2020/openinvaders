# Open Invaders specification

Behavior of the game as implemented on `dev`. Constants live in `src/lib/constants/game.ts` unless noted.

## Product

A single-player arcade game in the browser. The playfield is a client-only canvas. The only server route is an optional tactical advisor. There are no accounts, saved games, payments, or databases.

## Playfield

- Canvas size: 800×600 CSS pixels, drawn with the device pixel ratio and pixelated scaling.
- The page loads `Game` with `ssr: false` so the canvas and Web Audio are not initialized on the server.
- While status is `PLAYING`, a game loop and a separate render loop both use `requestAnimationFrame`. Delta time is capped at 32ms.
- The renderer asks the entity manager for the live entity list every frame.

## Status

`MENU` | `PLAYING` | `PAUSED` | `GAME_OVER`

- Menu, pause, and game over use a `<dialog>` opened with `showModal()`. The dialog stays mounted and is closed while playing so it is not removed while modal.
- Escape does not dismiss that dialog; pause and resume go through the game controls.
- Restart (`R`, the restart button, or Space from menu or game over) resets score, wave, lives, combo, and the extra-life flag, then rebuilds the ship, aliens, barriers, and projectiles.

## Player

- Starts with 3 lives. Speed 6, size 48×32, cannon y = 550.
- Move left and right. Both directions can be held; the ship stops at the 40px margins.
- Fire cooldown 200ms. At most 1 player projectile is active.
- A hit grants 1500ms of invincibility and a flash. The projectile is consumed. Collision detection does not change the life total; the store does.
- Movement flags clear on keyup, touch end, touch cancel, blur, and when the controls unmount.

## Aliens

- 5 rows × 11 columns. Row 0 is `TOP` (30 points). Rows 1–2 are `MIDDLE` (20). Rows 3–4 are `BOTTOM` (10).
- The formation steps horizontally by 12px. On a side margin it drops 16px and reverses.
- Step interval starts at 900ms and shrinks toward 50ms as aliens are destroyed.
- Only an alien with no living alien directly below it may shoot. Alien shot speed is downward. A frame cannot spawn more shots than the remaining room under the cap of 3.
- If any living alien’s bottom reaches the player’s y (550), the game ends.

## Barriers

- Four barriers, 72×54, y = 480.
- Pixel damage from shots and from aliens that overlap a barrier.
- A barrier is destroyed when fewer than 10% of its original pixels remain.

## UFO

- Spawns from either edge between 10s and 25s after the previous one leaves, y = 55, speed 2.5.
- Score comes from this table, indexed by `shotCount % 15`:

  `100, 50, 50, 100, 150, 100, 100, 50, 300, 100, 100, 100, 50, 150, 100`

- `shotCount` counts player shots for the whole game and resets on a full restart, not on a wave clear.
- The flying tone and its LFO stop when the UFO leaves, is destroyed, the wave resets, or the game ends.

## Waves

- Destroying every alien increments the wave, clears projectiles and the UFO, and rebuilds the formation.
- Barriers and the shot count persist across waves.
- The new ship receives the store’s current life total, not a fresh 3.

## Score and lives

- Points added = `floor(base × (1 + combo × 0.1))`.
- A kill within 1000ms of the previous kill raises combo by 1, up to 10. Otherwise combo becomes 1. Combo resets when the wave increments.
- Floating `+` popups show the points actually added.
- Crossing 1500 points once per game grants one life, up to 6. The next hit spends that life.
- High score is the max score seen. It and `isSoundEnabled` are the only fields written to `localStorage` (`space-invaders-storage`).

## Audio and visuals

- Sounds are synthesized. There are no audio files.
- Mute stops the UFO tone and skips new sounds. The preference is restored from storage.
- Effects: parallax starfield, explosions, barrier debris, screen shake, CRT pass, and a faint grid.

## Advisor

`POST /api/completion`. The model id is `gpt-4o`. The provider is OpenAI via `@ai-sdk/openai`. The client uses `useCompletion` with `streamProtocol: "text"`.

Request body (unknown keys such as `prompt` are ignored):

| Field | Rule |
| --- | --- |
| `event` | `game_start`, `wave_start`, or `life_lost` |
| `wave` | integer 1–999 |
| `lives` | integer 0–6 |
| `score` | integer 0–1_000_000 |

The server writes the prompt from that event. Output is capped at 80 tokens. The client sends a tip when play starts, when the wave increases, or when a life is lost and lives remain. If a request is already in flight, the newest event is sent when it finishes. The panel stays visible if a call fails.

| Condition | Response |
| --- | --- |
| `Origin` present and not equal to the request host | 403 |
| Missing `Origin` | allowed, then the checks below |
| Invalid JSON or schema | 400 |
| Over 8 requests per minute for one address, or 30 per minute for the instance | 429 and `Retry-After` |
| `OPENAI_API_KEY` unset | 200, `text/plain`, offline sentence. No provider call |
| Provider error or empty text | 500 |
| Success | 200, `text/plain` |
| `GET` | 405 |

The rate-limit map lives in the server process. It does not span multiple server instances. The OpenAI client is imported only after the key is known to be set. `maxDuration` is 30 seconds.

## Out of scope

- Accounts, leaderboards, multiplayer, and cloud saves
- Firebase, Stripe, and webhooks
- Changing the advisor model id or provider
- A second player shot or random UFO scores
