# Delivery Plan

Last updated: 2026-06-10

## Execution Window

Plan for 10-14 focused days, with the final 2-3 days reserved for submission hardening. The fastest four-day build path is too risky because the video, Devpost copy, architecture diagram, screenshots, and guest demo stability directly affect judging.

## Milestones

| Phase | Output |
| --- | --- |
| Strategy lock | track choice, MVP boundary, demo story |
| UI foundation | onboarding, dashboard, calendar, post detail, analytics shell |
| Auth foundation | Clerk provider, protected app workspace, stable guest/demo path |
| Data foundation | DynamoDB key model, repository layer, seed demo workspace |
| Storage and email foundation | S3 SDK v3 service wrapper, minimal import/export storage path, Resend notification service |
| AI workflow | plan generation, platform rewrite, draft generation, schema validation |
| Execution workflow | status changes, calendar/kanban behavior, optimistic update handling |
| Feedback loop | metric entry/import, analytics cards, next-cycle insights |
| Quality pass | empty/loading/error states, accessibility, responsive checks |
| Submission pack | architecture diagram, Devpost copy, video, screenshots, Team ID note |

## Demo Script Shape

Target length: 2:30-2:50, English narration.

| Time | Screen | Message |
| --- | --- | --- |
| 0:00-0:15 | hero or dashboard | creators need an operating system, not another blank calendar |
| 0:15-0:35 | onboarding | account DNA creates planning context |
| 0:35-1:05 | monthly plan | 30-day plan includes format, keywords, outline, and goal |
| 1:05-1:35 | post detail | one idea becomes variants for LinkedIn, X, YouTube, and Rednote |
| 1:35-1:55 | workflow | status moves from idea to published |
| 1:55-2:15 | metrics | performance data feeds next-cycle insights |
| 2:15-2:40 | architecture diagram | DynamoDB access-pattern design plus Vercel deployment |
| 2:40-2:50 | closing | built to ship, not just demo |

## Release Checklist

- Production Vercel URL is live.
- Guest workspace works without private credentials.
- Clerk login flow works for normal users without blocking the judge demo path.
- S3 import/export or asset flow is scoped and does not expose bucket credentials.
- Resend notification flow is verified with a safe test recipient or non-production smoke path.
- Demo data is reset and stable.
- Primary navigation names match the recorded video.
- Devpost description is English and mentions the database choice.
- Architecture diagram shows Browser, Vercel, AI service, DynamoDB, optional YouTube Data API metrics sync, and CI/CD or preview flow.
- Storage Configuration screenshot is captured.
- Vercel Team ID is recorded outside the repository.
- Demo video is public and under 3 minutes.
- Bonus content links are public and include the required hackathon attribution or hashtag.

## Bonus Content Plan

- D-5: LinkedIn or X post about why CreatorOS uses Vercel and DynamoDB.
- D-3: dev.to or Medium article about DynamoDB access patterns for AI content operations.
- D-1: short build log about moving from v0 scaffold to shippable product.

## Risk Register

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Product feels like a generic AI planner | high | emphasize CreatorOS workflow loop and cross-platform adaptation |
| DynamoDB use looks superficial | high | document and implement explicit access patterns, GSI, and conditional updates |
| Scope grows beyond MVP | high | keep OAuth, auto-publishing, teams, and billing deferred |
| UI feels like a template dashboard | medium-high | polish first screens, states, copy, and information hierarchy |
| Video becomes a feature walkthrough | high | script around problem -> workflow -> architecture -> value |
| Submission misses required material | high | use release checklist before final upload |
| Judging demo breaks | high | keep production stable, seed demo data, avoid last-minute nav renames |
| English copy is weak | medium | polish judge-facing UI, Devpost copy, and narration separately |
