import Link from "next/link"
import { ArrowRight, CalendarDays, CheckCircle2, Sparkles, Target, Workflow } from "lucide-react"
import { notFound } from "next/navigation"
import { AppShell } from "@/components/app/app-shell"
import { PlatformPill } from "@/components/app/platform-pill"
import { StatusBadge } from "@/components/app/status-badge"
import { Button } from "@/components/ui/button"
import { workflowStatuses, type DashboardSummary } from "@/lib/domain"
import { DEMO_MONTH } from "@/lib/demo-data"
import { ContentNotFoundError, getDashboardSummary } from "@/lib/repositories/content-repository"
import { resolveWorkspace } from "@/lib/workspace"

export default async function DashboardPage() {
  const workspace = await resolveWorkspace()
  let summary: DashboardSummary
  try {
    summary = await getDashboardSummary(workspace.workspaceId, DEMO_MONTH)
  } catch (error) {
    if (error instanceof ContentNotFoundError) {
      notFound()
    }

    throw error
  }
  const publishedMetrics = summary.metrics.reduce(
    (total, metric) => ({
      views: total.views + metric.views,
      likes: total.likes + metric.likes,
      followersGained: total.followersGained + metric.followersGained,
    }),
    { views: 0, likes: 0, followersGained: 0 },
  )
  const statusCounts = workflowStatuses.map((status) => ({
    status,
    count: summary.posts.filter((post) => post.status === status).length,
    posts: summary.posts.filter((post) => post.status === status).slice(0, 3),
  }))
  const nextPosts = summary.posts.slice(0, 5)

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Judge demo workspace</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">CreatorOS command center</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              Plan, adapt, publish, measure, and feed the next 30-day cycle from one workspace.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="lg">
              <Link href="/onboarding">
                <Sparkles data-icon="inline-start" />
                Update Account DNA
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/calendar">
                <CalendarDays data-icon="inline-start" />
                Open Calendar
              </Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Planned posts" value={summary.posts.length.toString()} detail={summary.plan.title} />
          <MetricCard label="Published views" value={publishedMetrics.views.toLocaleString()} detail="From demo metrics" />
          <MetricCard label="Engagements" value={publishedMetrics.likes.toLocaleString()} detail="Likes tracked manually" />
          <MetricCard label="Followers gained" value={publishedMetrics.followersGained.toLocaleString()} detail="Feedback loop input" />
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,4fr)_minmax(0,3fr)]">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-foreground">Monthly Plan</h2>
                <p className="mt-1 text-sm text-muted-foreground">{summary.plan.summary}</p>
              </div>
              <Button asChild variant="outline">
                <Link href="/calendar">
                  View all
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
            </div>
            <div className="mt-5 grid gap-3">
              {nextPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/post/${post.id}`}
                  className="flex flex-col gap-3 rounded-xl border border-border bg-background p-4 transition-colors hover:bg-accent/40 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{post.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {post.scheduledDate} · {post.format} · {post.goal}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <PlatformPill platform={post.primaryPlatform} />
                    <StatusBadge status={post.status} />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-base font-semibold text-foreground">Account DNA</h2>
            <dl className="mt-4 grid gap-4 text-sm">
              <InfoRow label="Niche" value={summary.profile.niche} />
              <InfoRow label="Audience" value={summary.profile.audience} />
              <InfoRow label="Cadence" value={summary.profile.cadence} />
              <InfoRow label="Tone" value={summary.profile.tone} />
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              {summary.profile.platforms.map((platform) => (
                <PlatformPill key={platform} platform={platform} />
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Workflow className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold text-foreground">Workflow Board</h2>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
            {statusCounts.map((column) => (
              <div key={column.status} className="rounded-xl bg-muted/45 p-3">
                <div className="flex items-center justify-between">
                  <StatusBadge status={column.status} />
                  <span className="text-xs font-medium text-muted-foreground">{column.count}</span>
                </div>
                <div className="mt-3 flex flex-col gap-2">
                  {column.posts.length ? (
                    column.posts.map((post) => (
                      <Link key={post.id} href={`/post/${post.id}`} className="rounded-lg border border-border bg-card p-3 text-xs hover:bg-accent/40">
                        <span className="line-clamp-2 font-medium text-foreground">{post.title}</span>
                        <span className="mt-2 block text-muted-foreground">{post.scheduledDate}</span>
                      </Link>
                    ))
                  ) : (
                    <div className="rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">
                      No posts in this stage.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Next-cycle Insights</h2>
            </div>
            <div className="mt-4 grid gap-3">
              {summary.insights.map((insight) => (
                <div key={insight.id} className="rounded-xl border border-border bg-background p-4">
                  <p className="font-medium text-foreground">{insight.title}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{insight.summary}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <h2 className="text-base font-semibold text-foreground">Service Readiness</h2>
            </div>
            <div className="mt-4 grid gap-3 text-sm">
              <ReadinessItem label="Demo workspace" value="Ready without signup" />
              <ReadinessItem label="DynamoDB" value="Repository boundary with demo fallback" />
              <ReadinessItem label="OpenAI-compatible AI" value="Validated JSON with fallback" />
              <ReadinessItem label="S3 and Resend" value="Server-side smoke endpoints" />
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  )
}

function MetricCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase text-muted-foreground">{label}</dt>
      <dd className="mt-1 leading-6 text-foreground">{value}</dd>
    </div>
  )
}

function ReadinessItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-background p-3">
      <span className="font-medium text-foreground">{label}</span>
      <span className="text-right text-muted-foreground">{value}</span>
    </div>
  )
}
