import { ArrowUpRight, CalendarDays, PieChart, Radio, Send } from "lucide-react"
import { stats } from "@/lib/dashboard-data"
import { DonutChart, RingChart, Sparkline } from "./mini-charts"

const iconMap = {
  calendar: CalendarDays,
  send: Send,
  pie: PieChart,
  radio: Radio,
}

export function StatCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = iconMap[stat.icon]
        return (
          <div key={stat.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{
                  backgroundColor: `color-mix(in oklch, ${stat.color} 22%, transparent)`,
                  color: stat.color,
                }}
              >
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">{stat.label}</p>
                <p className="text-xs text-muted-foreground">{stat.labelZh}</p>
              </div>
            </div>

            <div className="mt-4 flex items-end justify-between gap-2">
              <div>
                <p className="text-3xl font-semibold tracking-tight text-foreground">{stat.value}</p>
                <p className="mt-1 flex items-center gap-1 text-xs">
                  <span className="inline-flex items-center font-medium text-success">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    {stat.delta}
                  </span>
                  <span className="text-muted-foreground">{stat.deltaLabel}</span>
                </p>
              </div>

              <div className="shrink-0">
                {stat.chart === "line" ? (
                  <Sparkline data={stat.series} color={stat.color} />
                ) : (
                  <DonutChart
                    size={64}
                    stroke={8}
                    segments={[
                      { value: stat.series[0], color: stat.color },
                      { value: 100 - stat.series[0], color: "var(--muted)" },
                    ]}
                  />
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// kept for potential reuse
export { RingChart }
