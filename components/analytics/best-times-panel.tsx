type BestTime = {
  weekday: number
  time: string
  averageScore: number
  sampleSize: number
  confidence: string
}

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function BestTimesPanel({
  recommendations,
  metricCount,
  minimumSampleSize,
}: {
  recommendations: BestTime[]
  metricCount: number
  minimumSampleSize: number
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">Best-Time Analytics</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            First-party metrics only. Recommendations stay low confidence until at least {minimumSampleSize} samples exist per slot.
          </p>
        </div>
        <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          {metricCount} metric samples
        </span>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {recommendations.length ? recommendations.map((item) => (
          <div key={`${item.weekday}-${item.time}`} className="rounded-xl border border-border bg-background p-4">
            <p className="text-sm font-semibold text-foreground">{weekdayLabels[item.weekday]} · {item.time}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{item.averageScore.toLocaleString()}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {item.sampleSize} samples · {item.confidence} confidence
            </p>
          </div>
        )) : (
          <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground md:col-span-3">
            Add metrics to unlock first-party posting-time recommendations.
          </div>
        )}
      </div>
    </section>
  )
}
