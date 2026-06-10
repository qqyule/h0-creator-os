# AGENTS.md

This file defines project-specific rules for CreatorOS. It supplements the global Codex instructions and should be followed by any coding agent working in this repository.

## Project Mission

Build an English-first, judge-friendly B2B CreatorOS for H0 using Vercel and Amazon DynamoDB.

CreatorOS should prove this core workflow:

`onboarding -> monthly plan -> post detail -> platform rewrite -> status workflow -> metrics -> insight`

## Product Rules

- Default locale is `en-US`; `zh-CN` is secondary.
- User-facing routes and slugs should remain English.
- Every P0 feature must support the main demo path.
- The MVP should feel like a content operations system, not a chat-first content generator.
- Do not add real social platform OAuth, auto-publishing, complex team permissions, billing, or realtime collaboration without explicit approval.
- Keep the guest/demo workspace stable through judging.
- Do not rename judge-facing navigation after video recording starts.

## Engineering Rules

- Use `pnpm`; do not mix package managers.
- Follow the existing Next.js App Router, TypeScript, Tailwind, shadcn/ui, and lucide conventions.
- Use next-intl for i18n work; do not introduce a competing i18n system.
- Use ElectroDB for DynamoDB entity modeling and access; do not scatter raw DynamoDB key construction through feature code.
- Use Clerk for authentication and user/session identity; do not introduce a competing auth system.
- Use Amazon S3 through AWS SDK for JavaScript v3 for object storage work; prefer modular `@aws-sdk/*` packages.
- Use Resend for email notifications; do not introduce a competing transactional email provider.
- Keep changes surgical. Do not refactor unrelated dashboard code while adding one feature.
- Server credentials and database/storage/email access must stay server-side.
- Prefer DynamoDB access-pattern design over ad hoc scans, expressed through ElectroDB entities and indexes.
- AI outputs must be validated before persistence.
- Do not commit secrets, tokens, credit codes, Vercel Team ID, real user data, or private sample accounts.
- Do not add production dependencies without explaining the need, alternatives, and impact.
- Preserve English-first judge-facing copy; add Chinese only through an intentional localization path.

## Data And API Rules

- Repository code should be the only layer that directly reads or writes DynamoDB, and it should go through ElectroDB unless there is a documented exception.
- Clerk user IDs should be the authenticated user identity boundary for application data; keep demo workspace data isolated.
- S3 access should go through a server-side storage service or scoped presigned URLs; never expose bucket credentials to the browser.
- Resend access should go through a server-side notification service; never call Resend from Client Components.
- Status-changing writes should be idempotent where practical and should avoid silent overwrite.
- API responses should eventually use a consistent `ok/data/error/traceId` shape.
- Prompt/model failures should be debuggable: keep error category information without leaking secrets or raw internal stack traces to users.

## Verification Rules

- For documentation-only changes, run `git diff --check`.
- For code changes, run `pnpm lint` and, when the change can affect runtime behavior, `pnpm build`.
- The current `package.json` does not define `typecheck` or `test`; do not claim those commands were run until scripts exist.
- If a check cannot run, report the exact reason.
- Never claim a browser, build, lint, or test result that was not actually executed.

## Documentation Rules

- Keep project docs concise and implementation-facing.
- Do not paste long raw planning text into `docs/`; summarize it by category.
- Treat `docs/README.md`, `docs/strategy.md`, `docs/product-prd.md`, `docs/technical-architecture.md`, and `docs/delivery-plan.md` as the daily planning source.
- `docs/H0 Hack the Zero Stack 参赛战略与 CreatorOS 全案.docx` is the complete original project plan. Do not open or re-read it during normal work unless the Markdown docs are insufficient, conflicting, or a major planning decision explicitly requires source-level context.
- Keep H0 deadlines as absolute dates, not relative wording like "today" or "tomorrow".
- Link official rules and resources when documenting competition constraints.
- Do not write local private paths, credentials, or account details into repo docs.

## Frontend Rules

- Build product screens directly; do not create a marketing-only landing page unless asked.
- Use shadcn/ui as the primary component system. Reuse existing local components and styles before introducing new UI patterns.
- Include empty, loading, disabled, and error states for generation and form flows.
- Keep text inside buttons, cards, and navigation from overflowing at mobile and desktop widths.
- Use icons from `lucide-react` when an icon is needed.

## Submission Rules

- Devpost copy, video narration, architecture diagram labels, and judge-facing UI should be understandable in English.
- The demo video must remain under 3 minutes.
- Production should stay accessible and free for judges.
- Store Storage Configuration screenshots, Vercel Team ID, and any private submission-only details outside the repository unless explicitly approved.
