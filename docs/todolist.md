# TODO List

Last updated: 2026-06-11

This checklist is ordered around the MVP golden path:

`onboarding -> monthly plan -> post detail -> platform rewrite -> status workflow -> metrics -> insight`

## P0 - Golden Path

### UI Route Foundation

- [x] Create the `/onboarding` route for Account DNA setup.
- [x] Move or mirror the current dashboard scaffold into the intended `/dashboard` route.
- [x] Create the `/calendar` route for the 30-day planning view.
- [x] Create the `/post/[id]` route for the post detail workflow.
- [x] Create the `/analytics` route for metrics and next-cycle insights.
- [x] Replace `href="#"` navigation placeholders with real app route links.
- [x] Add empty, loading, disabled, and error states for generation and form flows.
- [x] Check the main demo path at desktop and mobile widths.

### Account DNA And Plan

- [x] Define the Account DNA type: niche, audience, platforms, cadence, tone, and goals.
- [x] Build the onboarding form with clear validation and submit states.
- [x] Save Account DNA through a server-side boundary.
- [x] Define the monthly plan type and 30-day post item type.
- [x] Seed a deterministic demo monthly plan.
- [x] Display plan summary and upcoming work on the dashboard.
- [x] Display date-based post visibility on the calendar.

### Post Detail And Rewrites

- [x] Define the post detail type with outline, draft, platforms, status, and metrics.
- [x] Render a post detail page that can be opened from dashboard or calendar.
- [x] Define platform variant types for LinkedIn, X, YouTube, and Rednote.
- [x] Add platform rewrite UI with loading, success, and error states.
- [x] Validate generated rewrite output before showing or saving it.
- [x] Keep generated and edited variants tied to the source post.

### Workflow Status

- [x] Use the status flow `Idea -> Drafting -> Review -> Scheduled -> Published`.
- [x] Add status controls on post detail.
- [x] Reflect status changes on dashboard and calendar views.
- [x] Make status-changing writes idempotent where practical.
- [x] Avoid silent overwrite by using `version` or `updatedAt` checks when persistence is added.

### Metrics And Insights

- [x] Define metric fields: views, likes, comments, saves, and followers gained.
- [x] Add manual metric entry on post detail or analytics.
- [x] Add CSV import planning only if it does not slow the core manual flow.
- [x] Display analytics trends from demo or persisted metrics.
- [x] Add the global AI provider settings page before wiring generation flows.
- [x] Generate next-cycle insights from plan plus metrics.
- [x] Show insight failure states without blocking the rest of the workflow.

### Auth, Demo, And Persistence

- [/] Integrate Clerk as the only auth provider (backend pipeline complete; frontend UI pending).
- [x] Keep real workspace data scoped by Clerk user ID.
- [x] Preserve a stable guest/demo workspace for judges.
- [x] Add a basic S3 service wrapper or presign endpoint for import/export or generated assets.
- [x] Add a basic Resend notification service for plan-ready or workflow reminder smoke coverage.

### DynamoDB Design, Development, And Deployment

- [ ] Finalize the workspace-scoped single-table model in `docs/dynamodb-plan.md`.
- [ ] Create separate dev and production DynamoDB table configuration.
- [ ] Configure table keys: `pk`, `sk`, `gsi1pk`, `gsi1sk`, `gsi2pk`, and `gsi2sk`.
- [x] Use on-demand billing for the hackathon build.
- [x] Define ElectroDB entities for Profile, MonthlyPlan, Post, PlatformVariant, DraftVersion, PostMetric, and Insight.
- [x] Implement repository functions for profile, plan, post, variant, draft, status, metric, and insight access.
- [x] Keep DynamoDB key construction inside entity or repository code.
- [x] Confirm runtime product reads use `GetItem`, `Query`, `PutItem`, or `UpdateItem`, not table scans.
- [x] Add conditional write behavior for status updates using `version` or `updatedAt`.
- [x] Add a deterministic seed path for the `DEMO#judge` workspace.
- [x] Store `AWS_REGION`, `CREATOROS_TABLE_NAME`, and AWS credentials in Vercel environment variables only.
- [ ] Use least-privilege IAM for runtime DynamoDB access and avoid unrestricted production `Scan`.
- [ ] Run a deployment smoke flow that reads profile, reads plan, opens a post, saves a variant, updates status, saves metrics, and reads insights.
- [x] Capture DynamoDB design evidence for the architecture diagram and Devpost explanation.

## P1 - Quality And Maintainability

### Clerk Frontend Completion

