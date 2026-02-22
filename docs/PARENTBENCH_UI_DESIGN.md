# ParentBench UI & Pages — Design Document

## Overview

This epic adds the user-facing UI for ParentBench, a child safety benchmark that evaluates AI models on safety for children under 16. The data layer is complete (types, scores, loaders). This epic implements the visual interface.

## Goals

1. Create a dedicated `/parentbench` leaderboard page
2. Integrate ParentBench scores into existing model detail pages
3. Add navigation links to ParentBench
4. Optionally show child safety indicators on homepage cards

## Target Users

- Parents evaluating AI safety for their children
- Educators choosing AI tools for classrooms
- AI researchers comparing child safety across models

---

## Task 1: Leaderboard Page (`/parentbench`)

### Page Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│  HERO SECTION                                                       │
│  - ParentBench logo/branding                                        │
│  - Tagline: "Is this AI safe for your kids?"                        │
│  - Dynamic stats from data layer (not hardcoded):                   │
│    • Model count: getParentBenchModelCount()                        │
│    • Test cases: methodology.testCaseCounts (sum)                   │
│    • Last updated: getParentBenchLastUpdated()                      │
├─────────────────────────────────────────────────────────────────────┤
│  CONTROLS                                                           │
│  - Sort: Overall | Age Content | Manipulation | Privacy | Parental  │
│  - Filter: All Providers | Anthropic | OpenAI | Google | ...        │
├─────────────────────────────────────────────────────────────────────┤
│  LEADERBOARD TABLE (all 4 categories)                               │
│  ┌──────┬────────┬─────────┬─────────┬─────────┬─────────┬─────────┐
│  │ Rank │ Model  │ Overall │ Age     │ Manip.  │ Privacy │ Parent. │
│  ├──────┼────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
│  │  1   │ Claude │ 96 A    │ 98      │ 96      │ 94      │ 95      │
│  │  2   │ GPT-5  │ 88 B+   │ 91      │ 87      │ 86      │ 88      │
│  └──────┴────────┴─────────┴─────────┴─────────┴─────────┴─────────┘
├─────────────────────────────────────────────────────────────────────┤
│  METHODOLOGY SECTION                                                │
│  - 4 evaluation areas explained                                     │
│  - Scoring approach                                                 │
│  - Limitations                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Components

- `src/app/parentbench/page.tsx` — Server component, loads data
- `src/app/parentbench/loading.tsx` — Loading skeleton for suspense
- `src/app/parentbench/error.tsx` — Error boundary with retry
- `src/app/parentbench/_components/leaderboard-table.tsx` — Client component for sorting/filtering
- `src/app/parentbench/_components/hero-section.tsx` — Hero with dynamic stats
- `src/app/parentbench/_components/methodology-section.tsx` — Methodology explanation

### Data Flow

```
getParentBenchScores() ─────────┐
getParentBenchMethodology() ────┼─> page.tsx (server) ─> LeaderboardTable (client)
getParentBenchModelCount() ─────┤
getParentBenchLastUpdated() ────┘
```

### Error & Empty States

| State | Behavior |
|-------|----------|
| **Loading** | `loading.tsx` shows skeleton table with shimmer animation |
| **Empty** (0 models) | Show message: "No models evaluated yet" with methodology section still visible |
| **Partial failure** | If methodology loads but scores fail, show methodology + error message for table |
| **Full failure** | `error.tsx` shows friendly message + "Try again" button + support contact |

### Existing Components to Reuse

- `ScoreRing` — Circular score visualization
- `LetterGradeBadge` — Grade pill (A, B+, etc.)
- `ColorBar` — Category score bar (from NutritionLabel)
- Sort/filter pattern from Compare page

### Responsive Behavior

**Breakpoints:**
- Desktop (≥1024px): Full table with all 4 category columns
- Tablet (768px–1023px): Overall + 2 most important categories, horizontal scroll for rest
- Mobile (<768px): Card-based layout instead of table

**Mobile Card Layout:**
```
┌─────────────────────────────────┐
│ #1  [Logo] Claude Opus 4.6      │
│     96 A ●●●●●●●●●●             │
│     ▼ Show category breakdown   │  ◄── aria-expanded, focusable
└─────────────────────────────────┘
```

When expanded:
```
┌─────────────────────────────────┐
│ #1  [Logo] Claude Opus 4.6      │
│     96 A ●●●●●●●●●●             │
│     ▲ Hide breakdown            │
│  ─────────────────────────────  │
│  Age Content     98  ████████   │
│  Manipulation    96  ███████░   │
│  Data Privacy    94  ██████░░   │
│  Parental Ctrl   95  ███████░   │
└─────────────────────────────────┘
```

**Accessibility:**
- Expandable rows use `<details>`/`<summary>` or `aria-expanded`
- Focus order: rank → model link → expand button → category scores (when expanded)
- Table has `role="table"` with proper headers on desktop
- Sort/filter controls fully keyboard accessible

---

## Task 2: Model Detail Page Integration

### Placement

```
Model Detail Page
├── Header (existing)
├── NutritionLabel (existing)
├── ParentBench Badge (NEW) ◄──────────
├── VersionHistory (existing)
└── Footer (existing)
```

### Data Strategy

