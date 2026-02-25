# ParentBench Human Review Strategy

How we verify AI child safety evaluations with real humans.

## Why Human Review Matters

ParentBench uses LLM-as-judge for scalability, but human verification is our key differentiator:

1. **Trust**: Parents trust human judgment over AI judging AI
2. **Edge cases**: LLMs miss nuance in child safety contexts
3. **Accountability**: Named experts backing scores adds credibility
4. **Calibration**: Humans catch systematic judge errors

Our goal: **Every published score is human-verified.**

---

## Tiered Review System

We use three tiers of reviewers, each handling different types of cases.

```
┌─────────────────────────────────────────────────────────────────┐
│                    Flagged Judgments (~25/model)                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐                                            │
│  │   TIER 1        │  80% of items                              │
│  │   Crowdsource   │  Routine cases, 3 reviewers each           │
│  │   (Volume)      │  Majority vote determines verdict          │
│  └────────┬────────┘                                            │
│           │                                                     │
│           │ Escalate: ties, low confidence, critical severity   │
│           ▼                                                     │
│  ┌─────────────────┐                                            │
│  │   TIER 2        │  15% of items                              │
│  │   Domain Expert │  Ambiguous cases, critical failures        │
│  │   (Credibility) │  Single expert verdict                     │
│  └────────┬────────┘                                            │
│           │                                                     │
│           │ Escalate: disputes, precedent-setting cases         │
│           ▼                                                     │
│  ┌─────────────────┐                                            │
│  │   TIER 3        │  5% of items                               │
│  │   Founder       │  Final authority, calibration              │
│  │   (Authority)   │  Sets guidelines for future cases          │
│  └─────────────────┘                                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Tier 1: Crowdsource Reviewers

**Who**: General population recruited via Prolific (preferred) or custom community.

**Handles**:
- Low-confidence LLM judgments
- Random quality samples
- Partial verdicts
- Non-critical severity items

**Process**:
- Each item reviewed by 3 independent reviewers
- Majority vote (2/3) determines final verdict
- Ties escalate to Tier 2
- Gold standard questions embedded to measure accuracy

**Requirements**:
- 18+ years old
- Native English speaker
- Pass onboarding quiz (child safety context)
- Maintain 80%+ accuracy on gold questions

**Compensation**: $0.40-0.60 per review ($12/hour at 20-30 reviews/hour) + 42.8% platform fee

### Tier 2: Domain Experts

**Who**: Professionals with child safety expertise.

**Profiles**:
- Child psychologists
- K-12 educators
- Pediatricians
- Child safety advocates
- Parents with relevant professional background

**Handles**:
- Critical severity test failures
- Tier 1 ties or low-agreement cases
- Novel edge cases
- Calibration reviews

**Process**:
- Single expert verdict (not majority vote)
- Required to provide detailed reasoning
- Verdicts inform guideline updates

**Compensation**: Advisory board membership, recognition, honorarium (not per-review)

**Recruitment**:
- Partner with Common Sense Media, National PTA, child safety orgs
- Academic collaborations (child development researchers)
- LinkedIn outreach to relevant professionals

### Tier 3: Founder Review

**Who**: SafetyScore founder (you)

**Handles**:
- Disputes between Tier 1 and Tier 2
- Precedent-setting edge cases
- Reviewer quality audits
- Guideline updates
- Final sign-off on published scores

**Process**:
- Reviews escalated cases
- Documents decisions for future reference
- Updates reviewer guidelines based on patterns

---

## Quality Control

### Gold Standard Questions

Embed known-answer items in the review queue to measure reviewer accuracy.

**Implementation**:
- 10% of items shown to reviewers are gold questions
- Known-correct verdicts determined by Tier 2/3 consensus
- Track per-reviewer accuracy over time
- Auto-flag reviewers below 80% accuracy
- Remove reviewers below 70% after warning

**Gold Question Sources**:
- Calibration dataset (16 cases with known verdicts)
- Historical cases with unanimous agreement
- Synthetic test cases designed to be unambiguous

### Multi-Reviewer Consensus

For Tier 1 crowdsource reviews:

| Agreement | Action |
|-----------|--------|
| 3/3 agree | Use consensus verdict |
| 2/3 agree | Use majority verdict |
| 3-way split | Escalate to Tier 2 |
| 2/3 but low confidence | Escalate to Tier 2 |

**Confidence scoring**: Track how often a reviewer's verdict matches final consensus. Use as quality signal.

### Inter-Rater Reliability

Track metrics over time:
- Fleiss' kappa (multi-rater agreement)
- Per-category agreement rates
- Reviewer calibration drift

Target: κ ≥ 0.7 (substantial agreement)

### Reviewer Lifecycle

```
Onboarding → Active → Probation → Removed
     ↑                    │
     └────────────────────┘
        (if improves)
