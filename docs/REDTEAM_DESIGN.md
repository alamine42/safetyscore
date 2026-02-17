# Community Red-Teaming Feature Design

## Overview

Allow users to submit safety test findings for AI models, contributing to SafetyScore's evaluations. Submissions are reviewed by moderators before affecting scores.

## User Flow

1. **Browse** → User sees "Report a Safety Issue" on model pages
2. **Submit** → Fill out structured form with test details
3. **Review** → Submission enters moderation queue
4. **Verify** → Moderators reproduce and validate findings
5. **Integrate** → Verified findings update model scores
6. **Credit** → Contributors attributed on model page

## Submission Form Fields

### Required
- **Model**: Select from available models
- **Category**: Which safety category (honesty, fairness, etc.)
- **Severity**: Low / Medium / High / Critical
- **Test Type**: Jailbreak / Bias / Hallucination / Privacy Leak / Manipulation / Other
- **Description**: What the issue is (min 100 chars)
- **Reproduction Steps**: How to reproduce (min 50 chars)
- **Evidence**: Screenshot or response text

### Optional
- **Contributor Name**: For attribution (or anonymous)
- **Email**: For follow-up questions
- **Platform**: Where tested (API, ChatGPT, Claude.ai, etc.)
- **Model Version**: Specific version if known

## Severity Definitions

| Severity | Impact | Example |
|----------|--------|---------|
| Critical | Immediate harm potential | Generates weapons instructions |
| High | Significant safety gap | Bypasses content filters easily |
| Medium | Notable concern | Shows bias in specific contexts |
| Low | Minor issue | Occasional hallucination |

## Moderation Workflow

### States
1. `pending` - New submission, awaiting review
2. `in_review` - Moderator is investigating
3. `verified` - Confirmed and will affect score
4. `rejected` - Could not reproduce or invalid
5. `duplicate` - Already known issue

### Verification Process
1. Moderator attempts to reproduce the issue
2. If reproducible, assess severity and category
3. Document findings with evidence
4. Update model score if warranted
5. Notify contributor of outcome

## Score Integration

Verified findings affect scores through:

1. **Direct Impact**: Critical/High findings reduce category score
2. **Trend Indicator**: Multiple findings trigger "down" trend
3. **Benchmark Supplement**: Community findings listed alongside formal benchmarks

### Impact Formula
```
score_adjustment = severity_weight * verification_confidence
  where:
    critical = -5 to -10 points
    high = -3 to -5 points
    medium = -1 to -3 points
    low = -0.5 to -1 point
```

## Data Model

### Submission
```typescript
type RedTeamSubmission = {
  id: string;
  modelSlug: string;
  category: SafetyCategory;
  severity: "low" | "medium" | "high" | "critical";
  testType: string;
  description: string;
  reproductionSteps: string;
  evidence: string; // URL or base64
  contributorName?: string;
  contributorEmail?: string;
  platform?: string;
  modelVersion?: string;
  status: "pending" | "in_review" | "verified" | "rejected" | "duplicate";
  submittedAt: string;
  reviewedAt?: string;
  reviewerNotes?: string;
  scoreImpact?: number;
};
```

### Community Stats (per model)
```typescript
type CommunityStats = {
  totalSubmissions: number;
  verifiedFindings: number;
  topContributors: Array<{ name: string; count: number }>;
  recentFindings: Array<{ category: string; severity: string; date: string }>;
};
```

## Implementation Phases

### Phase 1: Static Form + Netlify Forms (MVP)
- Submission form on model pages
- Netlify Forms for collection
- Manual review via email/spreadsheet
- No live score integration yet

### Phase 2: GitHub Integration
- Submissions create GitHub issues
- Use labels for status tracking
- Moderators review via GitHub
- Automated PR for verified findings

### Phase 3: Full Backend
- Dedicated API for submissions
- Admin dashboard for moderation
- Real-time score updates
- Contributor leaderboard

## UI Components

1. **ReportButton** - CTA on model pages
2. **SubmissionForm** - Modal or page with form
3. **CommunityBadge** - Shows community contribution stats
4. **ContributorList** - Attribution section
5. **FindingCard** - Display verified findings

## Security Considerations

- Rate limiting on submissions
- CAPTCHA or similar for spam prevention
- No PII in public findings
- Sanitize all user input
- Moderate before publishing

## Success Metrics

- Submissions per month
- Verification rate
- Time to review
- Unique contributors
- Score adjustments from community data
