import type { LucideIcon } from "lucide-react"
import { ArrowRight } from "lucide-react"
import type { PlatformId } from "@/lib/dashboard-data"
import { cn } from "@/lib/utils"

export function MiniSparkline({
  data,
  color = "currentColor",
  className,
}: {
  data: number[]
  color?: string
  className?: string
}) {
  const width = 150
  const height = 52
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const step = width / (data.length - 1)
  const points = data.map((value, index) => {
    const x = index * step
    const y = height - ((value - min) / range) * (height - 10) - 5
    return [x, y] as const
  })
  const path = points.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ")
  const area = `${path} L${width},${height} L0,${height} Z`

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={cn("h-14 w-full", className)} aria-hidden="true">
      <path d={area} fill={color} opacity="0.12" />
      <path d={path} fill="none" stroke={color} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function MiniBars({ values, className }: { values: number[]; className?: string }) {
  const max = Math.max(...values)

  return (
    <div className={cn("flex h-14 items-end gap-1.5", className)} aria-hidden="true">
      {values.map((value, index) => (
        <span
          key={`${value}-${index}`}
          className="flex-1 rounded-t-sm bg-primary/25 dark:bg-primary/35"
          style={{ height: `${Math.max(18, (value / max) * 100)}%` }}
        />
      ))}
    </div>
  )
}

export function IconBubble({ icon: Icon, className }: { icon: LucideIcon; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-11 w-11 items-center justify-center rounded-full border border-primary/15 bg-primary/10 text-primary shadow-[0_10px_30px_rgba(37,99,235,0.20)] dark:border-primary/25 dark:bg-primary/15",
        className,
      )}
    >
      <Icon className="h-5 w-5" />
    </span>
  )
}

export function FeatureShell({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "rounded-[22px] border border-border/90 bg-card/88 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.06)] backdrop-blur dark:bg-card/70 dark:shadow-[0_18px_45px_rgba(0,0,0,0.22)]",
        className,
      )}
    >
      {children}
    </div>
  )
}

export function PlatformDot({ platform }: { platform: PlatformId }) {
  const color = {
    linkedin: "bg-[#0a66c2]",
    x: "bg-slate-950 dark:bg-slate-100",
    youtube: "bg-red-500",
    rednote: "bg-rose-500",
  }[platform]

  return <span className={cn("h-2 w-2 rounded-full", color)} aria-hidden="true" />
}

export function ArchitectureStep({
  icon: Icon,
  title,
  detail,
  showArrow = true,
}: {
  icon: LucideIcon
  title: string
  detail: string
  showArrow?: boolean
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-border bg-background/80 p-4 dark:bg-background/45">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{title}</p>
          <p className="mt-1 truncate text-xs text-muted-foreground">{detail}</p>
        </div>
      </div>
      {showArrow ? <ArrowRight className="hidden h-4 w-4 shrink-0 text-primary/70 lg:block" /> : null}
    </div>
  )
}