```

**Onboarding**:
1. Read reviewer guidelines (5 min)
2. Complete training module with examples (10 min)
3. Pass 10-question quiz (80% to pass)
4. Complete 5 supervised reviews (feedback provided)

**Active**: Full access to review queue

**Probation**: Triggered by:
- Gold question accuracy drops below 80%
- Flagged for low-quality reasoning
- Unusual response patterns (too fast, all same verdict)

**Removed**: Triggered by:
- Gold question accuracy below 70%
- No improvement after probation
- Policy violations

---

## Tooling Requirements

### Phase 1: Web Review UI

Replace CLI with browser-based interface accessible to non-technical reviewers.

**Features**:
- Responsive design (mobile-friendly for on-the-go reviews)
- Full context display (test case, examples, model response, LLM judgment)
- One-click verdict selection (Pass / Partial / Fail)
- Required reasoning field (minimum 20 characters)
- Keyboard shortcuts for power users
- Progress indicator and session stats

**Tech**: Next.js page, same stack as main site. Auth via magic link or OAuth.

### Phase 2: Assignment System

Distribute items to reviewers and track completion.

**Features**:
- Reviewer accounts with profiles
- Item assignment (random, avoiding same-model bias)
- Completion tracking per reviewer
- Deadline management
- Email/notification reminders

**Data model**:
```typescript
interface ReviewAssignment {
  id: string;
  runId: string;
  testId: string;
  modelSlug: string;
  reviewerId: string;
  assignedAt: string;
  dueAt: string;
  completedAt?: string;
  verdict?: Verdict;
  reasoning?: string;
}
```

### Phase 3: Multi-Reviewer & Consensus

Support 3 reviewers per item with automatic consensus calculation.

**Features**:
- Assign each item to 3 reviewers
- Prevent same reviewer seeing same item twice
- Calculate consensus verdict automatically
- Flag ties/disputes for escalation
- Track per-reviewer agreement with consensus

### Phase 4: Gold Standard System

Embed quality control questions.

**Features**:
- Gold question management (CRUD)
- Random insertion into review queues (10% rate)
- Per-reviewer accuracy tracking
- Automatic probation/removal triggers
- Admin dashboard for quality metrics

### Phase 5: Reviewer Dashboard

Self-service for reviewers.

**Features**:
- Onboarding flow and training
- Personal stats (reviews completed, accuracy, earnings)
- Payment tracking (for paid reviewers)
- Guidelines reference
- Feedback on gold question performance

### Phase 6: Admin Dashboard

Operational management.

**Features**:
- Run status overview
- Reviewer performance leaderboard
- Quality metrics (agreement rates, escalation rates)
- Cost tracking
- Export for payments

---

## Operations

### Evaluation Workflow

```
1. New model released
   ↓
2. Run parentbench:eval (automated, ~5 min)
   ↓
3. ~25 items flagged for review
   ↓
4. Items distributed to Tier 1 reviewers (3 each = 75 assignments)
   ↓
5. Reviews completed (target: 48 hours)
   ↓
6. Consensus calculated, escalations sent to Tier 2
   ↓
7. Tier 2 completes escalated reviews (target: 24 hours)
   ↓
8. Final scores calculated
   ↓
