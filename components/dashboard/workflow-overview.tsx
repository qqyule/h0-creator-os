import { CalendarClock, CheckCircle2, Lightbulb, PencilLine, Plus, Users } from "lucide-react"
import { workflowColumns } from "@/lib/dashboard-data"
import { PlatformIcon } from "./platform-icon"

const colIcon = {
  idea: { Icon: Lightbulb, color: "#f59e0b" },
  draft: { Icon: PencilLine, color: "#3b82f6" },
  review: { Icon: Users, color: "#a855f7" },
  scheduled: { Icon: CalendarClock, color: "#06b6d4" },
  published: { Icon: CheckCircle2, color: "#22c55e" },
}

export function WorkflowOverview() {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-baseline gap-2">
        <h2 className="text-base font-semibold text-foreground">Workflow Overview</h2>
        <span className="text-xs text-muted-foreground">工作流概览</span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {workflowColumns.map((col) => {
          const { Icon, color } = colIcon[col.icon]
          return (
            <div key={col.id} className="flex flex-col rounded-xl bg-muted/50 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Icon className="h-4 w-4" style={{ color }} />
                  <span className="text-sm font-medium text-foreground">{col.label}</span>
                </div>
                <span className="text-xs font-medium text-muted-foreground">{col.count}</span>
              </div>

              <div className="mt-3 flex flex-1 flex-col gap-2">
                {col.cards.map((card, i) => (
                  <div key={i} className="rounded-lg border border-border bg-card p-2.5 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-pretty text-xs font-medium leading-snug text-foreground">{card.title}</p>
                      <PlatformIcon platform={card.platform} tile className="h-4 w-4 shrink-0" />
                    </div>
                    {card.date ? <p className="mt-1.5 text-[11px] text-muted-foreground">{card.date}</p> : null}
                  </div>
                ))}
              </div>

              <button className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground">
                <Plus className="h-3 w-3" />
                {col.more} more
              </button>
            </div>
          )
        })}
      </div>
    </section>
  )
}
