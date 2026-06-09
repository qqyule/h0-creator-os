import { ArrowRight, CheckCircle2, Circle } from "lucide-react"
import { upcomingTasks } from "@/lib/dashboard-data"
import { PlatformIcon } from "./platform-icon"

export function UpcomingTasks() {
  return (
    <section className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <h2 className="text-base font-semibold text-foreground">Upcoming Tasks</h2>
          <span className="text-xs text-muted-foreground">近期任务</span>
        </div>
        <button className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
          View all
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <ul className="mt-4 flex flex-1 flex-col gap-3">
        {upcomingTasks.map((task, i) => (
          <li key={i} className="flex items-start gap-3">
            {task.done ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
            ) : (
              <Circle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground/40" />
            )}
            <p
              className={`flex-1 text-pretty text-sm leading-snug ${
                task.done ? "text-muted-foreground line-through" : "text-foreground"
              }`}
            >
              {task.title}
            </p>
            <div className="flex shrink-0 items-center gap-1.5">
              <PlatformIcon platform={task.platform} tile className="h-4 w-4" />
              <span className="whitespace-nowrap text-[11px] text-muted-foreground">{task.due}</span>
            </div>
          </li>
        ))}
      </ul>

      <button className="mt-4 flex items-center gap-1 border-t border-border pt-3 text-sm font-medium text-primary hover:underline">
        See calendar
        <ArrowRight className="h-4 w-4" />
      </button>
    </section>
  )
}
