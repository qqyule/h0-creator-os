# CreatorOS Documents

Last updated: 2026-06-18

CreatorOS is content operations for cross-platform creator teams. The H0 version proves one complete workflow: plan, adapt, ship, measure, and improve the next 30 posts.

For the judge-facing project summary, live demo link, requirement coverage, and one-glance feature explanation, start with the root [README](../README.md). This file is the implementation-facing documentation index.

## Current Decisions

- Primary competition track: Track 2, Monetizable B2B app.
- Product positioning: `Content operations for cross-platform creator teams.`
- Primary backend choice: Amazon DynamoDB.
- DynamoDB access layer: ElectroDB.
- Object storage: Amazon S3 through AWS SDK for JavaScript v3.
- Authentication: Clerk.
- Email notifications: Resend.
- Optional public metrics sync: YouTube Data API v3 with a server-side Google public API key.
- i18n implementation: next-intl.
- UI system: shadcn/ui as the primary component layer, styled with the existing Tailwind setup.
- Frontend and hosting: Next.js on Vercel, using the existing dashboard scaffold as the starting point.
- Default locale: `en-US`; `zh-CN` is secondary.
- MVP path: onboarding -> monthly plan -> post detail -> platform rewrite -> status workflow -> metrics -> insight.
- Scope guard: no real platform OAuth, auto-publishing integration, or complex team permissions in the MVP unless explicitly approved.

## Document Map

- [H0 Strategy](./strategy.md): competition strategy, scoring, submission requirements, and credits ambiguity.
- [Product PRD](./product-prd.md): users, MVP scope, golden path, page requirements, and out-of-scope items.
- [Technical Architecture](./technical-architecture.md): stack, DynamoDB model, access patterns, API surface, and quality baseline.
- [DynamoDB Implementation Plan](./dynamodb-plan.md): deeper database design, access patterns, deployment, IAM, and judging evidence.
- [Runtime Setup](./runtime-setup.md): environment variables, external resources, demo seed, and smoke checks.
- [Delivery Plan](./delivery-plan.md): 10-14 day execution plan, demo script, release checklist, and risk register.
- [Development Plan](./development-plan.md): implementation sequence from the current scaffold to the MVP golden path.
- [TODO List](./todolist.md): phase-based checklist for P0, P1, submission, and deferred work.
- [Development Log](./development-log.md): concise progress log template for implementation sessions.
- [Submission Pack](./submission-pack.md): final Devpost copy, evidence guardrails, and submission fields.
- [Demo Video Script](./demo-video-recording-script.md): 2:41 recording timeline, narration, and QA checklist.
- [Bonus Content Pack](./bonus-content-pack.md): main article, LinkedIn post, and X thread drafts.

## Daily Development Workflow

1. Read the PRD, technical architecture, DynamoDB plan, and development plan before code changes.
2. Use the TODO list as the active implementation checklist.
3. Record meaningful progress, verification results, risks, and next steps in the development log.
4. Keep repository docs concise; do not paste long raw planning text or private submission-only details into `docs/`.

## Source Notes

This directory condenses the attached planning document into implementation-facing Markdown. H0 rule links were checked on 2026-06-09:

- [H0 Rules](https://h01.devpost.com/rules)
- [H0 Resources](https://h01.devpost.com/resources)

Before final submission, re-check the official pages because deadlines, FAQ wording, and credit details can change.

## Original Full Plan

`docs/H0 Hack the Zero Stack 参赛战略与 CreatorOS 全案.docx` is the complete original project plan. Treat it as source material, not a daily working document.

Default workflow:

1. Use the Markdown files in `docs/` for normal planning and implementation.
2. Open the `.docx` only when the Markdown docs are insufficient, conflicting, or a major project decision needs original source context.
3. If the `.docx` changes an important decision, update the relevant Markdown file instead of making future agents re-read the Word document.
