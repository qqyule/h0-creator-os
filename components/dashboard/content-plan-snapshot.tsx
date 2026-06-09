import { MoreHorizontal } from "lucide-react"
import { calendarWeeks, statusColors, statusLegend, weekdayLabels } from "@/lib/dashboard-data"
import { cn } from "@/lib/utils"

export function ContentPlanSnapshot() {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-baseline gap-2">
        <h2 className="text-base font-semibold text-foreground">30-Day Content Plan Snapshot</h2>
        <span className="text-xs text-muted-foreground">30天内容计划概览</span>
      </div>

      {/* Weekday header */}
      <div className="mt-5 grid grid-cols-[88px_repeat(7,1fr)] gap-1 text-center">
        <div />
        {weekdayLabels.map((d) => (
          <div key={d} className="pb-1 text-xs font-medium text-muted-foreground">
            {d}
          </div>
        ))}
      </div>

      {/* Weeks */}
      <div className="flex flex-col gap-1">
        {calendarWeeks.map((week) => (
          <div key={week.range} className="grid grid-cols-[88px_repeat(7,1fr)] items-center gap-1">
            <div className="pr-2 text-right text-[11px] leading-tight text-muted-foreground">{week.range}</div>
            {week.days.map((day, i) => (
              <div
                key={i}
                className={cn(
                  "flex aspect-square flex-col items-center justify-center rounded-lg text-sm",
                  day.today
                    ? "bg-primary font-semibold text-primary-foreground"
                    : day.muted
                      ? "text-muted-foreground/40"
                      : "text-foreground hover:bg-accent/50",
                )}
              >
                <span>{day.day}</span>
                <span className="mt-1 flex h-1.5 items-center gap-0.5">
                  {day.dots?.map((s, di) => (
                    <span
                      key={di}
                      className="h-1.5 w-1.5 rounded-full"
                      style={{
                        backgroundColor: day.today ? "rgba(255,255,255,0.9)" : statusColors[s],
                      }}
                    />
                  ))}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-4">
        {statusLegend.map((s) => (
          <div key={s.id} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: statusColors[s.id] }} />
            {s.label}
          </div>
        ))}
        <button className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <MoreHorizontal className="h-4 w-4" />
          More
        </button>
      </div>
    </section>
  )
}
