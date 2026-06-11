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

Completed (backend pipeline):

- Integrate Clerk as the only authentication provider.
- Preserve a stable guest/demo path that does not require private social credentials.
- Keep demo workspace data isolated from real Clerk user data.
- Avoid storing real user sample accounts or secrets in the repository.
- Implement `resolveWorkspace()` to resolve Clerk session to `USER#clerkUserId` or fall back to `DEMO#judge`.
- Implement `requireAdmin()` guard for admin-only API routes.

Pending (frontend UI layer):

- Create `proxy.ts` at project root using `clerkMiddleware()` to protect authenticated routes while keeping the demo path and public pages accessible.
- Create `/sign-in` and `/sign-up` routes with Clerk `<SignIn />` and `<SignUp />` components.
- Replace the static avatar placeholder in `topbar.tsx` with Clerk `<UserButton />`, conditionally showing a "Sign in" link when the user is unauthenticated.
- Ensure the demo path (`DEMO#judge` workspace) remains fully functional when Clerk environment variables are absent.

Acceptance criteria:

- Normal users can sign up, sign in, and access their own workspace through Clerk identity.
- The topbar shows the real user avatar and sign-out control after login.
- Protected routes redirect unauthenticated users to `/sign-in` instead of silently falling back to demo data.
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

### 5.5 Public Metrics Sync

Add a no-auth data feedback path so creators can pull real performance numbers without OAuth.

- Add an optional `youtubeChannelId` field to the Profile entity and an optional `externalId` / `publishedUrl` pair to the Post entity.
- Create `lib/services/metrics-fetcher-service.ts` to call YouTube Data API v3 public endpoints using a server-side `GOOGLE_PUBLIC_API_KEY`. No user OAuth token is involved.
- Add a `/api/v1/posts/[id]/sync` route that accepts an `externalId`, fetches live stats (views, likes, comments), and persists them through `saveMetric()`.
- Extend the `MetricEntryPanel` in the post detail page with a "Sync Live Stats" input and button so users can paste a YouTube Video ID and pull real numbers in one click.
- Pre-fill a well-known public video ID as the placeholder so judges can test instantly.
- Show a `(Live synced)` badge next to metrics that originate from the public API.
- Keep the Google API key server-side only; never expose it to the browser.
- Gracefully degrade: if the key is not configured or the API call fails, the manual entry form remains fully functional.

Acceptance criteria:

- A judge can paste any public YouTube video ID, click sync, and see real views/likes/comments appear in the metrics panel.
- Synced metrics are persisted to DynamoDB and feed into the AI insight generation loop.
- The feature works without any social platform OAuth or user login on the provider side.
- Manual metric entry is unaffected when the Google API key is absent.

### 5.6 Premium Features (Visual Mockup & Tone Sandbox)

Add high-fidelity visual preview and immediate editing capabilities to elevate the WOW factor and utility of the post-detail screen.

- Implement a mockup component (`VisualMockupWorkspace`) supporting tabbed previews for LinkedIn, X (Twitter), and Rednote (小红书).
  - LinkedIn: Render desktop layout with user avatar, name, mock reaction buttons (Like, Celebrate), and a "See more..." truncation behavior.
  - X: Render a dark-mode mobile post layout with action counts and retweet/heart icons.
  - Rednote: Render a phone-sized double-column layout showing card layout, hearts count, and mock comment inputs.
- Add client-side and server-side Hook & Tone Sandbox controls.
  - Provide an inline "Hook Enhancer" widget that proposes 3 alternative openers (e.g., question, controversial, data-driven).
  - Provide a "Tone Sandbox" dropdown to toggle the variant draft's tone among "Analytic", "Playful", "Provocative", and "Empathetic" based on the workspace Account DNA.

Acceptance criteria:
- A user can toggle a visual preview for each platform and see a simulated platform UI instead of raw text.
- The preview matches platform-specific typography, margins, and icons.
- Post variants can be re-run for tone adjustments directly inside the editor without modifying the master plan.

### 5.7 Closed Loop (CSV Import & Actionable Tasks)

Fulfill PRD storage, import/export, and metric requirements while closing the loop from analysis back to actions.

- Design a standard CSV template for multi-platform metrics (PostID, Views, Likes, Comments, Saves, Followers).
- Add a CSV upload panel inside `/analytics` with drag-and-drop support, uploading raw files to S3 under `imports/` via server-side presigned URLs, and parsing the CSV client-side.
- Render a mapping preview screen before committing changes, showing data deltas between the CSV and current database state.
- Implement an AI Actionable Task Generator endpoint (`POST /api/v1/analytics/insights/actionable`) that takes the latest analytics insights and converts them into 2-3 specific task entities.
- Persist these generated tasks as post reminders or calendar task cards in the workspace database.

Acceptance criteria:
- CSV uploads successfully backup to Amazon S3.
- Parsing parses data correctly, displaying changes before saving to DynamoDB via ElectroDB repository methods.
- Insight pages provide a "Generate Action Items" button, which successfully spawns tasks visible on the dashboard and calendar.

### 5.8 Security & Serverless Hardening

Address critical deployment and security design deviations identified during P0/P1 review.

- Rename `proxy.ts` to `middleware.ts` at the project root to ensure Clerk route protection is properly recognized and executed by Next.js.
- Migrate AI settings persistence from local `.creatoros/ai-settings.json` disk storage to DynamoDB (e.g. as part of ProfileEntity or a separate config model) to avoid write errors and settings loss in the read-only, stateless Vercel Serverless environment.

Acceptance criteria:
- Unauthenticated access to protected routes like `/settings` is correctly blocked and redirected by Next.js Middleware.
- AI settings can be saved and retrieved successfully without any disk-write operations, resolving Vercel deployment compatibility.

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

Public API read-only access (e.g. YouTube Data API v3 with a server-side API key) is allowed because it does not require user OAuth, does not write to external platforms, and does not introduce social login flows. Keep this boundary clear in code reviews.

## Risks

- The product may look like a generic AI planner if the workflow loop is not visible on every main screen.
- DynamoDB may look superficial unless real persistence, access patterns, deployment evidence, and repository boundaries are implemented clearly.
- The demo can become fragile if the guest workspace depends on live provider success.
- Submission quality can suffer if video, Devpost copy, architecture diagram, and screenshots are left until the final day.
- YouTube Data API v3 has a daily quota (10,000 units/day by default). A single video stats request costs 1 unit, so this is unlikely to be a problem for hackathon usage, but the service must handle 403 quota-exceeded responses gracefully.
