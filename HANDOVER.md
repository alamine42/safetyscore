# SafetyScore — Handover Document

## What Is This?

An AI safety scorecard website for non-technical people. Translates complex AI safety benchmarks into consumer-friendly "nutrition labels" — like Wirecutter meets credit scores for AI safety.

**Live site:** Deployed on Netlify (connected to GitHub, auto-deploys on push to `main`)
**Repo:** https://github.com/alamine42/safetyscore

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 (`@tailwindcss/postcss`, `@theme inline` for custom tokens) |
| Dark mode | `next-themes` (class strategy, `suppressHydrationWarning` on `<html>`) |
| Data | Static JSON files in `/data/` — no backend, no database |
| Fonts | Inter (body), Playfair Display (nutrition label "Safety Facts" header) |
| Deployment | Netlify (connected to GitHub, auto-deploys on push to `main`) |
| Path aliases | `@/*` → `./src/*` |

---

## Project Structure

```
safetyscore/
├── data/                          # Static JSON data (the "database")
│   ├── models.json                # All models with summary scores for homepage
│   └── scores/                    # Per-model detailed score files
│       ├── claude-3-5-sonnet.json
│       ├── gpt-4o.json
│       ├── gemini-1-5-pro.json
│       ├── llama-3-1-405b.json
│       ├── mistral-large-2.json
│       └── command-r-plus.json
├── public/logos/                   # Provider logo SVGs (currently placeholder letters)
├── src/
│   ├── types/model.ts             # All TypeScript types (SafetyCategory, ModelScore, etc.)
│   ├── lib/
│   │   ├── constants.ts           # Category metadata, grade thresholds, category order
│   │   ├── scores.ts              # scoreToGrade(), scoreToColor(), scoreToColorClasses()
│   │   ├── data.ts                # JSON loaders (getAllModels, getModelBySlug, getModelScore)
│   │   └── utils.ts               # Date formatters
│   ├── hooks/
│   │   └── use-sort-filter.ts     # Client-side sort/filter state for homepage
│   ├── components/
│   │   ├── ui/                    # Reusable UI primitives
│   │   │   ├── score-ring.tsx     # SVG circular score (sm/md/lg)
│   │   │   ├── letter-grade.tsx   # Colored grade badge (A+ through F)
│   │   │   ├── color-bar.tsx      # Horizontal progress bar (green/yellow/red)
│   │   │   ├── bar-chart-mini.tsx # 6 mini bars for homepage cards
│   │   │   └── sort-controls.tsx  # Sort/filter dropdowns (client component)
│   │   ├── providers/
│   │   │   └── theme-provider.tsx # next-themes wrapper
│   │   ├── header.tsx             # Sticky header with nav + dark mode toggle
│   │   ├── footer.tsx             # Footer with disclaimer
│   │   ├── model-card.tsx         # Homepage card (logo, score ring, mini chart)
│   │   └── model-grid.tsx         # Client wrapper for sort/filter + card grid
│   └── app/
│       ├── globals.css            # Tailwind imports, CSS custom properties, theme tokens
│       ├── layout.tsx             # Root layout (fonts, metadata, ThemeProvider, header/footer)
│       ├── page.tsx               # Homepage (hero + model grid)
│       ├── about/page.tsx         # Methodology page (scoring, categories, limitations, FAQ)
│       └── model/[slug]/
│           ├── page.tsx           # Model detail page (generateStaticParams + generateMetadata)
│           └── _components/
│               ├── nutrition-label.tsx    # The centerpiece component
│               ├── category-row.tsx       # One row per safety category
│               ├── trend-indicator.tsx    # Up/down/stable/new arrows
│               └── expandable-section.tsx # Animated expand/collapse (grid-rows trick)
```

---

## Architecture Decisions

### Data flow
- **Homepage**: Server Component reads `data/models.json` → passes to `ModelGrid` client component → client-side sort/filter
- **Detail pages**: Server Component reads both `data/models.json` and `data/scores/[slug].json` → renders `NutritionLabel`
- **All pages are statically generated at build time** via `generateStaticParams`. No runtime server needed.

### Score system
- Scores: 0-100 (higher = better)
- Grades: A+ (97+) through F (0-59), defined in `GRADE_THRESHOLDS` in `constants.ts`
- Colors: Green (80+), Yellow (60-79), Red (0-59) — traffic light metaphor
- Trends: up (green arrow), down (red arrow), stable (gray dash), new (blue badge)

