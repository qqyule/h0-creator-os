import { CalendarDays, ChevronDown, Menu, Sparkles } from "lucide-react"
import { AiInsights } from "@/components/dashboard/ai-insights"
import { ContentPlanSnapshot } from "@/components/dashboard/content-plan-snapshot"
import { PlatformMix } from "@/components/dashboard/platform-mix"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { Sidebar } from "@/components/dashboard/sidebar"
import { StatCards } from "@/components/dashboard/stat-cards"
import { Topbar } from "@/components/dashboard/topbar"
import { UpcomingTasks } from "@/components/dashboard/upcoming-tasks"
import { WorkflowOverview } from "@/components/dashboard/workflow-overview"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-[1600px]">
        {/* Sidebar */}
        <div className="sticky top-0 hidden h-screen w-64 shrink-0 lg:block">
          <Sidebar />
        </div>

        {/* Main */}
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {/* Mobile brand header */}
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Sparkles className="h-5 w-5" />
              </span>
              <span className="text-lg font-semibold tracking-tight text-foreground">CreatorOS</span>
            </div>
            <button
              aria-label="Open menu"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          <Topbar />

          {/* Date range */}
          <div className="mt-6 flex justify-end">
            <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent/40">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              May 1 – May 31, 2025
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-5">
            <StatCards />

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
              <ContentPlanSnapshot />
              <WorkflowOverview />
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              <PlatformMix />
              <AiInsights />
              <UpcomingTasks />
            </div>

            <RecentActivity />
          </div>
        </main>
      </div>
    </div>
  )
}
