# CreatorOS Bonus Content Pack

Last updated: 2026-06-18

These drafts are public-safe and ready for final platform formatting. Attach `docs/architecture-diagram.png` when publishing, then add each public URL to Devpost and `docs/submission-pack.md`.

## Main Article

# Why CreatorOS Uses DynamoDB Access Patterns for Content Operations

Small creator teams increasingly operate like media companies. They plan a publishing calendar, adapt ideas for several platforms, move drafts through review, collect performance data, and decide what to make next.

The tools rarely reflect that full workflow. Planning might live in a calendar, drafts in documents, platform versions in separate editors, and analytics in a spreadsheet. Adding an AI chat box can generate more text, but it does not solve the operational problem: keeping strategy, execution, and learning connected.

I built CreatorOS for the H0: Hack the Zero Stack hackathon to explore that problem as a real full-stack workflow. CreatorOS helps small creator teams plan the next 30 posts, adapt each idea for LinkedIn, X, YouTube, and Rednote, track execution, and turn performance data into the next actions.

The product runs on Next.js and Vercel, with Amazon DynamoDB as its primary backend. The important decision was not simply connecting a database. It was designing the data around the questions the product needs to answer.

## Start With Access Patterns

CreatorOS repeatedly needs four kinds of reads:

| Access pattern | Product use |
| --- | --- |
| Read by workspace | Isolate the public demo from authenticated creator workspaces |
| Read by monthly timeline | Build the dashboard, calendar, and analytics views |
| Read by workflow status | Find work in Idea, Drafting, Review, Scheduled, or Published |
| Read by platform | Retrieve the LinkedIn, X, YouTube, or Rednote version of a post |

Those reads are predictable and closely tied to the product workflow. That made DynamoDB a natural fit for the application, provided the keys and indexes were designed intentionally.

The public judging workspace uses a stable identifier, `DEMO#judge`. Authenticated workspaces use Clerk identity boundaries. Both follow the same repository operations, but their records remain isolated by workspace-scoped keys.

## One Table, Several Content Entities

The CreatorOS table stores the entities that participate in the operating loop: profile, monthly plan, post, platform variant, draft version, metric, insight, and actionable task. ElectroDB defines those entities and their index attributes.

The primary key groups data within a workspace. GSI1 supports monthly timeline and metric reads, which feed the calendar and analytics views. GSI2 supports workflow status and platform-oriented reads. Product code can therefore query the view it needs without scanning the table or rebuilding key strings inside UI features.

This is also why the application has a repository boundary. Browser components and route handlers do not construct raw DynamoDB keys. Route handlers call typed repository functions, and the repository uses ElectroDB entities to express the access patterns. Keeping that boundary explicit makes the model easier to inspect and prevents feature code from slowly inventing incompatible key conventions.

## Workflow Updates Need Conflict Protection

Content workflow state changes frequently. A post can move from Drafting to Review while another request still holds an older version of the record. A normal overwrite can silently discard newer work.

CreatorOS uses version or timestamp conditions where practical for status-changing writes. If the stored state has changed since the caller loaded it, the update can fail as a conflict instead of pretending the write succeeded. The interface can then ask the user to refresh rather than hiding the race.

That is a small engineering decision, but it matters more to the product than adding another generated-text feature. A content operations system has to preserve the state of the work, not merely produce content.

## The Server Owns Persistence

The main data path is deliberately simple:

`Browser -> Vercel Route Handler -> Repository -> ElectroDB -> Amazon DynamoDB`

AWS credentials never reach the browser. The repository is the only application layer that directly reads or writes DynamoDB. AI outputs are validated before persistence. S3 provides a server-side backup path for raw CSV metric imports, while Clerk supplies the identity boundary for authenticated workspaces.

These integrations support the workflow, but they do not replace the central design: DynamoDB is the primary application backend, and its access patterns match the product screens judges can see.

