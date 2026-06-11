# Technical Architecture

Last updated: 2026-06-10

## Current Stack

- Framework: Next.js App Router.
- Runtime UI: React 19.
- Styling: Tailwind CSS 4 with shadcn/ui conventions.
- Icons: lucide-react.
- Package manager: pnpm.
- Current scripts: `pnpm dev`, `pnpm build`, `pnpm start`, `pnpm lint`.

The current repository is a dashboard scaffold. Runtime architecture should be added incrementally around the existing style and component conventions.

## Target Stack

| Layer | Choice | Reason |
| --- | --- | --- |
| Frontend | Next.js on Vercel | required deployment path and strong preview workflow |
| UI | shadcn/ui + Tailwind CSS | primary interface system; keep custom components aligned with shadcn/ui patterns |
| i18n | next-intl | locale routing, server/client translations, and English fallback for `zh-CN` gaps |
| Authentication | Clerk | user identity, sessions, and auth-aware route protection for Next.js App Router |
| Primary database | Amazon DynamoDB | fits user -> plan -> post -> status -> metrics access patterns |
| DynamoDB access layer | ElectroDB | typed entity modeling over DynamoDB single-table access patterns |
| Object storage | Amazon S3 with AWS SDK for JavaScript v3 | uploads, imports, exports, and generated artifacts through modular `@aws-sdk/client-s3` APIs |
| Email | Resend | transactional email notifications from server-side code |
| AI orchestration | Vercel AI SDK or direct provider wrapper | structured generation and streaming-friendly UX |
| Public metrics sync | YouTube Data API v3 with server-side API key | optional no-auth video stats feedback loop |
| Validation | Zod | validate AI output before persistence |
| Testing | Vitest and Playwright when added | unit coverage plus demo-path smoke tests |
| Observability | Vercel logs/observability | judge-period stability and debuggability |

## Runtime Flow

Browser UI -> Clerk-authenticated Next.js route or server action -> service layer -> repository layer -> ElectroDB entities -> DynamoDB.

AI generation should run server-side only:

Browser UI -> server route/action -> AI service -> schema validation -> repository write through ElectroDB -> typed response.

File operations should use server-side S3 SDK code or short-lived presigned URLs. Email notifications should go through server-side Resend services.

Never expose AWS, Clerk secret keys, Resend API keys, or AI provider credentials to Client Components.

Optional YouTube metrics sync runs server-side only:

Browser UI -> `/api/v1/posts/:id/sync` -> YouTube Data API v3 `videos.list` -> repository `saveMetric()` -> DynamoDB.

The Google public API key stays in server environment variables and is never sent to the browser.

## DynamoDB Logical Model

DynamoDB is a core judging surface for CreatorOS. The detailed design, deployment, IAM, and verification plan lives in [DynamoDB Implementation Plan](./dynamodb-plan.md). This section is the high-level model only.

Use a single-table design unless a later requirement proves otherwise. ElectroDB should define the entities, indexes, and access patterns so application code does not hand-build DynamoDB keys in scattered feature code.

| Entity | Example key shape | Notes |
| --- | --- | --- |
| PROFILE | `PK=WORKSPACE#{workspaceId}`, `SK=PROFILE` | account DNA |
| PLAN | `PK=WORKSPACE#{workspaceId}`, `SK=PLAN#{yyyy-mm}` | monthly plan summary |
| POST | `PK=WORKSPACE#{workspaceId}`, `SK=POST#{postId}` | calendar and workflow item |
| PLATFORM_VARIANT | `PK=WORKSPACE#{workspaceId}`, `SK=POST#{postId}#VARIANT#{platform}` | adapted content |
| DRAFT | `PK=WORKSPACE#{workspaceId}`, `SK=POST#{postId}#DRAFT#{platform}#{version}` | generated or edited drafts |
| METRIC | `PK=WORKSPACE#{workspaceId}`, `SK=POST#{postId}#METRIC#{publishedAt}` | post performance |
| INSIGHT | `PK=WORKSPACE#{workspaceId}`, `SK=INSIGHT#{yyyy-mm}#{generatedAt}` | next-cycle insight |

Recommended indexes:

- `GSI1`: monthly timeline and metrics reads, for `WORKSPACE#{workspaceId}#MONTH#{yyyy-mm}` or `WORKSPACE#{workspaceId}#METRICS#{yyyy-mm}` sorted by date.
- `GSI2`: workflow and platform reads, for `WORKSPACE#{workspaceId}#STATUS#{status}` or `WORKSPACE#{workspaceId}#PLATFORM#{platform}` sorted by date.

Status updates should use conditional writes with `version` or `updatedAt` to avoid silent overwrite.

## i18n Architecture

- Use next-intl as the required i18n layer.
- Default locale is `en-US`; secondary locale is `zh-CN`.
- Keep route slugs English unless a later routing decision explicitly changes this.
- Store UI messages in locale message files rather than inline bilingual strings.
- Missing `zh-CN` messages should fall back to English instead of showing raw keys.
- Judge-facing pages, screenshots, and video flow should remain understandable in English.

## Core API Surface

Keep the MVP API small:

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/api/v1/profile` | `POST` / `PATCH` | save account DNA |
| `/api/v1/plans/generate` | `POST` | generate monthly plan |
| `/api/v1/plans/:month` | `GET` | read monthly plan |
| `/api/v1/posts/:id` | `GET` / `PATCH` | read or edit one post |
| `/api/v1/posts/:id/rewrite` | `POST` | generate platform variant |
| `/api/v1/posts/:id/draft` | `POST` | generate draft |
| `/api/v1/posts/:id/status` | `PATCH` | change workflow status |
| `/api/v1/metrics/import` | `POST` | import or enter metrics |
| `/api/v1/posts/:id/sync` | `PATCH` | sync public YouTube video stats into metrics |
| `/api/v1/analytics/insights` | `GET` | read generated insights |
| `/api/v1/assets/presign` | `POST` | create scoped S3 upload/download URLs when needed |
| `/api/v1/notifications/test` | `POST` | server-only smoke path for Resend integration in non-production or admin/demo contexts |

Responses should use a consistent shape once API routes exist:

```ts
type ApiResponse<T> =
  | { ok: true; data: T; traceId?: string }
  | { ok: false; error: { code: string; message: string }; traceId?: string }
```

## Quality Baseline

- Performance target: LCP <= 2.5s, INP <= 200ms, CLS <= 0.1.
- Accessibility target: keyboard-operable main flow, clear labels, useful form errors, adequate contrast.
- Auth: Clerk is the source of user identity; keep the judge demo workspace stable and clearly separated from real users.
- Storage: use Amazon S3 through AWS SDK for JavaScript v3; prefer scoped presigned URLs for browser uploads/downloads.
- Email: use Resend for transactional notifications; do not send email directly from Client Components.
- Security: no secrets in repo, no real social credentials in MVP, server-side database/storage/email access only.
- Privacy: use demo data for judges; do not store unnecessary PII.
- i18n: next-intl, default `en-US`, secondary `zh-CN`, English route slugs, English fallback for missing translations.
- AI reliability: validate model output, retry once on invalid JSON/schema mismatch, then return a useful fallback state.
