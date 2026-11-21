# Afterlight

A field guide to little changes. An original, offline spot-the-difference game with three illustrated worlds, thirty hidden changes, and a gentle journey from dusk to morning.

[![make.fun competition](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![Live rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/nagn4g/spot-difference-game/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![Live reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/nagn4g/spot-difference-game/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)

Built for [Make the best spot the difference game](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451).

## Play

Run `node serve.ts` with Node 22.18 or later, then open `http://127.0.0.1:8080`. Any static server rooted at `game/` also works. The game has no build, downloads, libraries, external fonts, or network services.

Click a change on either panel to mark both pictures. Find all ten to turn the page. H gives a brief hint, P pauses, and N advances a completed scene. Three mistakes restart the current scene; each mistake adds ten seconds. You have three hints on each page. The timer counts up, with a suggested par rather than a hard timeout.

## The field guide

1. **Pasar Malam** — lanterns, food stalls, and a mischievous rooftop visitor. Par 2:30.
2. **Old Library** — a rainy window, crowded shelves, and a quiet reading desk. Par 3:00.
3. **Glasshouse Station** — a garden platform and the morning Botanical Express. Par 3:30.

All artwork is original Canvas 2D vector geometry authored as scene data. The renderer uses the same object lists for both panels, changing only the ten explicit variants. Sounds are synthesized with WebAudio oscillators after interaction. No images or audio files are loaded.

## Build and capture

`MAKEFUN_OUTPUT_DIR=out node main.ts` packages the static game and four screenshots, then builds the competition dossier with the unchanged kit library. Running this again produces the same output bytes.

With the local server running, `node shots.mjs` launches the supplied Chrome using Playwright, tests the game, and captures four real JPEG frames at 1280×800. URL stages are `?shot=play`, `?shot=scene2`, `?shot=title`, and `?shot=complete`; each exposes `window.__shotReady` after rendering. Staged timers are frozen for reproducible captures. Press Restart to return a staged hunt to live play.

The game source has one job per module: configuration, scene data, vector renderer, input, synthesized audio, state and flow, and screenshot staging. MIT licensed; the kit's dossier library is preserved unchanged under `vendor/`.

The capture command requires a host that permits local listening sockets and Chrome subprocesses. It fails visibly if either is denied; screenshots are never substituted with generated illustrations.

`node shots.mjs --logic-only` runs the actual scene, input, renderer, and state modules against a small DOM adapter. It checks the thirty hit targets and scene flow without a browser; it does not establish visual correctness or browser console/network behavior. The full capture command performs those browser checks. Set `PLAYWRIGHT_CORE` or `CHROME_PATH` to override the supplied local installation paths.
