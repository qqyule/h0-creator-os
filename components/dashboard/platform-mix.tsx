import { ArrowRight } from "lucide-react"
import { platformMix } from "@/lib/dashboard-data"
import { DonutChart } from "./mini-charts"
import { PlatformIcon } from "./platform-icon"

export function PlatformMix() {
  const total = platformMix.reduce((s, p) => s + p.count, 0)
  return (
    <section className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-baseline gap-2">
        <h2 className="text-base font-semibold text-foreground">Platform Mix</h2>
        <span className="text-xs text-muted-foreground">平台分布</span>
      </div>

      <div className="mt-5 flex flex-1 items-center gap-5">
        <DonutChart segments={platformMix.map((p) => ({ value: p.count, color: p.color }))}>
          <div className="text-center">
            <p className="text-2xl font-semibold text-foreground">{total}</p>
            <p className="text-xs text-muted-foreground">Planned</p>
          </div>
        </DonutChart>

        <ul className="flex-1 space-y-3">
          {platformMix.map((p) => (
            <li key={p.id} className="flex items-center gap-2 text-sm">
              <PlatformIcon platform={p.id} tile className="h-5 w-5" />
              <span className="flex-1 text-foreground">{p.label}</span>
              <span className="font-medium text-foreground">{p.count}</span>
              <span className="w-12 text-right text-xs text-muted-foreground">{p.percent}</span>
            </li>
          ))}
        </ul>
      </div>

      <button className="mt-5 flex items-center justify-center gap-1 border-t border-border pt-4 text-sm font-medium text-primary hover:underline">
        View breakdown
        <ArrowRight className="h-4 w-4" />
      </button>
    </section>
  )
}
