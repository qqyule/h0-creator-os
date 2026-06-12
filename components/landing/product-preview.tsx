"use client"

import { useState } from "react"
import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  FileText,
  LayoutDashboard,
  Sparkles,
  Workflow,
} from "lucide-react"
import { PlatformIcon } from "@/components/dashboard/platform-icon"
import { Button } from "@/components/ui/button"
import type { PlatformId } from "@/lib/dashboard-data"
import { cn } from "@/lib/utils"
import { MiniBars, MiniSparkline, PlatformDot } from "./landing-visuals"

const platforms: { id: PlatformId; label: string }[] = [
  { id: "linkedin", label: "LinkedIn" },
  { id: "x", label: "X" },
  { id: "youtube", label: "YouTube" },
  { id: "rednote", label: "Rednote" },
]

const previewPosts = [
  { title: "Turn repeated client questions into a content engine #1", meta: "2026-06-01 · LinkedIn carousel", platform: "linkedin" as const, status: "Idea" },
  { title: "The weekly review that keeps creators shipping #2", meta: "2026-06-08 · X thread", platform: "x" as const, status: "Drafting" },
  { title: "How to adapt one idea without sounding repetitive #3", meta: "2026-06-15 · YouTube short", platform: "youtube" as const, status: "Review" },
  { title: "What your content calendar is missing #4", meta: "2026-06-22 · Rednote story", platform: "rednote" as const, status: "Scheduled" },
  { title: "A practical system for measuring creator momentum #5", meta: "2026-06-30 · Newsletter clip", platform: "linkedin" as const, status: "Published" },
]

const statusClassName: Record<string, string> = {
  Idea: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-300/30 dark:bg-amber-300/10 dark:text-amber-200",
  Drafting: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-300/30 dark:bg-blue-300/10 dark:text-blue-200",
  Review: "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-300/30 dark:bg-purple-300/10 dark:text-purple-200",
  Scheduled: "border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-300/30 dark:bg-cyan-300/10 dark:text-cyan-200",
  Published: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-300/30 dark:bg-emerald-300/10 dark:text-emerald-200",
}

