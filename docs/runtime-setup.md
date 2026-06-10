# Runtime Setup

Last updated: 2026-06-10

This note documents the external resources needed after the P0 demo fallback is working locally. Do not commit real secrets or private account details.

## Environment Variables

Use `.env.example` as the non-secret template.

Required for authenticated or persisted runtime:

- Clerk: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
- Admin-only smoke/settings endpoints: `CREATOROS_ADMIN_CLERK_USER_IDS`
- DynamoDB: `AWS_REGION`, `CREATOROS_TABLE_NAME`
- S3: `CREATOROS_S3_BUCKET`
- Resend: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_TEST_RECIPIENT`
- OpenAI-compatible generation: `OPENAI_API_KEY`, optional `OPENAI_BASE_URL`, optional `OPENAI_MODEL`
- AI settings page secret storage: `AI_CONFIG_ENCRYPTION_KEY`

When these are missing, the app keeps the judge path usable through deterministic `DEMO#judge` fallback data.

`CREATOROS_ADMIN_CLERK_USER_IDS` is a comma-separated allowlist of Clerk user IDs that can call AI settings, S3 presign, and Resend smoke endpoints. If it is missing, those admin endpoints return `403`.

The AI settings page stores encrypted local runtime settings under `.creatoros/ai-settings.json`. The `.creatoros/` directory is ignored by git and should not be used as the long-term production configuration store.

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

After resource configuration, verify:

- `GET /api/v1/profile`
- `GET /api/v1/plans/2026-06`
- `GET /api/v1/posts/post-01`
- `POST /api/v1/posts/post-01/rewrite`
- `PATCH /api/v1/posts/post-01/status`
- `POST /api/v1/metrics/import`
- `POST /api/v1/analytics/insights`
- `POST /api/v1/assets/presign` with an admin Clerk session
- `POST /api/v1/notifications/test` with an admin Clerk session
