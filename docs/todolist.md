# TODO List

Last updated: 2026-06-10

This checklist is ordered around the MVP golden path:

`onboarding -> monthly plan -> post detail -> platform rewrite -> status workflow -> metrics -> insight`

## P0 - Golden Path

### UI Route Foundation

- [ ] Create the `/onboarding` route for Account DNA setup.
- [ ] Move or mirror the current dashboard scaffold into the intended `/dashboard` route.
- [ ] Create the `/calendar` route for the 30-day planning view.
- [ ] Create the `/post/[id]` route for the post detail workflow.
- [ ] Create the `/analytics` route for metrics and next-cycle insights.
- [ ] Replace `href="#"` navigation placeholders with real app route links.
- [ ] Add empty, loading, disabled, and error states for generation and form flows.
- [ ] Check the main demo path at desktop and mobile widths.

### Account DNA And Plan

- [ ] Define the Account DNA type: niche, audience, platforms, cadence, tone, and goals.
- [ ] Build the onboarding form with clear validation and submit states.
- [ ] Save Account DNA through a server-side boundary.
- [ ] Define the monthly plan type and 30-day post item type.
- [ ] Seed a deterministic demo monthly plan.
- [ ] Display plan summary and upcoming work on the dashboard.
- [ ] Display date-based post visibility on the calendar.

### Post Detail And Rewrites

- [ ] Define the post detail type with outline, draft, platforms, status, and metrics.
- [ ] Render a post detail page that can be opened from dashboard or calendar.
- [ ] Define platform variant types for LinkedIn, X, YouTube, and Rednote.
- [ ] Add platform rewrite UI with loading, success, and error states.
- [ ] Validate generated rewrite output before showing or saving it.
- [ ] Keep generated and edited variants tied to the source post.

### Workflow Status

- [ ] Use the status flow `Idea -> Drafting -> Review -> Scheduled -> Published`.
- [ ] Add status controls on post detail.
- [ ] Reflect status changes on dashboard and calendar views.
- [ ] Make status-changing writes idempotent where practical.
- [ ] Avoid silent overwrite by using `version` or `updatedAt` checks when persistence is added.

### Metrics And Insights

- [ ] Define metric fields: views, likes, comments, saves, and followers gained.
- [ ] Add manual metric entry on post detail or analytics.
- [ ] Add CSV import planning only if it does not slow the core manual flow.
- [ ] Display analytics trends from demo or persisted metrics.
- [ ] Generate next-cycle insights from plan plus metrics.
- [ ] Show insight failure states without blocking the rest of the workflow.

### Auth, Demo, And Persistence

- [ ] Integrate Clerk as the only auth provider.
- [ ] Keep real workspace data scoped by Clerk user ID.
- [ ] Preserve a stable guest/demo workspace for judges.
- [ ] Add a basic S3 service wrapper or presign endpoint for import/export or generated assets.
- [ ] Add a basic Resend notification service for plan-ready or workflow reminder smoke coverage.

### DynamoDB Design, Development, And Deployment

- [ ] Finalize the workspace-scoped single-table model in `docs/dynamodb-plan.md`.
- [ ] Create separate dev and production DynamoDB table configuration.
- [ ] Configure table keys: `pk`, `sk`, `gsi1pk`, `gsi1sk`, `gsi2pk`, and `gsi2sk`.
- [ ] Use on-demand billing for the hackathon build.
- [ ] Define ElectroDB entities for Profile, MonthlyPlan, Post, PlatformVariant, DraftVersion, PostMetric, and Insight.
- [ ] Implement repository functions for profile, plan, post, variant, draft, status, metric, and insight access.
- [ ] Keep DynamoDB key construction inside entity or repository code.
- [ ] Confirm runtime product reads use `GetItem`, `Query`, `PutItem`, or `UpdateItem`, not table scans.
- [ ] Add conditional write behavior for status updates using `version` or `updatedAt`.
- [ ] Add a deterministic seed path for the `DEMO#judge` workspace.
- [ ] Store `AWS_REGION`, `CREATOROS_TABLE_NAME`, and AWS credentials in Vercel environment variables only.
- [ ] Use least-privilege IAM for runtime DynamoDB access and avoid unrestricted production `Scan`.
- [ ] Run a deployment smoke flow that reads profile, reads plan, opens a post, saves a variant, updates status, saves metrics, and reads insights.
- [ ] Capture DynamoDB design evidence for the architecture diagram and Devpost explanation.

## P1 - Quality And Maintainability

- [ ] Add next-intl with `en-US` as default and `zh-CN` as secondary locale.
- [ ] Move user-facing copy into locale message files after route structure stabilizes.
- [ ] Add typed API response helpers using the `ok/data/error/traceId` shape.
- [ ] Add consistent server-side error categories for AI, database, storage, and notification failures.
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
