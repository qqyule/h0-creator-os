# CreatorOS Submission Pack

Last updated: 2026-06-18

This document contains the final judge-facing copy and evidence checklist for H0. Keep it public-safe: do not add credentials, private account details, Vercel Team ID, private screenshots, or real user data.

## Official Requirements Snapshot

- Submission deadline: June 29, 2026 at 5:00 PM PDT.
- Judging begins June 30, 2026.
- The project must use a required AWS database as the primary backend and deploy its frontend on Vercel or v0.app.
- Required materials include a text description, public video under three minutes, database selection, architecture diagram, published Vercel link, AWS database proof, and Vercel Team ID.
- The demo must remain free and accessible during judging.
- Public build content may qualify for Stage 2 bonus points when it follows the official attribution requirements.

Sources: [H0 Rules](https://h01.devpost.com/rules) and [H0 Resources](https://h01.devpost.com/resources).

## Devpost Copy

### Tagline

Content operations for cross-platform creator teams.

### Project Description

Small creator teams publish like media companies, but they often operate from a patchwork of calendars, documents, platform drafts, and analytics spreadsheets. The difficult part is not generating one more caption. It is carrying the same strategy from planning through execution, measurement, and the next decision.

CreatorOS is an English-first content operations workspace for independent creators, small studios, and cross-border teams publishing on LinkedIn, X, YouTube, and Rednote. It helps a team plan the next 30 posts, adapt each idea for different platforms, track execution, and turn performance data into the next actions.

The workflow starts with Account DNA: audience, niche, platforms, cadence, tone, and goals. CreatorOS turns that context into a monthly plan. Each planned idea opens as a production unit with an outline, draft, platform variants, workflow status, and metrics. After publication, the team can record performance and generate insights and tasks for the next cycle. The result is one continuous operating loop instead of disconnected AI prompts.

### Core Capabilities

1. **Account DNA and a 30-day plan.** Planning starts from a reusable strategy instead of a blank calendar.
2. **Platform adaptation.** One source idea becomes variants for LinkedIn, X, YouTube, and Rednote, with previews, hook alternatives, and tone controls.
3. **Execution workflow.** Posts move through `Idea -> Drafting -> Review -> Scheduled -> Published` with persisted status changes.
4. **Metrics feedback loop.** Teams can enter metrics manually or import CSV data, with raw imports backed up through a server-side S3 path.
5. **Insights and next actions.** Performance data becomes next-cycle insights and actionable tasks visible on the dashboard and calendar.

### Why DynamoDB

CreatorOS uses DynamoDB because its core reads are organized by workspace, monthly timeline, workflow status, and platform—access patterns that map naturally to a workspace-scoped single-table model with targeted GSIs.

The table stores profiles, plans, posts, platform variants, draft versions, metrics, insights, and tasks without exposing key construction to feature code. Primary keys isolate the public `DEMO#judge` workspace from Clerk-backed user workspaces. GSI1 supports monthly timeline and metric queries used by the calendar and analytics views. GSI2 supports workflow status and platform-oriented queries. Status writes use version or timestamp conditions where practical so stale updates do not silently overwrite newer work.

ElectroDB defines the entities and indexes, while a repository layer is the only application layer allowed to read or write DynamoDB. Route handlers call typed repository functions; browser components never construct table keys or receive AWS credentials. This keeps the access-pattern design explicit and makes the database integration part of the product architecture rather than a box checked after the UI was built.

### How It Is Built

The frontend and route handlers run in a Next.js App Router application deployed on Vercel. The primary persistence path is `Browser -> Vercel Route Handler -> Repository -> ElectroDB -> Amazon DynamoDB`. Server-side services also provide scoped S3 storage, Clerk identity, AI generation with schema validation, and optional public metrics integrations. These services support the workflow, but DynamoDB remains the primary application backend.

AI output is validated before persistence. The public demo uses a deterministic, isolated workspace so judges can inspect the full product without creating an account or connecting a social platform. CreatorOS deliberately avoids real social OAuth and auto-publishing in this version; the goal is to prove a reliable content operations loop rather than expand into risky integrations.

### How To Test It

Open [the public dashboard](https://creatoros-six.vercel.app/dashboard) without signing in. Review the monthly operating view, open the calendar, and select `post-01`. In post detail, inspect the source draft and platform variants, change the workflow status, and save manual metrics. Then open analytics to see how metrics produce insights and actionable tasks. The seeded workspace is designed to make this path understandable even when an external AI or public-data provider is unavailable.

### Why It Matters

CreatorOS is designed for small teams that have outgrown isolated writing tools but do not need an enterprise publishing suite. The same workflow can support a solo creator, a small studio, or a cross-border content team that needs repeatable planning, platform adaptation, execution visibility, and learning from results. That creates a clear path to a monetizable B2B workspace while keeping the H0 build focused and testable.

### What Was Built During H0

During H0, CreatorOS became a deployed full-stack application with a DynamoDB/ElectroDB model, repository boundary, workspace isolation, conditional workflow updates, a stable public demo, validated generation flows, metrics import, analytics insights, actionable tasks, and judge-facing submission evidence.

## Demo Video

- Target length: 2:41.
- Format: 1920x1080, 30fps, English narration and captions.
- Real product footage: approximately 122 seconds.
- Remotion animation: 39 seconds.
- Final recording plan and narration: [demo-video-recording-script.md](./demo-video-recording-script.md).

## Submission Fields

- Project name: CreatorOS.
- AWS database used: Amazon DynamoDB.
- Live demo: `https://creatoros-six.vercel.app`.
- Direct judge path: `https://creatoros-six.vercel.app/dashboard`.
- Architecture diagram: `docs/architecture-diagram.png`.
- Public video URL: pending publication.
- Bonus content URLs: pending publication.
- Vercel Team ID and private AWS evidence: stored outside the repository.

## Evidence Checklist

- [x] Production Vercel URL is live.
- [x] Public demo workspace works without sign-in.
- [x] DynamoDB single-table entities and repository boundary are implemented.
- [x] Architecture diagram labels DynamoDB as the primary backend.
- [x] AWS database proof screenshot is captured outside the repository.
- [ ] Vercel Team ID is recorded outside the repository.
- [ ] Final video is public, accessible without sign-in, and under three minutes.
- [ ] Main article, LinkedIn post, and X thread are public and linked in Devpost.
- [ ] Final Devpost page has been checked in an incognito window.

## Claim Guardrails

- Do not claim measured single-digit millisecond latency; no benchmark supports that statement.
- Describe YouTube metrics as optional unless a production success check has been completed.
- Do not demonstrate PDF carousel export until its encoding issue is fixed and verified.
- Do not imply that CreatorOS publishes directly to social platforms.
- Do not show AWS, Vercel, Clerk, or other private consoles in the demo video.
