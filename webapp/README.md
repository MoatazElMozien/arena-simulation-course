# Arena Course — Web Application

The web frontend for the **Arena Simulation — Zero to Hero** course.
Renders the course Markdown (living in the parent folder) as an interactive
learning app with live simulations, animated diagrams, search, progress
tracking and scored quizzes.

## Tech stack

- **React 18 + TypeScript** (strict mode)
- **Vite** for dev server & production builds
- **React Router** (hash routing — works on any static host)
- **react-markdown + remark-gfm** for course content
- **ESLint (flat config) + Prettier** for code quality

## Getting started

```powershell
npm install
npm run dev        # http://localhost:5173
```

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Typecheck (`tsc`) + production build to `dist/` |
| `npm run typecheck` | TypeScript only, no emit |
| `npm run lint` / `lint:fix` | ESLint check / auto-fix |
| `npm run format` | Prettier write |
| `npm run preview` | Serve the production build locally |

## Project structure

```
webapp/
├── index.html
├── vite.config.js          # allows ../ md files in dev
├── tsconfig.json           # strict TypeScript
├── eslint.config.js        # ESLint 9 flat config
└── src/
    ├── main.tsx            # entry
    ├── App.tsx             # routes: landing (/) + course shell
    ├── content.ts          # loads ../ *.md as raw strings + search index
    ├── store.tsx           # progress/quizzes/theme (localStorage)
    ├── pages/Landing.tsx   # marketing page + pricing stubs
    ├── components/         # Layout, Markdown, SearchPalette, Badges, Reveal
    ├── sims/               # FlowSim (live DES) + animated SVG diagrams
    └── styles.css          # design tokens, dark mode, landing styles
```

## Content

Course content is plain Markdown in the **parent directory** (`../README.md`,
`../0*.md`, `../exercises/*.md`). Edit any `.md` file and reload — no rebuild
of content needed. The app is the single rendering layer; Markdown stays the
single source of truth.

## Private stats panel (analytics)

The app tracks **privacy-friendly unique visitors** via a serverless API and
shows them on a hidden, password-protected dashboard at **`/#/admin`**.

- `POST /api/track` — called once per browser session; stores
  `sha256(IP + user-agent)` (no cookies, no raw IPs) in Redis.
- `GET /api/stats?token=…` — returns totals + last 14 days; protected by a
  timing-safe check against the `ADMIN_TOKEN` env var.
- `webapp/server/redis.ts` — zero-dependency Upstash Redis REST client.

### One-time setup

1. **Get free Redis REST credentials** — either
   [upstash.com](https://upstash.com) (free tier) or Vercel Marketplace →
   *Upstash for Redis*.
2. **Vercel → Project → Settings → Environment Variables**, add:

   | Variable | Value |
   |----------|-------|
   | `ADMIN_TOKEN` | a long random secret — this is your admin password |
   | `UPSTASH_REDIS_REST_URL` | from Upstash |
   | `UPSTASH_REDIS_REST_TOKEN` | from Upstash |

3. Deploy (Root Directory = `webapp`, framework preset = Vite, build `npm run build`, output `dist`).
4. Open **`https://your-domain/#/admin`**, enter `ADMIN_TOKEN` — done. 🔒

Copy `.env.example` → `.env.local` to test locally with `vercel dev`.

> The panel is intentionally unlinked anywhere in the UI, and the API refuses
> requests without the correct token — knowing the URL alone is not enough.

## Roadmap (sell-ready)

- [x] Landing page with pricing tiers (CTA stubs)
- [x] TypeScript + lint + format tooling
- [x] Private analytics: unique visitors + daily chart at `/#/admin`
- [ ] Stripe checkout for the Pro tier
- [ ] Auth + server-side progress sync (Supabase/Firebase/Clerk)
- [ ] SEO/meta + OG images (migrate to Next.js if marketing demands SSR)
- [ ] CI: GitHub Actions running `lint`, `typecheck`, `build` on every push
- [ ] Deploy to Vercel/Netlify + custom domain
