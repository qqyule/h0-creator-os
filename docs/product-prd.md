# Product PRD

Last updated: 2026-06-10

## Goal

CreatorOS helps creators and small teams move from vague positioning to an executable 30-day content system. The MVP should feel like a product that can be used every week, not a one-time generator.

## Target Users

- Solo creators who need a repeatable monthly planning workflow.
- Cross-platform creators who adapt one idea for LinkedIn, X, YouTube, and Rednote.
- Small teams or studios that need content status visibility.
- H0 judges who need to understand the product and architecture quickly without signup friction.

## Golden Path

The MVP must support this path end to end:

1. User enters account DNA during onboarding.
2. System generates a 30-day content plan.
3. User opens a single post detail page.
4. User generates or edits platform variants.
5. User moves the post through workflow status.
6. User enters or imports performance metrics.
7. System returns insight for the next planning cycle.

Every P0 feature should strengthen this path. Features outside this path are deferred unless explicitly approved.

## MVP Pages

| Page | Purpose | Key requirements |
| --- | --- | --- |
| `/onboarding` | capture account DNA | niche, audience, platforms, cadence, tone, goals |
| `/dashboard` | daily command center | plan summary, workflow status, insights, upcoming tasks |
| `/calendar` | 30-day planning view | date-based posts, status visibility, empty/loading/error states |
| `/post/[id]` | post detail workflow | outline, draft, platform variants, status, metrics |
| `/analytics` | feedback loop | manual/CSV metric input, trends, next-cycle insights |

## P0 Capabilities

- Account DNA setup.
- 30-day plan generation.
- Calendar and workflow views.
- Post detail page.
- Platform rewrites for LinkedIn, X, YouTube, and Rednote.
- Status flow: Idea -> Drafting -> Review -> Scheduled -> Published.
- Manual metric entry for views, likes, comments, saves, and followers gained.
- AI insight generated from plan plus metrics.
- Authenticated workspace with Clerk, while preserving a stable guest/demo path for judges.
- Basic file storage path for imports/exports or generated assets through Amazon S3.
- Basic transactional email notifications through Resend, such as plan-ready or workflow reminders.
- Guest/demo workspace for judges.
- English UI with zh-CN support.

## Deferred Scope

- Real social platform OAuth.
- Auto-publishing to third-party platforms.
- Full team permission system.
- Agency multi-client dashboard.
- Advanced billing or subscription flows.
- Realtime collaboration.

These can be mentioned as roadmap items, but they should not block the H0 MVP.

## Product Quality Requirements

- Judge-facing text defaults to English.
- Chinese text is allowed as secondary localized UI, not as the only explanation.
- No user flow should require real social media credentials.
- Authentication should use Clerk; application data must be scoped to the authenticated Clerk user or the demo workspace.
- Uploaded/imported files and generated export artifacts should use Amazon S3 through server-side SDK code or presigned URLs.
- Email notifications should be sent through Resend from server-side code only.
- Empty, loading, error, and disabled states are required for forms and generation flows.
- The guest workspace must remain stable through judging.
