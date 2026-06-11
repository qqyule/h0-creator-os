import Link from "next/link"
import { BarChart3, Download, Upload } from "lucide-react"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { AppShell } from "@/components/app/app-shell"
import { PlatformPill } from "@/components/app/platform-pill"
import { InsightGenerator } from "@/components/post/insight-actions"
import { Button } from "@/components/ui/button"
import { DEMO_MONTH } from "@/lib/demo-data"
import type { Insight, MonthlyPlan, PostMetric } from "@/lib/domain"
import { ContentNotFoundError, getMonthlyPlan, listInsights, listMetrics } from "@/lib/repositories/content-repository"
import { resolveWorkspace } from "@/lib/workspace"

export default async function AnalyticsPage() {
  const t = await getTranslations("analytics")
  const workspace = await resolveWorkspace()
  let plan: MonthlyPlan
  let metrics: PostMetric[]
  let insights: Insight[]
  try {
    ;[plan, metrics, insights] = await Promise.all([
      getMonthlyPlan(workspace.workspaceId, DEMO_MONTH),
      listMetrics(workspace.workspaceId, DEMO_MONTH),
      listInsights(workspace.workspaceId, DEMO_MONTH),
    ])
  } catch (error) {
    if (error instanceof ContentNotFoundError) {
      notFound()
    }

    throw error
  }
  const totals = metrics.reduce(
    (total, metric) => ({
      views: total.views + metric.views,
      likes: total.likes + metric.likes,
      comments: total.comments + metric.comments,
      saves: total.saves + metric.saves,
      followersGained: total.followersGained + metric.followersGained,
    }),
    { views: 0, likes: 0, comments: 0, saves: 0, followersGained: 0 },
  )
  const topMetrics = metrics.slice().sort((a, b) => b.views - a.views).slice(0, 6)

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">{t("eyebrow")}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{t("title")}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              {t("description")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" disabled>
              <Upload data-icon="inline-start" />
              {t("importBoundary")}
            </Button>
            <Button variant="outline" disabled>
              <Download data-icon="inline-start" />
              {t("exportCsv")}
            </Button>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <MetricCard label={t("metrics.views")} value={totals.views.toLocaleString()} />
          <MetricCard label={t("metrics.likes")} value={totals.likes.toLocaleString()} />
          <MetricCard label={t("metrics.comments")} value={totals.comments.toLocaleString()} />
          <MetricCard label={t("metrics.saves")} value={totals.saves.toLocaleString()} />
          <MetricCard label={t("metrics.followers")} value={totals.followersGained.toLocaleString()} />
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,3fr)_minmax(320px,2fr)]">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">{t("topPosts")}</h2>
            </div>
            <div className="mt-5 grid gap-3">
              {topMetrics.length ? (
                topMetrics.map((metric) => {
                  const post = plan.posts.find((item) => item.id === metric.postId)
                  return (
                    <Link
                      key={`${metric.postId}-${metric.publishedAt}`}
                      href={`/post/${metric.postId}`}
                      className="grid gap-3 rounded-xl border border-border bg-background p-4 hover:bg-accent/40 md:grid-cols-[minmax(0,1fr)_auto]"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">{post?.title ?? metric.postId}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{metric.publishedAt.slice(0, 10)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <PlatformPill platform={metric.platform} />
                        <span className="text-sm font-semibold text-foreground">
                          {t("viewsValue", { views: metric.views.toLocaleString() })}
                        </span>
                      </div>
                    </Link>
                  )
                })
              ) : (
                <div className="rounded-xl border border-dashed border-border p-8 text-center">
                  <p className="font-medium text-foreground">{t("emptyMetrics.title")}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{t("emptyMetrics.description")}</p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-base font-semibold text-foreground">{t("storedInsights")}</h2>
            <div className="mt-4 grid gap-3">
              {insights.map((insight) => (
                <div key={insight.id} className="rounded-xl border border-border bg-background p-4">
                  <p className="font-medium text-foreground">{insight.title}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{insight.summary}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {insight.recommendations.slice(0, 2).map((item) => (
                      <span key={item} className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <InsightGenerator month={DEMO_MONTH} />
      </div>
    </AppShell>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
    </div>
  )
}
