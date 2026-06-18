# CreatorOS H0 Demo Video Recording Script

Last updated: 2026-06-18

## Target

- Final duration: approximately 2:41, never over 3:00.
- Format: 1920x1080, 30fps.
- Footage mix: 122 seconds of real product footage and 39 seconds of Remotion animation.
- Audio: creator-recorded English narration, recorded in short sections.
- Accessibility: burned-in or platform-provided English captions reviewed against the final audio.

All judge-facing text must be English. Do not show private consoles, credentials, account identifiers, Vercel Team ID, or real user data.

## Recording Preparation

- [ ] Freeze the navigation labels and judge-facing routes.
- [ ] Run `pnpm lint`, `pnpm typecheck`, `pnpm build`, and `git diff --check`.
- [ ] Seed the demo workspace with `pnpm exec node scripts/seed-demo-workspace.mjs`.
- [ ] Open `https://creatoros-six.vercel.app/dashboard` in a signed-out browser window.
- [ ] Preload `/onboarding`, `/calendar`, `/post/post-01`, and `/analytics` in separate tabs.
- [ ] Use a 16:9 browser window at 90% or 100% zoom.
- [ ] Record clean source clips without live AI generation or other unpredictable network waits.
- [ ] Prepare to change `post-01` from `Idea` to `Drafting` as the one real write shown on screen.

Do not demonstrate PDF carousel export, YouTube live sync, CSV upload, admin settings, or any cloud-provider console. The analytics page may show the CSV/S3 path and existing data without performing an upload.

## Final Timeline And Narration

| Time | Picture and action | Narration |
| --- | --- | --- |
| 0:00-0:08 | Remotion problem animation: scattered calendar, drafts, metrics, tasks, and variants move into CreatorOS. | “Small creator teams publish like media companies, but their plans, drafts, workflow, and analytics are usually split across disconnected tools.” |
| 0:08-0:24 | Real `/dashboard`: show public access, 30-day plan summary, workflow status, and action items. | “CreatorOS brings that work into one content operations system instead of another blank prompt. This public workspace opens without sign-in and shows what the team is planning, what is in progress, and what needs attention next.” |
| 0:24-0:36 | Real `/onboarding`: show audience, platforms, cadence, tone, and goals without submitting. | “Planning begins with Account DNA: the audience, platforms, cadence, tone, and goals that should guide every plan and platform adaptation. The context stays reusable across the monthly workflow.” |
| 0:36-0:42 | Remotion operating-loop animation. | “That context moves through one operating loop, from planning to publishing, measurement, insight, and the next action.” |
| 0:42-0:58 | Real `/calendar`: show monthly view, post statuses, and task markers. | “The calendar turns strategy into a 30-day operating view. Each post has a date, platform, purpose, and visible workflow state, while task markers surface the work that needs follow-through.” |
| 0:58-1:36 | Real `/post/post-01`: show source outline and draft, then LinkedIn, X, and Rednote variants and previews. | “Inside a post, one idea becomes a production unit. The source outline, draft, platform variants, status, and metrics stay connected. The team can adapt the same idea for LinkedIn, X, YouTube, and Rednote, then compare visual previews, stronger hooks, and tone options before shipping.” |
| 1:36-1:54 | Change status from `Idea` to `Drafting`; show success toast and the persisted UI state. | “Execution is tracked as real workflow state, not a local checklist. Here the post moves from Idea to Drafting through a conditional server-side update that avoids silently overwriting newer work.” |
| 1:54-2:16 | Real `/analytics`: show metrics, CSV import area, insights, and actionable tasks without uploading or generating. | “After publication, metrics close the loop. Teams can record results manually or import CSV data with a server-side S3 backup, then turn performance into insights and actionable tasks for the dashboard and calendar. The next planning cycle starts from evidence instead of guesswork.” |
| 2:16-2:36 | Remotion architecture animation: emphasize the main persistence path and DynamoDB proof card. | “CreatorOS uses DynamoDB because the product reads content by workspace, monthly timeline, workflow status, and platform. A workspace-scoped single-table model with targeted GSIs supports those access patterns, while conditional updates protect workflow changes. Next.js on Vercel reaches DynamoDB only through server-side route and repository layers.” |
| 2:36-2:41 | Remotion closing card with product name and positioning. | “CreatorOS is content operations for cross-platform creator teams.” |

## Narration Recording Notes

- Record each timeline row as a separate take in a quiet room.
- Speak naturally at roughly 120–130 words per minute; do not rush to match the cut.
- Leave a short pause at the start and end of every take for editing.
- Pronounce product terms consistently: “Creator O-S,” “Dynamo D-B,” “G-S-I,” “Electro D-B,” and “Rednote.”
- Use the final edited audio—not the draft text—as the source of truth for subtitle timing.
- Normalize loudness across takes and remove obvious background noise without making the voice sound processed.

## Editing Rules

- Use direct cuts or short dissolves; avoid decorative transitions that hide product behavior.
- Keep the cursor deliberate and remove pauses spent locating controls.
- Use zoom or crop only when a relevant control would otherwise be unreadable at 1080p.
- Show one successful status write, but do not wait for AI generation or external APIs.
- Keep DynamoDB visible before 2:36 and hold the proof card long enough to read its three points.
- Keep all architecture integrations visible, but narrate only the primary persistence path and database decisions.
- After recording the write, reseed `DEMO#judge` and verify the public pages again.

## Final Video QA

- [ ] Duration is below 3:00 and approximately 2:41.
- [ ] Resolution is 1920x1080 at 30fps.
- [ ] Real product footage is at least 120 seconds.
- [ ] Narration is clear, consistent, and free of obvious clipping or noise.
- [ ] English captions match the final narration and fit within safe margins.
- [ ] The working app, status write, DynamoDB choice, and access-pattern decision are visible.
- [ ] No secrets, private IDs, consoles, or real user data appear.
- [ ] The published video plays without authentication in an incognito window.
