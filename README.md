# AetherGate Flip-Board

A split-flap message studio — compose multi-step messages, tune flip speed and sound, add music, then play fullscreen or share a cinematic link. Optional password protection for shared links.

**Live:** [text-flipping-board.vercel.app](https://text-flipping-board.vercel.app)  
**Repo:** [github.com/tranlap2412/text-flipping-board](https://github.com/tranlap2412/text-flipping-board)

## Features

- 6×22 split-flap board with **Vietnamese diacritic** support
- Multi-step messages with manual or auto advance
- Click sound, flip speed, music presets, and Zing MP3 search
- Fullscreen cinematic playback
- Shareable URLs with optional **password lock** (`?data=…&view=cinematic&music=…&lock=…`)

## Local development

```bash
yarn install
yarn dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy on Vercel

1. Push to [github.com/tranlap2412/text-flipping-board](https://github.com/tranlap2412/text-flipping-board).
2. Import the project in [Vercel](https://vercel.com/new) — **Next.js** is auto-detected.
3. Build: `yarn build` · Install: `yarn install`.
4. Add environment variable (recommended):

| Variable               | Value                                    |
| ---------------------- | ---------------------------------------- |
| `NEXT_PUBLIC_SITE_URL` | `https://text-flipping-board.vercel.app` |

5. Deploy. Zing MP3 routes (`/api/zing/*`) run as serverless functions in **Singapore (`sin1`)** — see `vercel.json`. After deploy, test Zing stream: `/api/zing/debug?id=ZZEEOWEW` (expect `streaming.err: 0` if the region fix works).

No database required — share links encode board state in the URL.

## Scripts

```bash
yarn dev      # development server
yarn build    # production build
yarn start    # serve production build
yarn lint     # ESLint
```

## Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4
- shadcn/ui (radix-sera)

## Author

William Bond
