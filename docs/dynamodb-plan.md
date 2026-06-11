# DynamoDB Implementation Plan

Last updated: 2026-06-11

DynamoDB is a core technical proof point for CreatorOS, not just a storage choice. The H0 build should make DynamoDB access-pattern design visible in the code, deployment plan, architecture diagram, and demo evidence.

## Goals

- Show a deliberate DynamoDB single-table design for the CreatorOS workflow.
- Keep all DynamoDB access behind ElectroDB entities and repository functions.
- Prove the product loop with real persistence: account DNA, monthly plan, posts, variants, workflow status, metrics, and insights.
- Avoid ad hoc scans and scattered key construction in feature code.
- Keep judge demo data stable, resettable, and isolated from real Clerk user data.

## Design Principles

- Use one content table for the MVP unless a specific access pattern proves another table is needed.
- Use workspace-scoped partition keys so real users and the demo workspace never mix data.
- Use overloaded GSIs for the two main read dimensions: monthly timeline and workflow/platform views.
- Store AI output only after schema validation.
- Use conditional writes for status transitions and other overwrite-prone updates.
- Keep AWS credentials, table names, and region configuration server-side only.
- Do not grant production app code broad DynamoDB permissions such as unrestricted `Scan`.

## Workspace Boundary

Use a normalized workspace ID as the application data boundary:

- Authenticated workspace: `USER#{clerkUserId}`
- Judge demo workspace: `DEMO#judge`

The table key prefix should use `WORKSPACE#{workspaceId}`. The demo workspace must be seeded with deterministic data and must not depend on private social accounts or real user data.

## Table Shape

Recommended table configuration:

| Setting | Value |
| --- | --- |
| Table name | Environment-specific, for example `creatoros-dev-content` and `creatoros-prod-content` |
| Billing mode | On-demand for the hackathon build |
| Partition key | `pk` |
| Sort key | `sk` |
| GSI1 | `gsi1pk`, `gsi1sk` for monthly timeline reads |
| GSI2 | `gsi2pk`, `gsi2sk` for workflow status and platform reads |
| Encryption | AWS-managed encryption at rest is acceptable for MVP |
| PITR | Enable for production if available in the AWS account |
| TTL | Optional; use only for temporary import jobs or generated artifacts metadata |

## Entity Model

Use ElectroDB entities for all table items. Application features should call repository functions, not DynamoDB clients directly.

| Entity | Primary key | GSI usage | Purpose |
| --- | --- | --- | --- |
| `Profile` | `pk=WORKSPACE#{workspaceId}`, `sk=PROFILE` | none required | Account DNA and creator positioning |
| `MonthlyPlan` | `pk=WORKSPACE#{workspaceId}`, `sk=PLAN#{yyyy-mm}` | `gsi1pk=WORKSPACE#{workspaceId}#MONTH#{yyyy-mm}`, `gsi1sk=PLAN` | Plan summary and generation metadata |
| `Post` | `pk=WORKSPACE#{workspaceId}`, `sk=POST#{postId}` | `gsi1pk=WORKSPACE#{workspaceId}#MONTH#{yyyy-mm}`, `gsi1sk=DATE#{scheduledDate}#POST#{postId}`; `gsi2pk=WORKSPACE#{workspaceId}#STATUS#{status}`, `gsi2sk=DATE#{scheduledDate}#POST#{postId}` | Calendar and workflow item |
| `PlatformVariant` | `pk=WORKSPACE#{workspaceId}`, `sk=POST#{postId}#VARIANT#{platform}` | `gsi2pk=WORKSPACE#{workspaceId}#PLATFORM#{platform}`, `gsi2sk=DATE#{scheduledDate}#POST#{postId}` | LinkedIn, X, YouTube, and Rednote rewrites |
| `DraftVersion` | `pk=WORKSPACE#{workspaceId}`, `sk=POST#{postId}#DRAFT#{platform}#{version}` | optional | Generated or edited drafts |
| `PostMetric` | `pk=WORKSPACE#{workspaceId}`, `sk=POST#{postId}#METRIC#{publishedAt}` | `gsi1pk=WORKSPACE#{workspaceId}#METRICS#{yyyy-mm}`, `gsi1sk=DATE#{publishedAt}#POST#{postId}` | Views, likes, comments, saves, followers gained |
| `Insight` | `pk=WORKSPACE#{workspaceId}`, `sk=INSIGHT#{yyyy-mm}#{generatedAt}` | `gsi1pk=WORKSPACE#{workspaceId}#MONTH#{yyyy-mm}`, `gsi1sk=INSIGHT#{generatedAt}` | Next-cycle insight generated from plan plus metrics |
| `AiSettings` | `pk=CONFIG#{configId}`, `sk=SETTINGS` | none required | Deployment-level AI provider configuration for admin-managed generation settings |

