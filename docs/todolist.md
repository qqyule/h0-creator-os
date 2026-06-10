# TODO List

Last updated: 2026-06-10

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

- [x] Integrate Clerk as the only auth provider.
- [x] Keep real workspace data scoped by Clerk user ID.
- [x] Preserve a stable guest/demo workspace for judges.
- [x] Add a basic S3 service wrapper or presign endpoint for import/export or generated assets.
- [x] Add a basic Resend notification service for plan-ready or workflow reminder smoke coverage.

### DynamoDB Design, Development, And Deployment

- [ ] Finalize the workspace-scoped single-table model in `docs/dynamodb-plan.md`.
- [ ] Create separate dev and production DynamoDB table configuration.
- [ ] Configure table keys: `pk`, `sk`, `gsi1pk`, `gsi1sk`, `gsi2pk`, and `gsi2sk`.
- [ ] Use on-demand billing for the hackathon build.
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

- [x] Add next-intl with `en-US` as default and `zh-CN` as secondary locale.
- [ ] Move user-facing copy into locale message files after route structure stabilizes.
- [x] Add typed API response helpers using the `ok/data/error/traceId` shape.
- [x] Add consistent server-side error categories for AI, database, storage, and notification failures.
- [ ] Add lightweight smoke coverage after test scripts are introduced.
- [ ] Improve accessibility for keyboard navigation, form labels, focus states, and errors.
- [ ] Review LCP, INP, and CLS for the demo path after the UI stabilizes.
- [ ] Keep public copy English-first and avoid Chinese-only judge-facing explanations.

## Submission

- [ ] Re-check official H0 rules and resources before final submission.
- [ ] Deploy the production Vercel URL.
- [ ] Verify guest/demo workspace without private credentials.
- [ ] Confirm Clerk login does not block the judge demo path.
- [ ] Verify S3 flow without exposing bucket credentials.
- [ ] Verify Resend smoke path with a safe test recipient or non-production route.
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