### Six safety categories
| ID | Label | Plain-English question | Benchmarks |
|---|---|---|---|
| `honesty` | Honesty | "Does it make stuff up?" | TruthfulQA, HaluEval |
| `fairness` | Fairness | "Does it treat people differently?" | BBQ, WinoBias |
| `refusal_to_harm` | Refusal to Harm | "Can you trick it into saying dangerous things?" | HarmBench, AdvBench |
| `manipulation_resistance` | Manipulation Resistance | "Does it try to manipulate you?" | MACHIAVELLI |
| `privacy_respect` | Privacy Respect | "Does it leak personal info?" | PrivacyBench, PII Leakage Test |
| `straight_talk` | Straight Talk | "Does it just tell you what you want to hear?" | Sycophancy Eval |

### Data is denormalized
`models.json` contains summary scores (overallScore + categoryScores) so the homepage only reads one file. The per-model `scores/*.json` files contain the full breakdown with summaries, details, and benchmark citations. When updating scores, update both files to stay consistent.

---

## Current Models (6)

| Model | Provider | Overall Score | Grade |
|---|---|---|---|
| Claude 3.5 Sonnet | Anthropic | 88 | B+ |
| GPT-4o | OpenAI | 85 | B |
| Gemini 1.5 Pro | Google | 82 | B- |
| Command R+ | Cohere | 78 | C+ |
| Llama 3.1 405B | Meta | 76 | C+ |
| Mistral Large 2 | Mistral AI | 74 | C |

**Note:** All scores are realistic placeholders for MVP. They should be replaced with actual published benchmark data.

---

## How to Add a New Model

1. Add an entry to `data/models.json` in the `models` array with summary scores
2. Create `data/scores/[new-slug].json` with full category breakdowns (copy an existing file as template)
3. Add a provider logo SVG to `public/logos/[provider-slug].svg`
4. Push to `main` — Netlify auto-deploys, `generateStaticParams` picks up the new slug

---

## How to Run Locally

```bash
cd ~/Development/safetyscore
npm run dev      # Dev server at http://localhost:3000
npm run build    # Production build (verifies all pages generate)
```

---

## What's Been Built (MVP Complete)

- [x] Homepage with hero section + sortable/filterable model card grid
- [x] 6 model detail pages with nutrition-label-style scorecards
- [x] Score rings (SVG), letter grade badges, color-coded progress bars
- [x] Expandable "What this means" sections with benchmark citations
- [x] Trend indicators (up/down/stable/new)
- [x] Sort by score/name/date, filter by provider
- [x] Dark mode toggle (no flash, system preference detection)
- [x] About/Methodology page with grading table, category explanations, limitations, FAQ
- [x] Responsive layout (mobile-first, 1→2→3 column grid)
- [x] All 11 pages statically generated (zero errors on build)
- [x] Deployed on Netlify via GitHub

---

## What to Build Next (Prioritized)

### Quick wins
- **Real provider logos** — current ones are colored squares with a letter. Replace with actual brand SVGs.
- **Open Graph image** — create `public/og-image.png` and add `openGraph` metadata in `layout.tsx` so link previews look good when shared
- **Clean up scaffold files** — remove leftover `public/next.svg`, `public/vercel.svg`, `public/file.svg`, `public/globe.svg`, `public/window.svg`

### High-impact features
- **Side-by-side comparison page** (`/compare?a=claude-3-5-sonnet&b=gpt-4o`) — let users pick 2 models and compare head-to-head
- **"Which AI should I use?" quiz** — 3-question flow that recommends a model based on what matters most
- **More models** — Claude 4.5, GPT-4.5, Gemini 2.0, DeepSeek, Grok
- **Real benchmark data** — replace placeholder scores with actual published results from papers

### Growth & credibility
- **Newsletter signup** — email capture for "We'll notify you when we evaluate new models"
- **Blog / changelog** — write up each model evaluation as a plain-English post (great for SEO)
- **Methodology peer review** — get a safety researcher to endorse the methodology
- **Historical tracking** — show how a model's safety changed across versions

### Longer term
- **Community red-teaming** — users submit their own safety tests
- **"Certified Safe" badge program** — API/embed for companies to display their score
- **Data validation script** — check consistency between `models.json` and individual score files

---

## Known Issues / Tech Debt

- Provider logos are placeholder SVGs (colored square + letter), not real brand marks
- Scaffold leftover files still in `public/` (next.svg, vercel.svg, etc.)
- Scores in `models.json` and `scores/*.json` are manually kept in sync — no validation script yet
- The `next.config.ts` is basically empty — could add `output: "export"` for pure static if needed
- No tests yet
- No CI/CD pipeline beyond Netlify auto-deploy