## Required Access Patterns

| Feature | Access pattern | Key/index |
| --- | --- | --- |
| Load account DNA | Get one profile | primary key |
| Save account DNA | Put/update profile | primary key |
| Load monthly plan | Get one plan | primary key |
| List calendar posts | Query posts for workspace and month | GSI1 monthly timeline |
| Open post detail | Query post aggregate by `POST#{postId}` prefix | primary key with sort-key prefix |
| List workflow board | Query posts by status | GSI2 status partition |
| List platform view | Query variants by platform | GSI2 platform partition |
| Change status | Conditional update on post | primary key plus `version` or `updatedAt` condition |
| Save rewrite | Put platform variant | primary key |
| Save metrics | Put metric item | primary key plus GSI1 metrics partition |
| Generate insights | Query plan, posts, and metrics by month | primary key plus GSI1 monthly and metrics partitions |
| Read or save AI settings | Get or put one deployment-level config item | primary key |
| Seed demo workspace | Batch write deterministic items | restricted seed/admin script only |

Production application code should not use table scans. If a seed, migration, or admin-only script needs `Scan`, document it and keep it outside runtime request paths.

## Repository Boundary

Recommended code ownership:

- `lib/dynamodb/client.ts`: server-only DynamoDB client configuration.
- `lib/dynamodb/entities.ts`: ElectroDB entity definitions and table/index names.
- `lib/repositories/profile-repository.ts`: Account DNA reads and writes.
- `lib/repositories/plan-repository.ts`: monthly plan and calendar access.
- `lib/repositories/post-repository.ts`: post detail, variants, drafts, and status updates.
- `lib/repositories/metrics-repository.ts`: metric writes and analytics reads.
- `lib/repositories/insight-repository.ts`: insight persistence.

Repository functions should return typed domain objects. Route handlers and server actions should not know DynamoDB key formats.

## Development Sequence

1. Define domain types and Zod schemas for Profile, MonthlyPlan, Post, PlatformVariant, PostMetric, and Insight.
2. Add server-only environment validation for `AWS_REGION` and `CREATOROS_TABLE_NAME`.
3. Define ElectroDB entities and index names.
4. Implement repository functions using deterministic demo data first, then replace demo reads with DynamoDB-backed reads.
5. Add a seed script for the `DEMO#judge` workspace.
6. Wire route handlers or server actions to repository functions.
7. Add conditional status update handling and conflict responses.
8. Add DynamoDB error categories to API responses without exposing raw AWS internals to users.

## Deployment Plan

- Create separate dev and production DynamoDB tables.
- Use on-demand capacity for the hackathon build to avoid capacity planning errors.
- Store `AWS_REGION`, `CREATOROS_TABLE_NAME`, and AWS credentials in Vercel environment variables, not in repository files.
- Use least-privilege IAM for the Vercel runtime role or access key:
  - Runtime: `GetItem`, `PutItem`, `UpdateItem`, `Query`, and limited `BatchWriteItem` only if needed.
  - Seed/admin scripts: allow extra write permissions only in controlled local or CI contexts.
  - Avoid granting unrestricted `Scan` to the production runtime.
- Enable PITR for production if the AWS account allows it.
- After deployment, run a safe smoke flow against production or preview:
  - load demo profile;
  - generate or load monthly plan;
  - open one post;
  - save a platform variant;
  - update status with a conditional write;
  - save metrics;
  - read insight data.

## Verification And Judging Evidence

Code evidence:

- ElectroDB entity definitions show table, indexes, and access patterns.
- Repository functions centralize all DynamoDB reads and writes.
- No feature component imports DynamoDB clients or constructs raw keys.
- Status update code includes conditional write behavior.

Runtime evidence:

- Demo workspace survives refresh and redeploy.
- Calendar, workflow board, post detail, metrics, and insights read from persisted data.
- A conflict or invalid update returns a clear error instead of silently overwriting.
- Vercel logs show successful repository operations without leaking credentials.

Submission evidence:

- Architecture diagram labels DynamoDB as the primary database and shows repository/ElectroDB boundary.
- Devpost copy explains why DynamoDB fits the access patterns.
- Demo narration briefly calls out single-table design, GSI timeline/status reads, and conditional status updates.
- Storage configuration screenshots and private account details remain outside the repository.

## Risks

- DynamoDB may look cosmetic if only demo seed data is hardcoded. At least one full golden-path flow should persist to DynamoDB before submission.
- Access patterns can become unclear if UI code constructs keys directly. Keep repository boundaries strict.
- Over-modeling can slow the build. Start with the listed access patterns and avoid extra GSIs until a real query needs them.
- Production credentials can leak if AWS config is imported into Client Components. Keep DynamoDB code server-only.
