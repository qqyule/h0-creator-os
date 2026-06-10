# Development Plan

Last updated: 2026-06-10

This plan turns the CreatorOS PRD and architecture notes into an implementation sequence. The goal is to ship the H0 MVP path without expanding scope beyond the judging demo.

## Goal

Build the complete content operations loop:

`onboarding -> monthly plan -> post detail -> platform rewrite -> status workflow -> metrics -> insight`

The MVP should feel like a usable B2B workflow system, not a chat-first generator or a static dashboard.

## Current State

- The repository is a Next.js App Router dashboard scaffold.
- The current UI is a static dashboard assembled from `app/page.tsx`, `components/dashboard/*`, and `lib/dashboard-data.ts`.
- There are no dedicated `/onboarding`, `/dashboard`, `/calendar`, `/post/[id]`, or `/analytics` routes yet.
- Clerk, next-intl, ElectroDB, DynamoDB, S3, Resend, AI generation, and persistent repositories are not implemented yet.
- The only available package scripts are `pnpm dev`, `pnpm build`, `pnpm start`, and `pnpm lint`.

## Implementation Phases

DynamoDB is a scoring-critical workstream. UI scaffolding can start with deterministic demo data, but the submission build should prove real DynamoDB persistence through ElectroDB repositories, documented access patterns, conditional status updates, and deployment evidence. Use [DynamoDB Implementation Plan](./dynamodb-plan.md) as the database source of truth.

### 1. UI Route Foundation

Create the product surface before wiring production services.

- Move the existing dashboard scaffold into the intended app route shape.
- Add the MVP pages from the PRD: `/onboarding`, `/dashboard`, `/calendar`, `/post/[id]`, and `/analytics`.
- Keep navigation labels English and stable once demo recording starts.
- Use existing Tailwind, shadcn/ui conventions, and lucide-react icons.
- Include empty, loading, disabled, and error states for generation and form flows.
- Use deterministic demo data so judges can complete the golden path without private credentials.

Acceptance criteria:

- A judge can navigate the full MVP path in the browser with seeded demo content.
- The dashboard no longer feels like an isolated template page.
- Mobile and desktop layouts do not overflow key cards, buttons, or navigation.

### 2. Data Model Foundation

Define the minimum domain model before adding service integrations.

- Model Account DNA with niche, audience, platforms, cadence, tone, and goals.
- Model monthly plans, post items, platform variants, drafts, workflow status, metrics, and insights.
- Keep status values aligned with the PRD: `Idea`, `Drafting`, `Review`, `Scheduled`, `Published`.
- Define platform values for LinkedIn, X, YouTube, and Rednote.
- Keep user data scoped by Clerk user ID or by an explicit demo workspace ID.

Acceptance criteria:

- UI components consume typed domain objects instead of dashboard-only placeholder shapes.
- The demo workspace can be seeded from deterministic data.
- The data model can map cleanly to the planned DynamoDB entities.

### 3. Auth And Demo Workspace

Add identity without blocking judge access.

- Integrate Clerk as the only authentication provider.
- Protect real user workspace routes where appropriate.
- Preserve a stable guest/demo path that does not require private social credentials.
- Keep demo workspace data isolated from real Clerk user data.
- Avoid storing real user sample accounts or secrets in the repository.

Acceptance criteria:

- Normal users can access their own workspace through Clerk identity.
- Judges can still complete the demo path without account setup friction.
- Server-side code remains the boundary for credentials and privileged operations.

### 4. DynamoDB And Repository Layer

Add persistence through ElectroDB and a repository boundary. Treat this as a technical centerpiece, not a late storage swap.

- Implement the workspace-scoped single-table design from the DynamoDB plan.
- Define ElectroDB entities for Profile, MonthlyPlan, Post, PlatformVariant, DraftVersion, PostMetric, and Insight where needed.
- Keep DynamoDB key construction inside repository/entity code, not scattered through pages or components.
- Implement access patterns for account DNA, current monthly plan, calendar posts, status board, platform view, post detail aggregates, metrics, and insights.
- Use conditional writes or version checks for status-changing operations where practical.
- Create a deterministic `DEMO#judge` seed path backed by DynamoDB before final submission.
- Prepare deployment configuration for separate dev and production tables, Vercel environment variables, and least-privilege IAM.

Acceptance criteria:

- Application code reads and writes CreatorOS data through repository functions.
- No Client Component imports server credentials or database clients.
- Runtime app code does not use table scans for product reads.
- The demo path can show real DynamoDB persistence after refresh or redeploy.
- The architecture diagram and Devpost copy can truthfully show DynamoDB access-pattern design.

### 5. AI Workflow

Wire generation behind validated server-side services.

- Implement 30-day plan generation from Account DNA.
- Implement platform rewrites for LinkedIn, X, YouTube, and Rednote.
- Implement draft generation only where it strengthens the post detail workflow.
- Implement insight generation from plan plus metrics.
- Validate AI output before persistence, retry once on invalid JSON or schema mismatch, then return a useful fallback state.
- Keep prompt/model failures debuggable without exposing secrets, raw stack traces, or provider internals to users.

Acceptance criteria:

- Each AI feature returns typed data that can be persisted or safely rejected.
- Failed generation shows a useful error state and does not corrupt stored data.
- The golden path remains usable with demo data if an AI provider is unavailable.

### 6. Submission Hardening

Stabilize the product and judging materials.

- Polish English judge-facing copy, navigation, and empty states.
- Verify responsive behavior for the demo path.
- Prepare architecture diagram labels: Browser, Vercel, AI service, DynamoDB, S3, Resend, Clerk, and preview/deploy flow.
- Prepare Devpost copy, screenshots, and a sub-3-minute video script.
- Keep Vercel Team ID, storage screenshots, credit codes, tokens, and private submission-only details outside the repository unless explicitly approved.

Acceptance criteria:

- Production URL is accessible and stable for judges.
- Guest/demo workspace can be reset or reseeded safely.
- Demo video, Devpost copy, architecture explanation, and storage evidence match the implemented product.

## Verification Strategy

- Documentation-only changes: run `git diff --check`.
- Code changes: run `pnpm lint`.
- Runtime-affecting code changes: run `pnpm build` when practical.
- Browser-facing UI changes: manually preview the affected route on desktop and mobile widths.
- API or persistence changes: verify the request path, expected payload, success response, and error response.
- DynamoDB changes: verify the access pattern, target index, repository function, and whether the operation uses conditional writes or can safely overwrite.
- Do not claim `typecheck` or `test` until scripts exist in `package.json`.

## Scope Guard

Do not add these to the MVP without explicit approval:

- Real social platform OAuth.
- Auto-publishing.
- Complex team permissions.
- Billing or subscription flows.
- Realtime collaboration.
- Agency multi-client dashboard.

## Risks

- The product may look like a generic AI planner if the workflow loop is not visible on every main screen.
- DynamoDB may look superficial unless real persistence, access patterns, deployment evidence, and repository boundaries are implemented clearly.
- The demo can become fragile if the guest workspace depends on live provider success.
- Submission quality can suffer if video, Devpost copy, architecture diagram, and screenshots are left until the final day.
