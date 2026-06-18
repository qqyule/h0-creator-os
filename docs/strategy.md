# H0 Strategy

Last updated: 2026-06-18

## Positioning

CreatorOS should not be pitched as a generic AI content calendar. It is content operations for cross-platform creator teams.

Primary public message:

> CreatorOS helps small creator teams plan the next 30 posts, adapt each idea for LinkedIn, X, YouTube, and Rednote, track execution, and turn performance data into the next actions.

Database rationale:

> CreatorOS uses DynamoDB because its core reads are organized by workspace, monthly timeline, workflow status, and platform—access patterns that map naturally to a workspace-scoped single-table model with targeted GSIs.

The strongest differentiator is the workflow loop:

1. Capture account DNA.
2. Generate a 30-day plan.
3. Open one post.
4. Rewrite it for multiple platforms.
5. Move it through execution status.
6. Import or enter metrics.
7. Generate next-cycle insights.

## Competition Strategy

- Primary track: Track 2, Monetizable B2B app.
- Secondary narrative: strong technical implementation through deliberate DynamoDB access-pattern design.
- Product language: English-first. Chinese support is valuable, but all judge-facing copy must be clear in English.
- Main judging risk: looking like "AI chat plus dashboard" instead of a real operating workflow.
- Main mitigation: every demo screen should support the full content operations loop.

## Scoring Map

| Internal focus | Official scoring area | What to show |
| --- | --- | --- |
| Technical complexity | Technical Implementation | DynamoDB model, access patterns, schema validation, Vercel deployment, error handling |
| UX | Design | clear navigation, polished dashboard, usable empty/loading/error states, accessible forms |
| Impact | Impact & Real-World Applicability | concrete B2B user, monthly workflow, metrics feedback loop, subscription potential |
| Originality | Originality | cross-platform and bilingual creator operations, not a generic planner |
| Presentation | Supports all areas | 3-minute demo that explains problem, workflow, architecture, and value |

## Submission Checklist

Required or strongly recommended H0 materials:

- Public English demo video under 3 minutes.
- Devpost text description in English.
- Production Vercel URL.
- Architecture diagram.
- Database/storage explanation.
- Vercel Storage Configuration screenshot.
- Vercel Team ID.
- Free accessible demo during judging.
- Guest workspace or clear test instructions.
- Up to 3 public bonus content pieces for score bonus.

## Credits Ambiguity

The source material and official pages show an ambiguity around AWS credit dates:

- H0 Rules mention AWS credits expiring on 2026-12-31.
- H0 Resources mention AWS credits expiring on 2026-07-31.
- The safe operating rule is to redeem immediately and avoid relying on the later date.

Do not store credit codes, AWS keys, Vercel tokens, or Team ID in the repository.

## Bonus Content Themes

Recommended public content topics:

- Why CreatorOS uses DynamoDB access patterns for content operations.
- From v0 scaffold to a shippable CreatorOS workflow.
- Building an English-first tool for cross-border creators on Vercel and AWS.
