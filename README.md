Netflix‑style Demo with Next.js (App Router)

Build a small, educational Netflix‑style app using Next.js 15 (App Router), Tailwind v4, and the native HTML5 `<video>` element. The repo includes a set of step‑by‑step lessons in English and Spanish.

### Highlights

- App Router layout + pages under `src/app/`
- Catalog driven by JSON (`src/data/movies.json`) with typed helpers
- Native `<video>` player with multiple sources and subtitles
- Resume playback (localStorage) and a “Continue Watching” row
- Friendly course content in [My Blog](https://coins5.dev/posts/series/netflix-clone/en/01-introduction)

### Project structure

- `src/app/` — layout, home, and watch route
- `src/components/` — `Hero`, `Row`, `MovieCard`, `VideoPlayer`, `ContinueWatching`
- `src/lib/` — catalog types/helpers and subtitles utilities
- `src/hooks/` — `useResume`, `useAutoFullscreen`, `useSubtitles`
- `public/` — videos, posters, subtitles

### Getting started

```bash
npm install
npm run dev
# http://localhost:3000
```

### Sample media

- Place small demo files under `public/videos/` and posters under `public/posters/`.
- You can also reference remote MP4/WebM URLs directly in `src/data/movies.json`.
- Subtitles: prefer `.vtt`; `.srt` is supported via client‑side conversion.

### Scripts

- `npm run covers:svg` — generate SVG cover images for lessons into `public/covers/en/`
- `npm run covers:jpg` — rasterize those SVGs to JPG using Sharp

### Notes

- Tailwind v4 is included via a single `@import "tailwindcss";` in `src/app/globals.css`.
- If you switch posters to `next/image` with remote URLs, set `images.remotePatterns` in `next.config.ts`.

### Credits and licensing

- See `CREDITS.md` for sources and licenses (Blender Open Movies, subtitles, and posters).
- When adding or replacing assets, append entries to `CREDITS.md` and include license texts in `LICENSES/` if required.

### Deploy

- Deploy on Vercel with default settings. Host large media on a bucket/CDN and reference via HTTPS in `movies.json`.
