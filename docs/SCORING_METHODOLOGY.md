# SafetyScore Scoring Methodology

## Overview

SafetyScore translates published AI safety benchmark results into a unified 0-100 scoring system. This document explains our conversion methodology and data sources.

## Data Quality Tiers

Each model is labeled with a data quality indicator:

- **Verified**: Scores derived directly from published benchmark results (papers, model cards, official evaluations)
- **Partial**: Some categories use real benchmark data; others are estimated based on model family performance
- **Estimated**: Limited public safety data available; scores extrapolated from related models or general assessments

## Benchmark Conversion Formulas

### Honesty (TruthfulQA, HaluEval)

**TruthfulQA** measures truthful response generation (higher = better):
- Score = TruthfulQA accuracy percentage
- Example: 81.4% accuracy → 81

**HaluEval** measures hallucination detection (higher = better):
- Score = (1 - hallucination_rate) × 100

### Fairness (BBQ, WinoBias)

**BBQ (Bias Benchmark for QA)** reports accuracy and bias score:
- Score = accuracy × (1 - bias_score) × 100
- Example: 97% accuracy, 0.006 bias → 96

**WinoBias** measures gender bias in coreference:
- Score = accuracy percentage on balanced test set

### Refusal to Harm (HarmBench, AdvBench)

**HarmBench** reports refusal rate against adversarial attacks (higher = better):
- Score = refusal_rate × 100
- Example: 0.981 refusal rate → 98

**AdvBench** measures resistance to jailbreak attempts:
- Score = (1 - attack_success_rate) × 100

### Manipulation Resistance (MACHIAVELLI)

**MACHIAVELLI** measures ethical behavior in game scenarios:
- Score = (1 - violation_rate) × 100
- Violations include: deception, manipulation, harm, stealing

### Privacy Respect (PrivacyBench, PII Leakage)

**PII Leakage Tests** measure personal information disclosure:
- Score = (1 - leakage_rate) × 100

### Straight Talk (Sycophancy Eval)

**Sycophancy Evaluation** measures agreement with incorrect premises:
- Score = (1 - sycophancy_rate) × 100
- Higher score = model pushes back when user is wrong

## Data Sources

### Primary Sources
- Model cards and system cards from providers (Anthropic, OpenAI, Google, Meta)
- Published research papers on safety benchmarks
- HELM Safety leaderboard (Stanford CRFM)
- Third-party safety evaluations (UK AISI, METR)

### Key References
- HarmBench: https://github.com/centerforaisafety/HarmBench
- TruthfulQA: https://arxiv.org/abs/2109.07958
- BBQ: https://arxiv.org/abs/2110.08193
- MACHIAVELLI: https://arxiv.org/abs/2304.03279
- HELM Safety: https://crfm.stanford.edu/helm-safety

## Real Benchmark Data Used

### HarmBench Refusal Rates (HELM Safety v1.0)
| Model | Standard | With Adversarial |
|-------|----------|------------------|
| Claude 3.5 Sonnet | 98.1% | 87.9% |
| GPT-4 Turbo | 89.8% | 60.2% |
| GPT-4o | 82.9% | 62.2% |
| Llama 3 70B | 64.0% | 48.3% |
| Mixtral 8x7B | 45.1% | 31.4% |

### TruthfulQA Accuracy
| Model | Score |
|-------|-------|
| GPT-4o | 81.4% |

### BBQ Bias Evaluation
| Model | Accuracy | Bias Score |
|-------|----------|------------|
| GPT-4 | 97% | 0.006 |

## Overall Score Calculation

The overall safety score is a weighted average of category scores:

```
overall = (honesty × 1.0 + fairness × 1.0 + refusal_to_harm × 1.2 +
           manipulation_resistance × 1.0 + privacy_respect × 1.0 +
           straight_talk × 0.8) / 6.0
```

Refusal to harm is weighted slightly higher due to its critical importance.
Straight talk is weighted slightly lower as it's less safety-critical.

## Limitations

1. **Benchmark coverage**: Not all models have been evaluated on all benchmarks
2. **Version sensitivity**: Scores may change with model updates
3. **Methodology differences**: Different papers may use different evaluation protocols
4. **Estimation uncertainty**: Models with "partial" or "estimated" quality have higher uncertainty

## Updates

Scores are updated when:
- New benchmark results are published
- Model providers release updated safety evaluations
- Independent third-party evaluations become available

Last updated: 2025-02-16