- [x] Create `proxy.ts` at project root with `clerkMiddleware()` to protect authenticated routes while keeping demo and public pages accessible.
- [x] Create `/sign-in` and `/sign-up` routes with Clerk `<SignIn />` and `<SignUp />` components.
- [x] Replace static avatar in `topbar.tsx` with Clerk `<UserButton />`, conditional "Sign in" link, and demo fallback for unconfigured Clerk.
- [x] Verify the demo path remains fully functional when `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is absent.

### General Quality

- [x] Add next-intl with `en-US` as default and `zh-CN` as secondary locale.
- [x] Move main-path user-facing copy into locale message files after route structure stabilizes.
- [x] Add typed API response helpers using the `ok/data/error/traceId` shape.
- [x] Add consistent server-side error categories for AI, database, storage, and notification failures.
- [x] Add lightweight smoke coverage after test scripts are introduced.
- [x] Improve accessibility for keyboard navigation, form labels, focus states, and errors.
- [x] Review LCP, INP, and CLS risk for the demo path after the UI stabilizes; real field metrics still require deployed traffic.
- [x] Keep public copy English-first and avoid Chinese-only judge-facing explanations.

### Security & Serverless Hardening

- [ ] Rename `proxy.ts` to `middleware.ts` at project root to ensure Clerk route protection is recognized and executed by Next.js.
- [ ] Migrate AI Settings persistence from local `.creatoros/ai-settings.json` disk storage to DynamoDB (e.g. ProfileEntity or a new ConfigEntity) to resolve write errors and config loss in Vercel Serverless environment.

## P1.5 - Public Metrics Sync (No-Auth Data Feedback)

### Entity And Service

- [ ] Add optional `youtubeChannelId` to `ProfileEntity` and `accountDnaSchema`.
- [ ] Add optional `externalId` and `publishedUrl` to `PostEntity` and `postSchema`.
- [ ] Create `lib/services/metrics-fetcher-service.ts` with `fetchYoutubeVideoStats(videoId)` using YouTube Data API v3 public endpoint and server-side `GOOGLE_PUBLIC_API_KEY`.
- [ ] Add `GOOGLE_PUBLIC_API_KEY` to `lib/env.ts` validation and `.env.example`.

### API Route

- [ ] Create `/api/v1/posts/[id]/sync/route.ts` (PATCH) that accepts `externalId`, calls `fetchYoutubeVideoStats`, persists via `saveMetric()`, and returns the synced metric with source tag.
- [ ] Handle 403 quota-exceeded and network errors gracefully with typed error responses.

### Frontend Integration

- [ ] Extend `MetricEntryPanel` with a "Sync Live Stats" input field and button above the manual form.
- [ ] Pre-fill a well-known public YouTube video ID as placeholder for instant judge testing.
- [ ] Show `(Live synced)` badge on metrics originating from the public API.
- [ ] Ensure manual metric entry remains fully functional when the Google API key is absent.

### Submission Evidence

- [ ] Add YouTube Data API v3 to the architecture diagram as an optional external data source.
- [ ] Mention no-auth public data sync in Devpost description as a differentiated feature.

## P1.6 - Premium UI & Tone Sandbox

### Mockup Workspace
- [ ] Create `components/mockup-preview.tsx` supporting LinkedIn, X, and Rednote.
- [ ] Implement desktop-like LinkedIn post styling, card headers, reactions, and "See more..." truncation.
- [ ] Implement mobile-like X dark-mode post styling, retweet/heart/views metrics icons.
- [ ] Implement mobile-like Rednote double-column view with double-tap like, description tags, and mock comments.
- [ ] Embed the mockup previews as tabs inside `app/post/[id]/page.tsx` platform variant editor.

### Tone & Hook Sandbox
- [ ] Create `/api/v1/posts/[id]/rewrite/hook` endpoint for generating 3 alternative opening lines.
- [ ] Add "Hook Enhancer" floating widget or popup to replace/paste selected openers in editor.
- [ ] Create "Tone Sandbox" dropdown in the editor, calling the rewrite API with customized tone overrides.
- [ ] Validate Sandbox inputs and ensure fallback values are stable when LLM fails.

## P1.7 - CSV S3 Backup & Actionable Tasks

### S3 & CSV Import
- [ ] Provide CSV template download (`/public/templates/creatoros-metrics-template.csv`).
- [ ] Add dropzone UI in `/analytics` for CSV selection and parsing.
- [ ] Use `assets/presign` to fetch a signed upload URL and store raw CSV in S3 under `imports/`.
- [ ] Map parsed CSV rows to post metrics entities.
- [ ] Show a preview delta comparison table before committing parsed data.

### Closed Loop Tasks
- [ ] Define Task Entity / model for workspace action items if it is separate from posts.
- [ ] Create `/api/v1/analytics/insights/actionable` (POST) to extract task items from AI insights text.
- [ ] Save generated tasks through the content repository layer.
- [ ] Render action items as checkout cards on `/dashboard` and task marks on `/calendar`.

## Submission

- [ ] Re-check official H0 rules and resources before final submission.
- [ ] Deploy the production Vercel URL.
- [x] Verify guest/demo workspace without private credentials.
- [x] Confirm Clerk login does not block the judge demo path.
- [x] Verify S3 flow without exposing bucket credentials.
- [x] Verify Resend smoke path with a safe test recipient or non-production route.
- [ ] Reset or reseed demo data before recording and submission.
- [ ] Freeze judge-facing navigation names before video recording.
- [ ] Create architecture diagram with Browser, Vercel, AI service, DynamoDB, S3, Resend, Clerk, and deploy flow.
- [ ] Write Devpost description in English and explain DynamoDB single-table and access-pattern design.
- [ ] Include DynamoDB runtime proof in the demo script: persisted demo workspace, GSI timeline/status reads, and conditional status updates.
- [ ] Capture storage configuration screenshot outside the repository.
- [ ] Record Vercel Team ID outside the repository.
- [ ] Record and publish a demo video under 3 minutes.
- [ ] Publish up to 3 bonus content links with required hackathon attribution or hashtag.

## Deferred Unless Approved

- [ ] Real social platform OAuth.
- [ ] Auto-publishing to third-party platforms.
- [ ] Full team permission system.
- [ ] Billing or subscription flows.
- [ ] Realtime collaboration.
- [ ] Agency multi-client dashboard.
