import { ArrowRight, Users } from "lucide-react"
import { recentActivity } from "@/lib/dashboard-data"
import { PlatformIcon } from "./platform-icon"

export function RecentActivity() {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <h2 className="text-base font-semibold text-foreground">Recent Activity</h2>
          <span className="text-xs text-muted-foreground">最新动态</span>
        </div>
        <button className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
          View all activity
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 divide-y divide-border sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-5">
        {recentActivity.map((item, i) => (
          <div
            key={i}
            className="flex items-start gap-3 py-3 sm:py-0 sm:pl-4 sm:pr-4 lg:border-l lg:border-border lg:first:border-l-0 lg:first:pl-0"
          >
            <span className="mt-0.5 shrink-0">
              {item.platform === "team" ? (
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <Users className="h-4 w-4" />
                </span>
              ) : (
                <PlatformIcon platform={item.platform} tile className="h-7 w-7" />
              )}
            </span>
            <div className="min-w-0">
              <p className="text-pretty text-sm leading-snug text-foreground">
                <span className="font-medium">{item.action}</span> {item.title}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">{item.time}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