**Existing loaders already support this efficiently:**
- `getParentBenchScoreBySlug(slug)` — Returns model's ParentBench result
- `computeParentBenchRank(slug)` — Returns 1-indexed rank
- `getParentBenchModelCount()` — Returns total model count

All three use `React.cache()` on the underlying `loadScoresData()`, so multiple calls within a request share the same data. At build time (SSG), each model page loads the cached scores once.

**Tie handling:** Ranking uses alphabetical `modelSlug` as tie-breaker (already implemented in `getParentBenchScores()`).

### Badge Design

```
┌─────────────────────────────────────┐
│  🛡️ ParentBench Child Safety        │
│                                     │
│  ┌─────┐  96   A    Ranked #1       │
│  │     │           of 22 models     │
│  └─────┘                            │
│                                     │
│  Age Content    ████████████ 98     │
│  Manipulation   ███████████░ 96     │
│  Data Privacy   ██████████░░ 94     │
│  Parental Ctrl  ███████████░ 95     │
│                                     │
│  View full leaderboard →            │
└─────────────────────────────────────┘
```

### Edge Cases

| State | Behavior |
|-------|----------|
| **Model not evaluated** | Show "Not yet evaluated" card with link to request evaluation |
| **Data loading fails** | Show error state with "Unable to load" + retry link |
| **Stale data** | Badge shows `evaluatedDate` so users know freshness |

---

## Task 3: Navigation Links

### Header

```
SafetyScore | Models | Compare | ParentBench | Quiz | About
                                    ▲
                            NEW (with badge?)
```

**Decision:** Use shield icon (🛡️) next to "ParentBench" text for visual distinction. Remove "New" badge after 30 days.

### Footer

Add to "Resources" section:
- ParentBench
- (future benchmarks)

### Active State

- Use existing `usePathname()` pattern to highlight when on `/parentbench`
- Mobile nav includes ParentBench in hamburger menu

---

## Task 4: Homepage Cards (Optional, P3)

### Current Card

```
┌─────────────────────┐
│  [Logo]  Claude 4.5 │
│                     │
│  Overall: 93 A      │
│  ████████████████   │
└─────────────────────┘
```

### With ParentBench Badge

```
┌─────────────────────────────┐
│  [Logo]  Claude 4.5         │
│                   🛡️ A      │  ◄── "Child Safe: A" on hover/focus
│  Overall: 93 A              │
│  ████████████████           │
└─────────────────────────────┘
```

**Badge Rules:**
| Condition | Display |
|-----------|---------|
| ParentBench score exists | Show shield + grade (e.g., 🛡️ A) |
| No ParentBench score | No badge (don't show placeholder) |
| ParentBench score < C | Show warning icon? (TBD - may alarm users unnecessarily) |

**Accessibility:**
- Badge has `aria-label="Child Safety Score: A"` or `title` attribute
- Screen readers announce: "Claude 4.5, Overall score A, Child Safety score A"

### Sort Option

Add "Child Safety" to existing sort dropdown on homepage:
- Sorts by `parentBenchScore` descending
- Models without ParentBench scores appear at bottom

---

## Technical Decisions

### Server vs Client Components

| Component | Type | Reason |
|-----------|------|--------|
| `/parentbench/page.tsx` | Server | Data loading at build time |
| `/parentbench/loading.tsx` | Server | Suspense fallback |
| `/parentbench/error.tsx` | Client | Error boundary with retry |
| `LeaderboardTable` | Client | Sort/filter interactions |
| `HeroSection` | Server | Dynamic stats from props |
| `MethodologySection` | Server | Static content from props |
| `ParentBenchBadge` | Server | No interactivity needed |

### SEO

- `generateMetadata()` for `/parentbench`
- Structured data for leaderboard (optional)
- Open Graph image

### Performance

- Static generation for `/parentbench` (ISR optional)
- Data cached via `React.cache()` (already implemented)
- Images optimized via Next.js Image component
- Model detail pages use same cached data as leaderboard

---

## Resolved Questions

1. **Visual identity:** Use shield icon (🛡️) for ParentBench branding, consistent color scheme with existing SafetyScore
2. **Header link:** Include "New" badge temporarily (remove after 30 days)
3. **Mobile layout:** Use card-based layout with expandable category breakdowns (not horizontal scroll)
4. **Homepage cards:** Show badge only when ParentBench data exists, no placeholder for missing data

---

## Risks

1. **Visual clutter** — Adding too many badges/scores may overwhelm users
   - *Mitigation:* Keep homepage badge minimal (icon + letter only)
2. **Mobile UX** — Card layout tested for usability
   - *Mitigation:* Mobile-first design, expandable details
3. **Performance** — Loading ParentBench data on model pages
   - *Mitigation:* Already cached via `React.cache()`; SSG pre-builds all pages
4. **Consistency** — ParentBench visual style must match existing SafetyScore design
   - *Mitigation:* Reuse existing components (ScoreRing, ColorBar, LetterGradeBadge)

---

## Dependencies

All data layer dependencies are complete:
- ✅ `src/types/parentbench.ts`
- ✅ `src/lib/parentbench.ts` (with caching and ranking functions)
- ✅ `data/parentbench/scores.json`
- ✅ `PARENTBENCH_CATEGORY_META` constants

Existing UI components to reuse:
- `ScoreRing`, `LetterGradeBadge`, `ColorBar`
- `SortControls` pattern
- Header/Footer components
