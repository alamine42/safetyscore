# SafetyScore

AI Safety Scorecards for non-technical people. Translates complex safety benchmarks into consumer-friendly "nutrition labels."

## Tech Stack
- Next.js 14+ (App Router) + TypeScript
- Tailwind CSS v4 via `@tailwindcss/postcss`
- `next-themes` for dark mode
- Static JSON data (no backend)
- Path aliases: `@/*` → `./src/*`

## Project Structure
- `data/` — Static JSON (models.json + scores/*.json)
- `src/types/` — TypeScript type definitions
- `src/lib/` — Data loaders, score helpers, constants
- `src/components/ui/` — Reusable UI primitives
- `src/components/providers/` — Context providers
- `src/app/model/[slug]/_components/` — Colocated page-specific components

## Conventions
- Server Components by default; add `"use client"` only when needed
- Fonts: Inter (body), Playfair Display (nutrition label headings)
- Colors: green (80-100), yellow (60-79), red (0-59) for scores
- All data loaded via `fs` at build time in server components
