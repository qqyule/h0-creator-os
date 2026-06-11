import Link from "next/link"
import { ArrowLeft, CalendarDays, Target } from "lucide-react"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { AppShell } from "@/components/app/app-shell"
import { PlatformPill } from "@/components/app/platform-pill"
import { StatusBadge } from "@/components/app/status-badge"
import { DraftPanel, MetricEntryPanel, RewritePanel, StatusPanel } from "@/components/post/post-actions"
import { Button } from "@/components/ui/button"
import type { PostDetail } from "@/lib/domain"
import { ContentNotFoundError, getPostDetail } from "@/lib/repositories/content-repository"
import { resolveWorkspace } from "@/lib/workspace"

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const t = await getTranslations("post")
  const workspace = await resolveWorkspace()
  const { id } = await params
  let detail: PostDetail
  try {
    detail = await getPostDetail(workspace.workspaceId, id)
  } catch (error) {
    if (error instanceof ContentNotFoundError) {
      notFound()
    }

    throw error
  }
  const { post } = detail

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <section className="border-b border-border pb-6">
          <Button asChild variant="ghost">
            <Link href="/calendar">
              <ArrowLeft data-icon="inline-start" />
              {t("backToCalendar")}
            </Link>
          </Button>
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={post.status} />
                <PlatformPill platform={post.primaryPlatform} />
              </div>
              <h1 className="mt-3 max-w-4xl text-3xl font-semibold tracking-tight text-foreground">{post.title}</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{post.sourceIdea}</p>
            </div>
            <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2 lg:min-w-80">
              <InfoPill icon={<CalendarDays className="h-4 w-4" />} label={t("date")} value={post.scheduledDate} />
              <InfoPill icon={<Target className="h-4 w-4" />} label={t("goal")} value={post.goal} />
            </div>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
          <div className="flex flex-col gap-5">
            <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <h2 className="text-base font-semibold text-foreground">{t("outline")}</h2>
              <ol className="mt-4 grid gap-3">
                {post.outline.map((item, index) => (
                  <li key={item} className="flex gap-3 rounded-xl border border-border bg-background p-3 text-sm">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
                      {index + 1}
                    </span>
                    <span className="leading-6 text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ol>
            </section>

            <DraftPanel post={post} />
            <RewritePanel post={post} initialVariants={detail.variants} />
          </div>

          <div className="flex flex-col gap-5">
            <StatusPanel post={post} />
            <MetricEntryPanel post={post} initialMetrics={detail.metrics} />
          </div>
        </section>
      </div>
    </AppShell>
  )
}

function InfoPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
      {icon}
      <span className="text-muted-foreground">{label}</span>
      <span className="ml-auto font-medium text-foreground">{value}</span>
    </div>
  )
}