![CreatorOS architecture diagram](https://raw.githubusercontent.com/qqyule/h0-creator-os/main/docs/architecture-diagram.png)

## A Demo That Does Not Depend on Private Accounts

CreatorOS intentionally avoids social OAuth and auto-publishing in the hackathon version. Those integrations would add risk without improving the main proof.

Instead, judges can open a deterministic public workspace without signing in. They can inspect the monthly plan, open a post, compare platform variants, move the post through workflow status, enter metrics, and see how performance becomes insights and tasks.

The result is not a generic AI calendar. It is a compact content operations loop backed by a data model designed for the way the product is actually read and updated.

Live demo: https://creatoros-six.vercel.app/dashboard

Source: https://github.com/qqyule/h0-creator-os

This project was created for the H0: Hack the Zero Stack hackathon using Vercel and Amazon DynamoDB. #H0Hackathon

## LinkedIn Draft

Small creator teams do not need another disconnected AI writing tool. They need a way to carry the same strategy through planning, platform adaptation, review, publishing, metrics, and the next decision.

I built CreatorOS for the H0: Hack the Zero Stack hackathon to make that loop concrete.

The product helps a team plan the next 30 posts, adapt one idea for LinkedIn, X, YouTube, and Rednote, track workflow status, and turn performance data into next actions.

Amazon DynamoDB is the primary backend because the product has clear access patterns:

- isolate data by workspace;
- read posts by monthly timeline;
- query work by workflow status;
- retrieve variants by platform.

CreatorOS maps those reads to a workspace-scoped single-table model with targeted GSIs. ElectroDB defines the entities and indexes, while a repository layer keeps raw key construction out of feature code. Conditional status updates help prevent stale requests from silently overwriting newer workflow state.

The public demo works without sign-in, so the complete flow is available to inspect:

https://creatoros-six.vercel.app/dashboard

Architecture and source:
https://github.com/qqyule/h0-creator-os

Created for H0: Hack the Zero Stack with Vercel and Amazon DynamoDB. #H0Hackathon #DynamoDB #Vercel

Publishing note: attach `docs/architecture-diagram.png` as the post image.

## X Thread Draft

### Post 1

Small creator teams do not need another AI prompt. They need one workflow for planning, platform adaptation, review, metrics, and the next decision. I built CreatorOS to make that operating loop concrete. 🧵 #H0Hackathon

### Post 2

CreatorOS plans the next 30 posts, adapts one idea for LinkedIn, X, YouTube, and Rednote, tracks workflow status, and turns performance data into next actions.

Public demo—no sign-in required:
https://creatoros-six.vercel.app/dashboard

### Post 3

Why DynamoDB? The product has explicit access patterns:

• isolate records by workspace
• read a monthly timeline
• query by workflow status
• retrieve variants by platform

The database design starts from those reads, not from a generic CRUD schema.

### Post 4

CreatorOS uses a workspace-scoped single-table model. GSI1 supports timeline and metric reads. GSI2 supports status and platform reads. ElectroDB defines the entities and indexes so feature code never needs to assemble raw DynamoDB keys.

### Post 5

Workflow state also needs conflict protection. Status changes use version or timestamp conditions where practical, so a stale request cannot silently overwrite newer work.

Small implementation detail. Important product behavior.

### Post 6

The primary data path stays simple:

Browser → Vercel Route Handler → Repository → ElectroDB → DynamoDB

Architecture and source:
https://github.com/qqyule/h0-creator-os

Built for H0 with Vercel + Amazon DynamoDB. #H0Hackathon

Publishing note: attach `docs/architecture-diagram.png` to Post 3 or Post 6.

## Publication Checklist

- [ ] Publish the main article on dev.to or Medium.
- [ ] Upload the architecture image and confirm it renders publicly.
- [ ] Publish the LinkedIn post with the architecture image.
- [ ] Publish the six-post X thread and attach the architecture image.
- [ ] Open all three links in an incognito window.
- [ ] Confirm the article and posts mention Vercel, Amazon DynamoDB, H0, and `#H0Hackathon`.
- [ ] Add the three public URLs to Devpost and `docs/submission-pack.md`.
