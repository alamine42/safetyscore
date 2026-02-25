# SafetyScore — Handover Document

**Last updated:** 2026-02-25 23:30
**Session focus:** ParentBench Evaluation Harness & Human Review Strategy

---

## What Got Done This Session

### 1. Git Cleanup & Beads Management
- Committed and pushed ParentBench changelog post (`38111a1`)
- Added `.gitignore` entries for `investigation.md` and `test-results/`
- Started tracking `.beads/` and `.gitattributes`
- Removed `AGENTS.md`
- Closed 3 completed epics (ParentBench UI, Data Layer, Tests)

### 2. ParentBench Evaluation Harness (Complete)
Built the full evaluation infrastructure to replace illustrative data with real AI safety evaluations.

**Components created:**
- **Model API adapters** (`scripts/parentbench/adapters/`) — Unified interface for 17+ models across Anthropic, OpenAI, and Google
- **Test runner** (`scripts/parentbench/run-eval.ts`) — Runs evaluations with resume support, run manifests for reproducibility
- **LLM Judge** (`scripts/parentbench/judges/`) — Claude Opus primary, GPT-4o fallback, versioned prompts
- **Scoring engine** (`scripts/parentbench/score.ts`) — Calculates scores with completeness enforcement
- **Human review CLI** (`scripts/parentbench/review.ts`) — Interactive terminal-based review interface
- **Calibration system** (`scripts/parentbench/calibrate.ts`) — 16 test cases with known verdicts
- **Run management** (`scripts/parentbench/runs.ts`) — List/view/delete evaluation runs

**Design document:** `docs/parentbench-eval-harness.md`

### 3. First Real Evaluation Run
Successfully ran evaluation on Claude 3 Haiku:
- 51/51 test cases evaluated
- 22 items flagged for human review
- **Results:** Overall 72.7 (C-), notably poor on Data Privacy (37.5 F)

### 4. Human Review Strategy (Complete)
Designed comprehensive human review system as key differentiator.

**Tiered system:**
- **Tier 1:** Crowdsource (Prolific) — 3 reviewers per item, majority vote
- **Tier 2:** Domain experts — Child psychologists, educators, pediatricians
- **Tier 3:** Founder — Final authority, precedent-setting cases

**Quality controls:**
- Gold standard questions (10% of reviews)
- Inter-rater reliability tracking (target κ ≥ 0.7)
- Reviewer lifecycle (onboarding → active → probation → removed)

**Strategy document:** `docs/human-review-strategy.md` (570 lines)

### 5. Human Review Epic Created
Created `safetyscore-cx9` with 13 tasks across 5 phases:
1. Foundation (Web UI, auth, single-reviewer)
2. Scale (multi-reviewer, Prolific, consensus)
3. Quality (gold standards, accuracy tracking)
4. Community (onboarding, training, dashboards)
5. Operations (payments, analytics, transparency)

---

## What Worked

- **Hybrid evaluation approach** — LLM-as-judge for scale, human review for trust
- **Run manifests** — Immutable evaluation runs with full provenance tracking
- **Completeness enforcement** — Prevents publishing unreviewed scores
- **Multi-judge fallback** — Primary Claude fails → fallback to GPT-4o
- **Resume support** — Can restart interrupted evaluation runs
- **Versioned judge prompts** — `prompts/judge-v1.txt` tracked for reproducibility

## What Didn't Work / Gotchas

- **dotenv not loading `.env.local`** — Scripts couldn't see API keys. Fixed by installing dotenv and importing at top of each script.
- **Wrong Anthropic model IDs** — `claude-3-5-haiku-20241022` returned 404. Fixed by using `-latest` aliases (e.g., `claude-3-5-haiku-latest`).
- **Vitest config didn't include scripts** — Tests in `scripts/` weren't running. Fixed by adding `scripts/**/*.test.ts` to vitest include.
- **Initial cost estimates were too low** — Didn't account for Prolific's 42.8% platform fee. Revised from $4K/year to $7K/year.

---

## Key Decisions Made

1. **Prolific over Mechanical Turk** — Higher quality pool, better for child safety context, academic pricing available
2. **3 reviewers per item** — Enables majority vote consensus without excessive cost
3. **Claude Opus as primary judge** — Best reasoning capability for nuanced child safety evaluations
4. **Gold standard questions at 10%** — Catches bad reviewers without excessive overhead
5. **Domain expert advisory board** — Quarterly honorarium, not per-review compensation
6. **Run-based architecture** — Each evaluation is immutable, supports audit trails and reproducibility

---

## Lessons Learned

### Evaluation Harness Design
- Version everything: judge prompts, test cases, model versions
- Build resume support from day 1 — evaluations will fail mid-run
- Separate response collection from judging — enables re-judging without re-running models
- Track provenance (timestamps, versions, runIds) for reproducibility

### Human Review Operations
- Prolific fees are significant (42.8%) — factor into cost models early
- Pool sizing needs 2x buffer for availability variance
- Gold standards are essential for quality — budget 10% of reviews for QA
- Domain experts want recognition, not per-review payment

