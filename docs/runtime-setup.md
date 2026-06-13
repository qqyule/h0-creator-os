# Runtime Setup

Last updated: 2026-06-12

This note documents the external resources needed after the P0 demo fallback is working locally. Do not commit real secrets or private account details.

## Environment Variables

Use `.env.example` as the non-secret template.

Required for authenticated or persisted runtime:

- Clerk: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
- Clerk custom pages: `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`, and dashboard fallback redirect URLs
- Admin-only smoke/settings endpoints: `CREATOROS_ADMIN_CLERK_USER_IDS`
- DynamoDB: `AWS_REGION`, `CREATOROS_TABLE_NAME`
- S3: `CREATOROS_S3_BUCKET`
- Resend: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_TEST_RECIPIENT`
- OpenAI-compatible generation: `OPENAI_API_KEY`, optional `OPENAI_BASE_URL`, optional `OPENAI_MODEL`
- Optional env-only AI fallback provider: `OPENAI_FALLBACK_API_KEY`, optional `OPENAI_FALLBACK_BASE_URL`, optional `OPENAI_FALLBACK_MODEL`
- AI settings page secret storage: `AI_CONFIG_ENCRYPTION_KEY`
- Optional YouTube live metrics sync: `GOOGLE_PUBLIC_API_KEY`

When these are missing, the app keeps the judge path usable through deterministic `DEMO#judge` fallback data.

`proxy.ts` protects `/settings` only when both Clerk public and secret keys are configured. The main judge path (`/dashboard`, `/onboarding`, `/calendar`, `/post/[id]`, and `/analytics`) remains public and demo-safe.

The UI uses `next-intl` with `en-US` as the default locale and `zh-CN` as the secondary locale. Locale choice is stored in the `creatoros-locale` cookie.

`CREATOROS_ADMIN_CLERK_USER_IDS` is a comma-separated allowlist of Clerk user IDs that can call AI settings, S3 presign, and Resend smoke endpoints. If it is missing, those admin endpoints return `403`.

The AI settings page stores encrypted primary provider settings in DynamoDB through the `AiSettings` ElectroDB entity. Saving settings requires DynamoDB configuration; reading settings falls back to `OPENAI_*` environment variables when no saved primary config exists. `OPENAI_FALLBACK_*` is optional, server-side only, and is not exposed in the admin settings UI.

AI generation tries the saved primary provider first, then the optional fallback provider. Provider responses are validated before persistence; if all providers fail, the workflow returns a safe editable demo draft instead of blocking the judge path.

YouTube live metrics sync uses the public YouTube Data API v3 `videos.list` endpoint from a server route. If `GOOGLE_PUBLIC_API_KEY` is missing or the API call fails, the post detail page keeps manual metric entry available.

## DynamoDB Table

Create the table outside the repository:

- Partition key: `pk`
- Sort key: `sk`
- GSI1: `gsi1pk`, `gsi1sk`
- GSI2: `gsi2pk`, `gsi2sk`
- Billing: on-demand for the hackathon build

Runtime app permissions should allow `GetItem`, `PutItem`, `UpdateItem`, and `Query`. Do not grant unrestricted production `Scan` to the web runtime.

## Demo Seed

After `AWS_REGION` and `CREATOROS_TABLE_NAME` point to an existing table, seed the judge workspace:

```bash
pnpm exec node scripts/seed-demo-workspace.mjs
```

The seed script reads `.env.local` and `.env` automatically. You can also pass values inline:

```bash
AWS_REGION=us-east-1 CREATOROS_TABLE_NAME=creatoros-prod-content pnpm exec node scripts/seed-demo-workspace.mjs
```

The script writes deterministic `DEMO#judge` profile, plan, posts, and platform variants. It does not create the table.

## Smoke Checks

Local read-only smoke for the main judge path:

```bash
CREATOROS_BASE_URL=http://localhost:3000 pnpm smoke:main-path
```

After resource configuration, verify:

- `GET /api/v1/profile`
- `GET /api/v1/plans/2026-06`
- `GET /api/v1/posts/post-01`
- `POST /api/v1/posts/post-01/rewrite`
- `PATCH /api/v1/posts/post-01/status`
- `POST /api/v1/metrics/import`
- `PATCH /api/v1/posts/post-01/sync` with `{"externalId":"GpQSUjNsNm0"}` or `{"externalId":"S5xNFmAR2xk"}` when `GOOGLE_PUBLIC_API_KEY` is configured
- `POST /api/v1/analytics/insights`
- `POST /api/v1/assets/presign` with an admin Clerk session
- `POST /api/v1/notifications/test` with an admin Clerk session

## Resource Verification

On 2026-06-12, the AWS resources were fully verified locally using the custom diagnostics tool:
- **DynamoDB Table**: `creatoros-prod-content` is `ACTIVE`.
  - Partition Key: `pk`
  - Sort Key: `sk`
  - GSI1: `gsi1pk` (Partition Key), `gsi1sk` (Sort Key)
  - GSI2: `gsi2pk` (Partition Key), `gsi2sk` (Sort Key)
- **S3 Bucket**: `creatoros-prod-assets` is fully accessible with read, write, and delete permissions successfully validated (via `PutObject` and `DeleteObject` tests).
