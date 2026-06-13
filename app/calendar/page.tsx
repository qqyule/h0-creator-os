import Link from "next/link"
import { CalendarDays, ChevronRight } from "lucide-react"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { AppShell } from "@/components/app/app-shell"
import { CalendarBoard } from "@/components/calendar/calendar-board"
import { Button } from "@/components/ui/button"
import { DEMO_MONTH } from "@/lib/demo-data"
import type { CreatorTask, MonthlyPlan } from "@/lib/domain"
import { ContentNotFoundError, getMonthlyPlan, listTasks } from "@/lib/repositories/content-repository"
import { resolveWorkspace } from "@/lib/workspace"

export default async function CalendarPage() {
  const t = await getTranslations("calendar")
  const workspace = await resolveWorkspace()
  let plan: MonthlyPlan
  let tasks: CreatorTask[]
  try {
    ;[plan, tasks] = await Promise.all([
      getMonthlyPlan(workspace.workspaceId, DEMO_MONTH),
      listTasks(workspace.workspaceId, DEMO_MONTH),
    ])
  } catch (error) {
    if (error instanceof ContentNotFoundError) {
      notFound()
    }

    throw error
  }
  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">{t("eyebrow")}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{plan.title}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{plan.summary}</p>
          </div>
          <Button asChild size="lg">
            <Link href={`/post/${plan.posts[0]?.id ?? "post-01"}`}>
              {t("openFirstPost")}
              <ChevronRight data-icon="inline-end" />
            </Link>
          </Button>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">{t("calendarTitle")}</h2>
            </div>
            <div className="text-sm text-muted-foreground">{t("plannedPosts", { count: plan.posts.length })}</div>
          </div>

          {plan.posts.length ? (
            <div className="mt-5">
              <CalendarBoard initialPosts={plan.posts} tasks={tasks} />
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-dashed border-border p-8 text-center">
              <p className="font-medium text-foreground">{t("empty.title")}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t("empty.description")}</p>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  )
}
