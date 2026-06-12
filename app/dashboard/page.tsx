import Link from "next/link"
import { ArrowRight, CalendarDays, CheckCircle2, ListChecks, Sparkles, Target, Workflow } from "lucide-react"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { AppShell } from "@/components/app/app-shell"
import { DashboardGuide } from "@/components/dashboard/dashboard-guide"
import { PlatformPill } from "@/components/app/platform-pill"
import { StatusBadge } from "@/components/app/status-badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { workflowStatuses, type DashboardSummary } from "@/lib/domain"
import { DEMO_MONTH } from "@/lib/demo-data"
import { ContentNotFoundError, getDashboardSummary } from "@/lib/repositories/content-repository"
import { resolveWorkspace } from "@/lib/workspace"

export default async function DashboardPage() {
  const t = await getTranslations("dashboard")
  const workspace = await resolveWorkspace()
  let summary: DashboardSummary
  try {
    summary = await getDashboardSummary(workspace.workspaceId, DEMO_MONTH)
  } catch (error) {
    if (error instanceof ContentNotFoundError) {
      redirect("/onboarding")
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
  const openTasks = summary.tasks.filter((task) => task.status === "open").slice(0, 4)

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div data-guide="dashboard-hero">
            <p className="text-sm font-medium text-primary">{t("hero.eyebrow")}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{t("hero.title")}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              {t("hero.description")}
            </p>
          </div>
          <div data-guide="dashboard-actions" className="flex flex-wrap items-center gap-2">
            <ThemeToggle />
            <DashboardGuide />
            <Button asChild size="lg">
              <Link href="/onboarding">
                <Sparkles data-icon="inline-start" />
                {t("hero.updateDna")}
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/calendar">
                <CalendarDays data-icon="inline-start" />
                {t("hero.openCalendar")}
              </Link>
            </Button>
          </div>
        </section>

        <section data-guide="dashboard-metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label={t("metrics.plannedPosts")} value={summary.posts.length.toString()} detail={summary.plan.title} />
          <MetricCard label={t("metrics.publishedViews")} value={publishedMetrics.views.toLocaleString()} detail={t("metrics.demoMetrics")} />
          <MetricCard label={t("metrics.engagements")} value={publishedMetrics.likes.toLocaleString()} detail={t("metrics.likesTracked")} />
          <MetricCard label={t("metrics.followersGained")} value={publishedMetrics.followersGained.toLocaleString()} detail={t("metrics.feedbackLoop")} />
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,4fr)_minmax(0,3fr)]">
          <div data-guide="dashboard-monthly-plan" className="min-w-0 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-foreground">{t("monthlyPlan.title")}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{summary.plan.summary}</p>
              </div>
              <Button asChild variant="outline" className="w-fit">
                <Link href="/calendar">
                  {t("monthlyPlan.viewAll")}
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
            </div>
            <div className="mt-5 grid gap-3">
              {nextPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/post/${post.id}`}
                  className="flex min-w-0 flex-col gap-3 rounded-xl border border-border bg-background p-4 transition-colors hover:bg-accent/40 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{post.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {post.scheduledDate} · {post.format} · {post.goal}
                    </p>
                  </div>
                  <div className="flex w-fit shrink-0 flex-wrap items-center gap-2">
                    <PlatformPill platform={post.primaryPlatform} />
                    <StatusBadge status={post.status} />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div data-guide="dashboard-account-dna" className="min-w-0 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-base font-semibold text-foreground">{t("accountDna.title")}</h2>
            <dl className="mt-4 grid gap-4 text-sm">
              <InfoRow label={t("accountDna.niche")} value={summary.profile.niche} />
              <InfoRow label={t("accountDna.audience")} value={summary.profile.audience} />
              <InfoRow label={t("accountDna.cadence")} value={summary.profile.cadence} />
              <InfoRow label={t("accountDna.tone")} value={summary.profile.tone} />
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              {summary.profile.platforms.map((platform) => (
                <PlatformPill key={platform} platform={platform} />
              ))}
            </div>
          </div>
        </section>

        <section data-guide="dashboard-workflow" className="min-w-0 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Workflow className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold text-foreground">{t("workflow.title")}</h2>
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
                      {t("workflow.emptyStage")}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section data-guide="dashboard-feedback-loop" className="grid gap-5 lg:grid-cols-2">
          <div className="min-w-0 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">{t("insights.title")}</h2>
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
          <div className="min-w-0 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <h2 className="text-base font-semibold text-foreground">{t("readiness.title")}</h2>
            </div>
            <div className="mt-4 grid gap-3 text-sm">
              <ReadinessItem label={t("readiness.demoWorkspace")} value={t("readiness.readyWithoutSignup")} />
              <ReadinessItem label={t("readiness.dynamodb")} value={t("readiness.repositoryBoundary")} />
              <ReadinessItem label={t("readiness.ai")} value={t("readiness.validatedFallback")} />
              <ReadinessItem label={t("readiness.integrations")} value={t("readiness.serverSmoke")} />
            </div>
          </div>
        </section>

        <section className="min-w-0 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold text-foreground">{t("tasks.title")}</h2>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {openTasks.length ? (
              openTasks.map((task) => (
                <div key={task.id} className="rounded-xl border border-border bg-background p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="line-clamp-2 font-medium text-foreground">{task.title}</p>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{task.description}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                      {task.dueDate.slice(5)}
                    </span>
                  </div>
                  {task.postId ? (
                    <Button asChild variant="outline" size="sm" className="mt-3">
                      <Link href={`/post/${task.postId}`}>
                        {t("tasks.openPost")}
                        <ArrowRight data-icon="inline-end" />
                      </Link>
                    </Button>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground md:col-span-2">
                {t("tasks.empty")}
              </div>
            )}
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
