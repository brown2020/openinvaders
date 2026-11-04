# Roadmap

Punchlist after the dependency maintenance pass. There are no open GitHub issues or pull requests. `main` is promoted separately after QA; work lands on `dev`.

## Next

1. QA the play loop on desktop and a phone: move, single shot, pause, restart, extra life at 1500, wave clear keeping the current life total, UFO visible without firing first, and alien shots visible before they hit.
2. Decide whether the advisor should stay on in the public demo. If yes, set `OPENAI_API_KEY` on the host. The repo and CI build do not need it.
3. Replace the in-process advisor rate limit with a shared limiter if the key is enabled in production. The current ceilings (8/minute per address, 30/minute per instance) reset on every new server instance.
4. Add a browser test that mounts the canvas for start, shoot, pause, and game over. Unit tests cover the status machine and the single-shot cap, and they do not mount the canvas.
5. Scale or letterbox the 800×600 canvas on narrow screens. It is a fixed pixel surface today.
6. When `typescript-eslint` supports TypeScript 7’s compiler API, point `typescript` at TypeScript 7. It stays on 6.0.3: TypeScript 7.0 has no compiler API, 7.1 is still `7.1.0-beta`, and `typescript-eslint` 8.72.1 still peers `typescript` `<6.1.0`. Next.js 16.5 is canary-only; the stable release is 16.4.5. `@types/node` stays on 24.x for the Node 24 runtime.

## Known gaps

- Advisor calls with no `Origin` header are accepted. Browsers on another site are rejected. A non-browser client can still request the three canned events and spend the key, up to the per-instance limit.
- `maxDuration` is 30 seconds. Whether the host allows that has not been checked against the deployment plan. The route waits for the full reply before it returns, so a slow provider uses that budget.
- The extra-life sound is played inside the Zustand `set` updater. A double-invoked updater would play it twice.
- Alien march state is one module-level object. Two mounted games would share it. The page mounts one game.
- High score and mute are local to the browser. Clearing site data clears them. There is no server copy.
- Hiding the tab does not clear movement unless the window also blurs.
- Score popups use canvas coordinates. They line up with the unscaled 800×600 canvas and will drift if that canvas is later CSS-scaled without a matching transform.
- `minimatch` 3.1.5 stays under `eslint-plugin-import`, `eslint-plugin-react`, and `eslint-plugin-jsx-a11y`. Those plugins call the v3 default export and `makeRe()`, which minimatch 11 removed. The 10.x copies used by ESLint, `@eslint/config-array`, and `@typescript-eslint/typescript-estree` are overridden to 11.0.4.

## Not in this repo

- No Firebase rules or indexes to deploy.
- No Stripe or webhook secret.
- No Vercel project settings are changed from here.
- Model id remains `gpt-4o`. Provider remains OpenAI. Do not swap either without an explicit product decision.