export function ProductPreview() {
  const [activePlatform, setActivePlatform] = useState<PlatformId>("linkedin")
  const [activePost, setActivePost] = useState(previewPosts[0].title)

  return (
    <div className="overflow-hidden rounded-[24px] border border-border bg-card shadow-[0_28px_80px_rgba(37,99,235,0.16)] dark:bg-card/85 dark:shadow-[0_28px_80px_rgba(0,0,0,0.36)]">
      <div className="flex h-11 items-center gap-2 border-b border-border bg-background/70 px-4 dark:bg-background/35">
        <span className="h-3 w-3 rounded-full bg-red-400" />
        <span className="h-3 w-3 rounded-full bg-amber-400" />
        <span className="h-3 w-3 rounded-full bg-emerald-400" />
        <span className="ml-2 h-1 w-4 rounded-full bg-muted" />
      </div>

      <div className="grid min-h-[500px] grid-cols-1 bg-card lg:grid-cols-[150px_minmax(0,1fr)] min-[1320px]:grid-cols-[170px_minmax(0,1fr)]">
        <aside className="hidden border-r border-border bg-muted/25 p-4 lg:flex lg:flex-col">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold text-foreground">CreatorOS</span>
          </div>

          <nav className="mt-8 grid gap-1 text-xs font-medium text-muted-foreground">
            {[
              { label: "Dashboard", icon: LayoutDashboard, active: true },
              { label: "Account DNA", icon: FileText },
              { label: "Calendar", icon: CalendarDays },
              { label: "Post Workflow", icon: Workflow },
              { label: "Analytics", icon: BarChart3 },
            ].map((item) => (
              <span
                key={item.label}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-2.5 py-2",
                  item.active ? "bg-primary/10 text-primary" : "text-muted-foreground",
                )}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </span>
            ))}
          </nav>

          <div className="mt-auto rounded-xl border border-border bg-card p-3">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>English</span>
              <span>中文</span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-xs font-semibold text-primary">Y</span>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-foreground">Acme Creators</p>
                <p className="text-[10px] text-muted-foreground">Pro Plan</p>
              </div>
              <ChevronRight className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </div>
        </aside>

        <main className="min-w-0 p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-medium text-primary">Judge demo workspace</p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground">CreatorOS command center</h2>
              <p className="mt-1 max-w-lg text-xs text-muted-foreground">
                Plan, adapt, publish, measure, and feed the next 30-day cycle from one workspace.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" className="h-8 rounded-lg">
                <Sparkles data-icon="inline-start" />
                Update Account DNA
              </Button>
              <Button size="sm" variant="outline" className="h-8 rounded-lg">
                Open Calendar
              </Button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 min-[1320px]:grid-cols-4">
            <PreviewMetric label="Planned posts" value="30" detail="June creator operations plan" />
            <PreviewMetric label="Published views" value="35,550" detail="From demo metrics" />
            <PreviewMetric label="Engagements" value="1,725" detail="Likes tracked manually" />
            <PreviewMetric label="Followers gained" value="93" detail="Feedback loop input" />
          </div>

          <div className="mt-5 grid gap-4 min-[1320px]:grid-cols-[minmax(0,1.15fr)_minmax(240px,0.85fr)]">
            <section className="rounded-2xl border border-border bg-background/70 p-4 dark:bg-background/35">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Monthly Plan</h3>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    A 30-day plan that turns one B2B creator positioning system into rewrites, workflow status, and feedback loops.
                  </p>
                </div>
                <Button size="xs" variant="outline">
                  View all
                </Button>
              </div>
              <div className="mt-4 grid gap-2">
                {previewPosts.map((post) => (
                  <button
                    key={post.title}
                    type="button"
                    onClick={() => setActivePost(post.title)}
                    className={cn(
                      "flex min-w-0 flex-col gap-2 rounded-xl border bg-card p-3 text-left transition sm:flex-row sm:items-center sm:justify-between",
                      activePost === post.title
                        ? "border-primary/45 shadow-[0_12px_30px_rgba(37,99,235,0.12)]"
                        : "border-border hover:border-primary/30 hover:bg-accent/30",
                    )}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-semibold text-foreground">{post.title}</span>
                      <span className="mt-1 block truncate text-[11px] text-muted-foreground">{post.meta}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      <PlatformIcon platform={post.platform} tile className="h-5 w-5 rounded-full" />
                      <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold", statusClassName[post.status])}>
                        {post.status}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-background/70 p-4 dark:bg-background/35">
              <h3 className="text-sm font-semibold text-foreground">Account DNA</h3>
              <dl className="mt-4 grid gap-3 text-xs">
                <PreviewInfo label="Niche" value="B2B creator operations for independent consultants" />
                <PreviewInfo label="Audience" value="Solo experts and small studios turning expertise into repeatable content systems." />
                <PreviewInfo label="Cadence" value="One flagship idea per weekday, adapted across priority platforms." />
                <PreviewInfo label="Tone" value="Clear, practical, operator-led, with concise examples and no hype." />
              </dl>
              <div className="mt-4 flex flex-wrap gap-2">
                {platforms.map((platform) => (
                  <button
                    key={platform.id}
                    type="button"
                    onClick={() => setActivePlatform(platform.id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition",
                      activePlatform === platform.id
                        ? "border-primary/45 bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground hover:text-foreground",
                    )}
                    aria-pressed={activePlatform === platform.id}
                  >
                    <PlatformIcon platform={platform.id} tile className="h-4 w-4 rounded-full" />
                    {platform.label}
                  </button>
                ))}
              </div>

              <div className="mt-5 rounded-xl border border-border bg-card p-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-foreground">Selected adaptation</p>
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                </div>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  {platforms.find((platform) => platform.id === activePlatform)?.label} gets the same idea tuned for native format, hook, and proof.
                </p>
                {activePlatform === "youtube" ? (
                  <MiniBars values={[18, 28, 21, 35, 31, 42, 38, 48]} className="mt-3" />
                ) : (
                  <MiniSparkline data={[14, 19, 17, 26, 23, 31, 29, 38]} color="rgb(37 99 235)" className="mt-2" />
                )}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}

function PreviewMetric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background/75 p-4 dark:bg-background/35">
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <p className="mt-2 text-xl font-semibold tracking-tight text-foreground">{value}</p>
      <p className="mt-1 truncate text-[11px] text-muted-foreground">{detail}</p>
    </div>
  )
}

function PreviewInfo({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-semibold uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 leading-5 text-foreground">{value}</dd>
    </div>
  )
}

export function WorkflowMiniBoard() {
  const columns = [
    { label: "Idea", count: 2, color: "text-amber-500", cards: ["", ""] },
    { label: "Drafting", count: 3, color: "text-blue-500", cards: ["", ""] },
    { label: "Review", count: 2, color: "text-purple-500", cards: ["", ""] },
  ]

  return (
    <div className="grid grid-cols-3 gap-2 rounded-2xl border border-border bg-background/80 p-3 dark:bg-background/35">
      {columns.map((column) => (
        <div key={column.label} className="min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className={cn("truncate text-xs font-semibold", column.color)}>{column.label}</p>
            <span className="text-[10px] text-muted-foreground">{column.count}</span>
          </div>
          <div className="mt-2 grid gap-2">
            {column.cards.map((_, index) => (
              <div key={index} className="rounded-lg border border-border bg-card p-2">
                <span className="block h-1.5 w-10 rounded-full bg-muted" />
                <span className="mt-2 block h-1.5 w-full rounded-full bg-muted/70" />
                <span className="mt-1.5 block h-1.5 w-2/3 rounded-full bg-muted/70" />
                <span className="mt-3 flex items-center gap-1">
                  <PlatformDot platform={index % 2 === 0 ? "linkedin" : "rednote"} />
                  <span className="h-1.5 w-8 rounded-full bg-muted" />
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
