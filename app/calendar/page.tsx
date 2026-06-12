import Link from "next/link"
import { CalendarDays, ChevronRight, ListChecks } from "lucide-react"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { AppShell } from "@/components/app/app-shell"
import { PlatformPill } from "@/components/app/platform-pill"
import { StatusBadge } from "@/components/app/status-badge"
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
  const weeks = chunk(plan.posts, 7)
  const tasksByPost = new Map<string, CreatorTask[]>()

  for (const task of tasks) {
    if (!task.postId || task.status === "done") {
      continue
    }

    tasksByPost.set(task.postId, [...(tasksByPost.get(task.postId) ?? []), task])
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
            <div className="mt-5 grid gap-4">
              {weeks.map((week, index) => (
                <div key={index} className="grid gap-3 md:grid-cols-7">
                  {week.map((post) => (
                    <Link
                      key={post.id}
                      href={`/post/${post.id}`}
                      className="flex min-h-40 flex-col rounded-xl border border-border bg-background p-3 transition-colors hover:bg-accent/40"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-semibold text-foreground">
                          {Number(post.scheduledDate.slice(-2))}
                        </span>
                        <StatusBadge status={post.status} />
                      </div>
                      <p className="mt-3 line-clamp-3 text-sm font-medium leading-5 text-foreground">{post.title}</p>
                      <p className="mt-2 text-xs text-muted-foreground">{post.format}</p>
                      <div className="mt-auto pt-3">
                        <PlatformPill platform={post.primaryPlatform} />
                        {tasksByPost.get(post.id)?.length ? (
                          <div className="mt-2 flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                            <ListChecks className="h-3 w-3" />
                            {t("taskMarker", { count: tasksByPost.get(post.id)?.length ?? 0 })}
                          </div>
                        ) : null}
                      </div>
                    </Link>
                  ))}
                </div>
              ))}
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

function chunk<T>(items: T[], size: number) {
  const result: T[][] = []

  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size))
  }

  return result
}
