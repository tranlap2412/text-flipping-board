# AetherGate Flip-Board

A split-flap message studio — compose multi-step messages, tune flip speed and sound, add music, then play fullscreen or share a cinematic link. Optional password protection for shared links.

**Live:** [music.cloudcenter.vn](https://music.cloudcenter.vn)  
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

## Deploy (standalone — VPS / hosting VN)

Zing MP3 streaming needs a **server in Vietnam**. Build a self-contained bundle and run it on your VPS or VN hosting with Node.js 20+.

```bash
yarn install
yarn build
```

Per [Next.js standalone output](https://nextjs.org/docs/app/api-reference/config/next-config-js/output), `yarn build` runs `next build` then copies `public/` and `.next/static/` into `.next/standalone/` before zipping.

This produces:

- `.next/standalone/` — ready to run with `node server.js`
- `dist/text-flipping-board-v{version}-{YYYYMMDD}.zip` — upload to VPS

On the server:

```bash
unzip text-flipping-board-v0.1.0-20250623.zip
cd standalone
PORT=3000 HOSTNAME=0.0.0.0 node server.js
```

Optional env:

| Variable               | Value                              |
| ---------------------- | ---------------------------------- |
| `NEXT_PUBLIC_SITE_URL` | `https://music.cloudcenter.vn`     |
| `PORT`                 | `3000` (or your reverse proxy)   |
| `HOSTNAME`             | `0.0.0.0` (listen on all interfaces)|

Put nginx/Caddy in front for HTTPS.

No database required — share links encode board state in the URL.

## Scripts

```bash
yarn dev              # development server
yarn build            # standalone production build
yarn start:standalone # run .next/standalone/server.js (after build)
yarn lint             # ESLint
```

## Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4
- shadcn/ui (radix-sera)

## Author

William Bond
