# AetherGate Flip-Board

Split-flap message studio built with Next.js. Compose multi-step messages, tune flip speed and sound, add background music, then play fullscreen or share a cinematic link.

## Features

- 6×22 split-flap board with Vietnamese diacritic support
- Multi-step messages with manual or auto advance
- Click sound, flip speed, and music presets (plus Zing MP3 search)
- Fullscreen cinematic playback
- Shareable URLs (`?data=…&view=cinematic&music=…`)

## Local development

```bash
yarn install
yarn dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy on Vercel

1. Push this repo to GitHub (or GitLab / Bitbucket).
2. Import the project in [Vercel](https://vercel.com/new).
3. Framework preset: **Next.js** (auto-detected).
4. Build command: `yarn build` · Install command: `yarn install` · Output: default.
5. Deploy.

### Environment variables (optional)

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Production URL for metadata, Open Graph, sitemap, and canonical links. Example: `https://flip-board.vercel.app`. Vercel sets `VERCEL_URL` automatically; set this when using a custom domain. |

Copy `.env.example` to `.env.local` for local overrides.

### After deploy

- Set `NEXT_PUBLIC_SITE_URL` to your custom domain if you add one.
- Share links encode board state in the URL — no database required.
- Zing MP3 routes (`/api/zing/*`) run as serverless functions on Vercel.

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