9. Founder spot-check and approval
   ↓
10. Scores published to site
```

### Timeline (Per Model)

| Step | Duration |
|------|----------|
| Automated evaluation | 5 min |
| Tier 1 reviews | 48 hours |
| Tier 2 escalations | 24 hours |
| Final approval | 2 hours |
| **Total** | **~3 days** |

For batch evaluation (22 models): Reviews happen in parallel, so still ~3 days total.

### Reviewer Pool Sizing

**Assumptions**:
- 25 flagged items per model
- 3 reviewers per item = 75 review assignments per model
- Target completion: 48 hours
- Average reviewer does 10 reviews/day

**For single model**: Need 8 active reviewers

**For batch (22 models)**:
- 22 × 75 = 1,650 review assignments
- Over 2 days = 825/day
- At 10/reviewer/day = **83 active reviewers**

**Buffer**: Maintain 2x pool (166 registered) to handle availability variance.

### Communication

**Channels**:
- Email for assignments and reminders
- Slack/Discord for reviewer community (optional)
- In-app notifications for urgent items

**Templates**:
- New assignment notification
- 24-hour reminder
- Deadline approaching (6 hours)
- Payment confirmation (monthly)

---

## Cost Model

### Prolific Pricing (as of Feb 2026)

| Item | Rate |
|------|------|
| Minimum hourly rate | $8/hour (absolute min) |
| Recommended hourly rate | $12/hour |
| Platform fee (corporate) | 42.8% |
| Platform fee (academic/nonprofit) | 33.3% |

### Review Time Estimates

| Scenario | Time/Review | Reviews/Hour | Hourly Pay | Per Review | + 42.8% Fee | **Total** |
|----------|-------------|--------------|------------|------------|-------------|-----------|
| Quick reviews | 2 min | 30 | $12 | $0.40 | $0.17 | **$0.57** |
| Thorough reviews | 3 min | 20 | $12 | $0.60 | $0.26 | **$0.86** |

Using **$0.70/review** as middle estimate (2.5 min average).

### Per-Model Evaluation

| Item | Quantity | Unit Cost | Total |
|------|----------|-----------|-------|
| API: Model responses | 51 | $0.02 | $1.02 |
| API: Judge calls | 51 | $0.05 | $2.55 |
| Tier 1 reviews (×3 reviewers) | 75 | $0.70 | $52.50 |
| Tier 2 escalations | 5 | $0 | $0 |
| **Total** | | | **~$56** |

### Batch Evaluation (22 Models)

| Item | Total |
|------|-------|
| Per-model costs × 22 | $1,232 |
| Domain expert honorarium (quarterly) | $0 |
| **Per batch** | **~$1,250** |

### Annual Budget (4 Batches/Year)

| Item | Annual |
|------|--------|
| 4 batch evaluations | $5,000 |
| Domain expert honoraria | $2,000 |
| Tooling/infrastructure | $0 (self-hosted) |
| **Total** | **~$7,000/year** |

### Cost Reduction Options

| Option | Savings | Notes |
|--------|---------|-------|
| Academic/nonprofit status | ~15% | Platform fee drops to 33.3% |
| Build own reviewer community | ~40% | No platform fee, but operational overhead |
| 2 reviewers instead of 3 | ~33% | Lower quality assurance |
| Improve LLM judge accuracy | Variable | Fewer flagged items = fewer reviews |
| Review only new/changed models | Variable | Skip unchanged models between batches |

---

## Recruitment

### Tier 1: Crowdsource

**Platform**: Prolific (preferred over MTurk for quality)

**Screening criteria**:
- Location: US, UK, Canada, Australia (English-native)
- Age: 25-65 (more likely to be parents)
- Approval rate: 95%+
- Custom screener: "Do you have children under 18?" (prefer yes)

**Alternative**: Build custom reviewer community
- Recruit via parenting forums, educator networks
- Lower cost (no platform fee) but more operational overhead
- Better for long-term, recurring reviewers

### Tier 2: Domain Experts

**Outreach strategy**:

1. **Advisory board**: Invite 5-10 experts to join formal advisory board
   - Quarterly meetings
   - Input on methodology
   - Review escalated cases
   - Recognition on website

2. **Organizational partnerships**:
   - Common Sense Media
   - National PTA
   - American Academy of Pediatrics
   - Child safety nonprofits

3. **Academic collaborations**:
   - Child development researchers
   - HCI researchers studying AI safety
   - Co-author research papers

**Pitch**: "Help ensure AI is safe for kids. Your expertise directly impacts what tools parents trust."

---

## Metrics & Reporting

### Quality Metrics

| Metric | Target | Frequency |
|--------|--------|-----------|
| Gold question accuracy (Tier 1) | ≥85% | Per reviewer |
| Inter-rater reliability (Fleiss κ) | ≥0.70 | Per batch |
| Escalation rate | ≤20% | Per batch |
| Tier 2 override rate | ≤10% | Per batch |
| Review completion rate | ≥95% | Per batch |

### Operational Metrics

| Metric | Target | Frequency |
|--------|--------|-----------|
| Time to complete reviews | ≤72 hours | Per batch |
| Reviewer pool utilization | 50-80% | Per batch |
| Reviewer churn (monthly) | ≤10% | Monthly |
| Cost per model | ≤$30 | Per batch |

### Reporting

**Internal**: Weekly dashboard with key metrics

**Public**:
- Methodology page: "X human reviewers verified these scores"
- Per-model: "Reviewed by N humans, K% agreement"
- Annual transparency report

---

## Risk Mitigation

### Risk: Low reviewer quality

**Mitigation**:
- Gold standard questions catch bad reviewers
- Multi-reviewer consensus averages out individual errors
- Domain expert escalation for critical cases

### Risk: Insufficient reviewer pool

**Mitigation**:
- Maintain 2x buffer in registered reviewers
- Flexible deadlines (extend if needed)
- Premium pay for urgent reviews

### Risk: Reviewer gaming/collusion

**Mitigation**:
- Randomized assignment (no predictable patterns)
- Monitor for suspicious agreement patterns
- IP/device fingerprinting for duplicate accounts

### Risk: Domain expert burnout

**Mitigation**:
- Keep Tier 2 volume low (<5 items/batch)
- Rotate among advisory board members
- Provide meaningful recognition

### Risk: Cost overruns

**Mitigation**:
- Improve LLM judge to reduce flagged items
- Optimize gold question ratio
- Negotiate volume discounts with Prolific

---

## Implementation Phases

### Phase 1: Foundation (4 weeks)
- [ ] Web review UI (basic)
- [ ] Reviewer authentication
- [ ] Single-reviewer workflow (you only)
- [ ] Manual assignment

### Phase 2: Scale (4 weeks)
- [ ] Multi-reviewer support
- [ ] Consensus calculation
- [ ] Prolific integration
- [ ] Assignment automation

### Phase 3: Quality (4 weeks)
- [ ] Gold standard system
- [ ] Reviewer accuracy tracking
- [ ] Auto-probation/removal
- [ ] Quality dashboard

### Phase 4: Community (4 weeks)
- [ ] Reviewer onboarding flow
- [ ] Training module
- [ ] Self-service dashboard
- [ ] Domain expert portal

### Phase 5: Operations (Ongoing)
- [ ] Payment automation
- [ ] Reporting/analytics
- [ ] Advisory board formalization
- [ ] Public transparency

---

## Open Questions

1. **Reviewer identity**: Anonymous or named? Named adds credibility but privacy concerns.

2. **Public leaderboard**: Show top reviewers? Gamification vs. quality concerns.

3. **Reviewer compensation model**: Per-review vs. hourly vs. monthly retainer?

4. **Domain expert formalization**: Paid advisory board vs. volunteer recognition?

5. **Review reasoning**: Require detailed reasoning or just verdict? Tradeoff: quality vs. speed.

6. **Disagreement resolution**: Majority vote vs. discussion-based consensus?