### Cost Model
| Item | Per Model | Per Batch (22 models) | Annual (4 batches) |
|------|-----------|----------------------|-------------------|
| API costs | $3.57 | $78 | $312 |
| Tier 1 reviews | $52.50 | $1,155 | $4,620 |
| Expert honoraria | - | - | $2,000 |
| **Total** | **$56** | **$1,250** | **$7,000** |

---

## Clear Next Steps

### Immediate (Next Session)
1. Run evaluations on remaining 16 models (OpenAI, Google keys needed)
2. Complete human review of Claude 3 Haiku (22 items in queue)
3. Publish first real ParentBench scores

### Short-term
1. Start Phase 1 of Human Review epic: Web review UI
2. Set up Prolific test study with 5-10 reviewers

### Long-term
1. Build reviewer community and advisory board
2. Scale to quarterly batch evaluations
3. Public transparency reporting

---

## Map of Important Files

### Evaluation Harness (NEW)
```
scripts/parentbench/
├── adapters/
│   ├── types.ts              # ModelAdapter interface, ModelConfig
│   ├── anthropic.ts          # Claude models adapter
│   ├── openai.ts             # GPT/o1 models adapter
│   ├── google.ts             # Gemini models adapter
│   ├── registry.ts           # 17 models mapped to configs
│   └── index.ts              # Unified exports
├── judges/
│   ├── types.ts              # Judge interface, Judgment type
│   ├── claude.ts             # Claude Opus judge
│   ├── openai.ts             # GPT-4o fallback judge
│   └── index.ts              # Multi-judge with fallback
├── prompts/
│   └── judge-v1.txt          # Versioned judge prompt
├── run-eval.ts               # Main test runner
├── judge.ts                  # Judge orchestration
├── score.ts                  # Scoring engine
├── review.ts                 # Human review CLI
├── calibrate.ts              # Judge calibration
├── runs.ts                   # Run management
├── types.ts                  # Core types (EvalRun, ReviewQueue)
└── utils.ts                  # File I/O, logging
```

### Evaluation Data
```
data/parentbench/
├── test-cases.json           # 51 test cases
├── calibration.json          # 16 calibration cases
├── scores.json               # Published scores (illustrative)
├── methodology.json          # Scoring methodology
└── runs/
    └── efe64b0b-.../         # Run manifest, responses, judgments
        ├── run.json          # Run metadata
        ├── review-queue.json # Items needing review
        ├── responses/        # Raw model responses
        └── judgments/        # LLM judge verdicts
```

### Documentation
```
docs/
├── parentbench-eval-harness.md   # Evaluation harness design
└── human-review-strategy.md      # Human review operations
```

### npm Scripts
```json
{
  "parentbench:eval": "tsx scripts/parentbench/run-eval.ts",
  "parentbench:review": "tsx scripts/parentbench/review.ts",
  "parentbench:score": "tsx scripts/parentbench/score.ts",
  "parentbench:calibrate": "tsx scripts/parentbench/calibrate.ts",
  "parentbench:runs": "tsx scripts/parentbench/runs.ts"
}
```

---

## Beads Status

### Closed Epics (6)
- `safetyscore-dbx` — ParentBench UI (12 tasks)
- `safetyscore-x2d` — ParentBench Data Layer (8 tasks)
- `safetyscore-pkc` — ParentBench Tests (4 tasks)
- `safetyscore-zog` — Evaluation Harness (8 tasks)
- Others from previous sessions

### Open Epic (1)
- `safetyscore-cx9` — Human Review System (13 tasks, all pending)

### Quick Reference
```bash
bd list                           # List open tasks
bd ready                          # Show unblocked tasks
bd show safetyscore-cx9           # Show epic details
bd start safetyscore-cx9.1        # Start Phase 1 task
```

---

## Environment Notes

### API Keys Required
```
ANTHROPIC_API_KEY     # Set in .env.local (working)
OPENAI_API_KEY        # Needed for GPT models
GOOGLE_AI_API_KEY     # Needed for Gemini models
```

### Running Evaluations
```bash
# Single model
npm run parentbench:eval -- --model claude-3-haiku

# Multiple models
npm run parentbench:eval -- --model claude-3-haiku,gpt-4o

# Resume interrupted run
npm run parentbench:eval -- --run-id efe64b0b-...

# Review flagged items
npm run parentbench:review -- --run-id efe64b0b-...
```

---

## Session Commits

| Hash | Description |
|------|-------------|
| `38111a1` | Add ParentBench changelog post |
| `54b1a0c` | Track .beads and .gitattributes, gitignore debug files |
| `ed2594b` | Close completed ParentBench epics |
| `0c83ddc` | Add ParentBench evaluation harness design and epic |
| `82785de` | Address Codex design review feedback |
| `1f40149` | Implement ParentBench evaluation harness |
| `021802f` | Fix dotenv loading and model ID aliases |
| `4f3b7d5` | Add human review strategy document |
| `6402dfe` | Create human review system epic |
| `fa4bd30` | Update costs with Prolific pricing |
