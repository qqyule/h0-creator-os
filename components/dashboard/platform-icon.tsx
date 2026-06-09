import type { PlatformId } from "@/lib/dashboard-data"
import { cn } from "@/lib/utils"

type Props = {
  platform: PlatformId
  className?: string
  /** when true, render a rounded tile with brand background */
  tile?: boolean
}

const brand: Record<PlatformId, { bg: string; fg: string }> = {
  linkedin: { bg: "#0a66c2", fg: "#ffffff" },
  x: { bg: "#0f172a", fg: "#ffffff" },
  youtube: { bg: "#ef4444", fg: "#ffffff" },
  rednote: { bg: "#ef2741", fg: "#ffffff" },
}

function Glyph({ platform, className }: { platform: PlatformId; className?: string }) {
  switch (platform) {
    case "linkedin":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
          <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
        </svg>
      )
    case "x":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
          <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.22-6.82-5.96 6.82H1.67l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23zm-1.16 17.52h1.83L7.01 4.13H5.04l12.04 15.64z" />
        </svg>
      )
    case "youtube":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
          <path d="M23.5 6.2a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.51A3.02 3.02 0 0 0 .5 6.2C0 8.08 0 12 0 12s0 3.92.5 5.8a3.02 3.02 0 0 0 2.12 2.14c1.88.51 9.38.51 9.38.51s7.5 0 9.38-.51a3.02 3.02 0 0 0 2.12-2.14C24 15.92 24 12 24 12s0-3.92-.5-5.8zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z" />
        </svg>
      )
    case "rednote":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
          <path d="M6.6 8.3v7.4h1.5V8.3H6.6zM3 8.3v1.4h2.1V8.3H3zm0 3v1.4h2.1v-1.4H3zm0 3v1.4h2.1v-1.4H3zm6.6-6V9.7h2v6h1.5v-6h2V8.3H9.6zm6.6 0v7.4h1.5v-3h.7l1.5 3H21l-1.7-3.2c.8-.3 1.3-1 1.3-2 0-1.3-1-2.2-2.5-2.2h-1.9zm1.5 1.3h.4c.7 0 1 .3 1 .9s-.3.9-1 .9h-.4V9.6z" />
        </svg>
      )
  }
}

export function PlatformIcon({ platform, className, tile }: Props) {
  if (tile) {
    const c = brand[platform]
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-md",
          className,
        )}
        style={{ backgroundColor: c.bg, color: c.fg }}
      >
        <Glyph platform={platform} className="h-3 w-3" />
      </span>
    )
  }
  return (
    <span style={{ color: brand[platform].bg }} className="inline-flex">
      <Glyph platform={platform} className={cn("h-4 w-4", className)} />
    </span>
  )
}
